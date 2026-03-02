# Render.com Deployment Guide

## ✅ **Your App is Building on Render!**

I can see the build succeeded. Now let's complete the setup:

---

## 🔧 **Fix Your Render Configuration**

### **Step 1: Update Build & Start Commands in Render Dashboard**

Go to your Render service → **Settings** and update:

**Build Command:**
```bash
npm install && cd client && npm install && npm run build && cd ..
```

**Start Command:**
```bash
node src/server.js
```

---

## ⚙️ **Step 2: Set Environment Variables**

In Render Dashboard → **Environment** tab, add these:

```
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://bhatiyakavya695_db_user:NHhzSv365iOm1mJR@cluster0.f5kfgha.mongodb.net/aidocumentation?retryWrites=true&w=majority&appName=Cluster0
JWT_SECRET=mm_docs_secret_key
OPENAI_API_KEY=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
OPENAI_API_KEY_BACKUP=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
RAZORPAY_KEY_ID=rzp_test_YourKeyId
RAZORPAY_KEY_SECRET=YourSecretKey
```

**Important:** After adding, click **"Save Changes"** button!

---

## 🚀 **Step 3: Trigger Manual Deploy**

After updating settings:

1. Go to **Manual Deploy** tab
2. Click **"Deploy latest commit"**
3. Wait for build to complete (~2-3 minutes)

---

## 📊 **Step 4: Verify Deployment**

Once deployed, test your health endpoint:

```
https://your-app-name.onrender.com/api/health
```

Should return:
```json
{
  "status": "OK",
  "message": "Backend is running 🚀",
  "environment": "production"
}
```

---

## 🎯 **What I Fixed:**

1. ✅ Created [render.yaml](render.yaml) - Render configuration
2. ✅ Updated [src/app.js](src/app.js) - Serves frontend in production
3. ✅ Added support for `.onrender.com` CORS
4. ✅ Frontend will be served from the same domain (no CORS issues!)

---

## 🔥 **Advantages of Render:**

- ✅ **Puppeteer works** (no size limits!)
- ✅ **Full-stack in one place** (frontend + backend)
- ✅ **Free tier** (750 hours/month)
- ✅ **Auto-deploy** from GitHub
- ✅ **Free SSL** certificate
- ✅ **No serverless issues**
- ⚠️ **Cold starts** after 15 min inactivity (~30s to wake up)

---

## 🔄 **Auto-Deploy Setup**

Your app will auto-deploy when you push to GitHub:

```bash
git add .
git commit -m "Configure for Render deployment"
git push origin main
```

Render will automatically detect changes and redeploy! 🎉

---

## ⚠️ **Important Configuration in Render Dashboard:**

### **1. Instance Type**
- Free tier: Already selected ✅

### **2. Branch**
- Make sure it's set to `main` (or your primary branch)

### **3. Root Directory**
- Leave blank (it's the root of your repo)

### **4. Auto-Deploy**
- Enable: **Yes** ✅

### **5. Health Check Path** (Optional but recommended)
- Path: `/api/health`
- This helps Render know when your app is ready

---

## 📝 **Common Issues & Solutions:**

### Issue 1: "Build failed - npm install"
**Solution:** Make sure your `package.json` has all dependencies listed

### Issue 2: "Application failed to respond"
**Fix:**
1. Check environment variables are set
2. Check MongoDB connection
3. Look at Render Logs (Dashboard → Logs tab)

### Issue 3: "404 on frontend routes"
**Fix:** Already fixed! The server now serves `client/dist/index.html` for non-API routes

### Issue 4: "CORS errors"
**Fix:** Already fixed! Added `.onrender.com` to CORS whitelist

### Issue 5: "Cold start delays"
**This is normal on free tier:**
- After 15 minutes of inactivity, the app sleeps
- First request takes ~30 seconds to wake up
- Subsequent requests are fast
- **Workaround:** Use [UptimeRobot](https://uptimerobot.com) to ping your app every 5 minutes

---

## 🔍 **View Logs:**

Render Dashboard → Your Service → **Logs** tab

Watch real-time logs to see:
- Build process
- Server startup
- Incoming requests
- Errors

---

## 🎨 **Custom Domain (Optional)**

Free tier supports custom domains:
1. Go to **Settings** → **Custom Domain**
2. Add your domain
3. Update DNS records as instructed

---

## 💾 **File Storage Warning:**

⚠️ **Render's free tier has ephemeral storage** - uploaded files are lost on restart!

For production, use cloud storage:
- **Cloudinary** (images/PDFs) - Free tier available
- **AWS S3** (any files)
- **Google Cloud Storage**

---

## 📈 **Monitoring:**

Free tools to monitor your app:
- **UptimeRobot** - Keep app awake + uptime monitoring
- **Render Dashboard** - Built-in metrics
- **Better Uptime** - Free tier available

---

## 🔒 **MongoDB Atlas Network Access:**

Make sure MongoDB Atlas allows Render's IPs:

1. MongoDB Atlas → **Network Access**
2. Add IP: `0.0.0.0/0` (Allow from anywhere)
3. Click **Confirm**

---

## 🆘 **Still Having Issues?**

1. **Check Build Logs** in Render Dashboard
2. **Check Deploy Logs** 
3. **Check Live Logs** (real-time)
4. **Test locally first:**
   ```bash
   npm run build
   NODE_ENV=production PORT=5000 node src/server.js
   # Visit http://localhost:5000
   ```

---

## 📱 **Your Deployment URLs:**

- **Full App:** `https://your-app-name.onrender.com`
- **API Health Check:** `https://your-app-name.onrender.com/api/health`
- **API Endpoints:** `https://your-app-name.onrender.com/api/*`

---

## ✨ **Next Steps:**

1. ✅ Update build/start commands in Render Dashboard
2. ✅ Add all environment variables
3. ✅ Click "Save Changes"
4. ✅ Trigger manual deploy
5. ✅ Test health endpoint
6. ✅ Test full app functionality
7. ✅ Enable auto-deploy for future updates

---

## 🎉 **You're Almost There!**

Just update those settings in Render Dashboard and redeploy. Your app will work perfectly on Render - including Puppeteer PDF generation! 🚀

**Commands to remember:**
```bash
# Push code (auto-deploys if enabled)
git add .
git commit -m "update"
git push

# View your app
open https://your-app-name.onrender.com
```

Good luck! 🍀
