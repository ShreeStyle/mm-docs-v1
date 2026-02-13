// src/app.js
const express = require("express");
const cors = require("cors");
const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is running 🚀"
  });
});

module.exports = app;
