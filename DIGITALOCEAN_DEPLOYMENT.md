# 🌊 DigitalOcean App Platform Deployment Guide

DigitalOcean App Platform offers excellent performance and reliability.

## 🚀 Deploy to DigitalOcean

### **Step 1: Create App**

1. **Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)**
2. **Click "Create App"**
3. **Connect GitHub** and select your repository

### **Step 2: Configure App**

1. **App Name**: `healthwallet-backend`
2. **Source Directory**: `/backend`
3. **Build Command**: `npm install && npm run build`
4. **Run Command**: `npm run start:prod`
5. **HTTP Port**: `3001`

### **Step 3: Add Database**

1. **Click "Create Database"**
2. **Choose**: MongoDB
3. **Plan**: Basic ($15/month) or use external MongoDB Atlas (free)

### **Step 4: Environment Variables**

```bash
NODE_ENV=production
PORT=3001
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healthwallet
REDIS_URL=redis://your-redis-url
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### **Step 5: Deploy**

1. **Click "Create Resources"**
2. **Wait for deployment** (5-10 minutes)
3. **Check logs** for any issues

## ✅ **Advantages of DigitalOcean**

- ✅ **High performance** and reliability
- ✅ **Automatic scaling**
- ✅ **Built-in monitoring**
- ✅ **Custom domains** and SSL
- ✅ **Global CDN**
- ✅ **Professional support**

## 💰 **Pricing**

- **App**: Free tier available
- **Database**: $15/month for MongoDB
- **Total**: ~$15/month for production setup

---

**DigitalOcean offers the best performance! 🌊✨**
