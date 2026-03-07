// Test what environment variables Vercel sees
module.exports = (req, res) => {
  res.json({
    hasMongoUri: !!process.env.MONGODB_URI,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasOpenAI: !!process.env.OPENAI_API_KEY,
    mongoUriLength: process.env.MONGODB_URI?.length || 0,
    mongoUriStart: process.env.MONGODB_URI?.substring(0, 20) || 'undefined',
    nodeEnv: process.env.NODE_ENV,
    allEnvKeys: Object.keys(process.env).filter(k => 
      k.includes('MONGO') || k.includes('JWT') || k.includes('NODE')
    )
  });
};
