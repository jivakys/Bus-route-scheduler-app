document.addEventListener("DOMContentLoaded", () => {
    // Check if user is logged in and is an operator
    const token = localStorage.getItem("token");
    if (!token) {
        window.location.href = "./login.html";
        return;
    }

    try {
        const payload = JSON.parse(atob(token.split(".")[1]));
        if (payload.role !== "operator") {
            window.location.href = "../index.html";
            return;
        }
    } catch (error) {
        window.location.href = "./login.html";
        return;
    }

    // Set minimum date for date input to today
    const dateInput = document.getElementById("date");
    const today = new Date().toISOString().split("T")[0];
    dateInput.min = today;

    // Handle search form submission
    const searchForm = document.getElementById("searchForm");
    if (searchForm) {
        searchForm.addEventListener("submit", async (e) => {
            e.preventDefault();
            const searchTerm = document.getElementById("search").value;
            const date = document.getElementById("date").value;
            const time = document.getElementById("time").value;

            try {
                const response = await fetch("https://bus-scheduler-backend.onrender.com/api/routes/search", {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                        "Authorization": `Bearer ${token}`
                    },
                    body: JSON.stringify({ 
                        searchTerm,
                        date: date || undefined,
                        time: time || undefined
                    })
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.message || 'Search failed');
                }

                const data = await response.json();
                if (!data || data.length === 0) {
                    throw new Error('No routes found matching your search');
                }
                displaySearchResults(data, searchTerm);
            } catch (error) {
                console.error("Search error:", error);
                const resultsContainer = document.getElementById("searchResults");
                if (resultsContainer) {
                    resultsContainer.innerHTML = `
                        <div class="error-message">
                            <p>${error.message || 'An error occurred while searching routes'}</p>
                        </div>
                    `;
                }
            }
        });

        // Add real-time search as user types
        const searchInput = document.getElementById("search");
        let searchTimeout;
        searchInput.addEventListener("input", (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (e.target.value.length >= 2) {
                    searchForm.dispatchEvent(new Event("submit"));
                }
            }, 500);
        });
    }
});

function displaySearchResults(routes, searchTerm) {
    const resultsContainer = document.getElementById("searchResults");
    if (!resultsContainer) return;

    if (!routes || routes.length === 0) {
        resultsContainer.innerHTML = "<p>No routes found matching your search.</p>";
        return;
    }

    // Group routes by stop
    const groupedRoutes = routes.reduce((acc, route) => {
        const stop = route.from.toLowerCase() === searchTerm.toLowerCase() ? route.to : route.from;
        if (!acc[stop]) {
            acc[stop] = [];
        }
        acc[stop].push(route);
        return acc;
    }, {});

    resultsContainer.innerHTML = Object.entries(groupedRoutes).map(([stop, routes]) => `
        <div class="stop-group">
            <h3>Routes from/to ${stop}</h3>
            ${routes.map(route => `
                <div class="route-card">
                    <div class="route-header">
                        <h4>${route.bus.busNumber} - ${route.bus.busName}</h4>
                        <span class="price">₹${route.price}</span>
                    </div>
                    <div class="route-info">
                        <div class="info-item">
                            <span class="info-label">From</span>
                            <span class="info-value">${route.from}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">To</span>
                            <span class="info-value">${route.to}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Departure</span>
                            <span class="info-value">${new Date(route.departureTime).toLocaleString()}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Arrival</span>
                            <span class="info-value">${new Date(route.arrivalTime).toLocaleString()}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Available Seats</span>
                            <span class="info-value">${route.availableSeats}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Bus Type</span>
                            <span class="info-value">${route.bus.type}</span>
                        </div>
                        <div class="info-item">
                            <span class="info-label">Capacity</span>
                            <span class="info-value">${route.bus.capacity}</span>
                        </div>
                    </div>
                </div>
            `).join("")}
        </div>
    `).join("");
} 