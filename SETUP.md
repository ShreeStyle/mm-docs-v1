# Setup Instructions

## Creating Demo User

To create a demo user for testing, run:

```bash
npm run seed:demo
```

This will create a demo user with the following credentials:
- **Email**: demo@test.com
- **Password**: demo123
- **Plan**: Pro (with 1 year subscription)

## Environment Variables Required

Make sure you have the following environment variables set in your `.env` file:

### Required for Backend
```env
# Database
MONGODB_URI=your_mongodb_connection_string

# JWT Authentication
JWT_SECRET=your_jwt_secret_key

# OpenAI (for AI features)
OPENAI_API_KEY=your_openai_api_key
OPENAI_API_KEY_BACKUP=your_backup_openai_key

# Payment Gateway (Razorpay)
RAZORPAY_KEY_ID=your_razorpay_key_id
RAZORPAY_KEY_SECRET=your_razorpay_secret

# Frontend URL (for CORS)
FRONTEND_URL=http://localhost:5173
```

### For Vercel Deployment
Make sure to set all the above environment variables in your Vercel project settings.

### For Render Deployment
All environment variables are configured in the `render.yaml` file and should be set in the Render dashboard.

## Running the Application

### Development Mode
```bash
# Start backend only
npm run dev

# Start frontend only (in client directory)
cd client && npm run dev

# Start both frontend and backend
npm run dev:all
```

### Production Build
```bash
# Build the frontend
npm run build

# Start production server
npm start
```

## Troubleshooting

### Login Error: HTTP 500
This usually means:
1. **Database not connected**: Check `MONGODB_URI` is set correctly
2. **Demo user doesn't exist**: Run `npm run seed:demo` to create it
3. **Missing JWT_SECRET**: Check environment variables

### User Not Found Error
If you see "User not found" when trying to login with demo@test.com:
1. Run `npm run seed:demo` to create the demo user
2. Or create a new account using the signup page

### Database Connection Issues
If the server fails to start with database errors:
1. Check your MongoDB connection string in `.env`
2. Make sure your MongoDB instance is running
3. Check if your IP is whitelisted in MongoDB Atlas (if using cloud)

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create new user account
- `POST /api/auth/login` - Login with email/password
- `POST /api/auth/verify-otp` - Verify OTP (if enabled)

### Documents
- `GET /api/documents` - List all documents
- `GET /api/documents/:id` - Get specific document
- `POST /api/documents` - Create new document
- `PUT /api/documents/:id` - Update document
- `DELETE /api/documents/:id` - Delete document

### Document Editor (PandaDoc-style)
- `POST /api/document-editor/create-from-template` - Create document from template
- `GET /api/document-editor/:id` - Get document for editing
- `PUT /api/document-editor/:id` - Update document
- `PUT /api/document-editor/:id/fields` - Update document fields
- `POST /api/document-editor/:id/send` - Send document to recipients

## Support

For additional help, please:
1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure MongoDB is accessible and running
