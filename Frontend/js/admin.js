// Admin Panel Main Script
document.addEventListener("DOMContentLoaded", () => {
  // Constants
  const API_BASE_URL = "https://bus-scheduler-backend.onrender.com";
  const FRONTEND_URL = "https://bus-route-scheduler-app.vercel.app";

  // DOM Elements
  const sidebarLinks = document.querySelectorAll(".sidebar-menu a");
  const adminContent = document.querySelector(".admin-content");
  const logoutBtn = document.querySelector(".logout-btn");

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
        // Token expired or invalid
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

  // Load Dashboard Data
  const loadDashboard = async () => {
    try {
      const [routes, buses, users, bookings] = await Promise.all([
        fetchWithAuth("/api/routes"),
        fetchWithAuth("/api/buses"),
        fetchWithAuth("/api/users"),
        fetchWithAuth("/api/bookings"),
      ]);

      // Update stats
      document.getElementById("totalRoutes").textContent = routes.length;
      document.getElementById("totalBuses").textContent = buses.length;
      document.getElementById("totalUsers").textContent = users.length;
      document.getElementById("activeBookings").textContent = bookings.filter(
        (b) => b.status === "active"
      ).length;

      // Update recent routes
      const recentRoutesHtml = routes
        .slice(0, 5)
        .map(
          (route) => `
        <tr>
          <td>${route.routeNumber}</td>
          <td>${route.startPoint}</td>
          <td>${route.endPoint}</td>
          <td>${new Date(route.createdAt).toLocaleDateString()}</td>
        </tr>
      `
        )
        .join("");
      document.getElementById("recentRoutes").innerHTML = recentRoutesHtml;

      // Update recent bookings
      const recentBookingsHtml = bookings
        .slice(0, 5)
        .map(
          (booking) => `
        <tr>
          <td>${booking.busNumber}</td>
          <td>${booking.route}</td>
          <td>${new Date(booking.departureTime).toLocaleString()}</td>
          <td><span class="status ${booking.status}">${
            booking.status
          }</span></td>
        </tr>
      `
        )
        .join("");
      document.getElementById("recentBookings").innerHTML = recentBookingsHtml;
    } catch (error) {
      console.error("Error loading dashboard:", error);
      // Show error message to user
      adminContent.innerHTML = `
        <div class="error-message">
          <h3>Error Loading Dashboard</h3>
          <p>Please try again later or contact support if the problem persists.</p>
        </div>
      `;
    }
  };

  // Handle Sidebar Navigation
  sidebarLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const section = link.getAttribute("data-section");

      // Update active state
      sidebarLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      // Update header title
      document.querySelector(".header-left h1").textContent =
        section.charAt(0).toUpperCase() + section.slice(1);

      // Load section content
      if (section === "dashboard") {
        loadDashboard();
      }
      // Other sections will be handled by their respective JS files
    });
  });

  // Handle Logout
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("adminToken");
    window.location.href = `${FRONTEND_URL}/html/login.html`;
  });

  // Initialize Dashboard
  loadDashboard();
});

function initializeAdminPanel() {
  // Load dashboard data
  loadDashboardData();

  // Handle sidebar navigation
  const sidebarLinks = document.querySelectorAll(".sidebar-menu a");
  sidebarLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const section = link.getAttribute("data-section");
      loadSection(section);
    });
  });

  // Handle logout
  const logoutBtn = document.querySelector(".logout-btn");
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    window.location.href = "../index.html";
  });
}

async function loadDashboardData() {
  try {
    const response = await fetch(
      "https://bus-scheduler-backend.onrender.com/api/admin/dashboard",
      {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      }
    );

    if (!response.ok) {
      throw new Error("Failed to fetch dashboard data");
    }

    const data = await response.json();
    updateDashboard(data);
  } catch (error) {
    console.error("Error fetching dashboard data:", error);
    showError("Error Loading Dashboard", error.message);
  }
}

function updateDashboard(data) {
  // Update stats
  document.getElementById("totalRoutes").textContent = data.totalRoutes;
  document.getElementById("totalBuses").textContent = data.totalBuses;
  document.getElementById("totalUsers").textContent = data.totalUsers;
  document.getElementById("activeBookings").textContent = data.activeBookings;

  // Update recent routes
  const recentRoutesList = document.getElementById("recentRoutes");

  recentRoutesList.innerHTML = data.recentRoutes
    .map(
      (route) => `
    <tr>
      <td>${route.routeNumber}</td>
      <td>${route.startPoint}</td>
      <td>${route.endPoint}</td>
      <td>${new Date(route.createdAt).toLocaleDateString()}</td>
    </tr>
  `
    )
    .join("");

  // Update recent bookings
  const recentBookingsList = document.getElementById("recentBookings");
  recentBookingsList.innerHTML = data.recentBookings
    .map(
      (booking) => `
    <tr>
      <td>${booking.busNumber}</td>
      <td>${booking.routeNumber}</td>
      <td>${new Date(booking.departureTime).toLocaleString()}</td>
      <td><span class="status ${booking.status.toLowerCase()}">${
        booking.status
      }</span></td>
    </tr>
  `
    )
    .join("");
}

function showError(title, message) {
  const contentDiv = document.querySelector(".admin-content");
  contentDiv.innerHTML = `
    <div class="error-message">
      <h3>${title}</h3>
      <p>${message}</p>
      <button onclick="loadDashboardData()" class="retry-btn">Retry</button>
    </div>
  `;
}

async function loadSection(section) {
  const contentDiv = document.querySelector(".admin-content");

  // Update active link
  document.querySelectorAll(".sidebar-menu a").forEach((link) => {
    link.classList.remove("active");
    if (link.getAttribute("data-section") === section) {
      link.classList.add("active");
    }
  });

  // Update header title
  document.querySelector(".header-left h1").textContent =
    section.charAt(0).toUpperCase() + section.slice(1);

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
    showError(
      `Error Loading ${section.charAt(0).toUpperCase() + section.slice(1)}`,
      error.message
    );
  }
}

async function loadDashboardSection() {
  const contentDiv = document.querySelector(".admin-content");
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
          <table class="admin-table">
            <thead>
              <tr>
                <th>Route Number</th>
                <th>Start Point</th>
                <th>End Point</th>
                <th>Created At</th>
              </tr>
            </thead>
            <tbody id="recentRoutes">
              <!-- Recent routes will be populated here -->
            </tbody>
          </table>
        </div>
        
        <div class="recent-card">
          <h3>Recent Bookings</h3>
          <table class="admin-table">
            <thead>
              <tr>
                <th>Bus Number</th>
                <th>Route</th>
                <th>Departure Time</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="recentBookings">
              <!-- Recent bookings will be populated here -->
            </tbody>
          </table>
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
