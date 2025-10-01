#!/bin/bash

# HealthWallet Production Deployment Script
# This script helps deploy the HealthWallet application to production

echo "🚀 HealthWallet Production Deployment Script"
echo "============================================="

# Check if Docker is running
if ! docker info > /dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker first."
    exit 1
fi

# Check if docker-compose is available
if ! command -v docker-compose &> /dev/null; then
    echo "❌ docker-compose is not installed. Please install it first."
    exit 1
fi

echo "✅ Docker is running"

# Create production environment file if it doesn't exist
if [ ! -f .env.prod ]; then
    echo "📝 Creating production environment file..."
    cat > .env.prod << EOF
# Production Environment Variables
MONGODB_URI=mongodb://mongodb:27017/healthwallet
REDIS_URL=redis://redis:6379
JWT_SECRET=$(openssl rand -base64 32)
JWT_EXPIRES_IN=7d
ETHEREUM_RPC_URL=https://mainnet.infura.io/v3/your-project-id
IPFS_URL=https://ipfs.infura.io:5001
PORT=3001
NODE_ENV=production
EOF
    echo "✅ Created .env.prod file"
fi

# Build and start services
echo "🔨 Building and starting services..."
docker-compose -f docker-compose.prod.yml down
docker-compose -f docker-compose.prod.yml build --no-cache
docker-compose -f docker-compose.prod.yml up -d

# Wait for services to be ready
echo "⏳ Waiting for services to be ready..."
sleep 30

# Check if services are running
echo "🔍 Checking service status..."
docker-compose -f docker-compose.prod.yml ps

# Test endpoints
echo "🧪 Testing endpoints..."
if curl -f http://localhost/api/health > /dev/null 2>&1; then
    echo "✅ Backend API is responding"
else
    echo "❌ Backend API is not responding"
fi

if curl -f http://localhost > /dev/null 2>&1; then
    echo "✅ Frontend is responding"
else
    echo "❌ Frontend is not responding"
fi

echo ""
echo "🎉 Deployment completed!"
echo "========================="
echo "Frontend: http://localhost"
echo "Backend API: http://localhost/api"
echo "API Documentation: http://localhost/api/docs"
echo ""
echo "To view logs: docker-compose -f docker-compose.prod.yml logs -f"
echo "To stop services: docker-compose -f docker-compose.prod.yml down"
echo ""
echo "⚠️  Remember to:"
echo "1. Set up SSL certificates for HTTPS"
echo "2. Configure your domain name"
echo "3. Set up monitoring and backups"
echo "4. Update environment variables with production values"





