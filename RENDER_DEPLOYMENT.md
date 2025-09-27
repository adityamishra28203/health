# 🎨 Render Deployment Guide for HealthWallet Backend

Render is a great alternative to Railway with better reliability and easier setup.

## 🚀 Quick Deploy to Render

### **Step 1: Prepare for Render**

1. **Go to [Render.com](https://render.com)**
2. **Sign up with GitHub**
3. **Connect your repository**

### **Step 2: Create Web Service**

1. **Click "New +" → "Web Service"**
2. **Connect Repository**: Select `adityamishra28203/health`
3. **Configure:**
   - **Name**: `healthwallet-backend`
   - **Root Directory**: `backend`
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm run start:prod`

### **Step 3: Add Database Services**

1. **Add MongoDB:**
   - Click "New +" → "MongoDB"
   - Name: `healthwallet-mongodb`
   - Plan: Free

2. **Add Redis:**
   - Click "New +" → "Redis"
   - Name: `healthwallet-redis`
   - Plan: Free

### **Step 4: Environment Variables**

In your web service settings, add:

```bash
NODE_ENV=production
PORT=10000
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healthwallet
REDIS_URL=redis://redis:6379
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### **Step 5: Deploy**

1. **Click "Create Web Service"**
2. **Wait for build** (usually 2-3 minutes)
3. **Check logs** for any errors

## ✅ **Advantages of Render**

- ✅ **More reliable** than Railway
- ✅ **Better build logs** and debugging
- ✅ **Free tier** with good limits
- ✅ **Automatic HTTPS** and custom domains
- ✅ **Easy database integration**
- ✅ **Better error messages**

## 🔗 **Your Backend URL**

Once deployed, your backend will be available at:
`https://healthwallet-backend.onrender.com`

## 🧪 **Test Your Deployment**

```bash
# Health check
curl https://healthwallet-backend.onrender.com/health

# API docs
open https://healthwallet-backend.onrender.com/api/docs
```

---

**Render is much more reliable than Railway! 🎨✨**
