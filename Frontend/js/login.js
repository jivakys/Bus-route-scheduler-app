document.addEventListener("DOMContentLoaded", () => {
  const loginForm = document.getElementById("loginForm");
  const errorMessage = document.getElementById("errorMessage");

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
        console.log("Login response:", data);

        if (response.ok) {
          localStorage.setItem("token", data.token);
          console.log("Token stored in localStorage");

          const payload = JSON.parse(atob(data.token.split(".")[1]));
          // console.log("Decoded token payload:", payload);
          // console.log("User role:", payload.role);

          if (payload.role === "admin") {
            // console.log("Redirecting to admin page...");
            window.location.href = "./admin.html";
          } else {
            // console.log("Redirecting to index page...");
            window.location.href = "../index.html";
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
          errorMessage.textContent = "An error occurred during login";
          errorMessage.style.display = "block";
        } else {
          alert("An error occurred during login");
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
          window.location.href = "../html/admin.html";
        } else {
          console.log("Token check - Redirecting to index page...");
          window.location.href = "../index.html";
        }
      } catch (error) {
        console.error("Token check error:", error);
        localStorage.removeItem("token");
      }
    }
  }
});
