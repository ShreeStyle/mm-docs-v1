// Test MongoDB connection and show detailed error
const mongoose = require("mongoose");

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI;
  
  if (!mongoUri) {
    return res.status(500).json({
      success: false,
      error: "MONGODB_URI not found in environment"
    });
  }
  
  try {
    // Try to connect with detailed error logging
    mongoose.set('strictQuery', false);
    
    const startTime = Date.now();
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
    });
    
    const elapsed = Date.now() - startTime;
    
    res.status(200).json({
      success: true,
      message: "MongoDB connection successful!",
      host: mongoose.connection.host,
      database: mongoose.connection.name,
      connectionTime: `${elapsed}ms`,
      readyState: mongoose.connection.readyState
    });
    
    // Close the connection
    await mongoose.connection.close();
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
      errorCode: error.code,
      errorName: error.name,
      stack: error.stack,
      mongoUriStart: mongoUri.substring(0, 30),
      mongoUriLength: mongoUri.length
    });
  }
};
