// Constants
const API_BASE_URL = "https://bus-scheduler-backend.onrender.com";
const FRONTEND_URL = "https://bus-route-scheduler-app.vercel.app";

// Check authentication on page load
document.addEventListener("DOMContentLoaded", () => {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  // If no token or admin role, redirect to login
  if (!token || userRole === "admin") {
    window.location.href = `${FRONTEND_URL}/html/admin.html`;
    return;
  }

  // Display username
  const username = localStorage.getItem("username");
  const usernameElement = document.getElementById("username");
  if (usernameElement) {
    usernameElement.textContent = username;
  }

  // Setup logout button
  const logoutButton = document.getElementById("logoutButton");
  if (logoutButton) {
    logoutButton.addEventListener("click", () => {
      localStorage.clear();
      window.location.href = `${FRONTEND_URL}/html/login.html`;
    });
  }
});
