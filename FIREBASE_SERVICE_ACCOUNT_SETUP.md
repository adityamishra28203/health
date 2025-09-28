# 🔥 Firebase Service Account Setup Guide

## **Step 1: Download Service Account Key**

1. Go to [Firebase Console](https://console.firebase.google.com/project/healthify-31b19/settings/serviceaccounts/adminsdk)
2. Click **"Generate new private key"**
3. Download the JSON file
4. Rename it to `serviceAccountKey.json`

## **Step 2: Place the Key File**

Copy your downloaded service account key to:
```
backend/config/serviceAccountKey.json
```

## **Step 3: Update Environment Variables**

Create `backend/.env` with:
```bash
# Firebase Admin Configuration
FIREBASE_PROJECT_ID=healthify-31b19
FIREBASE_SERVICE_ACCOUNT_PATH=./config/serviceAccountKey.json

# JWT Configuration
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRES_IN=24h

# Other configurations
NODE_ENV=development
PORT=3001
```

## **Step 4: Test Firebase Connection**

```bash
cd backend
npm run start:dev
```

You should see:
```
✅ Firebase Admin SDK initialized successfully
```

## **Alternative: Environment Variables Method**

If you prefer not to use a file, you can set these environment variables:

```bash
FIREBASE_PROJECT_ID=healthify-31b19
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@healthify-31b19.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=187067589929
```

## **Security Notes**

- ✅ Never commit `serviceAccountKey.json` to git
- ✅ Add `backend/config/serviceAccountKey.json` to `.gitignore`
- ✅ Use environment variables in production
- ✅ Rotate keys regularly

## **File Structure**
```
backend/
├── config/
│   └── serviceAccountKey.json  # Your Firebase service account key
├── .env                        # Environment variables
└── src/
    └── common/
        └── firebase-admin.service.ts
```

## **Ready to Test!**

Once you've placed your service account key, your Firebase Admin SDK will be ready to use! 🚀
