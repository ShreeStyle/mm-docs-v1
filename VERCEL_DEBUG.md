# Debugging Vercel Deployment Issues

## Quick Diagnostics

### 1. Check Server Health
Visit: `https://mm-docs-v1-alpha.vercel.app/api/health`

This will show:
- Server status
- Database connection status  
- Environment configuration
- User count (if DB connected)

**Expected Response:**
```json
{
  "status": "OK",
  "message": "Backend is running 🚀",
  "database": {
    "connected": true,
    "userCount": 1
  }
}
```

### 2. Common Issues

#### Issue: "Server error: Please try again later"
**Causes:**
1. MongoDB not connected
2. Environment variables missing
3. Demo user doesn't exist

**Solutions:**
1. Check Vercel Environment Variables:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Verify these are set:
     - `MONGODB_URI` - MongoDB connection string
     - `JWT_SECRET` - Any secure string
     - `OPENAI_API_KEY` - OpenAI API key (optional for basic features)

2. Create Demo User in Production Database:
   ```bash
   # Connect to your production MongoDB
   # Run the seed script pointing to production database
   MONGODB_URI="your_production_uri" npm run seed:demo
   ```

3. Check Vercel Function Logs:
   - Go to Vercel Dashboard → Your Project → Functions
   - Look for error messages in the logs
   - Check for "Database connection failed" or "User not found"

#### Issue: Database Connection Timeout
**Cause:** MongoDB Atlas IP whitelist or connection string issues

**Solutions:**
1. MongoDB Atlas Settings:
   - Go to MongoDB Atlas → Network Access
   - Add IP: `0.0.0.0/0` (allow all IPs for serverless)

2. Check Connection String:
   - Must include username, password
   - Must have `/dbname?retryWrites=true&w=majority`
   - Example: `mongodb+srv://username:password@cluster.mongodb.net/mydb?retryWrites=true&w=majority`

#### Issue: "User not found"
**Cause:** Demo user doesn't exist in production database

**Solutions:**
1. Create user via Signup page:
   - Go to `/signup`
   - Create a new account
   - Then login with new credentials

2. Or seed demo user to production:
   ```bash
   MONGODB_URI="your_production_mongodb_uri" npm run seed:demo
   ```

### 3. Vercel Logs Access

**View Real-time Logs:**
1. Open Vercel Dashboard
2. Navigate to your project
3. Go to "Deployments" tab
4. Click on latest deployment
5. Click "Functions" tab
6. Look for `/api/index` logs
7. Check for error messages

**Common Log Messages:**
- `❌ Database connection failed` → Check MONGODB_URI
- `❌ User not found` → Create user or run seed script
- `❌ Login error` → Check specific error details

### 4. Testing Locally

```bash
# Install dependencies
npm install

# Create demo user
npm run seed:demo

# Start dev server
npm run dev

# Test login at http://localhost:5173
```

### 5. Environment Variables Checklist

**Required for Vercel:**
- ✅ `MONGODB_URI` - Production MongoDB connection string
- ✅ `JWT_SECRET` - Any random secure string (e.g., generate with `openssl rand -hex 32`)

**Optional:**
- `OPENAI_API_KEY` - Only needed for AI features
- `RAZORPAY_KEY_ID` - Only needed for payments
- `RAZORPAY_KEY_SECRET` - Only needed for payments
- `FRONTEND_URL` - Vercel auto-sets this

### 6. Redeployment

After fixing environment variables or database issues:

1. **Trigger Redeploy:**
   ```bash
   git commit --allow-empty -m "Trigger redeploy"
   git push origin main
   ```

2. **Or manually in Vercel:**
   - Go to Deployments
   - Click "..." on latest deployment
   - Click "Redeploy"

### 7. Emergency Workaround

If nothing works, use Signup instead:
1. Go to `/signup` on your deployed site
2. Create a new account with any email
3. Login with your new credentials
4. This bypasses the demo user requirement

### 8. Get Help

If issues persist:
1. Check `/api/health` response
2. Copy error from browser console (F12)
3. Check Vercel function logs
4. Verify all environment variables are set correctly

### 9. Quick Fixes

**Reset Everything:**
```bash
# 1. Verify local works
npm run seed:demo
npm run dev

# 2. Test login locally at http://localhost:5173

# 3. If local works, issue is Vercel config
#    - Check environment variables
#    - Check MongoDB IP whitelist
#    - Redeploy
```

**Create User Directly in MongoDB:**
```javascript
// In MongoDB Compass or Atlas UI, insert:
{
  "name": "Demo User",
  "email": "demo@test.com",
  "password": "$2a$10$...", // Use bcrypt to hash "demo123"
  "plan": "pro",
  "onboarded": true,
  "subscriptionStatus": "active",
  "createdAt": new Date(),
  "updatedAt": new Date()
}
```

To generate password hash:
```bash
node -e "const bcrypt = require('bcryptjs'); console.log(bcrypt.hashSync('demo123', 10));"
```
