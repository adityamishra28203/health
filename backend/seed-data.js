const express = require('express');
const app = express();

// Sample data for testing
const sampleUsers = [
  {
    id: '1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    role: 'patient',
    status: 'active',
    aadhaarNumber: '123456789012',
    phoneNumber: '+91-9876543210'
  },
  {
    id: '2',
    email: 'dr.smith@apollohospital.com',
    name: 'Dr. Smith',
    role: 'doctor',
    status: 'active',
    specialization: 'Cardiology',
    hospitalId: 'apollo-001'
  },
  {
    id: '3',
    email: 'admin@healthwallet.com',
    name: 'Admin User',
    role: 'admin',
    status: 'active'
  }
];

const sampleHealthRecords = [
  {
    id: '1',
    patientId: '1',
    hospitalId: 'apollo-001',
    doctorName: 'Dr. Smith',
    date: '2025-01-15',
    recordType: 'prescription',
    description: 'Blood pressure medication prescription',
    fileHash: 'abc123def456',
    digitalSignature: 'signature_hash_1',
    isVerified: true,
    tags: ['cardiology', 'medication']
  },
  {
    id: '2',
    patientId: '1',
    hospitalId: 'apollo-001',
    doctorName: 'Dr. Smith',
    date: '2025-01-20',
    recordType: 'test_result',
    description: 'Blood test results - Cholesterol levels',
    fileHash: 'def456ghi789',
    digitalSignature: 'signature_hash_2',
    isVerified: true,
    tags: ['lab_test', 'cholesterol']
  }
];

const sampleInsuranceClaims = [
  {
    id: '1',
    patientId: '1',
    insurerId: 'bajaj-allianz',
    policyNumber: 'BA-123456',
    claimAmount: 15000,
    healthRecordId: '1',
    description: 'Blood pressure medication claim',
    status: 'approved',
    submissionDate: '2025-01-16',
    approvalDate: '2025-01-18'
  },
  {
    id: '2',
    patientId: '1',
    insurerId: 'bajaj-allianz',
    policyNumber: 'BA-123456',
    claimAmount: 2500,
    healthRecordId: '2',
    description: 'Blood test claim',
    status: 'pending',
    submissionDate: '2025-01-21'
  }
];

// API endpoints for sample data
app.get('/api/users', (req, res) => {
  res.json(sampleUsers);
});

app.get('/api/health-records', (req, res) => {
  res.json(sampleHealthRecords);
});

app.get('/api/insurance-claims', (req, res) => {
  res.json(sampleInsuranceClaims);
});

app.get('/api/analytics/health-score/:userId', (req, res) => {
  const { userId } = req.params;
  res.json({
    userId,
    healthScore: 85,
    lastUpdated: new Date().toISOString()
  });
});

app.get('/api/analytics/records-summary/:userId', (req, res) => {
  const { userId } = req.params;
  res.json({
    userId,
    totalRecords: 12,
    last30Days: 3,
    recordTypes: {
      prescriptions: 5,
      testResults: 4,
      dischargeSummaries: 3
    }
  });
});

app.get('/api/analytics/claim-trends/:insurerId', (req, res) => {
  const { insurerId } = req.params;
  res.json({
    insurerId,
    totalClaims: 120,
    approved: 80,
    pending: 25,
    rejected: 15,
    monthlyTrend: [
      { month: 'Jan', claims: 10 },
      { month: 'Feb', claims: 12 },
      { month: 'Mar', claims: 15 }
    ]
  });
});

// Authentication endpoints
app.post('/api/auth/login', (req, res) => {
  res.json({
    success: true,
    token: 'sample_jwt_token_123',
    user: sampleUsers[0]
  });
});

app.post('/api/auth/register', (req, res) => {
  res.json({
    success: true,
    message: 'User registered successfully',
    user: {
      id: '4',
      email: 'newuser@example.com',
      name: 'New User',
      role: 'patient',
      status: 'active'
    }
  });
});

// File upload endpoint
app.post('/api/file-storage/upload', (req, res) => {
  res.json({
    success: true,
    fileHash: 'new_file_hash_123',
    url: 'https://example.com/storage/new_file_hash_123'
  });
});

// Notifications endpoint
app.get('/api/notifications/:userId', (req, res) => {
  const { userId } = req.params;
  res.json([
    {
      id: '1',
      message: 'Your insurance claim #123 is approved!',
      type: 'success',
      date: new Date().toISOString()
    },
    {
      id: '2',
      message: 'New health record from Apollo Hospital.',
      type: 'info',
      date: new Date().toISOString()
    }
  ]);
});

// Admin endpoints
app.get('/api/admin/users', (req, res) => {
  res.json(sampleUsers);
});

app.get('/api/admin/health-records', (req, res) => {
  res.json(sampleHealthRecords);
});

app.get('/api/admin/insurance-claims', (req, res) => {
  res.json(sampleInsuranceClaims);
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Sample data API server running on port ${PORT}`);
  console.log('Available endpoints:');
  console.log('- GET /api/users');
  console.log('- GET /api/health-records');
  console.log('- GET /api/insurance-claims');
  console.log('- GET /api/analytics/health-score/:userId');
  console.log('- GET /api/analytics/records-summary/:userId');
  console.log('- GET /api/analytics/claim-trends/:insurerId');
  console.log('- POST /api/auth/login');
  console.log('- POST /api/auth/register');
  console.log('- POST /api/file-storage/upload');
  console.log('- GET /api/notifications/:userId');
  console.log('- GET /api/admin/users');
  console.log('- GET /api/admin/health-records');
  console.log('- GET /api/admin/insurance-claims');
});
