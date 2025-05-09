// API Configuration
const API_BASE_URL = "https://bus-scheduler-backend.onrender.com";

// Make API_BASE_URL available globally
window.API_BASE_URL = API_BASE_URL;

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = { API_BASE_URL };
} 