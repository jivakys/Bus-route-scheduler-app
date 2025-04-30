# Bus Route Scheduler App

A comprehensive bus route scheduling and management system with real-time tracking capabilities.

## Features

- Admin panel for route planning and management
- Real-time bus tracking
- Stop management
- Schedule management
- User authentication and authorization
- Bus fleet management
- Route optimization

## Tech Stack

### Backend
- Node.js
- Express.js
- MongoDB
- Socket.io (for real-time updates)
- JWT Authentication
- Express Validator

### Frontend (Coming Soon)
- React.js
- Redux
- Material-UI
- Mapbox/Google Maps
- Socket.io Client

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

## Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bus-route-scheduler-app.git
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
MONGODB_URI=mongodb://localhost:27017/bus-scheduler
JWT_SECRET=your_jwt_secret_key_here
FRONTEND_URL=http://localhost:3000
NODE_ENV=development
```

4. Start the backend server:
```bash
npm run dev
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
- GET /api/stops/nearby - Find stops near a location

### Schedules
- GET /api/schedules - Get all schedules
- GET /api/schedules/:id - Get a single schedule
- POST /api/schedules - Create a new schedule (admin only)
- PUT /api/schedules/:id - Update a schedule (admin only)
- DELETE /api/schedules/:id - Delete a schedule (admin only)
- GET /api/schedules/date/:date - Get schedules for a specific date

### Buses
- GET /api/buses - Get all buses
- GET /api/buses/:id - Get a single bus
- POST /api/buses - Create a new bus (admin only)
- PUT /api/buses/:id - Update a bus (admin only)
- DELETE /api/buses/:id - Delete a bus (admin only)
- PATCH /api/buses/:id/location - Update bus location

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Contact

Your Name - your.email@example.com

Project Link: https://github.com/yourusername/bus-route-scheduler-app