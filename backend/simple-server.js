const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:8081'],
  credentials: true,
}));
app.use(express.json());

// Sample data
const sampleHealthRecords = [
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
  },
  {
    id: '3',
    title: 'ECG Report',
    type: 'DIAGNOSTIC',
    date: '2024-01-05',
    status: 'PENDING',
    doctor: 'Dr. Brown',
    hospital: 'Max Hospital',
  },
];

const sampleInsuranceClaims = [
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
  },
  {
    id: '3',
    claimNumber: 'C003',
    policyNumber: 'POL123456',
    type: 'MEDICAL',
    amount: 5000,
    status: 'REJECTED',
    submittedDate: '2024-01-10',
    rejectionReason: 'Insufficient documentation',
  },
];

const sampleAnalytics = {
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
};

// Routes
app.get('/', (req, res) => {
  res.json({
    message: 'HealthWallet API is running!',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      healthRecords: '/api/health-records',
      insuranceClaims: '/api/insurance-claims',
      analytics: '/api/analytics',
      login: 'POST /api/auth/login',
      register: 'POST /api/auth/register',
    },
  });
});

app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    service: 'HealthWallet API',
    version: '1.0.0',
  });
});

app.get('/api/health-records', (req, res) => {
  res.json({
    records: sampleHealthRecords,
    total: sampleHealthRecords.length,
  });
});

app.get('/api/insurance-claims', (req, res) => {
  res.json({
    claims: sampleInsuranceClaims,
    total: sampleInsuranceClaims.length,
  });
});

app.get('/api/analytics', (req, res) => {
  res.json(sampleAnalytics);
});

app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  // Simulate login
  res.json({
    success: true,
    token: 'jwt_token_' + Date.now(),
    user: {
      id: '1',
      email: email,
      name: 'John Doe',
      role: 'PATIENT',
    },
  });
});

app.post('/api/auth/register', (req, res) => {
  const { email, name, password } = req.body;
  
  // Simulate registration
  res.json({
    success: true,
    message: 'User registered successfully',
    user: {
      id: '2',
      email: email,
      name: name,
      role: 'PATIENT',
    },
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 HealthWallet API is running on: http://localhost:${PORT}`);
  console.log(`📊 Health Records: http://localhost:${PORT}/api/health-records`);
  console.log(`💳 Insurance Claims: http://localhost:${PORT}/api/insurance-claims`);
  console.log(`📈 Analytics: http://localhost:${PORT}/api/analytics`);
});
