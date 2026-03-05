#!/bin/bash

# MM Docs - Quick Start Setup Script
echo "🚀 MM Docs - Advanced Features Setup"
echo "======================================"
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if Node.js is installed
echo -e "${BLUE}Checking Node.js installation...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js is not installed. Please install Node.js first.${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js found: $(node --version)${NC}"
echo ""

# Check if MongoDB is running
echo -e "${BLUE}Checking MongoDB connection...${NC}"
if ! command -v mongosh &> /dev/null; then
    echo -e "${YELLOW}MongoDB CLI not found. Make sure MongoDB is installed and running.${NC}"
else
    echo -e "${GREEN}✓ MongoDB CLI found${NC}"
fi
echo ""

# Install backend dependencies
echo -e "${BLUE}Installing backend dependencies...${NC}"
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Backend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Backend dependencies installation failed${NC}"
fi
echo ""

# Install frontend dependencies
echo -e "${BLUE}Installing frontend dependencies...${NC}"
cd client
npm install
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✓ Frontend dependencies installed${NC}"
else
    echo -e "${YELLOW}⚠ Frontend dependencies installation failed${NC}"
fi
cd ..
echo ""

# Check if .env file exists
echo -e "${BLUE}Checking environment configuration...${NC}"
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠ .env file not found${NC}"
    echo "Creating .env from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        echo -e "${GREEN}✓ .env file created. Please update with your credentials.${NC}"
    else
        echo -e "${YELLOW}⚠ .env.example not found. Please create .env manually.${NC}"
    fi
else
    echo -e "${GREEN}✓ .env file exists${NC}"
fi
echo ""

# Summary
echo ""
echo -e "${GREEN}======================================"
echo "✅ Setup Complete!"
echo "======================================${NC}"
echo ""
echo -e "${BLUE}📋 Next Steps:${NC}"
echo ""
echo "1. Update .env file with your credentials"
echo "   - MONGODB_URI"
echo "   - JWT_SECRET"
echo "   - OPENAI_API_KEY (or other AI provider)"
echo ""
echo "2. Start the backend server:"
echo "   ${GREEN}npm run dev${NC}"
echo ""
echo "3. In a new terminal, start the frontend:"
echo "   ${GREEN}cd client && npm run dev${NC}"
echo ""
echo "4. Access the application:"
echo "   ${GREEN}http://localhost:5173${NC}"
echo ""
echo "5. Access the new enhanced dashboard:"
echo "   ${GREEN}http://localhost:5173/dashboard/v2${NC}"
echo ""
echo -e "${BLUE}📚 Documentation:${NC}"
echo "   - ADVANCED_FEATURES.md - Complete feature guide"
echo "   - IMPLEMENTATION_GUIDE.md - Setup and architecture"
echo ""
echo -e "${BLUE}🔗 API Endpoints:${NC}"
echo "   - Backend: http://localhost:5000"
echo "   - Health Check: http://localhost:5000/api/health"
echo ""
echo -e "${GREEN}Happy coding! 🎉${NC}"
echo ""
