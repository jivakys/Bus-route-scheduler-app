// Admin Authentication Configuration
const API_BASE_URL = "https://bus-scheduler-backend.onrender.com";
// const FRONTEND_URL = "https://bus-route-scheduler-app.vercel.app";

// Function to verify admin authentication
async function verifyAdminAuth() {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  console.log("Admin auth check - Initial state:", {
    token: token ? "Present" : "Missing",
    userRole: userRole || "Not set",
  });

  if (!token || userRole !== "admin") {
    console.log("Auth check failed - Missing token or incorrect role");
    localStorage.clear(); // Clear all stored data
    window.location.href = "/html/login.html";
    return false;
  }

  try {
    console.log("Verifying admin token with backend...");
    const response = await fetch(`${API_BASE_URL}/api/admin/verify`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    console.log("Verification response status:", response.status);

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Verification failed:", errorData);
      throw new Error(`Verification failed: ${response.status}`);
    }

    const data = await response.json();
    console.log("Verification successful, user data:", data);

    if (data.role !== "admin") {
      throw new Error("User is not an admin");
    }

    document.getElementById("adminName").textContent = data.name || "Admin";
    return true;
  } catch (error) {
    console.error("Admin verification error:", error);
    localStorage.clear(); // Clear all stored data
    window.location.href = "/html/login.html";
    return false;
  }
}

// Function to load admin dashboard data
async function loadAdminDashboard(token) {
  try {
    console.log("Loading admin dashboard data...");
    const [routesRes, busesRes, usersRes, bookingsRes] = await Promise.all([
      fetch(`${API_BASE_URL}/api/routes`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_BASE_URL}/api/buses`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_BASE_URL}/api/users`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
      fetch(`${API_BASE_URL}/api/bookings`, {
        headers: { Authorization: `Bearer ${token}` },
      }),
    ]);

    if (!routesRes.ok || !busesRes.ok || !usersRes.ok || !bookingsRes.ok) {
      throw new Error("Failed to load dashboard data");
    }

    const [routes, buses, users, bookings] = await Promise.all([
      routesRes.json(),
      busesRes.json(),
      usersRes.json(),
      bookingsRes.json(),
    ]);

    // Update dashboard stats
    document.getElementById("totalRoutes").textContent = routes.length || 0;
    document.getElementById("totalBuses").textContent = buses.length || 0;
    document.getElementById("totalUsers").textContent = users.length || 0;
    document.getElementById("activeBookings").textContent =
      bookings.filter((b) => b.status === "active").length || 0;

    console.log("Dashboard data loaded successfully");
  } catch (error) {
    console.error("Error loading dashboard data:", error);
    document.getElementById("adminName").textContent = "Error loading data";
  }
}

// Initialize admin page
function initializeAdminPage() {
  console.log("Admin page initialized");

  // Prevent form submissions
  const forms = document.querySelectorAll("form");
  forms.forEach((form) => {
    form.addEventListener("submit", (e) => {
      e.preventDefault();
      e.stopPropagation();
      return false;
    });
  });

  // Verify admin auth and load data
  verifyAdminAuth().then((isAuthenticated) => {
    if (isAuthenticated) {
      const token = localStorage.getItem("token");
      loadAdminDashboard(token);
    }
  });
}

// Export functions for use in other files
export { verifyAdminAuth, loadAdminDashboard, initializeAdminPage };
