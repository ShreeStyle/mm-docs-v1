// src/app.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

// Middlewares
app.use(cors({
  origin: true, // Allow all origins for development
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200
}));
app.use(express.json());

// Serve static files for uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Debug middleware to log all requests
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.path} - ${new Date().toISOString()}`);
  next();
});

const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const brandKitRoutes = require("./routes/brandKitRoutes");
const documentRoutes = require("./routes/documentRoutes");
const aiRoutes = require("./routes/aiRoutes");
const publicRoutes = require("./routes/publicRoutes");
const onboardingRoutes = require("./routes/onboardingRoutes");
const templateRoutes = require("./routes/templateRoutes");
const paymentRoutes = require("./routes/paymentRoutes");
const subscriptionRoutes = require("./routes/subscriptionRoutes");

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/brand-kit", brandKitRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is running 🚀"
  });
});

module.exports = app;
