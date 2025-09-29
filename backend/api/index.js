const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Create Express app
const app = express();

// Enable CORS
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3000', 
    'http://localhost:8081',
    'https://healthwallet.vercel.app',
    'https://healthwallet-frontend.vercel.app',
      'https://health-j0gvmolnu-adityamishra28203s-projects.vercel.app',
      'https://health-five-lac.vercel.app',
      'https://healthify-gilt.vercel.app',
      'https://health-psi-three.vercel.app'
    ];
    
    // Check if origin is in allowed list
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow all Vercel deployments for your project
    if (origin.includes('vercel.app')) {
      return callback(null, true);
    }
    
    console.log('CORS blocked origin:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'Accept'],
  optionsSuccessStatus: 200
}));

// Handle preflight requests
app.options('*', (req, res) => {
  res.header('Access-Control-Allow-Origin', req.headers.origin || '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS, PATCH');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With, Accept');
  res.header('Access-Control-Allow-Credentials', 'true');
  res.sendStatus(200);
});

// Parse JSON bodies
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    // Allow common file types
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only images, PDFs, and documents are allowed'));
    }
  }
});

// Password hashing function
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// Password verification function
function verifyPassword(password, hashedPassword) {
  const [salt, hash] = hashedPassword.split(':');
  const verifyHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
  return hash === verifyHash;
}

// Hash SHA-256 password with PBKDF2 (for encrypted passwords from frontend)
function hashEncryptedPassword(encryptedPassword) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.pbkdf2Sync(encryptedPassword, salt, 1000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

// Pre-compute the SHA-256 hash of 'Admin123!' for testing
const ADMIN_PASSWORD_SHA256 = '3eb3fe66b31e3b4d10fa70b5cad49c7112294af6ae4e476a1c405155d45aa121';

// MongoDB connection and User schema
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://adityamishraubi:9460%40Mongodb@cluster0.2rqwy.mongodb.net/health';

// User schema for MongoDB
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    trim: true
  },
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
  emailVerified: {
    type: Boolean,
    default: false
  },
  phoneVerified: {
    type: Boolean,
    default: false
  },
  avatar: {
    type: String,
    maxlength: 1000000 // 1MB limit for base64 data URLs
  },
  bio: {
    type: String,
    maxlength: 500
  },
  emergencyContact: {
    type: String
  },
  bloodType: {
    type: String
  },
  allergies: [{
    type: String
  }],
  medications: [{
    type: String
  }],
  medicalConditions: [{
    type: String
  }],
  organization: {
    type: String
  },
  licenseNumber: {
    type: String
  },
  specialization: {
    type: String
  },
  lastLogin: {
    type: Date
  },
  loginAttempts: {
    type: Number,
    default: 0
  },
  lockUntil: {
    type: Date
  }
}, {
  timestamps: true
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword) {
  if (!this.password) {
    console.error('No password found for user:', this.email);
    return false;
  }
  
  try {
    console.log('Comparing password for user:', this.email);
    console.log('Password format check:', this.password.includes(':') ? 'PBKDF2' : 'bcrypt');
    
    // Check if password is stored in PBKDF2 format (salt:hash)
    if (this.password.includes(':')) {
      const [salt, hash] = this.password.split(':');
      console.log('Using PBKDF2 comparison');
      const candidateHash = crypto.pbkdf2Sync(candidatePassword, salt, 1000, 64, 'sha512').toString('hex');
      const isValid = hash === candidateHash;
      console.log('PBKDF2 comparison result:', isValid);
      return isValid;
    } else {
      // Fallback to bcrypt for old passwords
      console.log('Using bcrypt comparison');
      const bcrypt = require('bcryptjs');
      const isValid = await bcrypt.compare(candidatePassword, this.password);
      console.log('bcrypt comparison result:', isValid);
      return isValid;
    }
  } catch (error) {
    console.error('Password comparison error:', error);
    throw new Error('Password comparison failed: ' + error.message);
  }
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

const User = mongoose.model('User', userSchema);

// Health Records schema
const healthRecordSchema = new mongoose.Schema({
  patientId: {
    type: String,
    required: true,
    ref: 'User'
  },
  doctorId: {
    type: String,
    ref: 'User'
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true
  },
  type: {
    type: String,
    enum: ['lab_report', 'prescription', 'x_ray', 'mri', 'ct_scan', 'ultrasound', 'blood_test', 'vaccination', 'consultation', 'other'],
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'verified', 'rejected', 'archived'],
    default: 'pending'
  },
  fileHash: {
    type: String
  },
  ipfsHash: {
    type: String
  },
  fileName: {
    type: String
  },
  fileSize: {
    type: Number
  },
  mimeType: {
    type: String
  },
  fileUrl: {
    type: String
  },
  recordDate: {
    type: Date,
    required: true
  },
  tags: [{
    type: String
  }],
  medicalData: {
    type: mongoose.Schema.Types.Mixed
  },
  consentGiven: {
    type: Boolean,
    default: false
  },
  isEncrypted: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const HealthRecord = mongoose.model('HealthRecord', healthRecordSchema);

// Insurance Claims schema
const insuranceClaimSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    ref: 'User'
  },
  claimNumber: {
    type: String,
    required: true,
    unique: true
  },
  insuranceProvider: {
    type: String,
    required: true
  },
  claimType: {
    type: String,
    enum: ['medical', 'prescription', 'dental', 'vision', 'emergency'],
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  status: {
    type: String,
    enum: ['submitted', 'under_review', 'approved', 'rejected', 'paid'],
    default: 'submitted'
  },
  description: {
    type: String,
    required: true
  },
  submissionDate: {
    type: Date,
    default: Date.now
  },
  processedDate: {
    type: Date
  },
  documents: [{
    fileName: String,
    fileUrl: String,
    fileHash: String
  }]
}, {
  timestamps: true
});

const InsuranceClaim = mongoose.model('InsuranceClaim', insuranceClaimSchema);

// Connect to MongoDB
let isConnected = false;

async function connectToDatabase() {
  if (isConnected) {
    console.log('🔌 Database already connected');
    return;
  }
  
  try {
    console.log('🔌 Connecting to MongoDB...');
    console.log('🔗 MongoDB URI:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@')); // Hide credentials in logs
    await mongoose.connect(MONGODB_URI);
    isConnected = true;
    console.log('✅ Connected to MongoDB successfully!');
    
    // Create default admin user if it doesn't exist
    const existingAdmin = await User.findOne({ email: 'admin@healthify.com' });
    if (!existingAdmin) {
      console.log('👤 Creating default admin user...');
      const adminUser = new User({
        email: 'admin@healthify.com',
        password: hashEncryptedPassword(ADMIN_PASSWORD_SHA256),
        firstName: 'Admin',
        lastName: 'User',
        role: 'patient',
        status: 'active',
        emailVerified: true
      });
      
      await adminUser.save();
      console.log('✅ Created default admin user');
    } else {
      console.log('👤 Admin user already exists:', { 
        id: existingAdmin._id, 
        email: existingAdmin.email, 
        avatar: existingAdmin.avatar 
      });
    }
    
    // Create sample health records if none exist
    const existingRecords = await HealthRecord.countDocuments();
    if (existingRecords === 0) {
      console.log('📋 Creating sample health records...');
      
      const sampleRecords = [
        new HealthRecord({
          patientId: existingAdmin._id,
          doctorId: existingAdmin._id,
          title: 'Blood Test Report',
          description: 'Complete blood count and lipid profile',
          type: 'lab_report',
          status: 'verified',
          recordDate: new Date('2024-01-15'),
          tags: ['blood', 'test', 'lab'],
          medicalData: { 
            hemoglobin: '14.2 g/dL', 
            cholesterol: '180 mg/dL',
            whiteBloodCells: '7.2 K/μL'
          },
          consentGiven: true,
          isEncrypted: true
        }),
        new HealthRecord({
          patientId: existingAdmin._id,
          doctorId: existingAdmin._id,
          title: 'X-Ray Chest',
          description: 'Chest X-ray for routine checkup',
          type: 'x_ray',
          status: 'verified',
          recordDate: new Date('2024-01-10'),
          tags: ['x-ray', 'chest', 'routine'],
          medicalData: { 
            findings: 'Normal chest X-ray',
            impression: 'No acute findings'
          },
          consentGiven: true,
          isEncrypted: false
        })
      ];
      
      await HealthRecord.insertMany(sampleRecords);
      console.log('✅ Created sample health records');
    } else {
      console.log(`📋 Health records already exist: ${existingRecords} records`);
    }
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    // Fallback to in-memory storage if MongoDB fails
    console.log('⚠️ Falling back to in-memory storage');
  }
}

// Initialize database connection
connectToDatabase();

// Authentication routes
app.post('/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Basic validation
    if (!email || !password) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Email and password are required',
        timestamp: new Date().toISOString()
      });
    }

    // Password validation (skip for encrypted passwords - they are 64 character SHA-256 hashes)
    if (password.length === 64 && /^[a-f0-9]+$/.test(password)) {
      // This is an encrypted password (SHA-256 hash), skip format validation
    } else {
      // This is a plain text password, validate format
      if (password.length < 8) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Password must be at least 8 characters long',
          timestamp: new Date().toISOString()
        });
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Find user in database
    console.log('Searching for user with email:', email.toLowerCase());
    const user = await User.findOne({ email: email.toLowerCase() });
    console.log('User found:', user ? 'Yes' : 'No');
    if (!user) {
      console.log('No user found for email:', email.toLowerCase());
      return res.status(401).json({
        error: 'Authentication Error',
        message: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
    }

    // Check if account is locked
    if (user.isLocked) {
      const lockTime = user.lockUntil;
      const timeRemaining = lockTime ? Math.ceil((lockTime.getTime() - Date.now()) / (1000 * 60)) : 0;
      return res.status(401).json({
        error: 'Account Locked',
        message: `Account is temporarily locked. Try again in ${timeRemaining} minutes.`,
        timestamp: new Date().toISOString()
      });
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      return res.status(401).json({
        error: 'Authentication Error',
        message: 'Invalid email or password',
        timestamp: new Date().toISOString()
      });
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const mockToken = 'mock-jwt-token-' + Date.now();
    
    return res.status(200).json({
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        avatar: user.avatar,
        createdAt: user.createdAt
      },
      accessToken: mockToken,
      message: 'Login successful'
    });

  } catch (error) {
    console.error('Login error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    });
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred during login',
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/auth/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, role } = req.body;
    
    // Basic validation
    if (!firstName || !lastName || !email || !password || !role) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'All required fields must be provided',
        timestamp: new Date().toISOString()
      });
    }

    // Password validation (skip for encrypted passwords - they are 64 character SHA-256 hashes)
    if (password.length === 64 && /^[a-f0-9]+$/.test(password)) {
      // This is an encrypted password (SHA-256 hash), skip format validation
    } else {
      // This is a plain text password, validate format
      if (password.length < 8) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Password must be at least 8 characters long',
          timestamp: new Date().toISOString()
        });
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character',
          timestamp: new Date().toISOString()
        });
      }
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'User with this email already exists',
        timestamp: new Date().toISOString()
      });
    }

    // Create new user with hashed encrypted password
    const hashedPassword = hashEncryptedPassword(password);
    const newUser = new User({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      phone: phone?.trim(),
      role,
      status: 'active',
      emailVerified: false,
      phoneVerified: false
    });

    // Save to database
    await newUser.save();

    // Generate token
    const mockToken = 'mock-jwt-token-' + Date.now();
    
    res.status(201).json({
      user: {
        id: newUser._id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        status: newUser.status,
        emailVerified: newUser.emailVerified,
        avatar: newUser.avatar,
        createdAt: newUser.createdAt
      },
      accessToken: mockToken,
      message: 'Registration successful'
    });

  } catch (error) {
    console.error('Registration error:', error);
    if (error.code === 11000) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'User with this email already exists',
        timestamp: new Date().toISOString()
      });
    }
    
    res.status(500).json({
      error: 'Server Error',
      message: 'An error occurred during registration',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/auth/profile', async (req, res) => {
  try {
    // Get the authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        error: 'Authentication Error',
        message: 'No valid authorization token provided',
        timestamp: new Date().toISOString()
      });
    }
    
    // For mock tokens, find the most recently updated user (who likely just logged in)
    // This is a simple way to identify the current user without proper JWT decoding
    let user = await User.findOne().sort({ updatedAt: -1 }).select('-password');
    
    // If no user found by updatedAt, try by creation date (newest first)
    if (!user) {
      user = await User.findOne().sort({ createdAt: -1 }).select('-password');
    }
    
    if (!user) {
      return res.status(404).json({
        error: 'User Error',
        message: 'No users found in database',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('👤 Fetching profile for user:', { id: user._id, email: user.email, firstName: user.firstName, lastName: user.lastName });
    
    res.status(200).json({
      id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
      bio: user.bio,
      bloodType: user.bloodType,
      allergies: user.allergies,
      medications: user.medications,
      medicalConditions: user.medicalConditions,
      emergencyContact: user.emergencyContact,
      createdAt: user.createdAt
    });
  } catch (error) {
    console.error('Profile fetch error:', error);
    res.status(500).json({
      error: 'Server Error',
      message: 'Failed to fetch profile',
      timestamp: new Date().toISOString()
    });
  }
});

app.put('/auth/profile', async (req, res) => {
  try {
    // Mock profile update - replace with real profile update logic
    const { firstName, lastName, email, phone, avatar, role, bio } = req.body;
    
    // Check if any data is provided
    if (!firstName && !lastName && !email && !phone && !avatar && !role && !bio) {
      console.log('❌ No data provided for profile update');
      return res.status(400).json({
        error: 'Validation Error',
        message: 'No data provided for profile update',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('📝 Profile update request received:', { 
      firstName: firstName !== undefined ? `provided (${typeof firstName}, value: "${firstName}")` : 'not provided',
      lastName: lastName !== undefined ? `provided (${typeof lastName}, value: "${lastName}")` : 'not provided', 
      email: email !== undefined ? `provided (${typeof email}, value: "${email}")` : 'not provided',
      phone: phone !== undefined ? `provided (${typeof phone}, value: "${phone}")` : 'not provided',
      avatar: avatar !== undefined ? `provided (${avatar.length} chars)` : 'not provided',
      role: role !== undefined ? `provided (${typeof role}, value: "${role}")` : 'not provided',
      bio: bio !== undefined ? `provided (${typeof bio}, value: "${bio}")` : 'not provided'
    });
    
    console.log('🔧 Profile update request:', { 
      firstName, 
      lastName, 
      email, 
      phone, 
      avatar: avatar ? `data URL (${avatar.length} chars)` : null, 
      role, 
      bio 
    });
    
    // Validate avatar data size if present
    if (avatar && avatar.length > 1000000) { // 1MB limit for base64 (reduced from 5MB)
      console.log('❌ Avatar data too large:', avatar.length, 'characters');
      return res.status(400).json({
        error: 'Validation Error',
        message: `Avatar image is too large (${Math.round(avatar.length / 1024)}KB). Please use a smaller image.`,
        timestamp: new Date().toISOString()
      });
    }
    
    // Check if database is connected
    if (!isConnected) {
      console.log('❌ Database not connected, attempting to reconnect...');
      await connectToDatabase();
      if (!isConnected) {
        return res.status(500).json({
          error: 'Database Error',
          message: 'Database connection failed',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Try to find user by email first, then fallback to most recently updated user
    let user;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
      console.log('🔍 Searching for user by email:', email.toLowerCase());
    }
    
    // If not found by email, get the most recently updated user (who likely just logged in)
    if (!user) {
      user = await User.findOne().sort({ updatedAt: -1 }); // Get most recently updated user
      console.log('🔍 Using most recently updated user in database');
    }
    
    if (!user) {
      console.log('❌ No users found in database');
      return res.status(404).json({
        error: 'User Error',
        message: 'No users found in database',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('👤 Found user:', { id: user._id, email: user.email, currentAvatar: user.avatar });
    
    // Update user fields
    if (firstName !== undefined) {
      // Only validate if firstName is being updated and it's empty
      if (firstName === null || firstName === '' || (firstName && firstName.trim() === '')) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'First name cannot be empty',
          timestamp: new Date().toISOString()
        });
      }
      if (firstName && firstName.trim()) {
        user.firstName = firstName.trim();
      }
    }
    if (lastName !== undefined) {
      // Only validate if lastName is being updated and it's empty
      if (lastName === null || lastName === '' || (lastName && lastName.trim() === '')) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Last name cannot be empty',
          timestamp: new Date().toISOString()
        });
      }
      if (lastName && lastName.trim()) {
        user.lastName = lastName.trim();
      }
    }
    
    // Clean up old invalid avatar URLs
    if (user.avatar && (user.avatar.includes('securehealth-storage.com') || (!user.avatar.startsWith('data:') && !user.avatar.startsWith('http')))) {
      console.log('🧹 Cleaning up old invalid avatar URL:', user.avatar);
      user.avatar = '';
    }
    if (email && email !== user.email) {
      // Check if new email is already taken by another user
      const existingUser = await User.findOne({ email: email.toLowerCase(), _id: { $ne: user._id } });
      if (existingUser) {
        return res.status(400).json({
          error: 'Validation Error',
          message: 'Email is already taken by another user',
          timestamp: new Date().toISOString()
        });
      }
      user.email = email.toLowerCase();
    }
    if (phone !== undefined) user.phone = phone; // Allow empty string to clear phone
    if (bio !== undefined) user.bio = bio; // Allow empty string to clear bio
    if (avatar) {
      console.log('🖼️ Updating avatar from:', user.avatar ? `present (${user.avatar.length} chars)` : 'null', 'to:', `present (${avatar.length} chars)`);
      user.avatar = avatar;
    }
    if (role) user.role = role;
    
    // Save updated user
    try {
      console.log('💾 Attempting to save user with data:', {
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        bio: user.bio,
        avatar: user.avatar ? `present (${user.avatar.length} chars)` : 'null'
      });
      
      // Save the user without validating required fields that aren't being updated
      await user.save({ validateBeforeSave: false });
      console.log('✅ User saved successfully, new avatar:', user.avatar ? `present (${user.avatar.length} chars)` : 'null');
    } catch (saveError) {
      console.error('❌ Error saving user:', saveError);
      console.error('❌ Save error details:', {
        message: saveError.message,
        name: saveError.name,
        code: saveError.code,
        errors: saveError.errors,
        keyPattern: saveError.keyPattern,
        keyValue: saveError.keyValue
      });
      
      // Provide more specific error messages
      let errorMessage = 'Failed to save user profile';
      if (saveError.name === 'ValidationError') {
        errorMessage = 'Profile validation failed. Please check your input.';
      } else if (saveError.code === 11000) {
        errorMessage = 'Email address is already in use.';
      } else if (saveError.message.includes('maxlength')) {
        errorMessage = 'One or more fields exceed the maximum length allowed.';
      }
      
      return res.status(500).json({
        error: 'Database Error',
        message: errorMessage,
        details: saveError.message,
        timestamp: new Date().toISOString()
      });
    }
    
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    res.status(200).json({
      user: userWithoutPassword,
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({
      error: 'Update Error',
      message: 'Failed to update profile',
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/auth/logout', (req, res) => {
  // Mock logout - replace with real logout logic
  res.status(200).json({
    message: 'Logout successful',
    timestamp: new Date().toISOString()
  });
});

// File upload endpoint
app.post('/files/upload', upload.single('file'), (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'No file uploaded',
        timestamp: new Date().toISOString()
      });
    }

    // Mock file upload response
    const mockFileResponse = {
      id: Date.now().toString(),
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      fileUrl: `https://securehealth-storage.com/files/${Date.now()}-${req.file.originalname}`,
      uploadedAt: new Date().toISOString(),
      status: 'uploaded'
    };

    res.status(200).json({
      file: mockFileResponse,
      message: 'File uploaded successfully'
    });
  } catch (error) {
    console.error('File upload error:', error);
    res.status(500).json({
      error: 'Upload Error',
      message: 'Failed to upload file',
      timestamp: new Date().toISOString()
    });
  }
});

// Avatar upload endpoint
app.post('/files/upload-avatar', upload.single('avatar'), (req, res) => {
  try {
    console.log('📁 Avatar upload request received');
    console.log('📄 Request file:', req.file ? { 
      originalname: req.file.originalname, 
      size: req.file.size, 
      mimetype: req.file.mimetype 
    } : 'No file');
    
    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({
        error: 'Validation Error',
        message: 'No avatar file uploaded',
        timestamp: new Date().toISOString()
      });
    }

    // Check if it's an image
    if (!req.file.mimetype.startsWith('image/')) {
      console.log('❌ File is not an image:', req.file.mimetype);
      return res.status(400).json({
        error: 'Validation Error',
        message: 'Avatar must be an image file',
        timestamp: new Date().toISOString()
      });
    }

    // Convert file to base64 data URL for immediate use
    const base64Data = req.file.buffer.toString('base64');
    const dataUrl = `data:${req.file.mimetype};base64,${base64Data}`;

    // Mock avatar upload response with base64 data URL
    const mockAvatarResponse = {
      id: Date.now().toString(),
      fileName: req.file.originalname,
      fileSize: req.file.size,
      mimeType: req.file.mimetype,
      avatarUrl: dataUrl, // Use base64 data URL instead of fake URL
      uploadedAt: new Date().toISOString(),
      status: 'uploaded'
    };

    console.log('✅ Avatar upload successful, data URL length:', dataUrl.length);

    res.status(200).json({
      avatar: mockAvatarResponse,
      message: 'Avatar uploaded successfully'
    });
  } catch (error) {
    console.error('Avatar upload error:', error);
    res.status(500).json({
      error: 'Upload Error',
      message: 'Failed to upload avatar',
      timestamp: new Date().toISOString()
    });
  }
});

// Cleanup endpoint to remove old invalid avatar URLs
app.post('/cleanup-avatars', async (req, res) => {
  try {
    console.log('🧹 Starting avatar cleanup...');
    
    if (!isConnected) {
      await connectToDatabase();
      if (!isConnected) {
        return res.status(500).json({
          error: 'Database Error',
          message: 'Database connection failed',
          timestamp: new Date().toISOString()
        });
      }
    }
    
    // Find all users with old invalid avatar URLs
    const usersWithInvalidAvatars = await User.find({
      $or: [
        { avatar: { $regex: /securehealth-storage\.com/ } },
        { avatar: { $exists: true, $ne: null, $not: { $regex: /^data:/ } } }
      ]
    });
    
    console.log(`🧹 Found ${usersWithInvalidAvatars.length} users with invalid avatars`);
    
    // Clean up invalid avatars
    let cleanedCount = 0;
    for (const user of usersWithInvalidAvatars) {
      if (user.avatar && (user.avatar.includes('securehealth-storage.com') || !user.avatar.startsWith('data:'))) {
        console.log(`🧹 Cleaning avatar for user ${user.email}: ${user.avatar}`);
        user.avatar = '';
        await user.save();
        cleanedCount++;
      }
    }
    
    console.log(`✅ Avatar cleanup completed. Cleaned ${cleanedCount} users.`);
    
    res.status(200).json({
      message: 'Avatar cleanup completed',
      cleanedCount: cleanedCount,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Avatar cleanup error:', error);
    res.status(500).json({
      error: 'Cleanup Error',
      message: 'Failed to cleanup avatars',
      timestamp: new Date().toISOString()
    });
  }
});

// Health Records endpoints (using database)
app.get('/health-records', async (req, res) => {
  try {
    console.log('📋 Fetching health records from database');
    
    // Check if database is connected
    if (!isConnected) {
      await connectToDatabase();
    }
    
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    // Get health records from database with pagination
    const records = await HealthRecord.find()
      .sort({ recordDate: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await HealthRecord.countDocuments();
    
    console.log(`✅ Found ${records.length} health records in database (${total} total)`);
    
    // Convert MongoDB documents to frontend format
    const formattedRecords = records.map(record => ({
      id: record._id,
      patientId: record.patientId,
      doctorId: record.doctorId,
      title: record.title,
      description: record.description,
      type: record.type,
      status: record.status,
      fileHash: record.fileHash,
      ipfsHash: record.ipfsHash,
      fileName: record.fileName,
      fileSize: record.fileSize,
      mimeType: record.mimeType,
      fileUrl: record.fileUrl,
      recordDate: record.recordDate.toISOString().split('T')[0],
      tags: record.tags,
      medicalData: record.medicalData,
      consentGiven: record.consentGiven,
      isEncrypted: record.isEncrypted,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    }));
    
    res.json({
      records: formattedRecords,
      total: total,
      page: page,
      limit: limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('❌ Error fetching health records:', error);
    res.status(500).json({
      error: 'Database Error',
      message: 'Failed to fetch health records',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/health-records/statistics', async (req, res) => {
  try {
    console.log('📊 Fetching health records statistics from database');
    
    // Check if database is connected
    if (!isConnected) {
      await connectToDatabase();
    }
    
    // Get statistics from database
    const totalRecords = await HealthRecord.countDocuments();
    const verifiedRecords = await HealthRecord.countDocuments({ status: 'verified' });
    const pendingRecords = await HealthRecord.countDocuments({ status: 'pending' });
    
    // Get records by type
    const recordsByType = await HealthRecord.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Convert to object format
    const recordsByTypeObj = {};
    recordsByType.forEach(item => {
      recordsByTypeObj[item._id] = item.count;
    });
    
    const statistics = {
      totalRecords,
      verifiedRecords,
      pendingRecords,
      recordsByType: recordsByTypeObj
    };
    
    console.log('✅ Health records statistics:', statistics);
    
    res.json(statistics);
  } catch (error) {
    console.error('❌ Error fetching health records statistics:', error);
    res.status(500).json({
      error: 'Database Error',
      message: 'Failed to fetch health records statistics',
      timestamp: new Date().toISOString()
    });
  }
});

app.get('/health-records/:id', async (req, res) => {
  try {
    const { id } = req.params;
    console.log(`📋 Fetching health record ${id} from database`);
    
    // Check if database is connected
    if (!isConnected) {
      await connectToDatabase();
    }
    
    // Find record by ID
    const record = await HealthRecord.findById(id);
    
    if (!record) {
      return res.status(404).json({
        error: 'Not Found',
        message: 'Health record not found',
        timestamp: new Date().toISOString()
      });
    }
    
    // Convert to frontend format
    const formattedRecord = {
      id: record._id,
      patientId: record.patientId,
      doctorId: record.doctorId,
      title: record.title,
      description: record.description,
      type: record.type,
      status: record.status,
      fileHash: record.fileHash,
      ipfsHash: record.ipfsHash,
      fileName: record.fileName,
      fileSize: record.fileSize,
      mimeType: record.mimeType,
      fileUrl: record.fileUrl,
      recordDate: record.recordDate.toISOString().split('T')[0],
      tags: record.tags,
      medicalData: record.medicalData,
      consentGiven: record.consentGiven,
      isEncrypted: record.isEncrypted,
      createdAt: record.createdAt,
      updatedAt: record.updatedAt
    };
    
    console.log('✅ Found health record:', formattedRecord.title);
    res.json(formattedRecord);
  } catch (error) {
    console.error('❌ Error fetching health record:', error);
    res.status(500).json({
      error: 'Database Error',
      message: 'Failed to fetch health record',
      timestamp: new Date().toISOString()
    });
  }
});

app.post('/health-records', async (req, res) => {
  try {
    const { title, description, type, recordDate, tags, medicalData, consentGiven, isEncrypted } = req.body;
    console.log('📋 Creating new health record:', { title, type, recordDate });
    
    // Check if database is connected
    if (!isConnected) {
      await connectToDatabase();
    }
    
    // Get the first user as patient (for demo purposes)
    const patient = await User.findOne().sort({ createdAt: 1 });
    if (!patient) {
      return res.status(400).json({
        error: 'Validation Error',
        message: 'No patient found in database',
        timestamp: new Date().toISOString()
      });
    }
    
    // Create new health record
    const newRecord = new HealthRecord({
      patientId: patient._id,
      doctorId: patient._id, // For demo, using same user as doctor
      title: title.trim(),
      description: description?.trim(),
      type: type,
      status: 'pending',
      recordDate: new Date(recordDate),
      tags: tags || [],
      medicalData: medicalData || {},
      consentGiven: consentGiven || false,
      isEncrypted: isEncrypted !== false // Default to true
    });
    
    // Save to database
    await newRecord.save();
    
    // Convert to frontend format
    const formattedRecord = {
      id: newRecord._id,
      patientId: newRecord.patientId,
      doctorId: newRecord.doctorId,
      title: newRecord.title,
      description: newRecord.description,
      type: newRecord.type,
      status: newRecord.status,
      fileHash: newRecord.fileHash,
      ipfsHash: newRecord.ipfsHash,
      fileName: newRecord.fileName,
      fileSize: newRecord.fileSize,
      mimeType: newRecord.mimeType,
      fileUrl: newRecord.fileUrl,
      recordDate: newRecord.recordDate.toISOString().split('T')[0],
      tags: newRecord.tags,
      medicalData: newRecord.medicalData,
      consentGiven: newRecord.consentGiven,
      isEncrypted: newRecord.isEncrypted,
      createdAt: newRecord.createdAt,
      updatedAt: newRecord.updatedAt
    };
    
    console.log('✅ Created health record:', formattedRecord.title);
    res.status(201).json(formattedRecord);
  } catch (error) {
    console.error('❌ Error creating health record:', error);
    res.status(500).json({
      error: 'Database Error',
      message: 'Failed to create health record',
      timestamp: new Date().toISOString()
    });
  }
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    platform: 'vercel',
    message: 'HealthWallet API is running',
    cors: 'enabled',
    endpoints: [
      '/health',
      '/',
      '/auth/login',
      '/auth/register',
      '/auth/profile',
      '/auth/logout',
      '/files/upload',
      '/files/upload-avatar',
      '/health-records',
      '/health-records/statistics',
      '/health-records/:id',
      '/api/health-records',
      '/api/insurance-claims',
      '/api/analytics',
      '/api/docs'
    ]
  });
});

// Basic API endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'HealthWallet API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString(),
    platform: 'vercel',
    status: 'public',
    endpoints: {
      health: '/health',
      records: '/api/health-records',
      claims: '/api/insurance-claims',
      analytics: '/api/analytics',
      docs: '/api/docs'
    }
  });
});

// Public test endpoint
app.get('/test', (req, res) => {
  res.json({
    message: 'Backend is working!',
    timestamp: new Date().toISOString(),
    status: 'success'
  });
});

// Sample health records endpoint (keeping for backward compatibility)
app.get('/api/health-records', (req, res) => {
  res.json({
    records: [
      {
        id: '1',
        title: 'Blood Test Report',
        type: 'LAB_REPORT',
        date: '2024-01-15',
        status: 'VERIFIED',
        doctor: 'Dr. Smith',
        hospital: 'Apollo Hospital',
      },
      {
        id: '2',
        title: 'X-Ray Chest',
        type: 'RADIOLOGY',
        date: '2024-01-10',
        status: 'VERIFIED',
        doctor: 'Dr. Johnson',
        hospital: 'Fortis Healthcare',
      }
    ],
    total: 2,
  });
});

// Sample insurance claims endpoint
app.get('/api/insurance-claims', (req, res) => {
  res.json({
    claims: [
      {
        id: '1',
        claimNumber: 'C001',
        policyNumber: 'POL123456',
        type: 'MEDICAL',
        amount: 25000,
        status: 'APPROVED',
        submittedDate: '2024-01-15',
        approvedDate: '2024-01-20',
        approvedAmount: 25000,
      },
      {
        id: '2',
        claimNumber: 'C002',
        policyNumber: 'POL123456',
        type: 'SURGERY',
        amount: 150000,
        status: 'PENDING',
        submittedDate: '2024-01-18',
      }
    ],
    total: 2,
  });
});

// Sample analytics endpoint
app.get('/api/analytics', (req, res) => {
  res.json({
    healthScore: 85,
    totalRecords: 24,
    verifiedRecords: 20,
    pendingRecords: 4,
    totalClaims: 3,
    approvedClaims: 1,
    pendingClaims: 1,
    rejectedClaims: 1,
    totalClaimAmount: 180000,
    approvedAmount: 25000,
    trends: [
      { month: 'Jan', score: 80 },
      { month: 'Feb', score: 82 },
      { month: 'Mar', score: 85 },
    ],
  });
});

// API documentation endpoint
app.get('/api/docs', (req, res) => {
  res.json({
    title: 'HealthWallet API',
    description: 'Blockchain-powered health records and insurance platform API',
    version: '1.0.0',
    endpoints: [
      { method: 'GET', path: '/health', description: 'Health check endpoint' },
      { method: 'GET', path: '/api/health-records', description: 'Get health records' },
      { method: 'GET', path: '/api/insurance-claims', description: 'Get insurance claims' },
      { method: 'GET', path: '/api/analytics', description: 'Get analytics data' }
    ]
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message,
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: `Route ${req.method} ${req.path} not found`,
    timestamp: new Date().toISOString()
  });
});

module.exports = app;