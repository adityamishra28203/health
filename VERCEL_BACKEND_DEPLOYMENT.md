# ▲ Vercel Backend Deployment Guide

Deploy your NestJS backend to Vercel for a unified platform experience!

## 🚀 **Why Vercel for Backend?**

- ✅ **Same platform** as frontend (easier management)
- ✅ **Automatic deployments** from GitHub
- ✅ **Global CDN** and edge functions
- ✅ **Free tier** with generous limits
- ✅ **Excellent performance** and reliability
- ✅ **Easy environment variable management**
- ✅ **Built-in monitoring** and analytics

## 📋 **Prerequisites**

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com)
2. **GitHub Repository**: Your code should be on GitHub
3. **Vercel CLI** (optional): `npm install -g vercel`

## 🚀 **Deployment Steps**

### **Method 1: Vercel Dashboard (Recommended)**

#### **Step 1: Create New Project**

1. **Go to [Vercel Dashboard](https://vercel.com/dashboard)**
2. **Click "New Project"**
3. **Import Git Repository**: Select `adityamishra28203/health`

#### **Step 2: Configure Backend Project**

1. **Project Name**: `healthwallet-backend`
2. **Root Directory**: `backend`
3. **Framework Preset**: `Other`
4. **Build Command**: `npm install && npm run build`
5. **Output Directory**: `dist`
6. **Install Command**: `npm install`

#### **Step 3: Environment Variables**

In the Vercel dashboard, go to **Settings** → **Environment Variables** and add:

```bash
# Required Variables
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d

# Database (use external services)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healthwallet
REDIS_URL=redis://username:password@your-redis-host:6379

# CORS (update with your frontend URL)
CORS_ORIGIN=https://healthwallet.vercel.app,https://healthwallet-frontend.vercel.app

# Optional (for blockchain features)
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-project-id
IPFS_URL=https://ipfs.infura.io:5001
```

#### **Step 4: Deploy**

1. **Click "Deploy"**
2. **Wait for build** (2-3 minutes)
3. **Check deployment logs** for any errors

### **Method 2: Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Navigate to backend directory
cd /Users/aditya_mac/blockchain-health-wallet/backend

# Deploy
vercel --prod

# Set environment variables
vercel env add NODE_ENV
vercel env add JWT_SECRET
vercel env add MONGODB_URI
vercel env add REDIS_URL
vercel env add CORS_ORIGIN
```

## 🗄️ **Database Setup**

Since Vercel doesn't provide databases, you'll need external services:

### **MongoDB Atlas (Free)**

1. **Go to [MongoDB Atlas](https://www.mongodb.com/atlas)**
2. **Create free cluster**
3. **Get connection string**
4. **Add to Vercel environment variables**

### **Redis Cloud (Free)**

1. **Go to [Redis Cloud](https://redis.com/try-free/)**
2. **Create free database**
3. **Get connection string**
4. **Add to Vercel environment variables**

## 🔗 **Your Backend URLs**

After deployment, your backend will be available at:

- **Main API**: `https://healthwallet-backend.vercel.app`
- **Health Check**: `https://healthwallet-backend.vercel.app/health`
- **API Docs**: `https://healthwallet-backend.vercel.app/api/docs`

## 🧪 **Testing Your Deployment**

### **Health Check**
```bash
curl https://healthwallet-backend.vercel.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2025-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "platform": "vercel"
}
```

### **API Documentation**
Visit: `https://healthwallet-backend.vercel.app/api/docs`

### **Test CORS**
```bash
curl -H "Origin: https://healthwallet.vercel.app" \
     -H "Access-Control-Request-Method: GET" \
     -H "Access-Control-Request-Headers: X-Requested-With" \
     -X OPTIONS \
     https://healthwallet-backend.vercel.app/health
```

## 🔄 **Update Frontend**

Once your backend is deployed, update your frontend environment variables:

### **In Vercel Dashboard:**
1. Go to your frontend project
2. Settings → Environment Variables
3. Update `NEXT_PUBLIC_API_URL` to your backend URL
4. Redeploy frontend

## 📊 **Monitoring & Analytics**

### **Vercel Analytics**
- **Performance**: Real-time performance metrics
- **Function Logs**: Serverless function execution logs
- **Errors**: Automatic error tracking
- **Usage**: Bandwidth and function execution stats

### **Health Monitoring**
- **Uptime**: Monitor `/health` endpoint
- **Response Times**: Track API performance
- **Error Rates**: Monitor failed requests

## 🚨 **Troubleshooting**

### **Common Issues**

#### **Build Failures**
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify TypeScript compilation

#### **Environment Variables**
- Make sure all required variables are set
- Check variable names (case-sensitive)
- Redeploy after adding new variables

#### **CORS Issues**
- Update `CORS_ORIGIN` with your frontend URL
- Check if frontend URL is in the allowed origins list

#### **Database Connection**
- Verify MongoDB Atlas connection string
- Check if IP whitelist includes Vercel IPs
- Ensure Redis connection string is correct

### **Debug Commands**

```bash
# Check deployment logs
vercel logs

# Check environment variables
vercel env ls

# Redeploy with logs
vercel --prod --debug
```

## 🎯 **Production Checklist**

- [ ] Backend deployed successfully
- [ ] Health check endpoint working
- [ ] API documentation accessible
- [ ] Environment variables configured
- [ ] Database connections working
- [ ] CORS properly configured
- [ ] Frontend updated with backend URL
- [ ] Monitoring set up

## 🎉 **Success!**

Your HealthWallet backend is now running on Vercel with:

- ✅ **High performance** global CDN
- ✅ **Automatic scaling** based on demand
- ✅ **Zero maintenance** serverless architecture
- ✅ **Built-in monitoring** and analytics
- ✅ **Easy management** through Vercel dashboard

## 🔗 **Next Steps**

1. **Deploy frontend** to Vercel (if not already done)
2. **Set up custom domain** (optional)
3. **Configure monitoring** alerts
4. **Set up CI/CD** for automatic deployments
5. **Add team members** for collaboration

---

**Your HealthWallet backend is now live on Vercel! ▲✨**