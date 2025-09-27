# HealthWallet Setup Guide

This guide provides step-by-step instructions to set up the HealthWallet application from scratch.

## 🎯 Prerequisites

### Required Software

1. **Node.js** (v18 or higher)
   ```bash
   # Check version
   node --version
   
   # If not installed, download from https://nodejs.org/
   ```

2. **npm** (comes with Node.js)
   ```bash
   # Check version
   npm --version
   ```

3. **Docker** and **Docker Compose**
   ```bash
   # Check if Docker is installed
   docker --version
   docker-compose --version
   
   # If not installed, download from https://www.docker.com/
   ```

4. **Git**
   ```bash
   # Check if Git is installed
   git --version
   
   # If not installed, download from https://git-scm.com/
   ```

### System Requirements

- **RAM**: Minimum 8GB (16GB recommended)
- **Storage**: At least 10GB free space
- **OS**: Windows 10+, macOS 10.15+, or Linux (Ubuntu 18.04+)

## 🚀 Quick Setup (Docker - Recommended)

### Step 1: Clone the Repository

```bash
git clone <repository-url>
cd blockchain-health-wallet
```

### Step 2: Create Environment Files

Create the following environment files:

#### Backend Environment
```bash
# Create backend/.env file
cat > backend/.env << EOF
MONGODB_URI=mongodb://mongodb:27017/healthwallet
REDIS_URL=redis://redis:6379
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
ETHEREUM_RPC_URL=http://ganache:8545
IPFS_URL=http://ipfs:5001
PORT=3001
NODE_ENV=development
EOF
```

#### Frontend Environment
```bash
# Create frontend/.env.local file
cat > frontend/.env.local << EOF
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_IPFS_URL=http://localhost:5001
NEXT_PUBLIC_BLOCKCHAIN_URL=http://localhost:8545
EOF
```

### Step 3: Start All Services

```bash
# Start all services with Docker Compose
docker-compose up -d

# Check if all services are running
docker-compose ps
```

### Step 4: Verify Installation

1. **Frontend**: Open http://localhost:3000
2. **Backend API**: Open http://localhost:3001
3. **API Documentation**: Open http://localhost:3001/api/docs

## 🔧 Manual Development Setup

If you prefer to run services individually for development:

### Step 1: Start Infrastructure Services

```bash
# Start MongoDB
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Start Redis
docker run -d -p 6379:6379 --name redis redis:latest

# Start IPFS
docker run -d -p 5001:5001 --name ipfs ipfs/go-ipfs:latest

# Start Ganache (Ethereum testnet)
docker run -d -p 8545:8545 --name ganache trufflesuite/ganache-cli:latest
```

### Step 2: Setup Backend

```bash
cd backend

# Install dependencies
npm install

# Create environment file
cp .env.example .env
# Edit .env with your configuration

# Start development server
npm run start:dev
```

### Step 3: Setup Frontend

```bash
cd frontend

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local
# Edit .env.local with your configuration

# Start development server
npm run dev
```

### Step 4: Setup Mobile (Optional)

```bash
cd mobile

# Install dependencies
npm install

# Install Expo CLI globally
npm install -g @expo/cli

# Start development server
npm start
```

## 🐛 Troubleshooting

### Common Issues

#### 1. Port Already in Use
```bash
# Find process using port
lsof -i :3000
lsof -i :3001

# Kill process
kill -9 <PID>
```

#### 2. Docker Issues
```bash
# Restart Docker
sudo systemctl restart docker  # Linux
# or restart Docker Desktop on macOS/Windows

# Clean up Docker
docker system prune -a
```

#### 3. Node Modules Issues
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

#### 4. MongoDB Connection Issues
```bash
# Check if MongoDB is running
docker ps | grep mongo

# Check MongoDB logs
docker logs mongodb
```

#### 5. Frontend Build Issues
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Environment Variables Issues

Make sure all required environment variables are set:

#### Backend Required Variables
- `MONGODB_URI`
- `REDIS_URL`
- `JWT_SECRET`
- `PORT`

#### Frontend Required Variables
- `NEXT_PUBLIC_API_URL`

## 🔍 Verification Steps

### 1. Check All Services

```bash
# Check Docker containers
docker-compose ps

# Expected output:
# Name                    Command               State           Ports
# -------------------------------------------------------------------------------
# backend                 npm run start:dev     Up      0.0.0.0:3001->3001/tcp
# frontend                npm run dev           Up      0.0.0.0:3000->3000/tcp
# mongodb                 docker-entrypoint.sh  Up      0.0.0.0:27017->27017/tcp
# redis                   docker-entrypoint.sh  Up      0.0.0.0:6379->6379/tcp
# ipfs                    /sbin/tini -- /usr/   Up      0.0.0.0:5001->5001/tcp
# ganache                 docker-entrypoint.sh  Up      0.0.0.0:8545->8545/tcp
# nginx                   /docker-entrypoint.sh Up      0.0.0.0:80->80/tcp
```

### 2. Test API Endpoints

```bash
# Test health endpoint
curl http://localhost:3001/health

# Test API documentation
curl http://localhost:3001/api/docs
```

### 3. Test Frontend

1. Open http://localhost:3000 in your browser
2. You should see the HealthWallet homepage
3. Check browser console for any errors

### 4. Test Database Connection

```bash
# Connect to MongoDB
docker exec -it mongodb mongo

# In MongoDB shell:
use healthwallet
db.users.find()
```

## 📚 Next Steps

After successful setup:

1. **Read the API Documentation**: http://localhost:3001/api/docs
2. **Explore the Frontend**: http://localhost:3000
3. **Check the Mobile App**: Run `cd mobile && npm start`
4. **Review the Code**: Start with `frontend/src/app/page.tsx`
5. **Set up Development Tools**: Install VS Code extensions for React, TypeScript, and Docker

## 🆘 Getting Help

If you encounter issues:

1. **Check the logs**:
   ```bash
   docker-compose logs -f [service-name]
   ```

2. **Restart services**:
   ```bash
   docker-compose restart [service-name]
   ```

3. **Check GitHub Issues**: Look for similar issues in the repository

4. **Create a new issue**: Provide detailed error messages and steps to reproduce

## 🎉 Success!

If you can access:
- ✅ Frontend at http://localhost:3000
- ✅ Backend API at http://localhost:3001
- ✅ API docs at http://localhost:3001/api/docs

Then you've successfully set up HealthWallet! 🚀
