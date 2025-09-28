const express = require('express');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');

const router = express.Router();

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
  emailVerified: { type: Boolean, default: false },
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

// OTP schema
const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  code: { type: String, required: true },
  type: { type: String, enum: ['signup', 'login'], required: true },
  expiresAt: { type: Date, default: Date.now, expires: 300 },
  attempts: { type: Number, default: 0 },
  verified: { type: Boolean, default: false }
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);
const OTP = mongoose.model('OTP', otpSchema);

// Verify OTP and login
router.post('/verify-otp-login', async (req, res) => {
  try {
    const { phone, otp } = req.body;

    if (!phone || !otp) {
      return res.status(400).json({ message: 'Phone number and OTP are required' });
    }

    // Find OTP record
    const otpRecord = await OTP.findOne({ phone, type: 'login' });
    
    if (!otpRecord) {
      return res.status(404).json({ message: 'OTP not found or expired' });
    }

    // Check if OTP is expired
    if (otpRecord.expiresAt < new Date()) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'OTP has expired' });
    }

    // Check attempts
    if (otpRecord.attempts >= 3) {
      await OTP.deleteOne({ _id: otpRecord._id });
      return res.status(400).json({ message: 'Too many attempts. Please request a new OTP.' });
    }

    // Verify OTP
    if (otpRecord.code !== otp) {
      otpRecord.attempts += 1;
      await otpRecord.save();
      return res.status(400).json({ message: 'Invalid OTP' });
    }

    // Find user
    const user = await User.findOne({ phone });
    if (!user) {
      return res.status(404).json({ message: 'User not found. Please sign up first.' });
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Mark OTP as verified and delete it
    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate JWT token
    const accessToken = jwt.sign(
      { userId: user._id, phone: user.phone, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    res.json({
      message: 'Login successful',
      user: {
        id: user._id,
        phone: user.phone,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        phoneVerified: user.phoneVerified
      },
      accessToken
    });

  } catch (error) {
    console.error('Verify OTP login error:', error);
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
});

module.exports = router;
