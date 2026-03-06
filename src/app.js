// src/app.js
const express = require("express");
const cors = require("cors");
const path = require("path");
const app = express();

// Middlewares
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? [process.env.FRONTEND_URL, /\.onrender\.com$/, /\.vercel\.app$/] 
    : true,
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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
const documentEditorRoutes = require("./routes/documentEditorRoutes");
const catalogRoutes = require("./routes/catalogRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const chatRoutes = require("./routes/chatRoutes");
const clauseRoutes = require("./routes/clauseRoutes");
const collaborationRoutes = require("./routes/collaborationRoutes");
const memoryRoutes = require("./routes/memoryRoutes");
const settingsRoutes = require("./routes/settingsRoutes");
const signatureRoutes = require("./routes/signatureRoutes");
const workflowRoutes = require("./routes/workflowRoutes");
const complianceRoutes = require("./routes/complianceRoutes");

app.use("/api/users", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/brand-kit", brandKitRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/documents", documentEditorRoutes); // Document editor routes
app.use("/api/ai", aiRoutes);
app.use("/api/public", publicRoutes);
app.use("/api/onboarding", onboardingRoutes);
app.use("/api/templates", templateRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/catalog", catalogRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/clauses", clauseRoutes);
app.use("/api/collaboration", collaborationRoutes);
app.use("/api/memory", memoryRoutes);
app.use("/api/settings", settingsRoutes);
app.use("/api/signatures", signatureRoutes);
app.use("/api/workflows", workflowRoutes);
app.use("/api/compliance", complianceRoutes);

// Health Check API
app.get("/api/health", (req, res) => {
  res.json({
    status: "OK",
    message: "Backend is running 🚀",
    environment: process.env.NODE_ENV || 'development'
  });
});

// Serve static frontend files in production (for Render deployment)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../client/dist')));
  
  // All non-API routes serve the frontend
  app.get(/.*/, (req, res, next) => {
    // Skip API routes
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
      return next();
    }
    res.sendFile(path.join(__dirname, '../client/dist/index.html'));
  });
}

// 404 handler for API routes
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    res.status(404).json({ 
      error: 'Not Found', 
      message: `Route ${req.method} ${req.path} not found` 
    });
  } else {
    next();
  }
});

// Global error handler for serverless
app.use((err, req, res, next) => {
  console.error('Error:', err);
  
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

module.exports = app;
