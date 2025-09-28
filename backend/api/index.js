const express = require('express');
const cors = require('cors');

// Import authentication routes
const googleSignup = require('./auth/google-signup');
const googleLogin = require('./auth/google-login');
const sendOtp = require('./auth/send-otp');
const verifyOtpSignup = require('./auth/verify-otp-signup');
const verifyOtpLogin = require('./auth/verify-otp-login');

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

// Authentication routes
app.use('/auth', googleSignup);
app.use('/auth', googleLogin);
app.use('/auth', sendOtp);
app.use('/auth', verifyOtpSignup);
app.use('/auth', verifyOtpLogin);

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

// Sample health records endpoint
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
