# 🟣 Heroku Deployment Guide for HealthWallet Backend

Heroku is a reliable platform with excellent Node.js support.

## 🚀 Deploy to Heroku

### **Step 1: Install Heroku CLI**

```bash
# macOS
brew install heroku/brew/heroku

# Or download from https://devcenter.heroku.com/articles/heroku-cli
```

### **Step 2: Login to Heroku**

```bash
heroku login
```

### **Step 3: Create Heroku App**

```bash
cd /Users/aditya_mac/blockchain-health-wallet/backend
heroku create healthwallet-backend
```

### **Step 4: Add Database Services**

```bash
# Add MongoDB Atlas (free tier)
heroku addons:create mongolab:sandbox

# Add Redis (free tier)
heroku addons:create heroku-redis:mini
```

### **Step 5: Set Environment Variables**

```bash
heroku config:set NODE_ENV=production
heroku config:set JWT_SECRET=your-super-secret-jwt-key-change-this
heroku config:set JWT_EXPIRES_IN=7d
heroku config:set CORS_ORIGIN=https://your-frontend-domain.vercel.app
```

### **Step 6: Create Procfile**

Create `backend/Procfile`:
```
web: npm run start:prod
```

### **Step 7: Deploy**

```bash
git add .
git commit -m "Add Heroku deployment configuration"
git push heroku main
```

## ✅ **Advantages of Heroku**

- ✅ **Very reliable** and stable
- ✅ **Excellent Node.js support**
- ✅ **Easy database add-ons**
- ✅ **Great logging** and monitoring
- ✅ **Free tier** available
- ✅ **Automatic deployments** from GitHub

## 🔗 **Your Backend URL**

`https://healthwallet-backend.herokuapp.com`

---

**Heroku is the most reliable option! 🟣✨**
