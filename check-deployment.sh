#!/bin/bash

# Pre-Deployment Checklist Script

echo "🔍 Pre-Deployment Checklist for Vercel"
echo "======================================="
echo ""

# Check if .env exists
if [ -f ".env" ]; then
    echo "✅ .env file found"
else
    echo "⚠️  .env file not found - Create one from .env.example"
fi

# Check for required dependencies
echo ""
echo "📦 Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ Backend node_modules installed"
else
    echo "❌ Backend dependencies not installed - Run: npm install"
fi

if [ -d "client/node_modules" ]; then
    echo "✅ Frontend node_modules installed"
else
    echo "❌ Frontend dependencies not installed - Run: cd client && npm install"
fi

# Check for MongoDB connection
echo ""
echo "🗄️  MongoDB Configuration:"
if grep -q "MONGODB_URI" .env; then
    echo "✅ MONGODB_URI found in .env"
    echo "   Make sure to use MongoDB Atlas URI for production"
else
    echo "❌ MONGODB_URI not set in .env"
fi

# Check for API keys
echo ""
echo "🔑 API Keys:"
if grep -q "OPENAI_API_KEY" .env; then
    echo "✅ OPENAI_API_KEY found"
else
    echo "❌ OPENAI_API_KEY not set"
fi

if grep -q "RAZORPAY_KEY_ID" .env; then
    echo "✅ RAZORPAY_KEY_ID found"
else
    echo "⚠️  RAZORPAY_KEY_ID not set (needed for payments)"
fi

# Test build
echo ""
echo "🏗️  Testing build..."
echo "   Run: npm run build"
echo ""

# Vercel CLI check
echo "🚀 Vercel CLI:"
if command -v vercel &> /dev/null; then
    echo "✅ Vercel CLI installed"
    echo "   Ready to deploy with: vercel --prod"
else
    echo "❌ Vercel CLI not installed"
    echo "   Install with: npm i -g vercel"
fi

echo ""
echo "📝 Next Steps:"
echo "   1. Set up MongoDB Atlas: https://cloud.mongodb.com"
echo "   2. Update .env with production MongoDB URI"
echo "   3. Run: npm run build (to test locally)"
echo "   4. Run: vercel login"
echo "   5. Run: vercel (for preview deployment)"
echo "   6. Set environment variables in Vercel Dashboard"
echo "   7. Run: vercel --prod (for production)"
echo ""
echo "📖 Full guide: See VERCEL_DEPLOYMENT.md"
