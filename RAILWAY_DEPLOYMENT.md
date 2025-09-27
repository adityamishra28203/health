# 🚂 Railway Deployment Guide for HealthWallet

This guide will help you deploy the HealthWallet backend to Railway successfully.

## 🔧 Fixed Issues

I've fixed several issues that were causing the Railway build to fail:

### 1. **Dockerfile Improvements**
- ✅ Added `curl` for health checks
- ✅ Install all dependencies (including dev) for build
- ✅ Proper build process
- ✅ Remove dev dependencies after build

### 2. **Main.ts Updates**
- ✅ Added proper error handling
- ✅ Added health check endpoint
- ✅ Added Swagger documentation
- ✅ Added validation pipes
- ✅ Listen on `0.0.0.0` for Railway

### 3. **Railway Configuration**
- ✅ Added `railway.json` configuration
- ✅ Added `.dockerignore` for optimization

## 🚀 Deployment Steps

### **Step 1: Push Updated Code**

```bash
cd /Users/aditya_mac/blockchain-health-wallet
git add .
git commit -m "Fix Railway deployment issues"
git push origin main
```

### **Step 2: Deploy on Railway**

1. **Go to [Railway.app](https://railway.app)**
2. **Create New Project**
3. **Deploy from GitHub**
   - Select your `health` repository
   - Set **Root Directory** to `backend`
   - Click "Deploy"

### **Step 3: Add Database Services**

1. **Add MongoDB:**
   - Click "New" → "Database" → "MongoDB"
   - Copy the connection string

2. **Add Redis:**
   - Click "New" → "Database" → "Redis"
   - Copy the connection string

### **Step 4: Configure Environment Variables**

In Railway dashboard, go to **Variables** tab and add:

```bash
# Required Variables
NODE_ENV=production
PORT=3001
MONGODB_URI=${{MongoDB.MONGODB_URI}}
REDIS_URL=${{Redis.REDIS_URL}}
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# CORS (update with your frontend URL)
CORS_ORIGIN=https://your-frontend-domain.vercel.app

# Optional (for blockchain features)
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-project-id
IPFS_URL=https://ipfs.infura.io:5001
```

### **Step 5: Deploy**

1. **Click "Deploy"** in Railway
2. **Wait for build** to complete
3. **Check logs** for any errors

## 🔍 Troubleshooting

### **Common Build Issues**

#### **1. Build Timeout**
- Railway has a 10-minute build timeout
- The optimized Dockerfile should build faster now

#### **2. Memory Issues**
- Railway provides 512MB RAM by default
- The build process is now optimized to use less memory

#### **3. Dependency Issues**
- All dependencies are now properly installed
- Dev dependencies are removed after build

### **Check Build Logs**

In Railway dashboard:
1. Go to your project
2. Click on the service
3. Go to "Deployments" tab
4. Click on the latest deployment
5. Check the build logs

### **Common Error Messages & Solutions**

#### **"Failed to build image"**
- Check if all dependencies are in package.json
- Verify Dockerfile syntax
- Check build logs for specific errors

#### **"Module not found"**
- Ensure all imports are correct
- Check if TypeScript compilation succeeds
- Verify all dependencies are installed

#### **"Port binding failed"**
- Make sure the app listens on `0.0.0.0:${PORT}`
- Check if PORT environment variable is set

## 📊 Expected Build Output

A successful build should show:

```
✅ Installing dependencies...
✅ Building application...
✅ Removing dev dependencies...
✅ Starting application...
🚀 HealthWallet API is running on: http://0.0.0.0:3001
📚 API Documentation: http://0.0.0.0:3001/api/docs
```

## 🔗 Testing Your Deployment

### **1. Health Check**
```bash
curl https://your-railway-url.railway.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production"
}
```

### **2. API Documentation**
Visit: `https://your-railway-url.railway.app/api/docs`

### **3. Test API Endpoints**
```bash
# Test CORS
curl -H "Origin: https://your-frontend.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://your-railway-url.railway.app/health
```

## 🔄 Update Frontend

Once your backend is deployed, update your frontend environment variables:

### **Vercel Environment Variables**
```
NEXT_PUBLIC_API_URL=https://your-railway-url.railway.app
NEXT_PUBLIC_IPFS_URL=https://ipfs.infura.io:5001
NEXT_PUBLIC_BLOCKCHAIN_URL=https://mainnet.infura.io/v3/your-project-id
```

## 🎉 Success!

If everything works correctly, you should have:

- ✅ **Backend API** running on Railway
- ✅ **Health check** endpoint working
- ✅ **API documentation** accessible
- ✅ **Database connections** working
- ✅ **CORS** properly configured

## 🆘 Still Having Issues?

### **Check These:**

1. **Build Logs**: Look for specific error messages
2. **Environment Variables**: Ensure all required vars are set
3. **Database Connections**: Verify MongoDB and Redis are connected
4. **Port Configuration**: Make sure PORT is set to 3001
5. **CORS Settings**: Update CORS_ORIGIN with your frontend URL

### **Get Help:**

1. **Railway Support**: https://railway.app/support
2. **Check Logs**: Railway dashboard → Service → Logs
3. **Restart Service**: Railway dashboard → Service → Restart

---

**🚀 Your HealthWallet backend should now deploy successfully on Railway!**
