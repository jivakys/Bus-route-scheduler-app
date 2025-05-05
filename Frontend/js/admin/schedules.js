// Constants
const API_BASE_URL = 'https://bus-scheduler-backend.vercel.app';
const FRONTEND_URL = 'https://bus-route-scheduler-app.vercel.app';

// Fetch data with authentication
const fetchWithAuth = async (endpoint, options = {}) => {
    const token = localStorage.getItem('adminToken');
    if (!token) {
        window.location.href = `${FRONTEND_URL}/html/login.html`;
        return;
    }

    const defaultOptions = {
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    };

    try {
        const response = await fetch(`${API_BASE_URL}${endpoint}`, {
            ...defaultOptions,
            ...options
        });

        if (response.status === 401) {
            localStorage.removeItem('adminToken');
            window.location.href = `${FRONTEND_URL}/html/login.html`;
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Fetch error:', error);
        throw error;
    }
};

// Load Schedules Section
const loadSchedulesSection = async () => {
    try {
        const schedules = await fetchWithAuth('/api/schedules');
        
        const schedulesTable = document.querySelector('.admin-content');
        schedulesTable.innerHTML = `
            <div class="section-header">
                <h2>Schedules Management</h2>
                <button class="add-btn" onclick="showAddScheduleModal()">
                    <i class="fas fa-plus"></i> Add Schedule
                </button>
            </div>
            <div class="table-container">
                <table class="admin-table">
                    <thead>
                        <tr>
                            <th>Route</th>
                            <th>Bus</th>
                            <th>Departure Time</th>
                            <th>Arrival Time</th>
                            <th>Status</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody id="schedulesTableBody">
                        ${schedules.map(schedule => `
                            <tr>
                                <td>${schedule.route}</td>
                                <td>${schedule.bus}</td>
                                <td>${new Date(schedule.departureTime).toLocaleString()}</td>
                                <td>${new Date(schedule.arrivalTime).toLocaleString()}</td>
                                <td><span class="status ${schedule.status}">${schedule.status}</span></td>
                                <td>
                                    <button class="edit-btn" onclick="editSchedule('${schedule._id}')">
                                        <i class="fas fa-edit"></i>
                                    </button>
                                    <button class="delete-btn" onclick="deleteSchedule('${schedule._id}')">
                                        <i class="fas fa-trash"></i>
                                    </button>
                                </td>
                            </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error('Error loading schedules:', error);
        document.querySelector('.admin-content').innerHTML = `
            <div class="error-message">
                <h3>Error Loading Schedules</h3>
                <p>Please try again later or contact support if the problem persists.</p>
            </div>
        `;
    }
};

// Add Schedule
const addSchedule = async (scheduleData) => {
    try {
        await fetchWithAuth('/api/schedules', {
            method: 'POST',
            body: JSON.stringify(scheduleData)
        });
        await loadSchedulesSection();
    } catch (error) {
        console.error('Error adding schedule:', error);
        throw error;
    }
};

// Edit Schedule
const editSchedule = async (scheduleId, scheduleData) => {
    try {
        await fetchWithAuth(`/api/schedules/${scheduleId}`, {
            method: 'PUT',
            body: JSON.stringify(scheduleData)
        });
        await loadSchedulesSection();
    } catch (error) {
        console.error('Error editing schedule:', error);
        throw error;
    }
};

// Delete Schedule
const deleteSchedule = async (scheduleId) => {
    if (!confirm('Are you sure you want to delete this schedule?')) return;
    
    try {
        await fetchWithAuth(`/api/schedules/${scheduleId}`, {
            method: 'DELETE'
        });
        await loadSchedulesSection();
    } catch (error) {
        console.error('Error deleting schedule:', error);
        throw error;
    }
};

// Export functions
window.scheduleFunctions = {
    loadSchedulesSection,
    addSchedule,
    editSchedule,
    deleteSchedule
};

// Schedules Management
async function showAddScheduleModal() {
    // Fetch routes and buses for dropdowns
    const [routes, buses] = await Promise.all([
        fetchRoutes(),
        fetchBuses()
    ]);

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
            <h2 style="margin-top: 0;">Add New Schedule</h2>
            <form id="addScheduleForm" style="margin-top: 20px;">
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="route" style="display: block; margin-bottom: 5px;">Route</label>
                    <select id="route" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        ${routes.map(route => `
                            <option value="${route._id}">${route.routeNumber} (${route.startPoint} - ${route.endPoint})</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="bus" style="display: block; margin-bottom: 5px;">Bus</label>
                    <select id="bus" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        ${buses.map(bus => `
                            <option value="${bus._id}">${bus.busNumber} (${bus.type})</option>
                        `).join('')}
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="departureTime" style="display: block; margin-bottom: 5px;">Departure Time</label>
                    <input type="datetime-local" id="departureTime" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="arrivalTime" style="display: block; margin-bottom: 5px;">Arrival Time</label>
                    <input type="datetime-local" id="arrivalTime" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="status" style="display: block; margin-bottom: 5px;">Status</label>
                    <select id="status" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="scheduled">Scheduled</option>
                        <option value="in-progress">In Progress</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
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
                ">Add Schedule</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Handle form submission
    const form = modal.querySelector('#addScheduleForm');
    const errorMessage = modal.querySelector('#errorMessage');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.style.display = 'none';
        
        try {
            const busId = document.getElementById('bus').value;
            const bus = buses.find(b => b._id === busId);
            
            const scheduleData = {
            route: document.getElementById('route').value,
                bus: busId,
                departureTime: new Date(document.getElementById('departureTime').value).toISOString(),
                arrivalTime: new Date(document.getElementById('arrivalTime').value).toISOString(),
                status: document.getElementById('status').value,
                seatsAvailable: bus.capacity // Use bus capacity as initial seats available
            };

            const success = await addSchedule(scheduleData);
            if (success) {
        modal.remove();
            }
        } catch (error) {
            errorMessage.textContent = error.message || 'Failed to add schedule. Please try again.';
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

async function fetchRoutes() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://bus-scheduler-backend.onrender.com/api/routes', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.ok ? await response.json() : [];
    } catch (error) {
        console.error('Error fetching routes:', error);
        return [];
    }
}

async function fetchBuses() {
    try {
        const token = localStorage.getItem('token');
        const response = await fetch('https://bus-scheduler-backend.onrender.com/api/buses', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return response.ok ? await response.json() : [];
    } catch (error) {
        console.error('Error fetching buses:', error);
        return [];
    }
}

async function showEditScheduleModal(schedule) {
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
            <h2 style="margin-top: 0;">Edit Schedule</h2>
            <form id="editScheduleForm" style="margin-top: 20px;">
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="editRoute" style="display: block; margin-bottom: 5px;">Route</label>
                    <select id="editRoute" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="${schedule.route._id}">${schedule.route.routeNumber} (${schedule.route.startPoint} - ${schedule.route.endPoint})</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="editBus" style="display: block; margin-bottom: 5px;">Bus</label>
                    <select id="editBus" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="${schedule.bus._id}">${schedule.bus.busNumber} (${schedule.bus.type})</option>
                    </select>
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="editDepartureTime" style="display: block; margin-bottom: 5px;">Departure Time</label>
                    <input type="datetime-local" id="editDepartureTime" required 
                        value="${new Date(schedule.departureTime).toISOString().slice(0, 16)}"
                        style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="editArrivalTime" style="display: block; margin-bottom: 5px;">Arrival Time</label>
                    <input type="datetime-local" id="editArrivalTime" required 
                        value="${new Date(schedule.arrivalTime).toISOString().slice(0, 16)}"
                        style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                </div>
                <div class="form-group" style="margin-bottom: 15px;">
                    <label for="editStatus" style="display: block; margin-bottom: 5px;">Status</label>
                    <select id="editStatus" required style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px;">
                        <option value="scheduled" ${schedule.status === 'scheduled' ? 'selected' : ''}>Scheduled</option>
                        <option value="in-progress" ${schedule.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                        <option value="completed" ${schedule.status === 'completed' ? 'selected' : ''}>Completed</option>
                        <option value="cancelled" ${schedule.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
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
                ">Update Schedule</button>
            </form>
        </div>
    `;

    document.body.appendChild(modal);

    // Handle form submission
    const form = modal.querySelector('#editScheduleForm');
    const errorMessage = modal.querySelector('#editErrorMessage');
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        errorMessage.style.display = 'none';
        
        try {
            const scheduleData = {
                route: document.getElementById('editRoute').value,
                bus: document.getElementById('editBus').value,
                departureTime: new Date(document.getElementById('editDepartureTime').value).toISOString(),
                arrivalTime: new Date(document.getElementById('editArrivalTime').value).toISOString(),
                status: document.getElementById('editStatus').value,
                seatsAvailable: schedule.seatsAvailable // Keep the existing seats available
            };

            const token = localStorage.getItem("token");
            if (!token) {
                throw new Error('Authentication token not found. Please login again.');
            }

            const response = await fetch(`https://bus-scheduler-backend.onrender.com/api/schedules/${schedule._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(scheduleData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to update schedule');
            }

            modal.remove();
            await loadSchedulesSection();
        } catch (error) {
            errorMessage.textContent = error.message || 'Failed to update schedule. Please try again.';
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

// Make functions available globally
window.showAddScheduleModal = showAddScheduleModal;
window.editSchedule = editSchedule;
window.deleteSchedule = deleteSchedule;
window.showEditScheduleModal = showEditScheduleModal; 