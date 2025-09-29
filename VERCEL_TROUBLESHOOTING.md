# 🔧 Vercel Backend Deployment Troubleshooting Guide

This guide helps you fix common issues when deploying the HealthWallet backend to Vercel.

## 🚨 Common Issues & Solutions

### **Issue 1: Build Failures**

#### **Problem**: Build command fails during deployment
#### **Solution**:
1. **Check build logs** in Vercel dashboard
2. **Verify package.json** has correct scripts:
   ```json
   {
     "scripts": {
       "build": "npx nest build",
       "start:prod": "node dist/main"
     }
   }
   ```
3. **Ensure all dependencies** are in `dependencies` not `devDependencies`

#### **Problem**: TypeScript compilation errors
#### **Solution**:
1. **Check TypeScript config**: Ensure `tsconfig.json` is correct
2. **Fix import errors**: Make sure all imports are correct
3. **Check for missing dependencies**: Install any missing packages

### **Issue 2: Runtime Errors**

#### **Problem**: Application crashes on startup
#### **Solution**:
1. **Check environment variables** are set in Vercel dashboard
2. **Verify database connections** (MongoDB, Redis)
3. **Check CORS configuration** includes your frontend URL

#### **Problem**: Module not found errors
#### **Solution**:
1. **Check AppModule** includes all necessary modules
2. **Verify imports** in all files
3. **Ensure build output** includes all files

### **Issue 3: Database Connection Issues**

#### **Problem**: MongoDB connection fails
#### **Solution**:
1. **Set MONGODB_URI** in Vercel environment variables
2. **Use MongoDB Atlas** (free tier available)
3. **Check connection string** format:
   ```
   mongodb+srv://username:password@cluster.mongodb.net/healthwallet
   ```

#### **Problem**: Redis connection fails
#### **Solution**:
1. **Set REDIS_URL** in Vercel environment variables
2. **Use Redis Cloud** (free tier available)
3. **Check connection string** format:
   ```
   redis://username:password@your-redis-host:6379
   ```

### **Issue 4: CORS Issues**

#### **Problem**: Frontend can't connect to backend
#### **Solution**:
1. **Update CORS_ORIGIN** in Vercel environment variables
2. **Include your frontend URL** in CORS origins
3. **Check main.ts** CORS configuration

### **Issue 5: Function Timeout**

#### **Problem**: Requests timeout after 30 seconds
#### **Solution**:
1. **Optimize database queries**
2. **Add caching** for frequently accessed data
3. **Consider upgrading** to Vercel Pro for longer timeouts

## 🔍 Debugging Steps

### **Step 1: Check Build Logs**
1. Go to Vercel dashboard
2. Click on your project
3. Go to "Deployments" tab
4. Click on the latest deployment
5. Check "Build Logs" for errors

### **Step 2: Check Function Logs**
1. Go to "Functions" tab in Vercel dashboard
2. Click on your function
3. Check "Logs" for runtime errors

### **Step 3: Test Locally**
```bash
# Build the project
npm run build

# Test the built application
npm run start:prod
```

### **Step 4: Check Environment Variables**
1. Go to Vercel dashboard
2. Click on your project
3. Go to "Settings" → "Environment Variables"
4. Verify all required variables are set

## 🛠️ Required Environment Variables

Make sure these are set in Vercel:

```bash
# Required
NODE_ENV=production
JWT_SECRET=your-super-secret-jwt-key
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/healthwallet
REDIS_URL=redis://username:password@your-redis-host:6379
CORS_ORIGIN=https://your-frontend-url.vercel.app

# Optional
JWT_EXPIRES_IN=7d
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-project-id
IPFS_URL=https://ipfs.infura.io:5001
```

## 🧪 Testing Your Deployment

### **Health Check**
```bash
curl https://your-backend-url.vercel.app/health
```

Expected response:
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456,
  "environment": "production",
  "platform": "vercel"
}
```

### **API Documentation**
Visit: `https://your-backend-url.vercel.app/api/docs`

### **Test Endpoints**
```bash
# Test basic endpoint
curl https://your-backend-url.vercel.app/

# Test health records
curl https://your-backend-url.vercel.app/api/health-records

# Test insurance claims
curl https://your-backend-url.vercel.app/api/insurance-claims
```

## 🔄 Redeployment Steps

If you need to redeploy:

1. **Make changes** to your code
2. **Commit and push** to GitHub
3. **Vercel will automatically redeploy**
4. **Check deployment logs** for any errors
5. **Test the new deployment**

## 📞 Getting Help

If you're still having issues:

1. **Check Vercel documentation**: https://vercel.com/docs
2. **Check NestJS documentation**: https://docs.nestjs.com/
3. **Check deployment logs** for specific error messages
4. **Test locally** to ensure the app works
5. **Verify environment variables** are set correctly

## 🎯 Success Checklist

- [ ] Build completes successfully
- [ ] No runtime errors in logs
- [ ] Health check endpoint responds
- [ ] API documentation is accessible
- [ ] Database connections work
- [ ] CORS is properly configured
- [ ] All environment variables are set

---

**Your HealthWallet backend should now be working on Vercel! 🎉**





