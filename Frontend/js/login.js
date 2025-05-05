// Constants
const API_BASE_URL = "https://bus-scheduler-backend.onrender.com";
const FRONTEND_URL = "https://bus-route-scheduler-app.vercel.app";

document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const errorMessage = document.getElementById("errorMessage");

  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        console.log("Full login response:", data);

        if (response.ok) {
          // Store token and user info
          localStorage.setItem("adminToken", data.token);
          localStorage.setItem("userRole", data.role);
          localStorage.setItem("userName", data.name);

          // Redirect based on role
          if (data.role === "admin") {
            window.location.href = `${FRONTEND_URL}/html/admin.html`;
          } else {
            window.location.href = `${FRONTEND_URL}/index.html`;
          }
        } else {
          if (errorMessage) {
            errorMessage.textContent = data.message || "Login failed";
            errorMessage.style.display = "block";
          } else {
            alert(data.message || "Login failed");
          }
        }
      } catch (error) {
        console.error("Login error:", error);
        if (errorMessage) {
          errorMessage.textContent =
            "An error occurred during login. Please check your connection.";
          errorMessage.style.display = "block";
        } else {
          alert(
            "An error occurred during login. Please check your connection."
          );
        }
      }
    });
  }

  // Only check token and redirect if we're not already on the login page
  const currentPath = window.location.pathname;
  if (!currentPath.includes("login.html")) {
    const token = localStorage.getItem("adminToken");
    if (token) {
      try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        console.log("Token check - Decoded payload:", payload);
        console.log("Token check - User role:", payload.role);

        if (payload.role === "admin") {
          console.log("Token check - Redirecting to admin page...");
          window.location.href = `${FRONTEND_URL}/html/admin.html`;
        } else {
          console.log("Token check - Redirecting to index page...");
          window.location.href = `${FRONTEND_URL}/index.html`;
        }
      } catch (error) {
        console.error("Token check error:", error);
        localStorage.removeItem("adminToken");
      }
    }
  }
});
