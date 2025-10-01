const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { body, validationResult } = require('express-validator');
const winston = require('winston');
const multer = require('multer');
const sharp = require('sharp');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const AWS = require('aws-sdk');

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
    new winston.transports.File({ filename: 'logs/document-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/document-combined.log' })
  ]
});

const app = express();
const PORT = process.env.PORT || 3003;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthwallet_documents', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// AWS S3 configuration
const s3 = new AWS.S3({
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION || 'us-east-1'
});

// Document schema
const documentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  originalName: { type: String, required: true },
  fileName: { type: String, required: true },
  fileType: { type: String, required: true },
  fileSize: { type: Number, required: true },
  mimeType: { type: String, required: true },
  storagePath: { type: String, required: true },
  sha256Hash: { type: String, required: true, unique: true },
  md5Hash: { type: String, required: true },
  canonicalizedContent: String,
  extractedText: String,
  metadata: {
    title: String,
    author: String,
    subject: String,
    keywords: [String],
    creationDate: Date,
    modificationDate: Date,
    pageCount: Number,
    dimensions: {
      width: Number,
      height: Number
    }
  },
  verification: {
    isVerified: { type: Boolean, default: false },
    verifiedAt: Date,
    verificationMethod: String,
    blockchainTxId: String,
    ipfsHash: String
  },
  access: {
    isPublic: { type: Boolean, default: false },
    sharedWith: [String], // Array of user IDs
    permissions: {
      view: { type: Boolean, default: true },
      download: { type: Boolean, default: true },
      share: { type: Boolean, default: false }
    }
  },
  tags: [String],
  category: { type: String, default: 'general' },
  status: { type: String, default: 'active', enum: ['active', 'archived', 'deleted'] },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Document = mongoose.model('Document', documentSchema);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const documentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // limit each IP to 50 requests per windowMs
  message: 'Too many requests, please try again later.'
});

app.use(documentLimiter);
app.use(express.json({ limit: '50mb' }));

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|txt|rtf/;
    const extname = allowedTypes.test(file.originalname.toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only documents and images are allowed'), false);
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

// Utility functions
const generateHash = (buffer) => {
  return crypto.createHash('sha256').update(buffer).digest('hex');
};

const generateMD5 = (buffer) => {
  return crypto.createHash('md5').update(buffer).digest('hex');
};

const extractTextFromFile = async (buffer, mimeType) => {
  try {
    if (mimeType === 'application/pdf') {
      const data = await pdfParse(buffer);
      return data.text;
    } else if (mimeType.includes('wordprocessingml') || mimeType.includes('msword')) {
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (mimeType === 'text/plain') {
      return buffer.toString('utf8');
    }
    return '';
  } catch (error) {
    logger.error('Text extraction error:', error);
    return '';
  }
};

const canonicalizeContent = (text) => {
  // Remove extra whitespace, normalize line endings, convert to lowercase
  return text
    .replace(/\s+/g, ' ')
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .toLowerCase()
    .trim();
};

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'document-service',
    timestamp: new Date().toISOString()
  });
});

// Upload document
app.post('/upload', verifyToken, upload.single('document'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, buffer, mimetype, size } = req.file;
    const { title, category, tags } = req.body;

    // Generate hashes
    const sha256Hash = generateHash(buffer);
    const md5Hash = generateMD5(buffer);

    // Check if document already exists (duplicate detection)
    const existingDoc = await Document.findOne({ sha256Hash });
    if (existingDoc) {
      return res.status(409).json({ 
        error: 'Document already exists',
        documentId: existingDoc._id,
        message: 'This document has already been uploaded'
      });
    }

    // Extract text content
    const extractedText = await extractTextFromFile(buffer, mimetype);
    const canonicalizedContent = canonicalizeContent(extractedText);

    // Generate unique filename
    const fileExtension = originalname.split('.').pop();
    const fileName = `${req.userId}_${Date.now()}.${fileExtension}`;
    const storagePath = `documents/${req.userId}/${fileName}`;

    // Upload to S3 (or local storage in development)
    let fileUrl;
    if (process.env.NODE_ENV === 'production') {
      const uploadParams = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: storagePath,
        Body: buffer,
        ContentType: mimetype,
        Metadata: {
          userId: req.userId,
          originalName: originalname,
          sha256Hash,
          uploadedAt: new Date().toISOString()
        }
      };

      const s3Result = await s3.upload(uploadParams).promise();
      fileUrl = s3Result.Location;
    } else {
      // For development, store as base64
      fileUrl = `data:${mimetype};base64,${buffer.toString('base64')}`;
    }

    // Create document record
    const document = new Document({
      userId: req.userId,
      originalName: originalname,
      fileName,
      fileType: fileExtension,
      fileSize: size,
      mimeType: mimetype,
      storagePath,
      sha256Hash,
      md5Hash,
      canonicalizedContent,
      extractedText,
      metadata: {
        title: title || originalname,
        pageCount: mimetype === 'application/pdf' ? await getPdfPageCount(buffer) : 1
      },
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      category: category || 'general'
    });

    await document.save();

    // TODO: Trigger blockchain verification process
    // This would be handled by a separate blockchain service
    // For now, we'll simulate it
    setTimeout(async () => {
      try {
        document.verification.isVerified = true;
        document.verification.verifiedAt = new Date();
        document.verification.verificationMethod = 'blockchain';
        document.verification.blockchainTxId = `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        document.verification.ipfsHash = `ipfs_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        await document.save();
        
        logger.info(`Document verified: ${document._id}`);
      } catch (error) {
        logger.error('Verification error:', error);
      }
    }, 5000);

    logger.info(`Document uploaded: ${originalname} by user ${req.userId}`);

    res.status(201).json({
      message: 'Document uploaded successfully',
      document: {
        id: document._id,
        originalName: document.originalName,
        fileName: document.fileName,
        fileSize: document.fileSize,
        sha256Hash: document.sha256Hash,
        fileUrl,
        status: document.status,
        verification: document.verification,
        createdAt: document.createdAt
      }
    });
  } catch (error) {
    logger.error('Document upload error:', error);
    res.status(500).json({ error: 'Failed to upload document' });
  }
});

// Get document by ID
app.get('/:documentId', verifyToken, async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check access permissions
    if (document.userId !== req.userId && !document.access.isPublic) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      id: document._id,
      originalName: document.originalName,
      fileName: document.fileName,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      sha256Hash: document.sha256Hash,
      metadata: document.metadata,
      verification: document.verification,
      access: document.access,
      tags: document.tags,
      category: document.category,
      status: document.status,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt
    });
  } catch (error) {
    logger.error('Get document error:', error);
    res.status(500).json({ error: 'Failed to get document' });
  }
});

// Get user's documents
app.get('/', verifyToken, async (req, res) => {
  try {
    const { category, status, limit = 20, offset = 0 } = req.query;

    const query = { userId: req.userId };
    if (category) query.category = category;
    if (status) query.status = status;

    const documents = await Document.find(query)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .select('-canonicalizedContent -extractedText');

    const total = await Document.countDocuments(query);

    res.json({
      documents,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Get documents error:', error);
    res.status(500).json({ error: 'Failed to get documents' });
  }
});

// Download document
app.get('/:documentId/download', verifyToken, async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check access permissions
    if (document.userId !== req.userId && !document.access.isPublic) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // In production, this would stream from S3
    // For development, we'll return the base64 data
    if (process.env.NODE_ENV === 'production') {
      // Stream from S3
      const s3Params = {
        Bucket: process.env.S3_BUCKET_NAME,
        Key: document.storagePath
      };

      const s3Stream = s3.getObject(s3Params).createReadStream();
      res.setHeader('Content-Type', document.mimeType);
      res.setHeader('Content-Disposition', `attachment; filename="${document.originalName}"`);
      s3Stream.pipe(res);
    } else {
      // For development, return base64 data
      res.json({
        message: 'Download not implemented in development mode',
        document: {
          id: document._id,
          originalName: document.originalName,
          mimeType: document.mimeType,
          sha256Hash: document.sha256Hash
        }
      });
    }
  } catch (error) {
    logger.error('Download document error:', error);
    res.status(500).json({ error: 'Failed to download document' });
  }
});

// Share document
app.post('/:documentId/share', verifyToken, [
  body('sharedWith').isArray(),
  body('permissions').isObject()
], async (req, res) => {
  try {
    const { documentId } = req.params;
    const { sharedWith, permissions } = req.body;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check ownership
    if (document.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Update sharing settings
    document.access.sharedWith = sharedWith;
    document.access.permissions = { ...document.access.permissions, ...permissions };
    document.updatedAt = new Date();

    await document.save();

    logger.info(`Document shared: ${documentId} with ${sharedWith.length} users`);

    res.json({
      message: 'Document sharing updated successfully',
      access: document.access
    });
  } catch (error) {
    logger.error('Share document error:', error);
    res.status(500).json({ error: 'Failed to share document' });
  }
});

// Delete document
app.delete('/:documentId', verifyToken, async (req, res) => {
  try {
    const { documentId } = req.params;

    const document = await Document.findById(documentId);
    if (!document) {
      return res.status(404).json({ error: 'Document not found' });
    }

    // Check ownership
    if (document.userId !== req.userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    // Soft delete
    document.status = 'deleted';
    document.updatedAt = new Date();
    await document.save();

    logger.info(`Document deleted: ${documentId} by user ${req.userId}`);

    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    logger.error('Delete document error:', error);
    res.status(500).json({ error: 'Failed to delete document' });
  }
});

// Helper function to get PDF page count
const getPdfPageCount = async (buffer) => {
  try {
    const data = await pdfParse(buffer);
    return data.numpages || 1;
  } catch (error) {
    return 1;
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Document service error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, () => {
  logger.info(`Document service running on port ${PORT}`);
});

module.exports = app;
