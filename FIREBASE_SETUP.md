# 🔥 Firebase Setup Guide for HealthWallet

## **Why Firebase?**

Firebase provides a complete backend solution that replaces:
- ✅ **MongoDB** → **Firestore** (Real-time NoSQL database)
- ✅ **Custom Authentication** → **Firebase Auth** (20+ providers)
- ✅ **IPFS** → **Firebase Storage** (File storage with CDN)
- ✅ **Twilio/SendGrid** → **Firebase Auth** (Built-in OTP)
- ✅ **Custom APIs** → **Firebase Functions** (Serverless functions)

## **Benefits of Firebase Migration:**

### **🚀 Performance & Scalability**
- **Real-time synchronization** - Changes update instantly
- **Offline support** - Works without internet
- **Automatic scaling** - Handles millions of users
- **Global CDN** - Fast file delivery worldwide

### **🔐 Security & Authentication**
- **20+ authentication providers** (Google, Facebook, Apple, etc.)
- **Built-in OTP** for phone/email verification
- **Security rules** at database level
- **Automatic token management**

### **💰 Cost-Effective**
- **Free tier** includes 1GB storage, 50K reads/day
- **Pay only for what you use**
- **No server maintenance costs**
- **Automatic backups**

## **Setup Instructions**

### **1. Create Firebase Project**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project"
3. Enter project name: `healthwallet`
4. Enable Google Analytics (optional)
5. Click "Create project"

### **2. Enable Authentication**

1. In Firebase Console, go to **Authentication**
2. Click **Get Started**
3. Go to **Sign-in method** tab
4. Enable the following providers:
   - ✅ **Email/Password**
   - ✅ **Google**
   - ✅ **Phone** (for OTP)

### **3. Create Firestore Database**

1. Go to **Firestore Database**
2. Click **Create database**
3. Choose **Start in test mode** (we'll add security rules later)
4. Select a location (choose closest to your users)

### **4. Enable Storage**

1. Go to **Storage**
2. Click **Get started**
3. Choose **Start in test mode**
4. Select same location as Firestore

### **5. Get Firebase Configuration**

1. Go to **Project Settings** (gear icon)
2. Scroll down to **Your apps**
3. Click **Web app** icon (`</>`)
4. Register app name: `healthwallet-web`
5. Copy the configuration object

### **6. Add Environment Variables**

Create `.env.local` in your frontend directory:

```bash
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=healthwallet.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=healthwallet
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=healthwallet.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=your_measurement_id
```

### **7. Install Firebase SDK**

```bash
cd frontend
npm install firebase
```

### **8. Configure Security Rules**

#### **Firestore Security Rules:**

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Health records - patients can read/write their own
    match /healthRecords/{recordId} {
      allow read, write: if request.auth != null && 
        (resource.data.patientId == request.auth.uid || 
         request.auth.token.role in ['doctor', 'hospital_admin', 'system_admin']);
    }
    
    // Insurance claims - patients can read/write their own
    match /insuranceClaims/{claimId} {
      allow read, write: if request.auth != null && 
        (resource.data.patientId == request.auth.uid || 
         request.auth.token.role in ['insurer', 'system_admin']);
    }
    
    // Hospitals - public read, admin write
    match /hospitals/{hospitalId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.role in ['hospital_admin', 'system_admin'];
    }
    
    // Insurance providers - public read, admin write
    match /insuranceProviders/{providerId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        request.auth.token.role in ['insurer', 'system_admin'];
    }
  }
}
```

#### **Storage Security Rules:**

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    // Users can upload to their own folders
    match /users/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Health record documents
    match /health-records/{patientId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == patientId || 
         request.auth.token.role in ['doctor', 'hospital_admin', 'system_admin']);
    }
    
    // Insurance claim documents
    match /insurance-claims/{patientId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        (request.auth.uid == patientId || 
         request.auth.token.role in ['insurer', 'system_admin']);
    }
  }
}
```

## **Migration Benefits**

### **🔄 Real-time Features**
- **Live updates** - Health records update instantly across devices
- **Collaborative editing** - Multiple doctors can work on same record
- **Offline sync** - Works without internet, syncs when connected

### **📱 Mobile-First**
- **Progressive Web App** support
- **Push notifications** for health alerts
- **Offline access** to critical health data

### **🔒 Enhanced Security**
- **End-to-end encryption** for sensitive data
- **Role-based access control**
- **Audit logs** for all data access
- **HIPAA compliance** ready

### **📊 Analytics & Monitoring**
- **User behavior analytics**
- **Performance monitoring**
- **Error tracking**
- **Custom metrics**

## **Next Steps**

1. **Set up Firebase project** (follow steps above)
2. **Configure security rules** (copy rules above)
3. **Test authentication** (use Firebase pages)
4. **Migrate existing data** (if any)
5. **Deploy to production**

## **Cost Estimation**

### **Free Tier (Perfect for MVP):**
- **Firestore**: 1GB storage, 50K reads/day
- **Storage**: 1GB storage, 10GB downloads/month
- **Authentication**: Unlimited users
- **Functions**: 125K invocations/month

### **Production Costs (10K users):**
- **Firestore**: ~$25/month
- **Storage**: ~$10/month
- **Authentication**: Free
- **Functions**: ~$5/month
- **Total**: ~$40/month

## **Support**

- 📚 [Firebase Documentation](https://firebase.google.com/docs)
- 🎥 [Firebase YouTube Channel](https://www.youtube.com/user/Firebase)
- 💬 [Firebase Community](https://firebase.google.com/community)
- 🐛 [Firebase Support](https://firebase.google.com/support)

---

**Ready to migrate to Firebase? Follow the setup guide above and enjoy the benefits of a modern, scalable backend! 🚀**
