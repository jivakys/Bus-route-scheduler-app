// Routes Management
async function loadRoutesSection() {
    const contentDiv = document.querySelector('.admin-content');
    if (!contentDiv) return;

    // Create routes section HTML
    contentDiv.innerHTML = `
        <div class="admin-section">
            <div class="section-header">
                <h2>Routes Management</h2>
                <button class="btn btn-primary" id="addRouteBtn">Add New Route</button>
            </div>
            <div class="routes-list" id="routesList">
                <!-- Routes will be loaded here -->
            </div>
        </div>
    `;

    // Add event listener for the Add New Route button
    const addRouteBtn = document.getElementById('addRouteBtn');
    if (addRouteBtn) {
        addRouteBtn.addEventListener('click', showAddRouteModal);
    }

    // Load routes
    await loadRoutes();
}

async function loadRoutes() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('http://localhost:3000/api/routes', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            const routes = await response.json();
            displayRoutes(routes);
        } else {
            console.error('Failed to fetch routes');
        }
    } catch (error) {
        console.error('Error fetching routes:', error);
    }
}

function displayRoutes(routes) {
    const routesList = document.getElementById('routesList');
    if (!routesList) return;

    routesList.innerHTML = `
        <table class="admin-table">
            <thead>
                <tr>
                    <th>Route Number</th>
                    <th>Start Point</th>
                    <th>End Point</th>
                    <th>Distance (km)</th>
                    <th>Estimated Time (min)</th>
                    <th>Status</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody>
                ${routes.map(route => `
                    <tr>
                        <td>${route.routeNumber}</td>
                        <td>${route.startPoint}</td>
                        <td>${route.endPoint}</td>
                        <td>${route.distance}</td>
                        <td>${route.estimatedTime}</td>
                        <td>${route.status}</td>
                        <td>
                            <button class="btn btn-sm btn-edit" onclick="editRoute('${route._id}')">Edit</button>
                            <button class="btn btn-sm btn-delete" onclick="deleteRoute('${route._id}')">Delete</button>
                        </td>
                    </tr>
                `).join('')}
            </tbody>
        </table>
    `;
}

function showAddRouteModal() {
    const modal = document.createElement('div');
    modal.className = 'modal';
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
            <h2 style="margin-top: 0;">Add New Route</h2>
            <form id="addRouteForm" style="margin-top: 20px;">
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="routeNumber" style="display: block; margin-bottom: 5px;">Route Number</label>
                    <input type="text" id="routeNumber" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="startPoint" style="display: block; margin-bottom: 5px;">Start Point</label>
                    <input type="text" id="startPoint" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="endPoint" style="display: block; margin-bottom: 5px;">End Point</label>
                    <input type="text" id="endPoint" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="distance" style="display: block; margin-bottom: 5px;">Distance (km)</label>
                    <input type="number" id="distance" required min="0" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="estimatedTime" style="display: block; margin-bottom: 5px;">Estimated Time (minutes)</label>
                    <input type="number" id="estimatedTime" required min="0" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="status" style="display: block; margin-bottom: 5px;">Status</label>
                    <select id="status" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="active">Active</option>
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
                ">Add Route</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Handle form submission
    const form = modal.querySelector('#addRouteForm');
    const errorMessage = modal.querySelector('#errorMessage');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.style.display = 'none';
        
        try {
            const routeData = {
                routeNumber: document.getElementById('routeNumber').value,
                startPoint: document.getElementById('startPoint').value,
                endPoint: document.getElementById('endPoint').value,
                distance: parseFloat(document.getElementById('distance').value),
                estimatedTime: parseInt(document.getElementById('estimatedTime').value),
                status: document.getElementById('status').value
            };

            const success = await addRoute(routeData);
            if (success) {
                modal.remove();
            }
        } catch (error) {
            errorMessage.textContent = error.message || 'Failed to add route. Please try again.';
            errorMessage.style.display = 'block';
        }
    });

    // Handle modal close
    modal.querySelector('.close').addEventListener('click', () => {
        modal.remove();
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

async function addRoute(routeData) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token not found. Please login again.');
        }

        const response = await fetch('http://localhost:3000/api/routes', {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(routeData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to add route');
        }

        await loadRoutes();
        return true;
    } catch (error) {
        console.error('Error adding route:', error);
        throw error;
    }
}

async function editRoute(routeId) {
    try {
        // Fetch route details
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/routes/${routeId}`, {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error('Failed to fetch route details');
        }

        const route = await response.json();
        showEditRouteModal(route);
    } catch (error) {
        console.error('Error fetching route details:', error);
        alert('Failed to load route details. Please try again.');
    }
}

function showEditRouteModal(route) {
    const modal = document.createElement('div');
    modal.className = 'modal';
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
            <h2 style="margin-top: 0;">Edit Route</h2>
            <form id="editRouteForm" style="margin-top: 20px;">
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="editRouteNumber" style="display: block; margin-bottom: 5px;">Route Number</label>
                    <input type="text" id="editRouteNumber" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" value="${route.routeNumber}">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="editStartPoint" style="display: block; margin-bottom: 5px;">Start Point</label>
                    <input type="text" id="editStartPoint" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" value="${route.startPoint}">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="editEndPoint" style="display: block; margin-bottom: 5px;">End Point</label>
                    <input type="text" id="editEndPoint" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" value="${route.endPoint}">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="editDistance" style="display: block; margin-bottom: 5px;">Distance (km)</label>
                    <input type="number" id="editDistance" required min="0" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" value="${route.distance}">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="editEstimatedTime" style="display: block; margin-bottom: 5px;">Estimated Time (minutes)</label>
                    <input type="number" id="editEstimatedTime" required min="0" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;" value="${route.estimatedTime}">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="editStatus" style="display: block; margin-bottom: 5px;">Status</label>
                    <select id="editStatus" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="active" ${route.status === 'active' ? 'selected' : ''}>Active</option>
                        <option value="inactive" ${route.status === 'inactive' ? 'selected' : ''}>Inactive</option>
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
                ">Update Route</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Handle form submission
    const form = modal.querySelector('#editRouteForm');
    const errorMessage = modal.querySelector('#editErrorMessage');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.style.display = 'none';
        
        try {
            const routeData = {
                routeNumber: document.getElementById('editRouteNumber').value,
                startPoint: document.getElementById('editStartPoint').value,
                endPoint: document.getElementById('editEndPoint').value,
                distance: parseFloat(document.getElementById('editDistance').value),
                estimatedTime: parseInt(document.getElementById('editEstimatedTime').value),
                status: document.getElementById('editStatus').value
            };

            const success = await updateRoute(route._id, routeData);
            if (success) {
                modal.remove();
            }
        } catch (error) {
            errorMessage.textContent = error.message || 'Failed to update route. Please try again.';
            errorMessage.style.display = 'block';
        }
    });

    // Handle modal close
    modal.querySelector('.close').addEventListener('click', () => {
        modal.remove();
    });

    // Close modal when clicking outside
    window.addEventListener('click', (e) => {
        if (e.target === modal) {
            modal.remove();
        }
    });
}

async function updateRoute(routeId, routeData) {
    try {
        const token = localStorage.getItem('token');
        if (!token) {
            throw new Error('Authentication token not found. Please login again.');
        }

        const response = await fetch(`http://localhost:3000/api/routes/${routeId}`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(routeData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.message || 'Failed to update route');
        }

        await loadRoutes();
        return true;
    } catch (error) {
        console.error('Error updating route:', error);
        throw error;
    }
}

async function deleteRoute(routeId) {
    if (!confirm('Are you sure you want to delete this route?')) return;

    try {
        const token = localStorage.getItem('token');
        const response = await fetch(`http://localhost:3000/api/routes/${routeId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        if (response.ok) {
            await loadRoutes();
        } else {
            console.error('Failed to delete route');
        }
    } catch (error) {
        console.error('Error deleting route:', error);
    }
}

// Export functions
window.routeFunctions = {
    loadRoutesSection,
    loadRoutes,
    addRoute,
    editRoute,
    deleteRoute
}; 