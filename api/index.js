// API entry point for Vercel Serverless Functions
if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config();
}

const mongoose = require("mongoose");

// Global connection cache
let isConnected = false;
let app = null;

const connectToDatabase = async () => {
  if (isConnected && mongoose.connection.readyState === 1) {
    console.log("=> Using existing database connection");
    return;
  }

  try {
    const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
    
    if (!mongoUri) {
      throw new Error("MONGODB_URI not found");
    }

    mongoose.set('strictQuery', false);
    
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });

    isConnected = true;
    console.log("=> MongoDB connected:", mongoose.connection.host);
  } catch (error) {
    console.error("=> Database connection error:", error.message);
    isConnected = false;
    throw error;
  }
};

// Export handler for Vercel
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Connect to database
    await connectToDatabase();
    
    // Load Express app if not already loaded
    if (!app) {
      app = require("../src/app");
    }
    
    // Handle request with Express app
    return app(req, res);
    
  } catch (error) {
    console.error("=> Handler error:", error);
    
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: "Internal Server Error",
        message: error.message || "Database connection failed. Please try again later.",
        hint: "Check Vercel environment variables: MONGODB_URI and JWT_SECRET"
      });
    }
  }
};
