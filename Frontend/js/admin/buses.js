// Buses Management
async function loadBusesSection() {
  const contentDiv = document.querySelector(".admin-content");
  if (!contentDiv) return;

  // Create buses section HTML
  contentDiv.innerHTML = `
        <div class="admin-section">
            <div class="section-header">
                <h2>Buses Management</h2>
                <button class="btn btn-primary" id="addBusBtn">Add New Bus</button>
            </div>
            <div class="buses-list" id="busesList">
                <!-- Buses will be loaded here -->
            </div>
        </div>
    `;

  // Add event listener for the Add New Bus button
  const addBusBtn = document.getElementById('addBusBtn');
  if (addBusBtn) {
    addBusBtn.addEventListener('click', showAddBusModal);
  }

  // Load buses
  await loadBuses();
}

async function loadBuses() {
  try {
    const token = localStorage.getItem("token");
    const response = await fetch("http://localhost:3000/api/buses", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      const buses = await response.json();
      displayBuses(buses);
    } else {
      console.error("Failed to fetch buses");
    }
  } catch (error) {
    console.error("Error fetching buses:", error);
  }
}

function displayBuses(buses) {
  const busesList = document.getElementById("busesList");
  if (!busesList) return;

  busesList.innerHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Bus Number</th>
                    <th>Type</th>
                    <th>Capacity</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${buses.map(bus => `
                    <tr>
                        <td>${bus.busNumber}</td>
                        <td>${bus.type}</td>
                        <td>${bus.capacity}</td>
                        <td>${bus.status}</td>
                        <td>
                            <button class="btn btn-sm btn-edit" onclick="editBus('${bus._id}')">Edit</button>
                            <button class="btn btn-sm btn-delete" onclick="deleteBus('${bus._id}')">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function showAddBusModal() {
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
            <h2 style="margin-top: 0;">Add New Bus</h2>
            <form id="addBusForm" style="margin-top: 20px;">
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="busNumber" style="display: block; margin-bottom: 5px;">Bus Number</label>
                    <input type="text" id="busNumber" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="busType" style="display: block; margin-bottom: 5px;">Bus Type</label>
                    <select id="busType" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="AC">AC</option>
                        <option value="Non-AC">Non-AC</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="capacity" style="display: block; margin-bottom: 5px;">Capacity</label>
                    <input type="number" id="capacity" required min="1" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="status" style="display: block; margin-bottom: 5px;">Status</label>
                    <select id="status" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="active">Active</option>
                        <option value="maintenance">Maintenance</option>
                        <option value="inactive">Inactive</option>
                    </select>
                </div>
                <div id="errorMessage" style="color: red; margin-bottom: 15px; display: none;"></div>
                <button type="submit" class="btn btn-primary" style="
                    background-color: #4CAF50;
                    color: white;
                    padding: 10px 15px;
                    border: none;
                    border-radius: 4px;
                    cursor: pointer;
                    width: 100%;
                ">Add Bus</button>
            </form>
        </div>
    `;

  document.body.appendChild(modal);

  // Handle form submission
  const form = modal.querySelector("#addBusForm");
  const errorMessage = modal.querySelector("#errorMessage");
  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMessage.style.display = 'none';
    
    try {
      const busData = {
      busNumber: document.getElementById("busNumber").value,
      type: document.getElementById("busType").value,
        capacity: parseInt(document.getElementById("capacity").value),
      status: document.getElementById("status").value,
      };

      const success = await addBus(busData);
      if (success) {
    modal.remove();
      }
    } catch (error) {
      errorMessage.textContent = error.message || 'Failed to add bus. Please try again.';
      errorMessage.style.display = 'block';
    }
  });

  // Handle modal close
  modal.querySelector(".close").addEventListener("click", () => {
    modal.remove();
  });

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

async function addBus(busData) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    const response = await fetch("http://localhost:3000/api/buses", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(busData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to add bus');
    }

    await loadBuses();
    return true;
  } catch (error) {
    console.error("Error adding bus:", error);
    throw error;
  }
}

async function editBus(busId) {
  try {
    // Fetch bus details
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:3000/api/buses/${busId}`, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch bus details');
    }

    const bus = await response.json();
    showEditBusModal(bus);
  } catch (error) {
    console.error('Error fetching bus details:', error);
    alert('Failed to load bus details. Please try again.');
  }
}

function showEditBusModal(bus) {
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
            <h2 style="margin-top: 0;">Edit Bus</h2>
            <form id="editBusForm" style="margin-top: 20px;">
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="editBusNumber" style="display: block; margin-bottom: 5px;">Bus Number</label>
                    <input type="text" id="editBusNumber" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" value="${bus.busNumber}">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="editBusType" style="display: block; margin-bottom: 5px;">Bus Type</label>
                    <select id="editBusType" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="AC" ${bus.type === 'AC' ? 'selected' : ''}>AC</option>
                        <option value="Non-AC" ${bus.type === 'Non-AC' ? 'selected' : ''}>Non-AC</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="editCapacity" style="display: block; margin-bottom: 5px;">Capacity</label>
                    <input type="number" id="editCapacity" required min="1" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" value="${bus.capacity}">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="editStatus" style="display: block; margin-bottom: 5px;">Status</label>
                    <select id="editStatus" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="active" ${bus.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="maintenance" ${bus.status === 'maintenance' ? 'selected' : ''}>Maintenance</option>
                        <option value="inactive" ${bus.status === 'inactive' ? 'selected' : ''}>Inactive</option>
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
                ">Update Bus</button>
            </form>
        </div>
    `;

  document.body.appendChild(modal);

  // Handle form submission
  const form = modal.querySelector("#editBusForm");
  const errorMessage = modal.querySelector("#editErrorMessage");
  
  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    errorMessage.style.display = 'none';
    
    try {
      const busData = {
        busNumber: document.getElementById("editBusNumber").value,
        type: document.getElementById("editBusType").value,
        capacity: parseInt(document.getElementById("editCapacity").value),
        status: document.getElementById("editStatus").value,
      };

      const success = await updateBus(bus._id, busData);
      if (success) {
        modal.remove();
      }
    } catch (error) {
      errorMessage.textContent = error.message || 'Failed to update bus. Please try again.';
      errorMessage.style.display = 'block';
    }
  });

  // Handle modal close
  modal.querySelector(".close").addEventListener("click", () => {
    modal.remove();
  });

  // Close modal when clicking outside
  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.remove();
    }
  });
}

async function updateBus(busId, busData) {
  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error('Authentication token not found. Please login again.');
    }

    const response = await fetch(`http://localhost:3000/api/buses/${busId}`, {
      method: "PUT",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(busData),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to update bus');
    }

    await loadBuses();
    return true;
  } catch (error) {
    console.error("Error updating bus:", error);
    throw error;
  }
}

async function deleteBus(busId) {
  if (!confirm("Are you sure you want to delete this bus?")) return;

  try {
    const token = localStorage.getItem("token");
    const response = await fetch(`http://localhost:3000/api/buses/${busId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.ok) {
      await loadBuses();
    } else {
      console.error("Failed to delete bus");
    }
  } catch (error) {
    console.error("Error deleting bus:", error);
  }
}

// Export functions
window.busFunctions = {
  loadBusesSection,
  loadBuses,
  addBus,
  editBus,
  deleteBus,
};
