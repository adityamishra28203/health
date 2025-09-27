# 🚀 HealthWallet Live Deployment Guide

This guide will help you deploy the HealthWallet application to Vercel for a unified platform experience.

## 🎯 Vercel Deployment (Recommended - Free & Easy)

### **Step 1: Deploy Frontend to Vercel**

1. **Go to [Vercel.com](https://vercel.com)**
   - Sign up with GitHub account
   - Click "New Project"

2. **Import Repository**
   - Select your `health` repository
   - Set **Root Directory** to `frontend`
   - Click "Deploy"

3. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add these variables:
   ```
   NEXT_PUBLIC_API_URL=https://healthwallet-backend.vercel.app
   NEXT_PUBLIC_IPFS_URL=https://ipfs.infura.io:5001
   NEXT_PUBLIC_BLOCKCHAIN_URL=https://mainnet.infura.io/v3/your-project-id
   ```

4. **Redeploy** after adding environment variables

### **Step 2: Deploy Backend to Vercel**

1. **Go to [Vercel.com](https://vercel.com)**
   - Use the same account as frontend
   - Click "New Project"

2. **Import Repository**
   - Select your `health` repository
   - Set **Root Directory** to `backend`
   - Click "Deploy"

3. **Configure Environment Variables**
   - Go to Settings → Environment Variables
   - Add these variables:
   ```
   NODE_ENV=production
   JWT_SECRET=your-super-secret-jwt-key-here
   JWT_EXPIRES_IN=7d
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healthwallet
   REDIS_URL=redis://username:password@your-redis-host:6379
   CORS_ORIGIN=https://healthwallet.vercel.app
   ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-project-id
   IPFS_URL=https://ipfs.infura.io:5001
   ```

4. **Update Frontend Environment**
   - Go to your frontend project
   - Update `NEXT_PUBLIC_API_URL` to `https://healthwallet-backend.vercel.app`
   - Redeploy frontend

## 🔧 Environment Variables

### **Frontend Environment Variables**
```bash
NEXT_PUBLIC_API_URL=https://healthwallet-backend.vercel.app
NEXT_PUBLIC_IPFS_URL=https://ipfs.infura.io:5001
NEXT_PUBLIC_BLOCKCHAIN_URL=https://mainnet.infura.io/v3/your-project-id
```

### **Backend Environment Variables**
```bash
# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healthwallet
REDIS_URL=redis://username:password@your-redis-host:6379

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# Blockchain
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-project-id
IPFS_URL=https://ipfs.infura.io:5001

# Server
NODE_ENV=production
CORS_ORIGIN=https://healthwallet.vercel.app
```

## 🗄️ Database Setup

### **MongoDB Atlas (Free)**
1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Create free cluster
3. Get connection string
4. Add to Vercel environment variables

### **Redis Cloud (Free)**
1. Go to [Redis Cloud](https://redis.com/try-free/)
2. Create free database
3. Get connection string
4. Add to Vercel environment variables

## 🧪 Testing Your Deployment

### **Health Check**
```bash
curl https://healthwallet-backend.vercel.app/health
```

### **API Documentation**
Visit: `https://healthwallet-backend.vercel.app/api/docs`

## 🎉 Success Checklist

- [ ] Frontend deployed to Vercel
- [ ] Backend deployed to Vercel
- [ ] Database services configured
- [ ] Environment variables set
- [ ] CORS properly configured
- [ ] Health checks working
- [ ] API documentation accessible

## 🔗 Final URLs

After successful deployment:

- **Frontend**: `https://healthwallet.vercel.app`
- **Backend**: `https://healthwallet-backend.vercel.app`
- **API Docs**: `https://healthwallet-backend.vercel.app/api/docs`
- **Health Check**: `https://healthwallet-backend.vercel.app/health`

---

**Your HealthWallet application is now live on Vercel! 🎉**