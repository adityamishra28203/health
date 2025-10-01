const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');
const morgan = require('morgan');
const jwt = require('jsonwebtoken');
const winston = require('winston');

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
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' })
  ]
});

const app = express();
const PORT = process.env.PORT || 3000;

// Service registry
const services = {
  auth: {
    url: process.env.AUTH_SERVICE_URL || 'http://localhost:3001',
    health: '/health'
  },
  profile: {
    url: process.env.PROFILE_SERVICE_URL || 'http://localhost:3002',
    health: '/health'
  },
  document: {
    url: process.env.DOCUMENT_SERVICE_URL || 'http://localhost:3003',
    health: '/health'
  },
  timeline: {
    url: process.env.TIMELINE_SERVICE_URL || 'http://localhost:3004',
    health: '/health'
  }
};

// Middleware
app.use(compression());
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// CORS configuration
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      'http://localhost:3000',
      'http://localhost:3001',
      'http://localhost:3002',
      process.env.FRONTEND_URL
    ].filter(Boolean);
    
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use(limiter);

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// JWT verification middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid token' });
  }
};

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    services: Object.keys(services)
  });
});

// Service health checks
app.get('/services/health', async (req, res) => {
  const healthStatus = {};
  
  for (const [serviceName, service] of Object.entries(services)) {
    try {
      const axios = require('axios');
      const response = await axios.get(`${service.url}${service.health}`, { timeout: 5000 });
      healthStatus[serviceName] = {
        status: 'healthy',
        responseTime: response.headers['x-response-time'] || 'unknown'
      };
    } catch (error) {
      healthStatus[serviceName] = {
        status: 'unhealthy',
        error: error.message
      };
    }
  }
  
  res.json(healthStatus);
});

// API Routes with service routing
app.use('/api/v1/auth', createProxyMiddleware({
  target: services.auth.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/auth': ''
  },
  onError: (err, req, res) => {
    logger.error('Auth service proxy error:', err);
    res.status(502).json({ error: 'Auth service unavailable' });
  }
}));

app.use('/api/v1/patients', verifyToken, createProxyMiddleware({
  target: services.profile.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/patients': ''
  },
  onError: (err, req, res) => {
    logger.error('Profile service proxy error:', err);
    res.status(502).json({ error: 'Profile service unavailable' });
  }
}));

app.use('/api/v1/documents', verifyToken, createProxyMiddleware({
  target: services.document.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/documents': ''
  },
  onError: (err, req, res) => {
    logger.error('Document service proxy error:', err);
    res.status(502).json({ error: 'Document service unavailable' });
  }
}));

app.use('/api/v1/timeline', verifyToken, createProxyMiddleware({
  target: services.timeline.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/v1/timeline': ''
  },
  onError: (err, req, res) => {
    logger.error('Timeline service proxy error:', err);
    res.status(502).json({ error: 'Timeline service unavailable' });
  }
}));

// Legacy API support (redirect to new services)
app.use('/api/auth', (req, res, next) => {
  req.url = req.url.replace('/api/auth', '/api/v1/auth');
  next();
}, createProxyMiddleware({
  target: services.auth.url,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': ''
  }
}));

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Gateway error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

app.listen(PORT, () => {
  logger.info(`API Gateway running on port ${PORT}`);
  logger.info('Service endpoints:');
  Object.entries(services).forEach(([name, service]) => {
    logger.info(`  ${name}: ${service.url}`);
  });
});

module.exports = app;
