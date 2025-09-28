#!/bin/bash

echo "🔥 Setting up Firebase Service Account for HealthWallet..."

# Create backend config directory if it doesn't exist
mkdir -p backend/config

# Create .env file for backend
echo "📝 Creating backend environment file..."
cat > backend/.env << EOF
# Firebase Admin Configuration
FIREBASE_PROJECT_ID=healthify-31b19
FIREBASE_SERVICE_ACCOUNT_PATH=./config/serviceAccountKey.json

# JWT Configuration
JWT_SECRET=healthwallet_jwt_secret_$(date +%s)
JWT_EXPIRES_IN=24h

# Other configurations
NODE_ENV=development
PORT=3001
EOF

echo "✅ Backend environment file created!"
echo ""
echo "🔧 Next steps:"
echo "1. Download your Firebase service account key from:"
echo "   https://console.firebase.google.com/project/healthify-31b19/settings/serviceaccounts/adminsdk"
echo "2. Save it as: backend/config/serviceAccountKey.json"
echo "3. Test the connection:"
echo "   cd backend && npm run start:dev"
echo ""
echo "📚 See FIREBASE_SERVICE_ACCOUNT_SETUP.md for detailed instructions"
echo ""
echo "🚀 Ready to configure Firebase Admin SDK!"
