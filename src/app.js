// src/app.js
const express = require("express");
const cors = require("cors");
const app = express();

// Middlewares
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    "https://graceful-luxury-693326.framer.app"
  ],
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true
}));
app.use(express.json());

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const brandKitRoutes = require("./routes/brandKitRoutes");
const documentRoutes = require("./routes/documentRoutes");
const aiRoutes = require("./routes/aiRoutes");
const publicRoutes = require("./routes/publicRoutes");
const onboardingRoutes = require("./routes/onboardingRoutes");
const templateRoutes = require("./routes/templateRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/brand-kit", brandKitRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/payments", paymentRoutes);

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is running 🚀"
  });
});

module.exports = app;
