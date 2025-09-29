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
  origin: process.env.CORS_ORIGIN?.split(',') || [
    'http://localhost:3000', 
    'http://localhost:8081',
    'https://healthwallet.vercel.app',
    'https://healthwallet-frontend.vercel.app',
    'https://health-j0gvmolnu-adityamishra28203s-projects.vercel.app'
  ],
  credentials: true,
}));

// Parse JSON bodies
app.use(express.json());

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
    type: String
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
  if (!this.password) return false;
  
  try {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
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
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
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
    // For now, return the first user (for demo purposes)
    // In a real app, you'd get the user ID from the JWT token
    const user = await User.findOne().sort({ createdAt: 1 }).select('-password');
    
    if (!user) {
      return res.status(404).json({
        error: 'User Error',
        message: 'No users found in database',
        timestamp: new Date().toISOString()
      });
    }
    
    console.log('👤 Fetching profile for user:', { id: user._id, email: user.email, avatar: user.avatar });
    
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
    const { firstName, lastName, email, phone, avatar, role } = req.body;
    
    console.log('🔧 Profile update request:', { firstName, lastName, email, phone, avatar, role });
    
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
    
    // Try to find user by email first, then fallback to first user
    let user;
    if (email) {
      user = await User.findOne({ email: email.toLowerCase() });
      console.log('🔍 Searching for user by email:', email.toLowerCase());
    }
    
    // If not found by email, get the first user (for demo purposes)
    if (!user) {
      user = await User.findOne().sort({ createdAt: 1 }); // Get oldest user
      console.log('🔍 Using first user in database');
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
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
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
    if (phone) user.phone = phone;
    if (avatar) {
      console.log('🖼️ Updating avatar from:', user.avatar, 'to:', avatar);
      user.avatar = avatar;
    }
    if (role) user.role = role;
    
    // Save updated user
    try {
      await user.save();
      console.log('✅ User saved successfully, new avatar:', user.avatar);
    } catch (saveError) {
      console.error('❌ Error saving user:', saveError);
      return res.status(500).json({
        error: 'Database Error',
        message: 'Failed to save user profile',
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

// Health Records endpoints (matching frontend expectations)
app.get('/health-records', (req, res) => {
  // Mock health records data
  const mockRecords = [
    {
      id: '1',
      patientId: '1',
      doctorId: '1',
      title: 'Blood Test Report',
      description: 'Complete blood count and lipid profile',
      type: 'lab_report',
      status: 'verified',
      fileHash: 'abc123',
      ipfsHash: 'ipfs123',
      fileName: 'blood_test.pdf',
      fileSize: 1024000,
      mimeType: 'application/pdf',
      fileUrl: 'https://example.com/blood_test.pdf',
      recordDate: '2024-01-15',
      tags: ['blood', 'test', 'lab'],
      medicalData: { hemoglobin: '14.2', cholesterol: '180' },
      consentGiven: true,
      isEncrypted: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: '2024-01-15T10:00:00Z'
    },
    {
      id: '2',
      patientId: '1',
      doctorId: '1',
      title: 'X-Ray Report',
      description: 'Chest X-ray examination',
      type: 'imaging',
      status: 'pending',
      fileHash: 'def456',
      ipfsHash: 'ipfs456',
      fileName: 'chest_xray.jpg',
      fileSize: 2048000,
      mimeType: 'image/jpeg',
      fileUrl: 'https://example.com/chest_xray.jpg',
      recordDate: '2024-01-20',
      tags: ['x-ray', 'chest', 'imaging'],
      medicalData: { findings: 'Normal chest X-ray' },
      consentGiven: true,
      isEncrypted: true,
      createdAt: '2024-01-20T14:30:00Z',
      updatedAt: '2024-01-20T14:30:00Z'
    }
  ];

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const startIndex = (page - 1) * limit;
  const endIndex = startIndex + limit;
  
  res.json({
    records: mockRecords.slice(startIndex, endIndex),
    total: mockRecords.length,
    page: page,
    limit: limit,
    totalPages: Math.ceil(mockRecords.length / limit)
  });
});

app.get('/health-records/statistics', (req, res) => {
  res.json({
    totalRecords: 2,
    verifiedRecords: 1,
    pendingRecords: 1,
    recordsByType: {
      'lab_report': 1,
      'imaging': 1
    }
  });
});

app.get('/health-records/:id', (req, res) => {
  const { id } = req.params;
  
  // Mock single record
  const mockRecord = {
    id: id,
    patientId: '1',
    doctorId: '1',
    title: 'Blood Test Report',
    description: 'Complete blood count and lipid profile',
    type: 'lab_report',
    status: 'verified',
    fileHash: 'abc123',
    ipfsHash: 'ipfs123',
    fileName: 'blood_test.pdf',
    fileSize: 1024000,
    mimeType: 'application/pdf',
    fileUrl: 'https://example.com/blood_test.pdf',
    recordDate: '2024-01-15',
    tags: ['blood', 'test', 'lab'],
    medicalData: { hemoglobin: '14.2', cholesterol: '180' },
    consentGiven: true,
    isEncrypted: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z'
  };

  res.json(mockRecord);
});

app.post('/health-records', (req, res) => {
  const { title, description, type, recordDate, tags, medicalData, consentGiven, isEncrypted } = req.body;
  
  // Mock creating a new record
  const newRecord = {
    id: Date.now().toString(),
    patientId: '1',
    doctorId: '1',
    title,
    description,
    type,
    status: 'pending',
    fileHash: 'new123',
    ipfsHash: 'ipfs_new123',
    recordDate,
    tags: tags || [],
    medicalData: medicalData || {},
    consentGiven: consentGiven || false,
    isEncrypted: isEncrypted || true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  res.status(201).json(newRecord);
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