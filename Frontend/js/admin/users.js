// Users Management
async function loadUsersSection() {
  const contentDiv = document.querySelector(".admin-content");
  if (!contentDiv) return;

  // Create users section HTML
  contentDiv.innerHTML = `
        <div class="admin-section">
            <div class="section-header">
                <h2>Users Management</h2>
            </div>
            <div class="users-list" id="usersList">
                <!-- Users will be loaded here -->
            </div>
        </div>
    `;

  // Load users
  await loadUsers();
}

async function loadUsers() {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found");
    }

    console.log("Fetching users...");
    const response = await fetch("http://localhost:3000/api/users", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || "Failed to fetch users");
    }

    const users = await response.json();
    console.log("Users fetched successfully:", users);
    displayUsers(users);
  } catch (error) {
    console.error("Error loading users:", error);
    const usersList = document.getElementById("usersList");
    if (usersList) {
      usersList.innerHTML = `<div class="error-message">${error.message}</div>`;
    }
  }
}

function displayUsers(users) {
  const usersList = document.getElementById("usersList");
  if (!usersList) return;

  usersList.innerHTML = `
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
            <tbody>
                ${users
                  .map(
                    (user) => `
                    <tr>
                        <td>${user.username}</td>
                        <td>${user.email}</td>
                        <td>${user.role}</td>
                        <td>${user.status || "active"}</td>
                        <td>
                            <button class="btn btn-sm btn-edit" onclick="editUser('${
                              user._id
                            }')">Edit</button>
                            <button class="btn btn-sm btn-delete" onclick="deleteUser('${
                              user._id
                            }')">Delete</button>
                        </td>
                    </tr>
                `
                  )
                  .join("")}
            </tbody>
        </table>
    `;
}

async function editUser(userId) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to fetch user details");
    }

    const user = await response.json();
    showEditUserModal(user);
  } catch (error) {
    console.error("Error fetching user details:", error);
    alert("Failed to load user details. Please try again.");
  }
}

function showEditUserModal(user) {
  const modal = document.createElement("div");
  modal.className = "modal";
  modal.style.cssText = `
        display: block;
        position: fixed;
        z-index: 1000;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        background-color: rgba(0,0,0,0.4);
        overflow-y: auto;
    `;

  modal.innerHTML = `
        <div class="modal-content" style="
            background-color: #fefefe;
            margin: 5% auto;
            padding: 20px;
            border: 1px solid #888;
            width: 50%;
            max-width: 600px;
            border-radius: 5px;
            position: relative;
            max-height: 90vh;
            overflow-y: auto;
        ">
            <span class="close" style="
                color: #aaa;
                float: right;
                font-size: 28px;
                font-weight: bold;
                cursor: pointer;
                position: sticky;
                top: 0;
                z-index: 1;
                background: white;
                padding: 0 5px;
            ">&times;</span>
            <h2 style="margin-top: 0;">Edit User</h2>
            <form id="editUserForm" style="margin-top: 20px;">
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="editName" style="display: block; margin-bottom: 5px;">Name</label>
                    <input type="text" id="editName" required value="${
                      user.name
                    }"
                        style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="editEmail" style="display: block; margin-bottom: 5px;">Email</label>
                    <input type="email" id="editEmail" required value="${
                      user.email
                    }"
                        style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="editRole" style="display: block; margin-bottom: 5px;">Role</label>
                    <select id="editRole" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="user" ${
                          user.role === "user" ? "selected" : ""
                        }>User</option>
                        <option value="admin" ${
                          user.role === "admin" ? "selected" : ""
                        }>Admin</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="editStatus" style="display: block; margin-bottom: 5px;">Status</label>
                    <select id="editStatus" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="active" ${
                          user.status === "active" ? "selected" : ""
                        }>Active</option>
                        <option value="inactive" ${
                          user.status === "inactive" ? "selected" : ""
                        }>Inactive</option>
                    </select>
                </div>
                <div id="editErrorMessage" style="color: red; margin-bottom: 15px; display: none;"></div>
                <button type="submit" class="btn btn-primary" style="
                    background-color: #4CAF50;
                    color: white;
                    padding: 10px 15px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    width: 100%;
                ">Update User</button>
            </form>
        </div>
    `;

  document.body.appendChild(modal);

  // Handle form submission
  const form = modal.querySelector("#editUserForm");
  const errorMessage = modal.querySelector("#editErrorMessage");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMessage.style.display = "none";

    try {
      const userData = {
        name: document.getElementById("editName").value,
        email: document.getElementById("editEmail").value,
        role: document.getElementById("editRole").value,
        status: document.getElementById("editStatus").value,
      };

      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication token not found");
      }

      const response = await fetch(
        `http://localhost:3000/api/users/${user._id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(userData),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update user");
      }

      modal.remove();
      await loadUsers();
    } catch (error) {
      errorMessage.textContent =
        error.message || "Failed to update user. Please try again.";
      errorMessage.style.display = "block";
    }
  });

  // Handle modal close
  modal.querySelector(".close").addEventListener("click", () => {
    modal.remove();
  });

  // Close modal when clicking outside
  window.addEventListener("click", (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

async function deleteUser(userId) {
  if (!confirm("Are you sure you want to delete this user?")) return;

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Authentication token not found");
    }

    const response = await fetch(`http://localhost:3000/api/users/${userId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error("Failed to delete user");
    }

    await loadUsers();
  } catch (error) {
    console.error("Error deleting user:", error);
    alert(error.message || "Failed to delete user");
  }
}

// Export functions
window.userFunctions = {
  loadUsersSection,
  loadUsers,
  editUser,
  deleteUser,
  showEditUserModal,
};

// Make functions available globally
window.loadUsersSection = loadUsersSection;
window.editUser = editUser;
window.deleteUser = deleteUser;
window.showEditUserModal = showEditUserModal;
