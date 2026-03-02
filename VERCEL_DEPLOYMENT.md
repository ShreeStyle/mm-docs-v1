# Vercel Deployment Guide

## ⚠️ Prerequisites

Before deploying to Vercel, ensure you have:

1. **MongoDB Atlas Account** (Free tier available)
   - Create a database at https://cloud.mongodb.com
   - Get your connection string
   - Whitelist all IPs (0.0.0.0/0) in Network Access

2. **Vercel Account**
   - Sign up at https://vercel.com
   - Install Vercel CLI: `npm i -g vercel`

3. **Environment Variables Ready**
   - All keys from `.env.example`
   - Production MongoDB URI
   - OpenRouter/OpenAI API keys
   - Razorpay credentials

---

## 🚀 Deployment Steps

### Step 1: Install Dependencies
```bash
npm install
npm install --prefix client
npm install puppeteer-core @sparticuz/chromium
```

### Step 2: Test Build Locally
```bash
npm run build
```

### Step 3: Login to Vercel
```bash
vercel login
```

### Step 4: Deploy
```bash
# First deployment (will prompt for configuration)
vercel

# Production deployment
vercel --prod
```

### Step 5: Set Environment Variables

In Vercel Dashboard (or via CLI), add these environment variables:

```bash
# Via CLI
vercel env add JWT_SECRET
vercel env add MONGODB_URI
vercel env add OPENAI_API_KEY
vercel env add OPENAI_API_KEY_BACKUP
vercel env add RAZORPAY_KEY_ID
vercel env add RAZORPAY_KEY_SECRET
vercel env add NODE_ENV production
vercel env add FRONTEND_URL your-vercel-url.vercel.app
```

**Or** go to: `Project Settings → Environment Variables` in Vercel Dashboard

---

## ⚠️ Important Configuration

### Serverless Function Limits

Vercel has limits on serverless functions:
- **Size**: 50MB (unzipped)
- **Duration**: 60 seconds (Pro plan needed for longer)
- **Memory**: 1024MB (configurable)

PDF generation with Puppeteer may hit these limits. If you face issues:

1. **Option A**: Use external PDF service (recommended for free plan)
   - PDFShift, PDF.co, or similar

2. **Option B**: Deploy backend separately on Render/Railway
   - Keep frontend on Vercel
   - Update API endpoints in frontend

3. **Option C**: Upgrade Vercel plan
   - Pro plan: 10-minute timeouts
   - Enterprise: Custom limits

---

## 🔧 Common Issues & Solutions

### Issue 1: "Function too large"
**Solution**: The `@sparticuz/chromium` package is large. Vercel may reject it.
- Use Vercel Pro plan
- Or split deployment (see below)

### Issue 2: "Timeout error"
**Solution**: PDF generation taking too long
- Optimize HTML before PDF conversion
- Use smaller page sizes
- Or use external PDF service

### Issue 3: "Cannot connect to MongoDB"
**Solution**: 
- Ensure MongoDB Atlas allows all IPs: `0.0.0.0/0`
- Check connection string format: `mongodb+srv://...`
- Verify username/password are URL-encoded

### Issue 4: "CORS errors"
**Solution**: Update `FRONTEND_URL` environment variable
```bash
vercel env add FRONTEND_URL https://your-app.vercel.app
```

---

## 🔀 Alternative: Split Deployment (Recommended)

If Puppeteer causes issues on Vercel, deploy separately:

### Frontend on Vercel
1. Deploy only the `client/` folder
2. Update API base URL in frontend code

### Backend on Render/Railway
1. Deploy full backend with Puppeteer
2. No serverless restrictions
3. Better for heavy operations

**Steps**:
1. Comment out backend routes in `vercel.json`
2. Deploy client to Vercel
3. Deploy backend to Render (https://render.com)
4. Update `FRONTEND_URL` in backend
5. Update API URLs in frontend

---

## 📊 Post-Deployment Checklist

- [ ] Check deployment logs in Vercel dashboard
- [ ] Test user registration
- [ ] Test document generation (all types)
- [ ] Test PDF download
- [ ] Test payment integration
- [ ] Check watermark on free plan
- [ ] Test brand kit upload
- [ ] Verify MongoDB connection
- [ ] Check all API endpoints
- [ ] Test on mobile devices

---

## 🔍 Monitoring

### View Logs
```bash
vercel logs your-project-url.vercel.app
```

### Check Function Performance
- Go to Vercel Dashboard → Project → Functions
- Monitor execution time and errors

---

## 🆘 Still Having Issues?

1. **Check Vercel deployment logs** in dashboard
2. **Test locally first**: `npm run build && npm start`
3. **Verify all environment variables** are set
4. **Check MongoDB Atlas network access**
5. **Consider splitting deployment** if Puppeteer fails

---

## 📝 Quick Commands Reference

```bash
# Install dependencies
npm install && cd client && npm install

# Local development
npm run dev:all

# Build for production
npm run build

# Test production build locally  
npm start

# Deploy to Vercel preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# Remove deployment
vercel remove [deployment-url]
```

---

## 🎯 Recommended Setup

**For Free/Hobby Plan**:
- Deploy frontend on Vercel
- Deploy backend on Render.com (free tier)
- Split for better performance

**For Vercel Pro Plan**:
- Full-stack deployment on Vercel
- Increase function timeout to 300s
- Increase memory to 3008MB

---

## 📚 Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [Vercel Functions](https://vercel.com/docs/concepts/functions/serverless-functions)
- [@sparticuz/chromium](https://github.com/Sparticuz/chromium)

---

**Need help?** Check deployment logs first, they usually show the exact error.
