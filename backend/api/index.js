const express = require('express');
const cors = require('cors');
const crypto = require('crypto');

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

// Mock user database with hashed passwords
const mockUsers = [
  {
    id: '1',
    firstName: 'Admin',
    lastName: 'User',
    email: 'admin@healthify.com',
    role: 'patient',
    avatar: null,
    password: hashEncryptedPassword(ADMIN_PASSWORD_SHA256), // Pre-hashed encrypted password
    createdAt: new Date().toISOString()
  }
];

// Authentication routes
app.post('/auth/login', (req, res) => {
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

  // Find user and verify password
  const user = mockUsers.find(u => u.email === email);
  if (user && verifyPassword(password, user.password)) {
    const { password: _, ...userWithoutPassword } = user; // Remove password from response
    const mockToken = 'mock-jwt-token-' + Date.now();
    
    return res.status(200).json({
      user: userWithoutPassword,
      accessToken: mockToken,
      message: 'Login successful'
    });
  }

  // Invalid credentials
  res.status(401).json({
    error: 'Authentication Error',
    message: 'Invalid email or password',
    timestamp: new Date().toISOString()
  });
});

app.post('/auth/register', (req, res) => {
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
  const existingUser = mockUsers.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({
      error: 'Validation Error',
      message: 'User with this email already exists',
      timestamp: new Date().toISOString()
    });
  }

  // Create new user with hashed encrypted password
  const hashedPassword = hashEncryptedPassword(password);
  const newUser = {
    id: Date.now().toString(),
    firstName,
    lastName,
    email,
    role,
    phone: phone || null,
    avatar: null,
    password: hashedPassword,
    createdAt: new Date().toISOString()
  };

  // Add to mock database
  mockUsers.push(newUser);

  const { password: _, ...userWithoutPassword } = newUser; // Remove password from response
  const mockToken = 'mock-jwt-token-' + Date.now();
  
  res.status(201).json({
    user: userWithoutPassword,
    accessToken: mockToken,
    message: 'Registration successful'
  });
});

app.get('/auth/profile', (req, res) => {
  // Mock profile - replace with real profile logic
  const mockUser = {
    id: '1',
    firstName: 'John',
    lastName: 'Doe',
    email: 'john.doe@example.com',
    role: 'patient',
    phone: '+1234567890',
    avatar: null,
    createdAt: new Date().toISOString()
  };
  
  res.status(200).json(mockUser);
});

app.post('/auth/logout', (req, res) => {
  // Mock logout - replace with real logout logic
  res.status(200).json({
    message: 'Logout successful',
    timestamp: new Date().toISOString()
  });
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
