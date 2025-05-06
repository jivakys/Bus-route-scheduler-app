# Bus Route Scheduler App

A comprehensive bus route scheduling and management system with tracking capabilities.

## Features

- User authentication and authorization
- Admin panel for route planning and management
- Stop management
- Schedule management
- Bus fleet management

## Tech Stack

### Backend

- Node.js
- Express.js
- MongoDB
- Socket.io (for real-time updates)
- JWT Authentication
- Express Validator

### Frontend (Coming Soon)

- HTML
- CSS
- JavaScript

## Deployed Link

Backend Link: [https://bus-scheduler-backend.onrender.com](https://bus-scheduler-backend.onrender.com)

## Postman Collection

[https://documenter.getpostman.com/view/24860067/2sB2j6AVv7](https://documenter.getpostman.com/view/24860067/2sB2j6AVv7)

## Installation

1. Clone the repository:

```bash
git clone https://github.com/jivakys/Bus-route-scheduler-app.git
cd bus-route-scheduler-app
```

2. Install backend dependencies:

```bash
cd Backend
npm install
```

3. Create a .env file in the Backend directory with the following variables:

```
PORT=5000
MONGODB_URL=mongodb://localhost:27017/bus-scheduler
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=http://localhost:3000
```

4. Start the backend server:

```bash
npm run dev
```

### Admin Creds
```bash
email - jivaksute@gmail.com
password - jivakadmin
```

## API Endpoints

### Authentication

- POST /api/auth/register - Register a new user
- POST /api/auth/login - Login user
- GET /api/auth/me - Get current user

### Routes

- GET /api/routes - Get all routes
- GET /api/routes/:id - Get a single route
- POST /api/routes - Create a new route (admin only)
- PUT /api/routes/:id - Update a route (admin only)
- DELETE /api/routes/:id - Delete a route (admin only)

### Stops

- GET /api/stops - Get all stops
- GET /api/stops/:id - Get a single stop
- POST /api/stops - Create a new stop (admin only)
- PUT /api/stops/:id - Update a stop (admin only)
- DELETE /api/stops/:id - Delete a stop (admin only)

### Schedules

- GET /api/schedules - Get all schedules
- GET /api/schedules/:id - Get a single schedule
- POST /api/schedules - Create a new schedule (admin only)
- PUT /api/schedules/:id - Update a schedule (admin only)
- DELETE /api/schedules/:id - Delete a schedule (admin only)

### Buses

- GET /api/buses - Get all buses
- GET /api/buses/:id - Get a single bus
- POST /api/buses - Create a new bus (admin only)
- PUT /api/buses/:id - Update a bus (admin only)
- DELETE /api/buses/:id - Delete a bus (admin only)


## Screenshots

### Home Page
![Screenshot](https://github.com/user-attachments/assets/aa38e0c1-3b7c-483c-888d-bb94f543ca7a)

### Admin Panel
![Screenshot2](https://github.com/user-attachments/assets/a1e3cc3c-2a4c-41a0-90b7-f1d05df0f57d)
