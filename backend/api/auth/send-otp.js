const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// OTP schema for storing OTP codes
const otpSchema = new mongoose.Schema({
  phone: { type: String, required: true },
  code: { type: String, required: true },
  type: { type: String, enum: ['signup', 'login'], required: true },
  expiresAt: { type: Date, default: Date.now, expires: 300 }, // 5 minutes
  attempts: { type: Number, default: 0 },
  verified: { type: Boolean, default: false }
}, {
  timestamps: true
});

const OTP = mongoose.model('OTP', otpSchema);

// Send OTP endpoint
router.post('/send-otp', async (req, res) => {
  try {
    const { phone, type = 'login' } = req.body;

    if (!phone) {
      return res.status(400).json({ message: 'Phone number is required' });
    }

    // Generate 6-digit OTP
    const otpCode = Math.floor(100000 + Math.random() * 900000).toString();

    // Delete any existing OTP for this phone
    await OTP.deleteMany({ phone });

    // Create new OTP record
    const otp = new OTP({
      phone,
      code: otpCode,
      type
    });

    await otp.save();

    // In a real application, you would send SMS here using services like Twilio
    // For now, we'll just log the OTP (in production, remove this)
    console.log(`OTP for ${phone}: ${otpCode}`);

    res.json({
      message: 'OTP sent successfully',
      phone: phone,
      expiresIn: 300 // 5 minutes
    });

  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
});

module.exports = router;
