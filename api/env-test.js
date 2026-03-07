// Simple endpoint to test environment variables without database connection
module.exports = (req, res) => {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json');
  
  const envInfo = {
    timestamp: new Date().toISOString(),
    nodeEnv: process.env.NODE_ENV,
    hasMongoUri: !!process.env.MONGODB_URI,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasOpenAiKey: !!process.env.OPENAI_API_KEY,
    mongoUriLength: process.env.MONGODB_URI ? process.env.MONGODB_URI.length : 0,
    mongoUriStart: process.env.MONGODB_URI ? process.env.MONGODB_URI.substring(0, 30) : 'NOT_SET',
    allEnvKeys: Object.keys(process.env).filter(key => 
      key.includes('MONGO') || 
      key.includes('JWT') || 
      key.includes('OPENAI') ||
      key.includes('NODE')
    )
  };
  
  res.status(200).json(envInfo);
};
