const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { connection } = require("./config/db");
const path = require("path");
require("dotenv").config();

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:5000",
    methods: ["GET", "POST"],
  },
});

// Middleware
app.use(
  helmet({
    contentSecurityPolicy: false, // Temporarily disable CSP for development
  })
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the Frontend directory
app.use(
  express.static(path.join(__dirname, "../Frontend"), {
    setHeaders: (res, path) => {
      if (path.endsWith(".js")) {
        res.setHeader("Content-Type", "application/javascript");
      }
    },
  })
);

// Database connection
connection
  .then(() => console.log("Connected to Database"))
  .catch((err) => console.error("Database connection error:", err));

// Socket.io connection handling
io.on("connection", (socket) => {
  console.log("A client connected");

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});

// Routes
app.use("/api/auth", require("./routes/auth"));
app.use("/api/routes", require("./routes/routes"));
app.use("/api/stops", require("./routes/stops"));
app.use("/api/schedules", require("./routes/schedules"));

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: "Something went wrong!" });
});

// Serve the main HTML file for all routes
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../Frontend/index.html"));
});

const PORT = process.env.PORT;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
