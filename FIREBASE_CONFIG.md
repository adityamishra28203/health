# 🔥 Firebase Configuration for HealthWallet

## **Your Firebase Project Details:**
- **Project ID:** healthify-31b19
- **Project Name:** Healthify
- **Auth Domain:** healthify-31b19.firebaseapp.com

## **Environment Variables Setup:**

### **Frontend (.env.local)**
```bash
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
```

### **Backend (.env)**
```bash
# Firebase Admin Configuration
FIREBASE_PROJECT_ID=healthify-31b19
FIREBASE_PRIVATE_KEY_ID=your_private_key_id
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
FIREBASE_CLIENT_EMAIL=firebase-adminsdk-xyz@healthify-31b19.iam.gserviceaccount.com
FIREBASE_CLIENT_ID=187067589929

# Existing variables
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=24h
```

## **Next Steps:**

### **1. Enable Authentication Methods**
Go to [Firebase Console](https://console.firebase.google.com/project/healthify-31b19/authentication/providers) and enable:

- ✅ **Email/Password**
- ✅ **Google** 
- ✅ **Phone** (for OTP)

### **2. Create Firestore Database**
- Go to [Firestore Database](https://console.firebase.google.com/project/healthify-31b19/firestore)
- Click **"Create database"**
- Choose **"Start in test mode"**

### **3. Enable Storage**
- Go to [Storage](https://console.firebase.google.com/project/healthify-31b19/storage)
- Click **"Get started"**
- Choose **"Start in test mode"**

### **4. Generate Service Account Key**
- Go to [Project Settings](https://console.firebase.google.com/project/healthify-31b19/settings/serviceaccounts/adminsdk)
- Click **"Generate new private key"**
- Download the JSON file
- Extract the values for backend .env

### **5. Configure Security Rules**

#### **Firestore Rules:**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /healthRecords/{recordId} {
      allow read, write: if request.auth != null && 
        (resource.data.patientId == request.auth.uid || 
         request.auth.token.role in ['doctor', 'hospital_admin', 'system_admin']);
    }
    
    match /insuranceClaims/{claimId} {
      allow read, write: if request.auth != null && 
        (resource.data.patientId == request.auth.uid || 
         request.auth.token.role in ['insurer', 'system_admin']);
    }
    
    match /hospitals/{hospitalId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.role in ['hospital_admin', 'system_admin'];
    }
  }
}
```

#### **Storage Rules:**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    match /health-records/{patientId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == patientId || 
         request.auth.token.role in ['doctor', 'hospital_admin', 'system_admin']);
    }
  }
}
```

## **Ready to Test!**

Once you've completed the setup:

1. **Test Frontend:** Visit `/auth/firebase-login`
2. **Test Backend:** API endpoints will use Firebase
3. **Verify Data:** Check Firebase Console for data

Your Firebase project is ready! 🚀
