// Function to check if user is logged in
function checkAuthState() {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const userRole = localStorage.getItem("userRole");
  const userProfile = document.getElementById("userProfile");
  const loginButtons = document.getElementById("loginButtons");
  const userName = document.getElementById("userName");
  const adminLink = document.getElementById("adminLink");

  console.log("Auth State Check:");
  console.log("Token:", token ? "Present" : "Missing");
  console.log("Username:", username);
  console.log("User Role:", userRole);
  console.log("Current Path:", window.location.pathname);

  // If we're on the admin page, only check if user is admin
  if (window.location.pathname.includes("admin.html")) {
    if (token && userRole === "admin") {
      console.log("Admin page - User is authenticated as admin");
      return;
    } else {
      console.log("Admin page - User is not authenticated as admin, redirecting to login");
      window.location.href = `${FRONTEND_URL}/html/login.html`;
      return;
    }
  }

  // For non-admin pages
  if (token && username) {
    // User is logged in
    if (userProfile) userProfile.style.display = "flex";
    if (loginButtons) loginButtons.style.display = "none";
    if (userName) userName.textContent = username;
    console.log("User is logged in, displaying username:", username);

    // Check if user is admin
    if (userRole === "admin" && adminLink) {
      adminLink.style.display = "block";
    }
  } else {
    // User is not logged in
    if (userProfile) userProfile.style.display = "none";
    if (loginButtons) loginButtons.style.display = "flex";
    if (adminLink) adminLink.style.display = "none";
    console.log("User is not logged in, showing login buttons");
  }
}

// Function to handle logout
function handleLogout() {
  console.log("Logging out...");
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  localStorage.removeItem("userRole");
  checkAuthState();
  window.location.href = `${FRONTEND_URL}/index.html`;
}

// Initialize auth state when page loads
document.addEventListener("DOMContentLoaded", () => {
  console.log("Auth.js initialized");
  checkAuthState();

  // Add logout event listener
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", handleLogout);
  }

  // Handle login form submission
  const loginForm = document.getElementById("loginForm");
  if (loginForm) {
    loginForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const email = document.getElementById("email").value;
      const password = document.getElementById("password").value;

      try {
        const response = await fetch("https://bus-scheduler-backend.onrender.com/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();
        if (response.ok) {
          localStorage.setItem("token", data.token);
          localStorage.setItem("username", data.username);
          localStorage.setItem("userRole", data.role);
          // Check if user is admin
          if (data.role === "admin") {
            window.location.href = "/html/admin.html";
          } else {
            window.location.href = "/";
          }
        } else {
          alert(data.message || "Login failed");
        }
      } catch (error) {
        console.error("Login error:", error);
        alert("An error occurred during login");
      }
    });
  }

  // Handle register form submission
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
        const response = await fetch(
          "http://localhost:3000/api/auth/register",
          {
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
          }
        );

        const data = await response.json();
        if (response.ok) {
          alert("Registration successful! Please login.");
          window.location.href = "login.html";
        } else {
          // Display validation errors from the server
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
