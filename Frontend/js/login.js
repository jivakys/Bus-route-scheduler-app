// Constants
const API_BASE_URL = "https://bus-scheduler-backend.onrender.com";

// Function to handle login
async function handleLogin(email, password) {
  try {
    // Show loading state
    const submitButton = document.querySelector(".login-btn");
    if (!submitButton) {
      console.error("Login button not found!");
      return;
    }
    submitButton.textContent = "Logging in...";
    submitButton.disabled = true;

    console.log("Starting login process...");
    console.log("API URL:", `${window.API_BASE_URL}/api/auth/login`);

    const response = await fetch(`${window.API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    console.log("Response status:", response.status);
    console.log("Response headers:", Object.fromEntries(response.headers.entries()));

    const data = await response.json();
    console.log("Response data:", data);

    if (!response.ok) {
      throw new Error(data.message || "Login failed");
    }

    if (!data.token) {
      throw new Error("No token received from server");
    }

    if (!data.user) {
      throw new Error("No user data received from server");
    }

    // Store user data
    localStorage.setItem("token", data.token);
    localStorage.setItem("username", data.user?.username || "User");
    localStorage.setItem("userRole", data.user?.role || "user");

    console.log("Login successful!");
    console.log("Stored data:", {
      token: data.token,
      username: data.user?.username,
      role: data.user?.role
    });

    // Redirect based on role
    const redirectPath = data.user?.role === "admin" ? "./admin.html" : "../index.html";
    console.log("Redirecting to:", redirectPath);
    
    // Force a small delay to ensure localStorage is updated
    setTimeout(() => {
      window.location.href = redirectPath;
    }, 100);

  } catch (error) {
    console.error("Login error:", error);
    // Show error message
    const errorMessage = document.getElementById("errorMessage");
    if (errorMessage) {
      errorMessage.textContent = error.message;
      errorMessage.style.display = "block";
    } else {
      alert(error.message);
    }
  } finally {
    // Reset button state
    const submitButton = document.querySelector(".login-btn");
    if (submitButton) {
      submitButton.textContent = "Login";
      submitButton.disabled = false;
    }
  }
}

// Initialize login form
document.addEventListener("DOMContentLoaded", () => {
    console.log("DOM loaded, initializing login form...");
    const loginForm = document.getElementById("loginForm");
    
    if (loginForm) {
        console.log("Login form found, adding submit handler");
        loginForm.addEventListener("submit", (e) => {
            e.preventDefault();
            console.log("Form submitted");
            
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
    } else {
        console.error("Login form not found!");
    }

    // Check if user is already logged in
    const token = localStorage.getItem("token");
    const userRole = localStorage.getItem("userRole");

    if (token && userRole) {
        console.log("User already logged in, checking redirect...");
        if (window.location.pathname.includes("login.html")) {
            const redirectPath = userRole === "admin" ? "./admin.html" : "../index.html";
            console.log("Already logged in, redirecting to:", redirectPath);
            window.location.href = redirectPath;
        }
    }
});
