// Constants
const API_BASE_URL = "https://bus-scheduler-backend.onrender.com";
const FRONTEND_URL = "https://bus-route-scheduler-app.vercel.app";

// Fetch data with authentication
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    window.location.href = `${FRONTEND_URL}/html/login.html`;
    return;
  }

  const defaultOptions = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...defaultOptions,
      ...options,
    });

    if (response.status === 401) {
      localStorage.removeItem("adminToken");
      window.location.href = `${FRONTEND_URL}/html/login.html`;
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

// Load Routes Section
const loadRoutesSection = async () => {
  try {
    const routes = await fetchWithAuth("/api/routes");

    const routesTable = document.querySelector(".admin-content");
    routesTable.innerHTML = `
            <div class="section-header">
                <h2>Routes Management</h2>
                <button class="add-btn" onclick="showAddRouteModal()">
                    <i class="fas fa-plus"></i> Add Route
                </button>
            </div>
            <div class="table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Route Number</th>
                            <th>Start Point</th>
                            <th>End Point</th>
                            <th>Stops</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="routesTableBody">
                        ${routes
                          .map(
                            (route) => `
                            <tr>
                                <td>${route.routeNumber}</td>
                                <td>${route.startPoint}</td>
                                <td>${route.endPoint}</td>
                                <td>${route.stops.join(", ")}</td>
                                <td>
                                    <button class="edit-btn" onclick="editRoute('${
                                      route._id
                                    }')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="delete-btn" onclick="deleteRoute('${
                                      route._id
                                    }')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
        `;
  } catch (error) {
    console.error("Error loading routes:", error);
    document.querySelector(".admin-content").innerHTML = `
            <div class="error-message">
                <h3>Error Loading Routes</h3>
                <p>Please try again later or contact support if the problem persists.</p>
            </div>
        `;
  }
};

// Add Route
const addRoute = async (routeData) => {
  try {
    await fetchWithAuth("/api/routes", {
      method: "POST",
      body: JSON.stringify(routeData),
    });
    await loadRoutesSection();
  } catch (error) {
    console.error("Error adding route:", error);
    throw error;
  }
};

// Edit Route
const editRoute = async (routeId, routeData) => {
  try {
    await fetchWithAuth(`/api/routes/${routeId}`, {
      method: "PUT",
      body: JSON.stringify(routeData),
    });
    await loadRoutesSection();
  } catch (error) {
    console.error("Error editing route:", error);
    throw error;
  }
};

// Delete Route
const deleteRoute = async (routeId) => {
  if (!confirm("Are you sure you want to delete this route?")) return;

  try {
    await fetchWithAuth(`/api/routes/${routeId}`, {
      method: "DELETE",
    });
    await loadRoutesSection();
  } catch (error) {
    console.error("Error deleting route:", error);
    throw error;
  }
};

// Export functions
window.routeFunctions = {
  loadRoutesSection,
  addRoute,
  editRoute,
  deleteRoute,
};
