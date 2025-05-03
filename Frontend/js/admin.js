// Admin Panel Main Script
document.addEventListener("DOMContentLoaded", () => {
  // Check if user is admin
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "../html/login.html";
    return;
  }

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    if (payload.role !== "admin") {
      window.location.href = "../index.html";
      return;
    }
  } catch (error) {
    window.location.href = "../html/login.html";
    return;
  }

  // Initialize admin panel
  initializeAdminPanel();
});

function initializeAdminPanel() {
  // Load dashboard data
  loadDashboardData();

  // Handle sidebar navigation
  const sidebarLinks = document.querySelectorAll(".sidebar-menu a");
  if (sidebarLinks) {
    sidebarLinks.forEach((link) => {
      if (link) {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const section = link.getAttribute("data-section");
          if (section) {
            loadSection(section);
          }
        });
      }
    });
  }

  // Handle logout
  const logoutBtn = document.querySelector(".logout-btn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", (e) => {
      e.preventDefault();
      localStorage.removeItem("token");
      window.location.href = "./login.html";
    });
  }

  // Add route button
  const addRouteBtn = document.getElementById("addRouteBtn");
  if (addRouteBtn) {
    addRouteBtn.addEventListener("click", (e) => {
      e.preventDefault();
      addRouteForm();
    });
  }

  // Add bus button
  const addBusBtn = document.getElementById('addBusBtn');
  if (addBusBtn) {
    addBusBtn.addEventListener('click', (e) => {
      e.preventDefault();
      addBusForm();
    });
  }
}

async function loadDashboardData() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("No authentication token found");
    }

    console.log(
      "Fetching dashboard data with token:",
      token.substring(0, 10) + "..."
    );

    const response = await fetch("http://localhost:3000/api/admin/dashboard", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    console.log("Response status:", response.status);
    console.log(
      "Response headers:",
      Object.fromEntries(response.headers.entries())
    );

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.message || `HTTP error! status: ${response.status}`
      );
    }

    const data = await response.json();
    console.log("Received data:", data);

    if (!data) {
      throw new Error("No data received from server");
    }

    updateDashboardStats(data);
    updateRecentRoutes(data.recentRoutes);
    updateRecentBookings(data.recentBookings);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    showError("Error Loading Dashboard", error.message);
  }
}

function updateDashboardStats(data) {
  const elements = {
    totalRoutes: document.getElementById("totalRoutes"),
    totalBuses: document.getElementById("totalBuses"),
    totalUsers: document.getElementById("totalUsers"),
    activeBookings: document.getElementById("activeBookings"),
  };

  Object.entries(elements).forEach(([key, element]) => {
    if (element) {
      element.textContent = data[key] || 0;
    }
  });
}

function updateRecentRoutes(routes) {
  const container = document.getElementById("recentRoutes");
  if (!container) return;

  if (!routes || routes.length === 0) {
    container.innerHTML = "<p>No recent routes found</p>";
    return;
  }

  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Route Number</th>
          <th>Start Point</th>
          <th>End Point</th>
          <th>Created At</th>
        </tr>
      </thead>
      <tbody>
        ${routes.map(route => `
          <tr>
            <td>${route.routeNumber}</td>
            <td>${route.startPoint}</td>
            <td>${route.endPoint}</td>
            <td>${new Date(route.createdAt).toLocaleDateString()}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function updateRecentBookings(bookings) {
  const container = document.getElementById("recentBookings");
  if (!container) return;

  if (!bookings || bookings.length === 0) {
    container.innerHTML = "<p>No recent bookings found</p>";
    return;
  }

  container.innerHTML = `
    <table class="admin-table">
      <thead>
        <tr>
          <th>Bus Number</th>
          <th>Route</th>
          <th>Departure Time</th>
          <th>Status</th>
        </tr>
      </thead>
      <tbody>
        ${bookings.map(booking => `
          <tr>
            <td>${booking.busNumber || 'N/A'}</td>
            <td>${booking.startPoint} - ${booking.endPoint}</td>
            <td>${new Date(booking.departureTime).toLocaleString()}</td>
            <td>${booking.status}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>
  `;
}

function showError(title, message) {
  const contentDiv = document.querySelector(".admin-content");
  if (contentDiv) {
    contentDiv.innerHTML = `
      <div class="error-message">
        <h3>${title}</h3>
        <p>${message}</p>
        <button onclick="loadDashboardData()" class="retry-btn">Retry</button>
      </div>
    `;
  }
}

async function loadSection(section) {
  const contentDiv = document.querySelector(".admin-content");
  if (!contentDiv) {
    console.error("Content div not found");
    return;
  }

  // Update active link
  const sidebarLinks = document.querySelectorAll(".sidebar-menu a");
  if (sidebarLinks) {
    sidebarLinks.forEach((link) => {
      if (link) {
        link.classList.remove("active");
        if (link.getAttribute("data-section") === section) {
          link.classList.add("active");
        }
      }
    });
  }

  // Update header title
  const headerTitle = document.querySelector(".header-left h1");
  if (headerTitle) {
    headerTitle.textContent =
      section.charAt(0).toUpperCase() + section.slice(1);
  }

  // Load section content
  try {
    switch (section) {
      case "routes":
        if (window.routeFunctions?.loadRoutesSection) {
          await window.routeFunctions.loadRoutesSection();
        } else {
          throw new Error("Routes module not loaded");
        }
        break;
      case "buses":
        if (window.busFunctions?.loadBusesSection) {
          await window.busFunctions.loadBusesSection();
        } else {
          throw new Error("Buses module not loaded");
        }
        break;
      case "drivers":
        if (window.driverFunctions?.loadDriversSection) {
          await window.driverFunctions.loadDriversSection();
        } else {
          throw new Error("Drivers module not loaded");
        }
        break;
      case "schedules":
        if (window.scheduleFunctions?.loadSchedulesSection) {
          await window.scheduleFunctions.loadSchedulesSection();
        } else {
          throw new Error("Schedules module not loaded");
        }
        break;
      case "users":
        if (window.userFunctions?.loadUsersSection) {
          await window.userFunctions.loadUsersSection();
        } else {
          throw new Error("Users module not loaded");
        }
        break;
      case "dashboard":
        await loadDashboardSection();
        break;
      default:
        contentDiv.innerHTML = "<h2>Section not found</h2>";
    }
  } catch (error) {
    console.error(`Error loading section ${section}:`, error);
    showError(`Error Loading ${section.charAt(0).toUpperCase() + section.slice(1)}`, error.message);
  }
}

async function loadDashboardSection() {
  const contentDiv = document.querySelector(".admin-content");
  if (!contentDiv) {
    console.error("Content div not found");
    return;
  }

  contentDiv.innerHTML = `
    <div class="dashboard-container">
      <div class="stats-grid">
        <div class="stat-card">
          <h3>Total Routes</h3>
          <p id="totalRoutes">0</p>
        </div>
        <div class="stat-card">
          <h3>Total Buses</h3>
          <p id="totalBuses">0</p>
        </div>
        <div class="stat-card">
          <h3>Total Users</h3>
          <p id="totalUsers">0</p>
        </div>
        <div class="stat-card">
          <h3>Active Bookings</h3>
          <p id="activeBookings">0</p>
        </div>
      </div>
      <div class="recent-data">
        <div class="recent-card">
          <h3>Recent Routes</h3>
          <div id="recentRoutes"></div>
        </div>
        <div class="recent-card">
          <h3>Recent Bookings</h3>
          <div id="recentBookings"></div>
        </div>
      </div>
    </div>
  `;

  await loadDashboardData();
}

// Export functions for other admin modules
window.adminFunctions = {
  loadSection,
  loadDashboardData,
};

// Add route form
function addRouteForm() {
  const contentDiv = document.querySelector('.admin-content');
  if (!contentDiv) return;

  contentDiv.innerHTML = `
    <div class="admin-form-container">
      <h2>Add New Route</h2>
      <form id="addRouteForm" class="admin-form">
        <div class="form-group">
          <label for="routeNumber">Route Number</label>
          <input type="text" id="routeNumber" name="routeNumber" required>
        </div>
        <div class="form-group">
          <label for="startPoint">Start Point</label>
          <input type="text" id="startPoint" name="startPoint" required>
        </div>
        <div class="form-group">
          <label for="endPoint">End Point</label>
          <input type="text" id="endPoint" name="endPoint" required>
        </div>
        <div class="form-group">
          <label for="distance">Distance (km)</label>
          <input type="number" id="distance" name="distance" required min="0" step="0.1">
        </div>
        <div class="form-group">
          <label for="estimatedTime">Estimated Time (minutes)</label>
          <input type="number" id="estimatedTime" name="estimatedTime" required min="0">
        </div>
        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" name="status" required>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Add Route</button>
          <button type="button" class="btn btn-outline" onclick="loadSection('routes')">Cancel</button>
        </div>
      </form>
    </div>
  `;

  // Add form submission handler
  const form = document.getElementById('addRouteForm');
  if (form) {
    form.addEventListener('submit', handleAddRoute);
  }
}

// Handle add route form submission
async function handleAddRoute(event) {
  event.preventDefault();
  
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login again');
    window.location.href = '../html/login.html';
    return;
  }

  const formData = {
    routeNumber: document.getElementById('routeNumber').value,
    startPoint: document.getElementById('startPoint').value,
    endPoint: document.getElementById('endPoint').value,
    distance: parseFloat(document.getElementById('distance').value),
    estimatedTime: parseInt(document.getElementById('estimatedTime').value),
    status: document.getElementById('status').value
  };

  try {
    const response = await fetch('http://localhost:3000/api/routes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add route');
    }

    const result = await response.json();
    alert('Route added successfully!');
    loadSection('routes');
  } catch (error) {
    console.error('Error adding route:', error);
    alert(error.message || 'Failed to add route');
  }
}

// Add bus form
function addBusForm() {
  const contentDiv = document.querySelector('.admin-content');
  if (!contentDiv) return;

  contentDiv.innerHTML = `
    <div class="admin-form-container">
      <h2>Add New Bus</h2>
      <form id="addBusForm" class="admin-form">
        <div class="form-group">
          <label for="busNumber">Bus Number</label>
          <input type="text" id="busNumber" name="busNumber" required>
        </div>
        <div class="form-group">
          <label for="capacity">Capacity</label>
          <input type="number" id="capacity" name="capacity" required min="1">
        </div>
        <div class="form-group">
          <label for="type">Bus Type</label>
          <select id="type" name="type" required>
            <option value="AC">AC</option>
            <option value="Non-AC">Non-AC</option>
          </select>
        </div>
        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" name="status" required>
            <option value="active">Active</option>
            <option value="maintenance">Maintenance</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Add Bus</button>
          <button type="button" class="btn btn-outline" onclick="loadSection('buses')">Cancel</button>
        </div>
      </form>
    </div>
  `;

  // Add form submission handler
  const form = document.getElementById('addBusForm');
  if (form) {
    form.addEventListener('submit', handleAddBus);
  }
}

// Handle add bus form submission
async function handleAddBus(event) {
  event.preventDefault();
  
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login again');
    window.location.href = '../html/login.html';
    return;
  }

  const formData = {
    busNumber: document.getElementById('busNumber').value,
    capacity: parseInt(document.getElementById('capacity').value),
    type: document.getElementById('type').value,
    status: document.getElementById('status').value
  };

  try {
    const response = await fetch('http://localhost:3000/api/buses', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add bus');
    }

    const result = await response.json();
    alert('Bus added successfully!');
    loadSection('buses');
  } catch (error) {
    console.error('Error adding bus:', error);
    alert(error.message || 'Failed to add bus');
  }
}

// Add schedule form
function addScheduleForm() {
  const contentDiv = document.querySelector('.admin-content');
  if (!contentDiv) return;

  contentDiv.innerHTML = `
    <div class="admin-form-container">
      <h2>Add New Schedule</h2>
      <form id="addScheduleForm" class="admin-form">
        <div class="form-group">
          <label for="bus">Bus</label>
          <select id="bus" name="bus" required>
            <!-- Buses will be populated dynamically -->
          </select>
        </div>
        <div class="form-group">
          <label for="route">Route</label>
          <select id="route" name="route" required>
            <!-- Routes will be populated dynamically -->
          </select>
        </div>
        <div class="form-group">
          <label for="departureTime">Departure Time</label>
          <input type="datetime-local" id="departureTime" name="departureTime" required>
        </div>
        <div class="form-group">
          <label for="arrivalTime">Arrival Time</label>
          <input type="datetime-local" id="arrivalTime" name="arrivalTime" required>
        </div>
        <div class="form-group">
          <label for="seatsAvailable">Seats Available</label>
          <input type="number" id="seatsAvailable" name="seatsAvailable" required min="0">
        </div>
        <div class="form-group">
          <label for="status">Status</label>
          <select id="status" name="status" required>
            <option value="scheduled">Scheduled</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div class="form-actions">
          <button type="submit" class="btn btn-primary">Add Schedule</button>
          <button type="button" class="btn btn-outline" onclick="loadSection('schedules')">Cancel</button>
        </div>
      </form>
    </div>
  `;

  // Populate buses and routes dropdowns
  populateBusesAndRoutes();

  // Add form submission handler
  const form = document.getElementById('addScheduleForm');
  if (form) {
    form.addEventListener('submit', handleAddSchedule);
  }
}

// Populate buses and routes dropdowns
async function populateBusesAndRoutes() {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    // Fetch buses
    const busesResponse = await fetch('http://localhost:3000/api/buses', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const buses = await busesResponse.json();

    // Fetch routes
    const routesResponse = await fetch('http://localhost:3000/api/routes', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    const routes = await routesResponse.json();

    // Populate buses dropdown
    const busSelect = document.getElementById('bus');
    if (busSelect) {
      busSelect.innerHTML = buses.map(bus => 
        `<option value="${bus._id}">${bus.busNumber} (${bus.type})</option>`
      ).join('');
    }

    // Populate routes dropdown
    const routeSelect = document.getElementById('route');
    if (routeSelect) {
      routeSelect.innerHTML = routes.map(route => 
        `<option value="${route._id}">${route.routeNumber} (${route.startPoint} - ${route.endPoint})</option>`
      ).join('');
    }
  } catch (error) {
    console.error('Error populating dropdowns:', error);
  }
}

// Handle add schedule form submission
async function handleAddSchedule(event) {
  event.preventDefault();
  
  const token = localStorage.getItem('token');
  if (!token) {
    alert('Please login again');
    window.location.href = '../html/login.html';
    return;
  }

  const formData = {
    bus: document.getElementById('bus').value,
    route: document.getElementById('route').value,
    departureTime: new Date(document.getElementById('departureTime').value).toISOString(),
    arrivalTime: new Date(document.getElementById('arrivalTime').value).toISOString(),
    seatsAvailable: parseInt(document.getElementById('seatsAvailable').value),
    status: document.getElementById('status').value
  };

  try {
    const response = await fetch('http://localhost:3000/api/schedules', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(formData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to add schedule');
    }

    const result = await response.json();
    alert('Schedule added successfully!');
    loadSection('schedules');
  } catch (error) {
    console.error('Error adding schedule:', error);
    alert(error.message || 'Failed to add schedule');
  }
}
