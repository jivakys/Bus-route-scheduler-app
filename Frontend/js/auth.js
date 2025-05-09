// Constants
const API_BASE_URL = "https://bus-scheduler-backend.onrender.com";

// Function to check authentication state
function checkAuth() {
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token) {
    window.location.href = "./login.html";
    return;
  }

  if (userRole !== "admin") {
    window.location.href = "../index.html";
    return;
  }

  // Set admin name
  const adminName = localStorage.getItem("username");
  if (adminName) {
    document.getElementById("adminName").textContent = adminName;
  }
}

// Function to handle logout
function handleLogout() {
  localStorage.clear();
  window.location.href = "./login.html";
}

// Initialize auth state when DOM is loaded
document.addEventListener("DOMContentLoaded", checkAuth);

// Handle register form submission
document.addEventListener("DOMContentLoaded", () => {
  const registerForm = document.getElementById("registerForm");
  if (registerForm) {
    registerForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const username = document.getElementById("name").value.trim();
      const email = document.getElementById("email").value.trim();
      const password = document.getElementById("password").value;
      const confirmPassword = document.getElementById("confirmPassword").value;

      // Frontend validation
      if (username.length < 3) {
        alert("Username must be at least 3 characters long");
        return;
      }

      if (password.length < 6) {
        alert("Password must be at least 6 characters long");
        return;
      }

      if (password !== confirmPassword) {
        alert("Passwords do not match");
        return;
      }

      // Email validation
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        alert("Please enter a valid email address");
        return;
      }

      try {
        const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            username,
            email,
            password,
            role: "operator",
          }),
        });

        const data = await response.json();
        if (response.ok) {
          alert("Registration successful! Please login.");
          window.location.href = "./login.html";
        } else {
          if (data.errors) {
            const errorMessage = data.errors
              .map((error) => error.msg)
              .join("\n");
            alert(errorMessage);
          } else {
            alert(data.message || "Registration failed");
          }
        }
      } catch (error) {
        console.error("Registration error:", error);
        alert("An error occurred during registration");
      }
    });
  }
});
