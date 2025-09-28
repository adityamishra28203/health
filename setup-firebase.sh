#!/bin/bash

echo "🔥 Setting up Firebase for HealthWallet..."

# Create frontend .env.local
echo "📝 Creating frontend environment file..."
cat > frontend/.env.local << EOF
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDwLaFs-yhOf4sDxbVugB51DVCg3s0bddI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=healthify-31b19.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=healthify-31b19
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=healthify-31b19.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=187067589929
NEXT_PUBLIC_FIREBASE_APP_ID=1:187067589929:web:f198185edd20078d7d4338
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-40S6DL1DNW

# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_IPFS_URL=https://ipfs.infura.io:5001
NEXT_PUBLIC_BLOCKCHAIN_URL=https://mainnet.infura.io/v3/your-project-id
EOF

# Create backend .env template
echo "📝 Creating backend environment template..."
cat > backend/.env.example << EOF
# Firebase Admin Configuration
FIREBASE_PROJECT_ID=healthify-31b19
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@healthify-31b19.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=187067589929

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# Other configurations
NODE_ENV=development
PORT=3001
EOF

echo "✅ Environment files created!"
echo ""
echo "🔧 Next steps:"
echo "1. Go to Firebase Console: https://console.firebase.google.com/project/healthify-31b19"
echo "2. Enable Authentication (Email/Password, Google, Phone)"
echo "3. Create Firestore Database (test mode)"
echo "4. Enable Storage (test mode)"
echo "5. Generate Service Account Key for backend"
echo "6. Copy backend/.env.example to backend/.env and fill in the values"
echo ""
echo "📚 See FIREBASE_CONFIG.md for detailed instructions"
echo ""
echo "🚀 Ready to test Firebase integration!"
