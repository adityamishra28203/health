#!/bin/bash

# HealthWallet Git Setup Script
# This script helps set up Git and push to GitHub

echo "🚀 HealthWallet Git Setup Script"
echo "================================="

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Please run this script from the blockchain-health-wallet directory"
    exit 1
fi

echo "✅ Found project directory"

# Check if Git is available
if ! command -v git &> /dev/null; then
    echo "❌ Git is not installed. Please install Git first."
    exit 1
fi

echo "✅ Git is available"

# Initialize Git repository
echo "🔧 Initializing Git repository..."
git init

# Add all files
echo "📁 Adding files to Git..."
git add .

# Create initial commit
echo "💾 Creating initial commit..."
git commit -m "Initial commit: HealthWallet blockchain health records platform

Features:
- Complete Next.js frontend with TypeScript
- NestJS backend API with MongoDB
- React Native mobile app
- Docker containerization
- Kubernetes deployment configs
- Comprehensive documentation
- HIPAA/DISHA compliance
- Blockchain integration with IPFS
- Insurance claims management
- Real-time notifications
- Analytics dashboard"

# Add remote repository
echo "🔗 Adding remote repository..."
git remote add origin https://github.com/adityamishra28203/health.git

# Set main branch
echo "🌿 Setting main branch..."
git branch -M main

echo ""
echo "🎉 Git repository setup complete!"
echo "================================"
echo ""
echo "Next steps:"
echo "1. Push to GitHub: git push -u origin main"
echo "2. If prompted for credentials:"
echo "   - Username: adityamishra28203"
echo "   - Password: Use a Personal Access Token (not your GitHub password)"
echo ""
echo "To create a Personal Access Token:"
echo "1. Go to GitHub → Settings → Developer settings → Personal access tokens"
echo "2. Generate new token with 'repo' permissions"
echo "3. Use the token as your password"
echo ""
echo "Repository URL: https://github.com/adityamishra28203/health"











