# 🔥 Firebase Connection Test Guide

## **Current Status:**
- ✅ Firebase project configured: `healthify-31b19`
- ✅ Service account template created
- ✅ Test script ready
- ⚠️ **Need actual service account key**

## **Step 1: Download Your Service Account Key**

### **Option A: Firebase Console (Recommended)**
1. Go to [Firebase Console Service Accounts](https://console.firebase.google.com/project/healthify-31b19/settings/serviceaccounts/adminsdk)
2. Click **"Generate new private key"**
3. Download the JSON file
4. Replace `backend/config/serviceAccountKey.json` with the downloaded file

### **Option B: Google Cloud Console**
1. Go to [Google Cloud Console](https://console.cloud.google.com/iam-admin/serviceaccounts?project=healthify-31b19)
2. Click on your service account
3. Go to **"Keys"** tab
4. Click **"Add Key"** → **"Create new key"** → **"JSON"**
5. Download and replace the file

## **Step 2: Test Firebase Connection**

```bash
# Navigate to backend
cd backend

# Run the test script
node test-firebase.js
```

### **Expected Success Output:**
```
🔥 Testing Firebase Admin SDK Connection...

✅ Firebase Admin SDK initialized successfully!
📊 Project ID: healthify-31b19
📧 Service Account Email: firebase-adminsdk-xyz@healthify-31b19.iam.gserviceaccount.com
✅ Firestore database connected!
✅ Firebase Auth connected!
✅ Firebase Storage connected!

🎉 All Firebase services connected successfully!
🚀 Your HealthWallet backend is ready to use Firebase!
```

## **Step 3: Test Backend Integration**

```bash
# Start the backend server
npm run start:dev
```

### **Expected Output:**
```
✅ Firebase Admin SDK initialized successfully
🚀 HealthWallet API is running on: http://0.0.0.0:3001
📚 API Documentation: http://0.0.0.0:3001/api/docs
```

## **Step 4: Test API Endpoints**

### **Health Check:**
```bash
curl http://localhost:3001/health
```

### **Test Firebase Integration:**
```bash
# Test user creation (if implemented)
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'
```

## **Troubleshooting**

### **Common Issues:**

#### **1. "Service account key not found"**
- ✅ Make sure `backend/config/serviceAccountKey.json` exists
- ✅ Check file permissions
- ✅ Verify the file is not empty

#### **2. "Invalid service account key"**
- ✅ Ensure you downloaded the correct key
- ✅ Check JSON format is valid
- ✅ Verify the key is for the right project

#### **3. "Firebase services not enabled"**
- ✅ Enable Authentication in Firebase Console
- ✅ Create Firestore Database
- ✅ Enable Storage
- ✅ Check project billing (if needed)

#### **4. "Permission denied"**
- ✅ Verify service account has proper roles
- ✅ Check Firebase project permissions
- ✅ Ensure project is active

## **Firebase Services Checklist**

### **Authentication:**
- [ ] Email/Password enabled
- [ ] Google OAuth enabled  
- [ ] Phone authentication enabled

### **Firestore Database:**
- [ ] Database created
- [ ] Security rules configured
- [ ] Test mode enabled

### **Storage:**
- [ ] Storage enabled
- [ ] Security rules configured
- [ ] Test mode enabled

## **Next Steps After Successful Connection:**

1. **Test User Registration:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/register \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"password123","firstName":"Test","lastName":"User"}'
   ```

2. **Test User Login:**
   ```bash
   curl -X POST http://localhost:3001/api/auth/login \
     -H "Content-Type: application/json" \
     -d '{"identifier":"test@example.com","password":"password123"}'
   ```

3. **Test Health Records:**
   ```bash
   curl http://localhost:3001/api/health-records
   ```

## **Ready to Go! 🚀**

Once you see the success message, your Firebase integration is working perfectly and you can start using all Firebase services in your HealthWallet application!
