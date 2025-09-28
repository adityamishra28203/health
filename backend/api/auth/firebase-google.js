const express = require('express');
const admin = require('firebase-admin');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const router = express.Router();

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  try {
    const serviceAccount = require('../../config/serviceAccountKey.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.FIREBASE_PROJECT_ID || 'healthify-31b19'
    });
  } catch (error) {
    console.error('Firebase Admin SDK initialization failed:', error);
  }
}

// User schema
const userSchema = new mongoose.Schema({
  firebaseUid: { type: String, unique: true, sparse: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, minlength: 8 },
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  phone: { type: String, trim: true },
  role: { 
    type: String, 
    enum: ['patient', 'doctor', 'hospital_admin', 'insurer', 'system_admin'],
    default: 'patient' 
  },
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'suspended', 'pending_verification'],
    default: 'active' 
  },
  emailVerified: { type: Boolean, default: true },
  phoneVerified: { type: Boolean, default: false },
  avatar: { type: String },
  bio: { type: String, maxlength: 500 },
  emergencyContact: { type: String },
  bloodType: { type: String },
  allergies: [{ type: String }],
  medications: [{ type: String }],
  medicalConditions: [{ type: String }],
  organization: { type: String },
  licenseNumber: { type: String },
  specialization: { type: String },
  aadhaarNumber: { type: String },
  aadhaarVerified: { type: Boolean, default: false },
  lastLogin: { type: Date },
  loginAttempts: { type: Number, default: 0 },
  lockUntil: { type: Date },
  refreshTokens: [{ type: String }],
}, {
  timestamps: true,
});

const User = mongoose.model('User', userSchema);

// Firebase Google authentication endpoint
router.post('/firebase-google', async (req, res) => {
  try {
    const { idToken, role = 'patient' } = req.body;

    if (!idToken) {
      return res.status(400).json({ message: 'Firebase ID token is required' });
    }

    // Verify the Firebase ID token
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    const { uid, email, name, picture } = decodedToken;

    // Check if user already exists
    let user = await User.findOne({ firebaseUid: uid });
    
    if (user) {
      // User exists, update last login
      user.lastLogin = new Date();
      user.emailVerified = true;
      if (picture) user.avatar = picture;
      await user.save();
      
      // Generate JWT token
      const accessToken = jwt.sign(
        { userId: user._id, email: user.email, role: user.role },
        process.env.JWT_SECRET || 'your-secret-key',
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
      );

      return res.json({
        message: 'Login successful',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
          status: user.status,
          firebaseUid: user.firebaseUid
        },
        accessToken
      });
    }

    // Create new user
    const nameParts = name ? name.split(' ') : ['User', 'Name'];
    user = new User({
      firebaseUid: uid,
      email,
      firstName: nameParts[0] || 'User',
      lastName: nameParts.slice(1).join(' ') || 'Name',
      role,
      status: 'active',
      emailVerified: true,
      avatar: picture,
      lastLogin: new Date()
    });

    await user.save();

    // Generate JWT token
    const accessToken = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      message: 'Account created successfully',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar,
        status: user.status,
        firebaseUid: user.firebaseUid
      },
      accessToken
    });

  } catch (error) {
    console.error('Firebase Google auth error:', error);
    
    if (error.code === 'auth/invalid-token') {
      return res.status(401).json({ message: 'Invalid Firebase token' });
    }
    
    res.status(500).json({ 
      message: 'Firebase authentication failed', 
      error: error.message 
    });
  }
});

module.exports = router;
