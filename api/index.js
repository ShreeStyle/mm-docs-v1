// API entry point for Vercel Serverless Functions
// Note: .env files are not deployed to Vercel, environment variables come from Vercel dashboard
if (process.env.NODE_ENV !== 'production') {
  require("dotenv").config();
}

const connectDB = require("../src/config/db");

// Global connection state
let cachedDb = null;

const connectToDatabase = async () => {
  if (cachedDb) {
    console.log("=> Using cached database connection");
    return cachedDb;
  }

  try {
    console.log("=> Connecting to database...");
    console.log("=> MONGODB_URI exists:", !!process.env.MONGODB_URI);
    console.log("=> JWT_SECRET exists:", !!process.env.JWT_SECRET);
    
    cachedDb = await connectDB();
    console.log("=> Database connection established successfully");
    return cachedDb;
  } catch (error) {
    console.error("=> Database connection failed:", error.message);
    cachedDb = null;
    throw error;
  }
};

// Export the handler for Vercel
module.exports = async (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader('Access-Control-Allow-Headers', 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization');

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    console.log(`=> [${new Date().toISOString()}] ${req.method} ${req.url}`);
    
    // Connect to database first
    await connectToDatabase();
    
    // Load and execute Express app
    const app = require("../src/app");
    return app(req, res);
    
  } catch (error) {
    console.error("=> Handler error:", error.message);
    console.error("=> Stack:", error.stack);
    
    if (!res.headersSent) {
      return res.status(500).json({ 
        error: "Internal Server Error",
        message: "Database connection failed. Please try again later.",
        hint: "Check Vercel environment variables: MONGODB_URI and JWT_SECRET"
      });
    }
  }
};
