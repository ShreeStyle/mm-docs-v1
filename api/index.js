// API entry point for Vercel Serverless Functions
require("dotenv").config();
const app = require("../src/app");
const connectDB = require("../src/config/db");

// Connect to MongoDB (connection will be reused across invocations)
let isConnected = false;

const connectToDatabase = async () => {
  if (isConnected) {
    console.log("=> Using existing database connection");
    return;
  }

  try {
    await connectDB();
    isConnected = true;
    console.log("=> New database connection established");
  } catch (error) {
    console.error("=> Database connection failed:", error.message);
    isConnected = false;
    throw error;
  }
};

// Export the Express app as a serverless function
module.exports = async (req, res) => {
  // Set CORS headers for all responses
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log(`=> ${req.method} ${req.url}`);
    
    // Ensure database is connected
    await connectToDatabase();
    
    // Pass the request to Express app
    return app(req, res);
  } catch (error) {
    console.error("=> Function error:", error);
    
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: "Internal Server Error",
        message: process.env.NODE_ENV === 'production' 
          ? 'An error occurred' 
          : error.message
      });
    }
  }
};
