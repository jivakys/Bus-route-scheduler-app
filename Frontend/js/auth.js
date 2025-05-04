// Function to check if user is logged in
function checkAuthState() {
  const token = localStorage.getItem("token");
  const username = localStorage.getItem("username");
  const userProfile = document.getElementById("userProfile");
  const loginButtons = document.getElementById("loginButtons");
  const userName = document.getElementById("userName");
  const adminLink = document.getElementById("adminLink");

  console.log("Auth State Check:");
  console.log("Token:", token ? "Present" : "Missing");
  console.log("Username from localStorage:", username);
  console.log("User Profile Element:", userProfile);
  console.log("Login Buttons Element:", loginButtons);
  console.log("User Name Element:", userName);

  if (token && username) {
    // User is logged in
    userProfile.style.display = "flex";
    loginButtons.style.display = "none";
    userName.textContent = username;
    console.log("User is logged in, displaying username:", username);

    // Check if user is admin
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.role === "admin" && adminLink) {
        adminLink.style.display = "block";
      }
    } catch (error) {
      console.error("Error parsing token:", error);
    }
  } else {
    // User is not logged in
    userProfile.style.display = "none";
    loginButtons.style.display = "flex";
    if (adminLink) {
      adminLink.style.display = "none";
    }
    console.log("User is not logged in, showing login buttons");
  }
}

// Function to handle logout
function handleLogout() {
  console.log("Logging out...");
  localStorage.removeItem("token");
  localStorage.removeItem("username");
  // Check if we're in the html directory
  const isInHtmlDir = window.location.pathname.includes("/html/");
  window.location.href = isInHtmlDir ? "../index.html" : "./index.html";
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
        const response = await fetch("http://localhost:3000/api/auth/login", {
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
          // Check if user is admin
          const payload = JSON.parse(atob(data.token.split(".")[1]));
          if (payload.role === "admin") {
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
