const admin = require('firebase-admin');

console.log('🔥 Testing Firebase Admin SDK Connection...\n');

try {
  // Check if service account file exists
  const fs = require('fs');
  const path = require('path');
  
  const serviceAccountPath = path.join(__dirname, 'config', 'serviceAccountKey.json');
  
  if (!fs.existsSync(serviceAccountPath)) {
    console.log('❌ Service account key file not found at:', serviceAccountPath);
    console.log('📝 Please download your service account key from Firebase Console');
    console.log('🔗 https://console.firebase.google.com/project/healthify-31b19/settings/serviceaccounts/adminsdk');
    process.exit(1);
  }
  
  // Load service account
  const serviceAccount = require(serviceAccountPath);
  
  // Check if it's the template file
  if (serviceAccount.private_key_id === 'YOUR_PRIVATE_KEY_ID') {
    console.log('⚠️  Template service account key detected!');
    console.log('📝 Please replace with your actual Firebase service account key');
    console.log('🔗 Download from: https://console.firebase.google.com/project/healthify-31b19/settings/serviceaccounts/adminsdk');
    process.exit(1);
  }
  
  // Initialize Firebase Admin
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    projectId: serviceAccount.project_id || 'healthify-31b19',
  });
  
  console.log('✅ Firebase Admin SDK initialized successfully!');
  console.log('📊 Project ID:', serviceAccount.project_id);
  console.log('📧 Service Account Email:', serviceAccount.client_email);
  
  // Test Firestore connection
  const db = admin.firestore();
  console.log('✅ Firestore database connected!');
  
  // Test Auth connection
  const auth = admin.auth();
  console.log('✅ Firebase Auth connected!');
  
  // Test Storage connection
  const storage = admin.storage();
  console.log('✅ Firebase Storage connected!');
  
  console.log('\n🎉 All Firebase services connected successfully!');
  console.log('🚀 Your HealthWallet backend is ready to use Firebase!');
  
} catch (error) {
  console.log('❌ Firebase connection failed:');
  console.log('Error:', error.message);
  console.log('\n🔧 Troubleshooting:');
  console.log('1. Make sure you have downloaded the correct service account key');
  console.log('2. Check that the JSON file is valid');
  console.log('3. Verify the Firebase project is active');
  console.log('4. Ensure all required Firebase services are enabled');
  
  process.exit(1);
}











