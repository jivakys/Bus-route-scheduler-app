// Routes Management
document.addEventListener("DOMContentLoaded", () => {
  // Constants
  const API_BASE_URL = "https://bus-scheduler-backend.onrender.com";

  // Check if we're on the routes page
  if (!document.getElementById("routesTable")) {
    return;
  }

  // Initialize routes table
  loadRoutes();

  // Add event listeners
  const addRouteForm = document.getElementById("addRouteForm");
  if (addRouteForm) {
    addRouteForm.addEventListener("submit", handleAddRoute);
  }
});

async function loadRoutes() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/routes`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const routes = await response.json();
    const routesTable = document.getElementById("routesTable");
    if (!routesTable) return;

    const tbody = routesTable.querySelector("tbody");
    tbody.innerHTML = routes.map(route => `
      <tr>
        <td>${route.routeNumber}</td>
        <td>${route.startPoint}</td>
        <td>${route.endPoint}</td>
        <td>${route.distance} km</td>
        <td>${route.estimatedTime} mins</td>
        <td>
          <button onclick="editRoute('${route._id}')" class="edit-btn">Edit</button>
          <button onclick="deleteRoute('${route._id}')" class="delete-btn">Delete</button>
        </td>
      </tr>
    `).join("");
  } catch (error) {
    console.error("Error loading routes:", error);
    showError("Error Loading Routes", "Failed to load routes. Please try again.");
  }
}

async function handleAddRoute(e) {
  e.preventDefault();
  const token = localStorage.getItem("token");
  const formData = new FormData(e.target);
  const routeData = {
    routeNumber: formData.get("routeNumber"),
    startPoint: formData.get("startPoint"),
    endPoint: formData.get("endPoint"),
    distance: formData.get("distance"),
    estimatedTime: formData.get("estimatedTime")
  };

  try {
    const response = await fetch(`${API_BASE_URL}/api/routes`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(routeData)
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    e.target.reset();
    loadRoutes();
    showSuccess("Route added successfully!");
  } catch (error) {
    console.error("Error adding route:", error);
    showError("Error Adding Route", "Failed to add route. Please try again.");
  }
}

async function editRoute(routeId) {
  // Implementation for editing route
}

async function deleteRoute(routeId) {
  if (!confirm("Are you sure you want to delete this route?")) {
    return;
  }

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`${API_BASE_URL}/api/routes/${routeId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    loadRoutes();
    showSuccess("Route deleted successfully!");
  } catch (error) {
    console.error("Error deleting route:", error);
    showError("Error Deleting Route", "Failed to delete route. Please try again.");
  }
}

function showError(title, message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.innerHTML = `
    <h3>${title}</h3>
    <p>${message}</p>
  `;
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
  const successDiv = document.createElement("div");
  successDiv.className = "success-message";
  successDiv.textContent = message;
  document.body.appendChild(successDiv);
  setTimeout(() => successDiv.remove(), 5000);
} 