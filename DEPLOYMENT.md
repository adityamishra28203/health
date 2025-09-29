# Deployment Guide

This guide covers deploying SecureHealth to various platforms.

## 🚀 Vercel Deployment (Recommended)

### Prerequisites
- GitHub repository with the code
- Vercel account
- Backend API deployed separately

### Steps

1. **Connect Repository to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Select the `frontend` folder as the root directory

2. **Configure Environment Variables**
   In Vercel dashboard, go to Settings → Environment Variables:
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-api.com
   NEXT_PUBLIC_IPFS_URL=https://ipfs.infura.io:5001
   NEXT_PUBLIC_BLOCKCHAIN_URL=https://mainnet.infura.io/v3/your-project-id
   NEXT_PUBLIC_USE_MOCK_DATA=false
   ```

3. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your application

### Custom Domain
- Go to Settings → Domains
- Add your custom domain
- Configure DNS records as instructed

## 🌐 Netlify Deployment

### Prerequisites
- GitHub repository
- Netlify account

### Steps

1. **Build Settings**
   ```
   Build command: cd frontend && npm run build
   Publish directory: frontend/out
   ```

2. **Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-api.com
   NEXT_PUBLIC_IPFS_URL=https://ipfs.infura.io:5001
   NEXT_PUBLIC_BLOCKCHAIN_URL=https://mainnet.infura.io/v3/your-project-id
   NEXT_PUBLIC_USE_MOCK_DATA=false
   ```

3. **Deploy**
   - Connect repository to Netlify
   - Configure build settings
   - Deploy

## 🐳 Docker Deployment

### Frontend Dockerfile

```dockerfile
FROM node:18-alpine AS base

# Install dependencies only when needed
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm ci

# Rebuild the source code only when needed
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# Production image, copy all the files and run next
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

COPY --from=builder /app/public ./public

# Set the correct permission for prerender cache
RUN mkdir .next
RUN chown nextjs:nodejs .next

# Automatically leverage output traces to reduce image size
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]
```

### Docker Compose

```yaml
version: '3.8'
services:
  frontend:
    build: 
      context: ./frontend
      dockerfile: Dockerfile
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://backend:3003
      - NEXT_PUBLIC_IPFS_URL=https://ipfs.infura.io:5001
      - NEXT_PUBLIC_BLOCKCHAIN_URL=https://mainnet.infura.io/v3/your-project-id
      - NEXT_PUBLIC_USE_MOCK_DATA=false
    depends_on:
      - backend

  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    ports:
      - "3003:3003"
    environment:
      - PORT=3003
      - MONGODB_URI=mongodb://mongo:27017/securehealth
      - JWT_SECRET=your-super-secret-jwt-key
    depends_on:
      - mongo

  mongo:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
```

## ☁️ AWS Deployment

### Using AWS Amplify

1. **Connect Repository**
   - Go to AWS Amplify Console
   - Connect your GitHub repository
   - Select the `frontend` folder

2. **Build Settings**
   ```yaml
   version: 1
   frontend:
     phases:
       preBuild:
         commands:
           - cd frontend
           - npm install
       build:
         commands:
           - npm run build
     artifacts:
       baseDirectory: frontend/out
       files:
         - '**/*'
     cache:
       paths:
         - frontend/node_modules/**/*
         - frontend/.next/cache/**/*
   ```

3. **Environment Variables**
   ```
   NEXT_PUBLIC_API_URL=https://your-backend-api.com
   NEXT_PUBLIC_IPFS_URL=https://ipfs.infura.io:5001
   NEXT_PUBLIC_BLOCKCHAIN_URL=https://mainnet.infura.io/v3/your-project-id
   NEXT_PUBLIC_USE_MOCK_DATA=false
   ```

### Using AWS EC2

1. **Launch EC2 Instance**
   - Choose Ubuntu 20.04 LTS
   - Configure security groups (ports 3000, 22, 80, 443)

2. **Install Dependencies**
   ```bash
   sudo apt update
   sudo apt install nodejs npm nginx
   ```

3. **Deploy Application**
   ```bash
   git clone <your-repo>
   cd blockchain-health-wallet/frontend
   npm install
   npm run build
   npm start
   ```

4. **Configure Nginx**
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;

       location / {
           proxy_pass http://localhost:3000;
           proxy_http_version 1.1;
           proxy_set_header Upgrade $http_upgrade;
           proxy_set_header Connection 'upgrade';
           proxy_set_header Host $host;
           proxy_cache_bypass $http_upgrade;
       }
   }
   ```

## 🔧 Environment Configuration

### Production Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://api.yourdomain.com

# IPFS Configuration
NEXT_PUBLIC_IPFS_URL=https://ipfs.infura.io:5001

# Blockchain Configuration
NEXT_PUBLIC_BLOCKCHAIN_URL=https://mainnet.infura.io/v3/your-project-id

# Feature Flags
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### Backend Environment Variables

```bash
# Server Configuration
PORT=3003
NODE_ENV=production

# Database
MONGODB_URI=mongodb://localhost:27017/securehealth

# Security
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# External Services
IPFS_URL=https://ipfs.infura.io:5001
BLOCKCHAIN_URL=https://mainnet.infura.io/v3/your-project-id
```

## 🔒 Security Considerations

### SSL/TLS
- Always use HTTPS in production
- Configure proper SSL certificates
- Use HSTS headers

### Environment Variables
- Never commit sensitive data to version control
- Use secure environment variable management
- Rotate secrets regularly

### Database Security
- Use strong passwords
- Enable authentication
- Configure firewall rules
- Regular backups

### API Security
- Rate limiting
- CORS configuration
- Input validation
- Error handling

## 📊 Monitoring and Logging

### Application Monitoring
- Set up error tracking (Sentry, LogRocket)
- Configure performance monitoring
- Set up uptime monitoring

### Logging
- Structured logging
- Log aggregation
- Log retention policies

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   - Check Node.js version compatibility
   - Verify all dependencies are installed
   - Check for TypeScript errors

2. **Runtime Errors**
   - Verify environment variables
   - Check API connectivity
   - Review browser console for errors

3. **Performance Issues**
   - Optimize images and assets
   - Enable caching
   - Monitor bundle size

### Support
- Check application logs
- Review deployment logs
- Contact development team

## 📈 Performance Optimization

### Frontend Optimizations
- Enable Next.js optimizations
- Implement proper caching
- Optimize images and assets
- Use CDN for static assets

### Backend Optimizations
- Database indexing
- Query optimization
- Caching strategies
- Load balancing

---

**For additional support, please refer to the main README.md or create an issue in the repository.**