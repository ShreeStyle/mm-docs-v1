// src/config/db.js
const mongoose = require("mongoose");

// Cached connection for serverless functions
let cachedConnection = null;

const connectDB = async () => {
  // Return cached connection if it exists
  if (cachedConnection && mongoose.connection.readyState === 1) {
    console.log("✅ Using cached MongoDB connection");
    return cachedConnection;
  }

  try {
    // Support both MONGODB_URI (Vercel standard) and MONGO_URI
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error("❌ MongoDB URI not found in environment variables. Please set MONGODB_URI or MONGO_URI.");
    }
    
    console.log("🔄 Attempting MongoDB connection...");
    
    // Configure mongoose for serverless and regular deployments
    mongoose.set('strictQuery', false);
    
    const conn = await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 15000, // 15 seconds for initial connection
      socketTimeoutMS: 45000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    
    cachedConnection = conn;
    console.log(`✅ MongoDB Connected to: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error("❌ MongoDB Connection Error:", error.message);
    cachedConnection = null;
    
    // Throw error in production/serverless environments
    if (process.env.VERCEL || process.env.RENDER || process.env.NODE_ENV === 'production') {
      throw new Error(`MongoDB connection failed: ${error.message}`);
    } else {
      console.error("Exiting process due to database error");
      process.exit(1);
    }
  }
};

module.exports = connectDB;
