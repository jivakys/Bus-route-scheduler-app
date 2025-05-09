// Admin Panel Main Script

// Global fetchWithAuth function
async function fetchWithAuth(endpoint, options = {}) {
  const token = localStorage.getItem("token");
  if (!token) {
    window.location.href = "./login.html";
    return null;
  }

  const defaultOptions = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const url = `${window.API_BASE_URL}${endpoint}`;
    console.log("Fetching from:", url);
    
    // Log the complete request details
    const requestDetails = {
      url,
      method: options.method || 'GET',
      headers: { ...defaultOptions.headers, ...options.headers },
      body: options.body ? JSON.parse(options.body) : undefined
    };
    console.log("Request details:", JSON.stringify(requestDetails, null, 2));
    
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    });

    // Check if response is HTML (usually means 404 or server error)
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("text/html")) {
      console.warn(`Received HTML response from ${endpoint}`);
      return null;
    }

    if (response.status === 401) {
      localStorage.clear();
      window.location.href = "./login.html";
      return null;
    }

    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Endpoint ${endpoint} not found`);
        return null;
      }
      if (response.status === 500) {
        console.error("Server error details:", data);
        throw new Error(data.message || "Server error occurred");
      }
      throw new Error(data.message || `HTTP error! status: ${response.status}`);
    }

    return data;
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
}

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const sidebarLinks = document.querySelectorAll(".sidebar-menu a");
  const adminContent = document.querySelector(".admin-content");
  const logoutBtn = document.querySelector(".logout-btn");
  const dashboardSection = document.getElementById("dashboardSection");
  const routesSection = document.getElementById("routesSection");

  // Form Elements
  const routeForm = document.getElementById("routeForm");
  const busForm = document.getElementById("busForm");
  const scheduleForm = document.getElementById("scheduleForm");

  // Check authentication
  const token = localStorage.getItem("token");
  const userRole = localStorage.getItem("userRole");

  if (!token || userRole !== "admin") {
    window.location.href = "./login.html";
    return;
  }

  // Form Submission Handlers
  if (routeForm) {
    routeForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(routeForm);
      const routeData = {
        routeNumber: formData.get("routeNumber"),
        startPoint: formData.get("startPoint"),
        endPoint: formData.get("endPoint"),
        distance: parseInt(formData.get("distance")),
        estimatedTime: parseInt(formData.get("estimatedTime")),
      };

      try {
        const editId = routeForm.dataset.editId;
        const method = editId ? "PUT" : "POST";
        const url = editId ? `/api/routes/${editId}` : "/api/routes";

        await fetchWithAuth(url, {
          method,
          body: JSON.stringify(routeData),
        });

        showSuccess(editId ? "Route updated successfully" : "Route added successfully");
        hideAddRouteForm();
        loadRoutes();
        loadDashboard();
      } catch (error) {
        console.error("Error saving route:", error);
        showError("Error", error.message || "Failed to save route");
      }
    });
  }

  if (busForm) {
    busForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(busForm);
      const busData = {
        busNumber: formData.get("busNumber"),
        capacity: parseInt(formData.get("capacity")),
        model: formData.get("model"),
      };

      try {
        const editId = busForm.dataset.editId;
        const method = editId ? "PUT" : "POST";
        const url = editId ? `/api/buses/${editId}` : "/api/buses";

        await fetchWithAuth(url, {
          method,
          body: JSON.stringify(busData),
        });

        showSuccess(editId ? "Bus updated successfully" : "Bus added successfully");
        hideAddBusForm();
        loadBuses();
        loadDashboard();
      } catch (error) {
        console.error("Error saving bus:", error);
        showError("Error", error.message || "Failed to save bus");
      }
    });
  }

  if (scheduleForm) {
    scheduleForm.addEventListener("submit", async (e) => {
      e.preventDefault();
      const formData = new FormData(scheduleForm);
      const scheduleData = {
        busId: formData.get("busId"),
        routeId: formData.get("routeId"),
        departureTime: formData.get("departureTime"),
        status: "scheduled",
      };

      try {
        const editId = scheduleForm.dataset.editId;
        const method = editId ? "PUT" : "POST";
        const url = editId ? `/api/schedules/${editId}` : "/api/schedules";

        await fetchWithAuth(url, {
          method,
          body: JSON.stringify(scheduleData),
        });

        showSuccess(editId ? "Schedule updated successfully" : "Schedule added successfully");
        hideAddScheduleForm();
        loadSchedules();
        loadDashboard();
      } catch (error) {
        console.error("Error saving schedule:", error);
        showError("Error", error.message || "Failed to save schedule");
      }
    });
  }

  // Load Dashboard Data
  const loadDashboard = async () => {
    try {
      const [routes, buses, users, schedules] = await Promise.all([
        fetchWithAuth("/api/routes"),
        fetchWithAuth("/api/buses"),
        fetchWithAuth("/api/users"),
        fetchWithAuth("/api/schedules")
      ]);

      console.log("Schedules data:", schedules);

      // Update stats with null checks and default values
      document.getElementById("totalRoutes").textContent = routes?.length || 0;
      document.getElementById("totalBuses").textContent = buses?.length || 0;
      document.getElementById("totalUsers").textContent = users?.length || 0;
      document.getElementById("activeBookings").textContent = schedules?.filter(
        (s) => s.status === "active" || s.status === "scheduled"
      ).length || 0;

      // Update recent routes with null check
      const recentRoutesHtml = (routes || [])
        .slice(0, 5)
        .map(
          (route) => `
        <tr>
          <td>${route.routeNumber || 'N/A'}</td>
          <td>${route.startPoint || 'N/A'}</td>
          <td>${route.endPoint || 'N/A'}</td>
          <td>${route.createdAt ? new Date(route.createdAt).toLocaleDateString() : 'N/A'}</td>
        </tr>
      `
        )
        .join("");
      document.getElementById("recentRoutes").innerHTML = recentRoutesHtml || "<tr><td colspan='4'>No recent routes</td></tr>";

      // Update recent schedules with proper data mapping
      const recentSchedulesHtml = (schedules || [])
        .slice(0, 5)
        .map(
          (schedule) => {
            const bus = buses?.find(b => b._id === schedule.busId);
            const route = routes?.find(r => r._id === schedule.routeId);
            
            return `
              <tr>
                <td>${bus?.busNumber || 'N/A'}</td>
                <td>${route ? `${route.startPoint} - ${route.endPoint}` : 'N/A'}</td>
                <td>${schedule.departureTime ? new Date(schedule.departureTime).toLocaleString() : 'N/A'}</td>
                <td><span class="status ${schedule.status || 'pending'}">${schedule.status || 'pending'}</span></td>
              </tr>
            `;
          }
        )
        .join("");
      document.getElementById("recentBookings").innerHTML = recentSchedulesHtml || "<tr><td colspan='4'>No recent schedules</td></tr>";
    } catch (error) {
      console.error("Error loading dashboard:", error);
      const dashboardContent = document.querySelector(".dashboard-container");
      if (dashboardContent) {
        dashboardContent.innerHTML = `
          <div class="error-message">
            <h3>Error Loading Dashboard</h3>
            <p>Unable to load dashboard data. Please try again later.</p>
            <button onclick="loadDashboard()" class="retry-btn">Retry</button>
          </div>
        `;
      }
    }
  };

  // Load Routes Data
  const loadRoutes = async () => {
    try {
      const routes = await fetchWithAuth("/api/routes");
      const routesTable = document.getElementById("routesTable");
      if (!routesTable) return;

      const routesHtml = (routes || [])
        .map(
          (route) => `
        <tr>
          <td>${route.routeNumber || 'N/A'}</td>
          <td>${route.startPoint || 'N/A'}</td>
          <td>${route.endPoint || 'N/A'}</td>
          <td>${route.distance || 'N/A'} km</td>
          <td>${route.estimatedTime || 'N/A'} min</td>
          <td>
            <button onclick="editRoute('${route._id}')" class="edit-btn">Edit</button>
            <button onclick="deleteRoute('${route._id}')" class="delete-btn">Delete</button>
          </td>
        </tr>
      `
        )
        .join("");
      routesTable.innerHTML = routesHtml || "<tr><td colspan='6'>No routes found</td></tr>";
    } catch (error) {
      console.error("Error loading routes:", error);
      showError("Error", "Failed to load routes. Please try again.");
    }
  };

  // Handle Sidebar Navigation
  sidebarLinks.forEach((link) => {
    link.addEventListener("click", (e) => {
      e.preventDefault();
      const section = link.getAttribute("data-section");

      // Update active state
      sidebarLinks.forEach((l) => l.classList.remove("active"));
      link.classList.add("active");

      // Update header title
      document.querySelector(".header-left h1").textContent =
        section.charAt(0).toUpperCase() + section.slice(1);

      // Hide all sections first
      const sections = [
        "dashboardSection",
        "routesSection",
        "busesSection",
        "schedulesSection",
        "usersSection"
      ];
      sections.forEach(sectionId => {
        const element = document.getElementById(sectionId);
        if (element) {
          element.style.display = "none";
        }
      });

      // Show selected section
      switch (section) {
        case "dashboard":
          dashboardSection.style.display = "block";
          loadDashboard();
          break;
        case "routes":
          routesSection.style.display = "block";
          loadRoutes();
          break;
        case "buses":
          const busesSection = document.getElementById("busesSection");
          if (busesSection) {
            busesSection.style.display = "block";
            loadBuses();
          }
          break;
        case "schedules":
          const schedulesSection = document.getElementById("schedulesSection");
          if (schedulesSection) {
            schedulesSection.style.display = "block";
            loadSchedules();
          }
          break;
        case "users":
          const usersSection = document.getElementById("usersSection");
          if (usersSection) {
            usersSection.style.display = "block";
            loadUsers();
          }
          break;
      }
    });
  });

  // Handle Logout
  logoutBtn.addEventListener("click", (e) => {
    e.preventDefault();
    localStorage.clear();
    window.location.href = "./login.html";
  });

  // Initialize Dashboard
  loadDashboard();
});

// Global functions
function showError(title, message) {
  const errorDiv = document.createElement("div");
  errorDiv.className = "error-message";
  errorDiv.innerHTML = `
    <h3>${title}</h3>
    <p>${message}</p>
  `;
  document.body.appendChild(errorDiv);
  setTimeout(() => errorDiv.remove(), 5000);
}

function showSuccess(message) {
  const successDiv = document.createElement("div");
  successDiv.className = "success-message";
  successDiv.textContent = message;
  document.body.appendChild(successDiv);
  setTimeout(() => successDiv.remove(), 5000);
}

// Form visibility functions
function showAddRouteForm() {
  const form = document.getElementById("addRouteForm");
  if (form) {
    form.style.display = "block";
    // Reset form
    const routeForm = document.getElementById("routeForm");
    if (routeForm) {
      routeForm.reset();
      delete routeForm.dataset.editId;
    }
  }
}

function hideAddRouteForm() {
  const form = document.getElementById("addRouteForm");
  if (form) {
    form.style.display = "none";
    // Reset form
    const routeForm = document.getElementById("routeForm");
    if (routeForm) {
      routeForm.reset();
      delete routeForm.dataset.editId;
    }
  }
}

function showAddBusForm() {
  const form = document.getElementById("addBusForm");
  if (form) {
    form.style.display = "block";
    // Reset form
    const busForm = document.getElementById("busForm");
    if (busForm) {
      busForm.reset();
      delete busForm.dataset.editId;
    }
  }
}

function hideAddBusForm() {
  const form = document.getElementById("addBusForm");
  if (form) {
    form.style.display = "none";
    // Reset form
    const busForm = document.getElementById("busForm");
    if (busForm) {
      busForm.reset();
      delete busForm.dataset.editId;
    }
  }
}

function showAddScheduleForm() {
  const form = document.getElementById("addScheduleForm");
  if (form) {
    form.style.display = "block";
    // Reset form
    const scheduleForm = document.getElementById("scheduleForm");
    if (scheduleForm) {
      scheduleForm.reset();
      delete scheduleForm.dataset.editId;
    }
    // Load buses and routes for dropdowns
    loadBusesForSchedule();
    loadRoutesForSchedule();
  }
}

function hideAddScheduleForm() {
  const form = document.getElementById("addScheduleForm");
  if (form) {
    form.style.display = "none";
    // Reset form
    const scheduleForm = document.getElementById("scheduleForm");
    if (scheduleForm) {
      scheduleForm.reset();
      delete scheduleForm.dataset.editId;
    }
  }
}

// Load Routes Data
async function loadRoutes() {
  try {
    const routes = await fetchWithAuth("/api/routes");
    const routesTable = document.getElementById("routesTable");
    if (!routesTable) return;

    const routesHtml = (routes || [])
      .map(
        (route) => `
        <tr>
          <td>${route.routeNumber || 'N/A'}</td>
          <td>${route.startPoint || 'N/A'}</td>
          <td>${route.endPoint || 'N/A'}</td>
          <td>${route.distance || 'N/A'} km</td>
          <td>${route.estimatedTime || 'N/A'} min</td>
          <td>
            <button onclick="editRoute('${route._id}')" class="edit-btn">Edit</button>
            <button onclick="deleteRoute('${route._id}')" class="delete-btn">Delete</button>
          </td>
        </tr>
      `
      )
      .join("");
    routesTable.innerHTML = routesHtml || "<tr><td colspan='6'>No routes found</td></tr>";
  } catch (error) {
    console.error("Error loading routes:", error);
    showError("Error", "Failed to load routes. Please try again.");
  }
}

// Load Buses Data
async function loadBuses() {
  try {
    const buses = await fetchWithAuth("/api/buses");
    const busesTable = document.getElementById("busesTable");
    if (!busesTable) return;

    const busesHtml = (buses || [])
      .map(
        (bus) => `
        <tr>
          <td>${bus.busNumber || 'N/A'}</td>
          <td>${bus.capacity || 'N/A'}</td>
          <td>${bus.model || 'N/A'}</td>
          <td>
            <button onclick="editBus('${bus._id}')" class="edit-btn">Edit</button>
            <button onclick="deleteBus('${bus._id}')" class="delete-btn">Delete</button>
          </td>
        </tr>
      `
      )
      .join("");
    busesTable.innerHTML = busesHtml || "<tr><td colspan='4'>No buses found</td></tr>";
  } catch (error) {
    console.error("Error loading buses:", error);
    showError("Error", "Failed to load buses. Please try again.");
  }
}

// Load Schedules Data
async function loadSchedules() {
  try {
    const schedules = await fetchWithAuth("/api/schedules");
    const schedulesTable = document.getElementById("schedulesTable");
    if (!schedulesTable) return;

    const schedulesHtml = (schedules || [])
      .map(
        (schedule) => `
        <tr>
          <td>${schedule.busNumber || 'N/A'}</td>
          <td>${schedule.routeNumber || 'N/A'}</td>
          <td>${schedule.departureTime ? new Date(schedule.departureTime).toLocaleString() : 'N/A'}</td>
          <td><span class="status ${schedule.status || 'pending'}">${schedule.status || 'pending'}</span></td>
          <td>
            <button onclick="editSchedule('${schedule._id}')" class="edit-btn">Edit</button>
            <button onclick="deleteSchedule('${schedule._id}')" class="delete-btn">Delete</button>
          </td>
        </tr>
      `
      )
      .join("");
    schedulesTable.innerHTML = schedulesHtml || "<tr><td colspan='5'>No schedules found</td></tr>";
  } catch (error) {
    console.error("Error loading schedules:", error);
    showError("Error", "Failed to load schedules. Please try again.");
  }
}

// Load Users Data
async function loadUsers() {
  try {
    const users = await fetchWithAuth("/api/users");
    const usersTable = document.getElementById("usersTable");
    if (!usersTable) return;

    const usersHtml = (users || [])
      .map(
        (user) => `
        <tr>
          <td>${user.username || 'N/A'}</td>
          <td>${user.email || 'N/A'}</td>
          <td>${user.role || 'N/A'}</td>
          <td>
            <button onclick="editUser('${user._id}')" class="edit-btn">Edit</button>
            <button onclick="deleteUser('${user._id}')" class="delete-btn">Delete</button>
          </td>
        </tr>
      `
      )
      .join("");
    usersTable.innerHTML = usersHtml || "<tr><td colspan='4'>No users found</td></tr>";
  } catch (error) {
    console.error("Error loading users:", error);
    showError("Error", "Failed to load users. Please try again.");
  }
}

// Load Buses for Schedule Form
async function loadBusesForSchedule() {
  try {
    const buses = await fetchWithAuth("/api/buses");
    const busSelect = document.getElementById("busId");
    if (!busSelect) return;

    const busOptions = (buses || [])
      .map(
        (bus) => `
        <option value="${bus._id}">${bus.busNumber} - ${bus.model}</option>
      `
      )
      .join("");
    busSelect.innerHTML = busOptions || "<option value=''>No buses available</option>";
  } catch (error) {
    console.error("Error loading buses for schedule:", error);
    showError("Error", "Failed to load buses for schedule form");
  }
}

// Load Routes for Schedule Form
async function loadRoutesForSchedule() {
  try {
    const routes = await fetchWithAuth("/api/routes");
    const routeSelect = document.getElementById("routeId");
    if (!routeSelect) return;

    const routeOptions = (routes || [])
      .map(
        (route) => `
        <option value="${route._id}">${route.routeNumber} - ${route.startPoint} to ${route.endPoint}</option>
      `
      )
      .join("");
    routeSelect.innerHTML = routeOptions || "<option value=''>No routes available</option>";
  } catch (error) {
    console.error("Error loading routes for schedule:", error);
    showError("Error", "Failed to load routes for schedule form");
  }
}

// Edit and Delete functions
async function editRoute(routeId) {
  try {
    const route = await fetchWithAuth(`/api/routes/${routeId}`);
    if (!route) {
      showError("Error", "Route not found");
      return;
    }

    // Populate form with route data
    const form = document.getElementById("addRouteForm");
    if (form) {
      const routeForm = document.getElementById("routeForm");
      if (routeForm) {
        routeForm.routeNumber.value = route.routeNumber || "";
        routeForm.startPoint.value = route.startPoint || "";
        routeForm.endPoint.value = route.endPoint || "";
        routeForm.distance.value = route.distance || "";
        routeForm.estimatedTime.value = route.estimatedTime || "";
        routeForm.dataset.editId = routeId;
        showAddRouteForm();
      }
    }
  } catch (error) {
    console.error("Error loading route:", error);
    showError("Error", "Failed to load route details");
  }
}

async function deleteRoute(routeId) {
  if (!confirm("Are you sure you want to delete this route?")) return;

  try {
    await fetchWithAuth(`/api/routes/${routeId}`, {
      method: "DELETE",
    });
    showSuccess("Route deleted successfully");
    loadRoutes();
    loadDashboard();
  } catch (error) {
    console.error("Error deleting route:", error);
    showError("Error", "Failed to delete route");
  }
}

async function editBus(busId) {
  try {
    const bus = await fetchWithAuth(`/api/buses/${busId}`);
    if (!bus) {
      showError("Error", "Bus not found");
      return;
    }

    // Populate form with bus data
    const form = document.getElementById("addBusForm");
    if (form) {
      const busForm = document.getElementById("busForm");
      if (busForm) {
        busForm.busNumber.value = bus.busNumber || "";
        busForm.capacity.value = bus.capacity || "";
        busForm.model.value = bus.model || "";
        busForm.dataset.editId = busId;
        showAddBusForm();
      }
    }
  } catch (error) {
    console.error("Error loading bus:", error);
    showError("Error", "Failed to load bus details");
  }
}

async function deleteBus(busId) {
  if (!confirm("Are you sure you want to delete this bus?")) return;

  try {
    await fetchWithAuth(`/api/buses/${busId}`, {
      method: "DELETE",
    });
    showSuccess("Bus deleted successfully");
    loadBuses();
    loadDashboard();
  } catch (error) {
    console.error("Error deleting bus:", error);
    showError("Error", "Failed to delete bus");
  }
}

async function editSchedule(scheduleId) {
  try {
    const schedule = await fetchWithAuth(`/api/schedules/${scheduleId}`);
    if (!schedule) {
      showError("Error", "Schedule not found");
      return;
    }

    // Load buses and routes for dropdowns
    await loadBusesForSchedule();
    await loadRoutesForSchedule();

    // Populate form with schedule data
    const form = document.getElementById("addScheduleForm");
    if (form) {
      const scheduleForm = document.getElementById("scheduleForm");
      if (scheduleForm) {
        scheduleForm.busId.value = schedule.busId || "";
        scheduleForm.routeId.value = schedule.routeId || "";
        scheduleForm.departureTime.value = schedule.departureTime ? new Date(schedule.departureTime).toISOString().slice(0, 16) : "";
        scheduleForm.dataset.editId = scheduleId;
        showAddScheduleForm();
      }
    }
  } catch (error) {
    console.error("Error loading schedule:", error);
    showError("Error", "Failed to load schedule details");
  }
}

async function deleteSchedule(scheduleId) {
  if (!confirm("Are you sure you want to delete this schedule?")) return;

  try {
    await fetchWithAuth(`/api/schedules/${scheduleId}`, {
      method: "DELETE",
    });
    showSuccess("Schedule deleted successfully");
    loadSchedules();
    loadDashboard();
  } catch (error) {
    console.error("Error deleting schedule:", error);
    showError("Error", "Failed to delete schedule");
  }
}

async function editUser(userId) {
  try {
    const user = await fetchWithAuth(`/api/users/${userId}`);
    if (!user) {
      showError("Error", "User not found");
      return;
    }

    // Populate form with user data
    const form = document.getElementById("editUserForm");
    if (form) {
      form.username.value = user.username || "";
      form.email.value = user.email || "";
      form.role.value = user.role || "user";
      form.dataset.editId = userId;
      showEditUserForm();
    }
  } catch (error) {
    console.error("Error loading user:", error);
    showError("Error", "Failed to load user details");
  }
}

async function deleteUser(userId) {
  if (!confirm("Are you sure you want to delete this user?")) return;

  try {
    await fetchWithAuth(`/api/users/${userId}`, {
      method: "DELETE",
    });
    showSuccess("User deleted successfully");
    loadUsers();
    loadDashboard();
  } catch (error) {
    console.error("Error deleting user:", error);
    showError("Error", "Failed to delete user");
  }
}