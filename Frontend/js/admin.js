// Admin Panel Main Script
document.addEventListener("DOMContentLoaded", () => {
  // Constants
  const API_BASE_URL = "http://localhost:3000"; // Update this to your backend URL

  // DOM Elements
  const sidebarLinks = document.querySelectorAll(".sidebar-menu a");
  const adminContent = document.querySelector(".admin-content");
  const logoutBtn = document.querySelector(".logout-btn");

  // Check authentication
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token || userRole !== "admin") {
    window.location.href = "./login.html";
    return;
  }

  // Fetch data with authentication
  const fetchWithAuth = async (endpoint, options = {}) => {
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
        localStorage.clear();
        window.location.href = "./login.html";
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
      showError("Error Loading Dashboard", "Please try again later or contact support if the problem persists.");
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
    localStorage.clear();
    window.location.href = "./login.html";
  });

  // Initialize Dashboard
  loadDashboard();
});

function showError(title, message) {
  const contentDiv = document.querySelector(".admin-content");
  contentDiv.innerHTML = `
    <div class="error-message">
      <h3>${title}</h3>
      <p>${message}</p>
      <button onclick="window.location.reload()" class="retry-btn">Retry</button>
    </div>
  `;
}
