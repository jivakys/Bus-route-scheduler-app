// Constants
const API_BASE_URL = "https://bus-scheduler-backend.onrender.com";

// Function to handle login
async function handleLogin(email, password) {
  try {
    // Show loading state
    const submitButton = document.querySelector(".login-btn");
    submitButton.textContent = "Logging in...";
    submitButton.disabled = true;

    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    // Store user data
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.user?.name || "User");
    localStorage.setItem("userRole", data.user?.role || "user");

    // Redirect based on role
    if (data.user?.role === "admin") {
      window.location.href = "./admin.html";
    } else {
      window.location.href = "../index.html";
    }
  } catch (error) {
    // Show error message
    const errorMessage = document.getElementById("errorMessage");
    if (errorMessage) {
      errorMessage.textContent = error.message;
      errorMessage.style.display = "block";
    }
  } finally {
    // Reset button state
    const submitButton = document.querySelector(".login-btn");
    submitButton.textContent = "Login";
    submitButton.disabled = false;
  }
}

// Initialize login form
document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");

  if (loginForm) {
    loginForm.addEventListener("submit", (e) => {
      e.preventDefault();

      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      // Basic validation
      if (!email || !password) {
        const errorMessage = document.getElementById("errorMessage");
        if (errorMessage) {
          errorMessage.textContent = "Please fill in all fields";
          errorMessage.style.display = "block";
        }
        return;
      }

      handleLogin(email, password);
    });
  }

  // Check if user is already logged in
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (token && userRole) {
    // If on login page and already logged in, redirect appropriately
    if (window.location.pathname.includes("login.html")) {
      if (userRole === "admin") {
        window.location.href = "./admin.html";
      } else {
        window.location.href = "../index.html";
      }
    }
  }
});
