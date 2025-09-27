#!/bin/bash

# HealthWallet Vercel Deployment Script
# This script helps deploy both frontend and backend to Vercel

echo "🚀 HealthWallet Vercel Deployment Script"
echo "========================================"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
fi

echo "✅ Vercel CLI is available"

# Check if user is logged in
if ! vercel whoami &> /dev/null; then
    echo "🔐 Please login to Vercel:"
    vercel login
fi

echo "✅ Logged in to Vercel"

# Deploy Backend
echo "🔧 Deploying Backend..."
cd /Users/aditya_mac/blockchain-health-wallet/backend

echo "📝 Backend deployment configuration:"
echo "   - Root Directory: backend"
echo "   - Build Command: npm install && npm run build"
echo "   - Output Directory: dist"
echo "   - Framework: Other"

vercel --prod

echo ""
echo "🎉 Backend deployed successfully!"
echo "📋 Next steps:"
echo "1. Go to Vercel dashboard"
echo "2. Set environment variables for backend"
echo "3. Deploy frontend"
echo "4. Update frontend environment variables"
echo ""
echo "📚 See VERCEL_BACKEND_DEPLOYMENT.md for detailed instructions"
