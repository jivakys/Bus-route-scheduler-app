// Constants
const API_BASE_URL = "https://bus-scheduler-backend.onrender.com";

// Fetch data with authentication
const fetchWithAuth = async (endpoint, options = {}) => {
  const token = localStorage.getItem("adminToken");
  if (!token) {
    window.location.href = `./html/login.html`;
    return;
  }

  const defaultOptions = {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...defaultOptions,
      ...options,
    });

    if (response.status === 401) {
      localStorage.removeItem("adminToken");
      window.location.href = `./html/login.html`;
      return;
    }

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    throw error;
  }
};

// Load Users Section
const loadUsersSection = async () => {
  try {
    const users = await fetchWithAuth("/api/users");

    const usersTable = document.querySelector(".admin-content");
    usersTable.innerHTML = `
            <div class="section-header">
                <h2>Users Management</h2>
                <button class="add-btn" onclick="showAddUserModal()">
                    <i class="fas fa-plus"></i> Add User
                </button>
            </div>
            <div class="table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Email</th>
                            <th>Role</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="usersTableBody">
                        ${users
                          .map(
                            (user) => `
                            <tr>
                                <td>${user.name}</td>
                                <td>${user.email}</td>
                                <td>${user.role}</td>
                                <td><span class="status ${user.status}">${user.status}</span></td>
                                <td>
                                    <button class="edit-btn" onclick="editUser('${user._id}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="delete-btn" onclick="deleteUser('${user._id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `
                          )
                          .join("")}
                    </tbody>
                </table>
            </div>
        `;
  } catch (error) {
    console.error("Error loading users:", error);
    document.querySelector(".admin-content").innerHTML = `
            <div class="error-message">
                <h3>Error Loading Users</h3>
                <p>Please try again later or contact support if the problem persists.</p>
            </div>
        `;
  }
};

// Add User
const addUser = async (userData) => {
  try {
    await fetchWithAuth("/api/users", {
      method: "POST",
      body: JSON.stringify(userData),
    });
    await loadUsersSection();
  } catch (error) {
    console.error("Error adding user:", error);
    throw error;
  }
};

// Edit User
const editUser = async (userId, userData) => {
  try {
    await fetchWithAuth(`/api/users/${userId}`, {
      method: "PUT",
      body: JSON.stringify(userData),
    });
    await loadUsersSection();
  } catch (error) {
    console.error("Error editing user:", error);
    throw error;
  }
};

// Delete User
const deleteUser = async (userId) => {
  if (!confirm("Are you sure you want to delete this user?")) return;

  try {
    await fetchWithAuth(`/api/users/${userId}`, {
      method: "DELETE",
    });
    await loadUsersSection();
  } catch (error) {
    console.error("Error deleting user:", error);
    throw error;
  }
};

// Export functions
window.userFunctions = {
  loadUsersSection,
  addUser,
  editUser,
  deleteUser,
};
