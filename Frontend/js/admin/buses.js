// Constants
const API_BASE_URL = "https://bus-scheduler-backend.onrender.com";
// const FRONTEND_URL = "https://bus-route-scheduler-app.vercel.app";

// Fetch data with authentication
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    window.location.href = `./html/login.html`;
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
      window.location.href = `./html/login.html`;
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

// Load Buses Section
const loadBusesSection = async () => {
  try {
    const buses = await fetchWithAuth("/api/buses");

    const busesTable = document.querySelector(".admin-content");
    busesTable.innerHTML = `
            <div class="section-header">
                <h2>Buses Management</h2>
                <button class="add-btn" onclick="showAddBusModal()">
                    <i class="fas fa-plus"></i> Add Bus
                </button>
            </div>
            <div class="table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Bus Number</th>
                            <th>Type</th>
                            <th>Capacity</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="busesTableBody">
                        ${buses
                          .map(
                            (bus) => `
                            <tr>
                                <td>${bus.busNumber}</td>
                                <td>${bus.type}</td>
                                <td>${bus.capacity}</td>
                                <td><span class="status ${bus.status}">${bus.status}</span></td>
                                <td>
                                    <button class="edit-btn" onclick="editBus('${bus._id}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="delete-btn" onclick="deleteBus('${bus._id}')">
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
    console.error("Error loading buses:", error);
    document.querySelector(".admin-content").innerHTML = `
            <div class="error-message">
                <h3>Error Loading Buses</h3>
                <p>Please try again later or contact support if the problem persists.</p>
            </div>
        `;
  }
};

// Add Bus
const addBus = async (busData) => {
  try {
    await fetchWithAuth("/api/buses", {
      method: "POST",
      body: JSON.stringify(busData),
    });
    await loadBusesSection();
  } catch (error) {
    console.error("Error adding bus:", error);
    throw error;
  }
};

// Edit Bus
const editBus = async (busId, busData) => {
  try {
    await fetchWithAuth(`/api/buses/${busId}`, {
      method: "PUT",
      body: JSON.stringify(busData),
    });
    await loadBusesSection();
  } catch (error) {
    console.error("Error editing bus:", error);
    throw error;
  }
};

// Delete Bus
const deleteBus = async (busId) => {
  if (!confirm("Are you sure you want to delete this bus?")) return;

  try {
    await fetchWithAuth(`/api/buses/${busId}`, {
      method: "DELETE",
    });
    await loadBusesSection();
  } catch (error) {
    console.error("Error deleting bus:", error);
    throw error;
  }
};

// Export functions
window.busFunctions = {
  loadBusesSection,
  addBus,
  editBus,
  deleteBus,
};
