# Environment Setup for Real Authentication Services

## Required Environment Variables

### Frontend (.env.local)
```bash
# API Configuration
NEXT_PUBLIC_API_URL=https://health-j0gvmolnu-adityamishra28203s-projects.vercel.app

# Google OAuth Configuration
NEXT_PUBLIC_GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com

# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
NEXT_PUBLIC_FIREBASE_APP_ID=your-app-id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your-measurement-id

# Development Configuration
NEXT_PUBLIC_USE_MOCK_DATA=false
```

### Backend Environment Variables
```bash
# SMS Service Configuration (Twilio)
TWILIO_ACCOUNT_SID=your-twilio-account-sid
TWILIO_AUTH_TOKEN=your-twilio-auth-token
TWILIO_PHONE_NUMBER=your-twilio-phone-number

# Email Service Configuration (SendGrid)
SENDGRID_API_KEY=your-sendgrid-api-key
SENDGRID_FROM_EMAIL=noreply@yourdomain.com

# Google OAuth Configuration
GOOGLE_CLIENT_ID=your-google-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your-google-client-secret

# JWT Configuration
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-jwt-refresh-secret-key
```

## Setup Instructions

### 1. Google OAuth Setup
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable Google+ API
4. Go to Credentials → Create Credentials → OAuth 2.0 Client ID
5. Set authorized redirect URIs:
   - `http://localhost:3000/auth/google/callback`
   - `https://yourdomain.com/auth/google/callback`
6. Copy Client ID and Secret

### 2. Twilio SMS Setup
1. Sign up at [Twilio](https://www.twilio.com/)
2. Get Account SID and Auth Token from Console
3. Purchase a phone number for SMS
4. Add credentials to backend environment

### 3. SendGrid Email Setup
1. Sign up at [SendGrid](https://sendgrid.com/)
2. Create API Key with Mail Send permissions
3. Verify sender email address
4. Add credentials to backend environment

### 4. Firebase Setup
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create new project
3. Enable Authentication → Sign-in methods
4. Enable Google, Email/Password, Phone
5. Copy configuration to frontend environment

## Testing Real Services

### Google OAuth Test
1. Set `NEXT_PUBLIC_GOOGLE_CLIENT_ID` in frontend
2. Set `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET` in backend
3. Test at: `http://localhost:3000/auth/google`

### Mobile OTP Test
1. Set Twilio credentials in backend
2. Test at: `http://localhost:3000/auth/multi-factor`
3. Enter real phone number with country code

### Email OTP Test
1. Set SendGrid credentials in backend
2. Test at: `http://localhost:3000/auth/multi-factor`
3. Enter real email address

## Fallback to Mock Data

If you want to test without real services, set:
```bash
NEXT_PUBLIC_USE_MOCK_DATA=true
```

This will use mock implementations for all authentication methods.
