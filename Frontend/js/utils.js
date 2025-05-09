// Shared utility functions

// Fetch with authentication
async function fetchWithAuth(endpoint, options = {}) {
  if (!window.API_BASE_URL) {
    console.error("API_BASE_URL is not defined. Make sure config.js is loaded.");
    return [];
  }

  const token = localStorage.getItem("token");
  if (!token) {
    console.error("No authentication token found");
    return [];
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
    
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
    });

    if (response.status === 401) {
      // Token expired or invalid
      localStorage.clear();
      window.location.href = "./login.html";
      return [];
    }

    if (!response.ok) {
      if (response.status === 404) {
        console.warn(`Endpoint ${endpoint} not found`);
        return []; // Return empty array for missing endpoints
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Fetch error:", error);
    return []; // Return empty array on error
  }
}

// Export the function to window object
window.fetchWithAuth = fetchWithAuth; 