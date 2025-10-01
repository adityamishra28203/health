const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const winston = require('winston');
const multer = require('multer');
const sharp = require('sharp');

// Configure logging
const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console(),
    new winston.transports.File({ filename: 'logs/profile-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/profile-combined.log' })
  ]
});

const app = express();
const PORT = process.env.PORT || 3002;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthwallet_profiles', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Patient Profile schema
const patientSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true }, // Reference to auth service user ID
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  avatar: String,
  bio: String,
  emergencyContact: String,
  bloodType: String,
  allergies: [String],
  medications: [String],
  medicalConditions: [String],
  organization: String,
  licenseNumber: String,
  specialization: String,
  preferences: {
    notifications: { type: Boolean, default: true },
    dataSharing: { type: Boolean, default: false },
    language: { type: String, default: 'en' },
    timezone: { type: String, default: 'UTC' }
  },
  familyMembers: [{
    name: String,
    relationship: String,
    phone: String,
    email: String,
    isEmergencyContact: { type: Boolean, default: false }
  }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Patient = mongoose.model('Patient', patientSchema);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const profileLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests, please try again later.'
});

app.use(profileLimiter);
app.use(express.json({ limit: '10mb' }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'), false);
    }
  }
});

// JWT verification middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'profile-service',
    timestamp: new Date().toISOString()
  });
});

// Get patient profile
app.get('/:patientId', verifyToken, async (req, res) => {
  try {
    const { patientId } = req.params;

    // Verify the user can access this profile
    if (req.userId !== patientId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const patient = await Patient.findOne({ userId: patientId });
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    res.json(patient);
  } catch (error) {
    logger.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
});

// Create or update patient profile
app.put('/:patientId', verifyToken, [
  body('firstName').notEmpty().trim(),
  body('lastName').notEmpty().trim(),
  body('email').isEmail().normalizeEmail()
], async (req, res) => {
  try {
    const { patientId } = req.params;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify the user can update this profile
    if (req.userId !== patientId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const updateData = {
      ...req.body,
      userId: patientId,
      updatedAt: new Date()
    };

    const patient = await Patient.findOneAndUpdate(
      { userId: patientId },
      updateData,
      { upsert: true, new: true, runValidators: true }
    );

    logger.info(`Profile updated for patient: ${patientId}`);
    res.json(patient);
  } catch (error) {
    logger.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// Upload avatar
app.post('/:patientId/avatar', verifyToken, upload.single('avatar'), async (req, res) => {
  try {
    const { patientId } = req.params;

    // Verify the user can update this profile
    if (req.userId !== patientId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // Process image with Sharp
    const processedImage = await sharp(req.file.buffer)
      .resize(200, 200, { fit: 'cover' })
      .jpeg({ quality: 80 })
      .toBuffer();

    // In a real implementation, you would upload to cloud storage
    // For now, we'll store as base64 (not recommended for production)
    const base64Image = `data:image/jpeg;base64,${processedImage.toString('base64')}`;

    // Update patient profile with avatar
    const patient = await Patient.findOneAndUpdate(
      { userId: patientId },
      { avatar: base64Image, updatedAt: new Date() },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    logger.info(`Avatar uploaded for patient: ${patientId}`);
    res.json({
      message: 'Avatar uploaded successfully',
      avatar: base64Image
    });
  } catch (error) {
    logger.error('Avatar upload error:', error);
    res.status(500).json({ error: 'Failed to upload avatar' });
  }
});

// Add family member
app.post('/:patientId/family', verifyToken, [
  body('name').notEmpty().trim(),
  body('relationship').notEmpty().trim(),
  body('phone').optional().isMobilePhone(),
  body('email').optional().isEmail()
], async (req, res) => {
  try {
    const { patientId } = req.params;
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Verify the user can update this profile
    if (req.userId !== patientId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const familyMember = {
      name: req.body.name,
      relationship: req.body.relationship,
      phone: req.body.phone,
      email: req.body.email,
      isEmergencyContact: req.body.isEmergencyContact || false
    };

    const patient = await Patient.findOneAndUpdate(
      { userId: patientId },
      { 
        $push: { familyMembers: familyMember },
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    logger.info(`Family member added for patient: ${patientId}`);
    res.json({
      message: 'Family member added successfully',
      familyMember
    });
  } catch (error) {
    logger.error('Add family member error:', error);
    res.status(500).json({ error: 'Failed to add family member' });
  }
});

// Update family member
app.put('/:patientId/family/:memberId', verifyToken, async (req, res) => {
  try {
    const { patientId, memberId } = req.params;

    // Verify the user can update this profile
    if (req.userId !== patientId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const patient = await Patient.findOne({ userId: patientId });
    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    const familyMember = patient.familyMembers.id(memberId);
    if (!familyMember) {
      return res.status(404).json({ error: 'Family member not found' });
    }

    // Update family member
    Object.assign(familyMember, req.body);
    patient.updatedAt = new Date();
    await patient.save();

    logger.info(`Family member updated for patient: ${patientId}`);
    res.json({
      message: 'Family member updated successfully',
      familyMember
    });
  } catch (error) {
    logger.error('Update family member error:', error);
    res.status(500).json({ error: 'Failed to update family member' });
  }
});

// Delete family member
app.delete('/:patientId/family/:memberId', verifyToken, async (req, res) => {
  try {
    const { patientId, memberId } = req.params;

    // Verify the user can update this profile
    if (req.userId !== patientId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const patient = await Patient.findOneAndUpdate(
      { userId: patientId },
      { 
        $pull: { familyMembers: { _id: memberId } },
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    logger.info(`Family member deleted for patient: ${patientId}`);
    res.json({ message: 'Family member deleted successfully' });
  } catch (error) {
    logger.error('Delete family member error:', error);
    res.status(500).json({ error: 'Failed to delete family member' });
  }
});

// Update preferences
app.put('/:patientId/preferences', verifyToken, async (req, res) => {
  try {
    const { patientId } = req.params;

    // Verify the user can update this profile
    if (req.userId !== patientId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const patient = await Patient.findOneAndUpdate(
      { userId: patientId },
      { 
        preferences: req.body,
        updatedAt: new Date()
      },
      { new: true }
    );

    if (!patient) {
      return res.status(404).json({ error: 'Patient profile not found' });
    }

    logger.info(`Preferences updated for patient: ${patientId}`);
    res.json({
      message: 'Preferences updated successfully',
      preferences: patient.preferences
    });
  } catch (error) {
    logger.error('Update preferences error:', error);
    res.status(500).json({ error: 'Failed to update preferences' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Profile service error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`Profile service running on port ${PORT}`);
});

module.exports = app;
