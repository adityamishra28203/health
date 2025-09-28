const express = require('express');
const { OAuth2Client } = require('google-auth-library');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const router = express.Router();

// User schema (same as test script)
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

// Google OAuth client
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google signup endpoint
router.post('/google-signup', async (req, res) => {
  try {
    const { code, role = 'patient' } = req.body;

    if (!code) {
      return res.status(400).json({ message: 'Authorization code is required' });
    }

    // Exchange authorization code for tokens
    const { tokens } = await client.getToken(code);
    client.setCredentials(tokens);

    // Get user info from Google
    const ticket = await client.verifyIdToken({
      idToken: tokens.id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const { email, given_name, family_name, picture } = payload;

    // Check if user already exists
    let user = await User.findOne({ email });
    
    if (user) {
      // User exists, update last login
      user.lastLogin = new Date();
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
          status: user.status
        },
        accessToken
      });
    }

    // Create new user
    user = new User({
      email,
      firstName: given_name || '',
      lastName: family_name || '',
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
        status: user.status
      },
      accessToken
    });

  } catch (error) {
    console.error('Google signup error:', error);
    res.status(500).json({ message: 'Google signup failed', error: error.message });
  }
});

module.exports = router;
