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
        console.log("Attempting to login with URL:", `${API_BASE_URL}/api/auth/login`);
        console.log("Request payload:", { email, password });
        
        const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json"
          },
          mode: "cors",
          credentials: "omit",
          body: JSON.stringify({ email, password }),
        });

        console.log("Response status:", response.status);
        console.log("Response headers:", Object.fromEntries(response.headers.entries()));
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Login failed with status:", response.status);
          console.error("Error response:", errorText);
          throw new Error(`Login failed: ${response.status} ${errorText}`);
        }

        const data = await response.json();
        console.log("Login successful, response data:", data);

        // Store token and user info
        localStorage.setItem("token", data.token);
        localStorage.setItem("username", data.user?.name || data.name || "User");
        localStorage.setItem("userRole", data.user?.role || data.role || "user");

        console.log("Stored user data:", {
          token: data.token,
          username: localStorage.getItem("username"),
          role: localStorage.getItem("userRole")
        });

        // Redirect based on role
        if (data.user?.role === "admin" || data.role === "admin") {
          window.location.href = `${FRONTEND_URL}/html/admin.html`;
        } else {
          window.location.href = `${FRONTEND_URL}/index.html`;
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
    const token = localStorage.getItem("token");
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
        localStorage.removeItem("token");
      }
    }
  }
});
