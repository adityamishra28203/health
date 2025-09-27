# 🚀 HealthWallet Live Deployment Guide

This guide will help you deploy the HealthWallet application to make it live and accessible to users.

## 🎯 Quick Deployment Options

### **Option 1: Vercel + Vercel (Recommended - Free & Easy)**

#### **Step 1: Deploy Frontend to Vercel**

1. **Go to [Vercel.com](https://vercel.com)**
   - Sign up with GitHub account
   - Click "New Project"

2. **Import Repository**
   - Select your `blockchain-health-wallet` repository
   - Set **Root Directory** to `frontend`
   - Click "Deploy"

3. **Configure Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add these variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-url.railway.app
   NEXT_PUBLIC_IPFS_URL=https://ipfs.infura.io:5001
   NEXT_PUBLIC_BLOCKCHAIN_URL=https://mainnet.infura.io/v3/your-project-id
   ```

4. **Redeploy** after adding environment variables

#### **Step 2: Deploy Backend to Vercel**

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

### **Option 2: Netlify + Heroku (Alternative)**

#### **Frontend (Netlify)**
1. Go to [Netlify.com](https://netlify.com)
2. Connect GitHub repository
3. Build settings:
   - **Base directory**: `frontend`
   - **Build command**: `npm run build`
   - **Publish directory**: `frontend/.next`
4. Add environment variables in Site settings

#### **Backend (Heroku)**
1. Go to [Heroku.com](https://heroku.com)
2. Create new app
3. Connect GitHub repository
4. Add MongoDB and Redis add-ons
5. Set environment variables
6. Deploy from GitHub

### **Option 3: VPS with Docker (Most Control)**

#### **Prerequisites**
- VPS with Ubuntu 20.04+
- Domain name pointing to your server
- Docker and Docker Compose installed

#### **Deployment Steps**

1. **Clone Repository on Server**
   ```bash
   git clone <your-repo-url>
   cd blockchain-health-wallet
   ```

2. **Run Deployment Script**
   ```bash
   chmod +x deploy.sh
   ./deploy.sh
   ```

3. **Set up SSL with Let's Encrypt**
   ```bash
   sudo apt install certbot nginx
   sudo certbot --nginx -d your-domain.com
   ```

4. **Configure Domain**
   - Point your domain to the server IP
   - Update DNS records

## 🔧 Manual Deployment Steps

### **Frontend Deployment (Vercel)**

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy from Frontend Directory**
   ```bash
   cd frontend
   vercel --prod
   ```

4. **Set Environment Variables**
   ```bash
   vercel env add NEXT_PUBLIC_API_URL
   vercel env add NEXT_PUBLIC_IPFS_URL
   vercel env add NEXT_PUBLIC_BLOCKCHAIN_URL
   ```

### **Backend Deployment (Railway)**

1. **Install Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **Login to Railway**
   ```bash
   railway login
   ```

3. **Deploy from Backend Directory**
   ```bash
   cd backend
   railway up
   ```

4. **Add Database Services**
   ```bash
   railway add mongodb
   railway add redis
   ```

5. **Set Environment Variables**
   ```bash
   railway variables set JWT_SECRET=your-secret-key
   railway variables set NODE_ENV=production
   ```

## 🌐 Domain Configuration

### **Custom Domain Setup**

1. **Buy a Domain** (from Namecheap, GoDaddy, etc.)

2. **Configure DNS**
   - Point A record to your server IP (for VPS)
   - Or use CNAME for Vercel/Railway

3. **SSL Certificate**
   - Vercel/Railway: Automatic SSL
   - VPS: Use Let's Encrypt

### **Example DNS Configuration**

```
Type    Name    Value
A       @       your-server-ip
CNAME   www     your-vercel-url.vercel.app
CNAME   api     your-railway-url.railway.app
```

## 🔐 Production Security Checklist

### **Environment Variables**
- [ ] Change default JWT secret
- [ ] Use production database URLs
- [ ] Set secure CORS origins
- [ ] Configure rate limiting

### **SSL/HTTPS**
- [ ] Enable HTTPS for all domains
- [ ] Redirect HTTP to HTTPS
- [ ] Use strong SSL certificates

### **Database Security**
- [ ] Use strong database passwords
- [ ] Enable database authentication
- [ ] Configure firewall rules
- [ ] Set up regular backups

### **Application Security**
- [ ] Enable CORS properly
- [ ] Set up rate limiting
- [ ] Configure security headers
- [ ] Enable request logging

## 📊 Monitoring Setup

### **Health Checks**
```bash
# Check if services are running
curl https://your-domain.com/api/health
curl https://your-domain.com/
```

### **Logs Monitoring**
```bash
# Vercel logs
vercel logs

# Railway logs
railway logs

# Docker logs
docker-compose logs -f
```

### **Performance Monitoring**
- Set up Uptime monitoring (UptimeRobot, Pingdom)
- Configure error tracking (Sentry)
- Set up analytics (Google Analytics)

## 🚨 Troubleshooting

### **Common Issues**

#### **Frontend Not Loading**
- Check environment variables
- Verify API URL is correct
- Check browser console for errors

#### **Backend API Errors**
- Check database connection
- Verify environment variables
- Check logs for specific errors

#### **Database Connection Issues**
- Verify connection string
- Check if database service is running
- Ensure proper authentication

### **Debug Commands**

```bash
# Check service status
docker-compose ps

# View logs
docker-compose logs -f [service-name]

# Test API endpoints
curl -X GET https://your-api-url.com/health
curl -X GET https://your-api-url.com/api/health

# Check environment variables
vercel env ls
railway variables
```

## 📈 Scaling Considerations

### **Traffic Scaling**
- Use CDN for static assets
- Implement caching strategies
- Set up load balancing

### **Database Scaling**
- Use database clustering
- Implement read replicas
- Set up connection pooling

### **Cost Optimization**
- Use free tiers efficiently
- Monitor resource usage
- Implement auto-scaling

## 🎉 Post-Deployment

### **Testing Checklist**
- [ ] Frontend loads correctly
- [ ] Backend API responds
- [ ] Database connections work
- [ ] Authentication flows work
- [ ] File uploads work
- [ ] All pages are accessible

### **User Acceptance Testing**
- [ ] Test user registration
- [ ] Test user login
- [ ] Test health record upload
- [ ] Test insurance claim submission
- [ ] Test on mobile devices

### **Go Live Checklist**
- [ ] Domain is configured
- [ ] SSL certificates are active
- [ ] Monitoring is set up
- [ ] Backups are configured
- [ ] Team has access to admin panels

## 🆘 Support

If you encounter issues during deployment:

1. **Check the logs** for specific error messages
2. **Verify environment variables** are set correctly
3. **Test locally** to ensure the app works
4. **Check service status** on your hosting platform
5. **Review documentation** for your hosting provider

## 📞 Getting Help

- **Vercel Support**: https://vercel.com/support
- **Railway Support**: https://railway.app/support
- **Docker Documentation**: https://docs.docker.com/
- **Project Issues**: Create an issue in the GitHub repository

---

**🎉 Congratulations! Your HealthWallet application is now live and accessible to users worldwide!**
