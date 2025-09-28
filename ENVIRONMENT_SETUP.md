# Environment Setup for Firebase Authentication

## Required Environment Variables

### Frontend (.env.local)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://health-j0gvmolnu-adityamishra28203s-projects.vercel.app

# Firebase Configuration (Already provided by user)
NEXT_PUBLIC_FIREBASE_API_KEY=AIzaSyDwLaFs-yhOf4sDxbVugB51DVCg3s0bddI
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=healthify-31b19.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=healthify-31b19
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=healthify-31b19.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=187067589929
NEXT_PUBLIC_FIREBASE_APP_ID=1:187067589929:web:f198185edd20078d7d4338
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=G-40S6DL1DNW

# Development Configuration
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### Backend Environment Variables (Optional - for additional features)
```bash
# JWT Configuration (if using custom backend auth)
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key
```

## Setup Instructions

### 1. Firebase Authentication Setup (Already Done)
✅ **Firebase project is already configured with:**
- Project ID: `healthify-31b19`
- Authentication enabled
- Phone authentication enabled
- Email/Password authentication enabled

### 2. Enable Firebase Authentication Methods
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `healthify-31b19`
3. Go to Authentication → Sign-in method
4. Enable the following methods:
   - ✅ **Email/Password** (Already enabled)
   - ✅ **Phone** (Already enabled)
   - ✅ **Google** (Optional - for Firebase Google auth)

### 3. Configure Phone Authentication
1. In Firebase Console → Authentication → Sign-in method
2. Click on "Phone" provider
3. Enable phone authentication
4. Add your domain to authorized domains:
   - `localhost` (for development)
   - `yourdomain.com` (for production)

## Testing Firebase Authentication

### Email/Password Authentication
1. Test at: `http://localhost:3000/auth/firebase-login`
2. Use email/password or create new account
3. Firebase handles all authentication

### Mobile OTP Authentication
1. Test at: `http://localhost:3000/auth/multi-factor`
2. Select "Phone" tab
3. Enter phone number with country code (e.g., +919876543210)
4. Firebase will send real SMS OTP

### Email Verification
1. Test at: `http://localhost:3000/auth/multi-factor`
2. Select "Email" tab
3. Enter email address
4. Firebase will send verification email

## Current Working Authentication Methods

1. **🔐 Traditional Login/Register** - Email/Password
2. **🔥 Firebase Authentication** - Complete Firebase integration
3. **📱 Firebase Phone OTP** - Real SMS via Firebase
4. **📧 Firebase Email Verification** - Real email via Firebase

## No Additional Setup Required

✅ **Your Firebase configuration is already complete!**
- All authentication methods use Firebase
- No external services (Twilio, SendGrid) needed
- Firebase handles SMS and email automatically
