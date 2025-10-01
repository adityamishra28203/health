const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
const { body, validationResult } = require('express-validator');
const winston = require('winston');
const { Kafka } = require('kafkajs');

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
    new winston.transports.File({ filename: 'logs/timeline-error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/timeline-combined.log' })
  ]
});

const app = express();
const PORT = process.env.PORT || 3004;

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthwallet_timeline', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Kafka configuration
const kafka = new Kafka({
  clientId: 'timeline-service',
  brokers: [process.env.KAFKA_BROKER || 'localhost:9092']
});

const producer = kafka.producer();
const consumer = kafka.consumer({ groupId: 'timeline-service-group' });

// Timeline Event schema
const timelineEventSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  eventType: { 
    type: String, 
    required: true,
    enum: [
      'document.uploaded',
      'document.shared',
      'document.verified',
      'profile.updated',
      'family.member.added',
      'consent.granted',
      'consent.revoked',
      'login',
      'logout',
      'password.changed',
      'avatar.updated'
    ]
  },
  title: { type: String, required: true },
  description: String,
  metadata: {
    documentId: String,
    documentName: String,
    documentHash: String,
    sharedWith: [String],
    consentId: String,
    consentType: String,
    familyMemberName: String,
    ipAddress: String,
    userAgent: String,
    location: {
      country: String,
      city: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    }
  },
  severity: { 
    type: String, 
    default: 'info',
    enum: ['info', 'warning', 'error', 'critical']
  },
  category: { 
    type: String, 
    default: 'general',
    enum: ['general', 'security', 'medical', 'sharing', 'profile']
  },
  isPublic: { type: Boolean, default: false },
  tags: [String],
  timestamp: { type: Date, default: Date.now, index: true },
  createdAt: { type: Date, default: Date.now }
});

const TimelineEvent = mongoose.model('TimelineEvent', timelineEventSchema);

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const timelineLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 200, // limit each IP to 200 requests per windowMs
  message: 'Too many requests, please try again later.'
});

app.use(timelineLimiter);
app.use(express.json({ limit: '10mb' }));

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

// Event creation helper
const createEvent = async (eventData) => {
  try {
    const event = new TimelineEvent(eventData);
    await event.save();

    // Publish event to Kafka for other services
    await producer.send({
      topic: 'timeline-events',
      messages: [{
        key: eventData.userId,
        value: JSON.stringify({
          eventId: event._id,
          userId: eventData.userId,
          eventType: eventData.eventType,
          timestamp: event.timestamp,
          metadata: eventData.metadata
        })
      }]
    });

    logger.info(`Timeline event created: ${eventData.eventType} for user ${eventData.userId}`);
    return event;
  } catch (error) {
    logger.error('Event creation error:', error);
    throw error;
  }
};

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'timeline-service',
    timestamp: new Date().toISOString()
  });
});

// Get user timeline
app.get('/:userId', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { 
      eventType, 
      category, 
      severity, 
      startDate, 
      endDate, 
      limit = 50, 
      offset = 0 
    } = req.query;

    // Verify the user can access this timeline
    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const query = { userId };
    
    if (eventType) query.eventType = eventType;
    if (category) query.category = category;
    if (severity) query.severity = severity;
    
    if (startDate || endDate) {
      query.timestamp = {};
      if (startDate) query.timestamp.$gte = new Date(startDate);
      if (endDate) query.timestamp.$lte = new Date(endDate);
    }

    const events = await TimelineEvent.find(query)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await TimelineEvent.countDocuments(query);

    // Group events by date for better organization
    const groupedEvents = events.reduce((acc, event) => {
      const date = event.timestamp.toISOString().split('T')[0];
      if (!acc[date]) {
        acc[date] = [];
      }
      acc[date].push(event);
      return acc;
    }, {});

    res.json({
      events: groupedEvents,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      },
      summary: {
        totalEvents: total,
        eventTypes: await TimelineEvent.distinct('eventType', { userId }),
        categories: await TimelineEvent.distinct('category', { userId }),
        dateRange: {
          start: events.length > 0 ? events[events.length - 1].timestamp : null,
          end: events.length > 0 ? events[0].timestamp : null
        }
      }
    });
  } catch (error) {
    logger.error('Get timeline error:', error);
    res.status(500).json({ error: 'Failed to get timeline' });
  }
});

// Create timeline event (for internal service calls)
app.post('/events', verifyToken, [
  body('eventType').notEmpty(),
  body('title').notEmpty(),
  body('description').optional(),
  body('metadata').optional().isObject(),
  body('severity').optional().isIn(['info', 'warning', 'error', 'critical']),
  body('category').optional().isIn(['general', 'security', 'medical', 'sharing', 'profile'])
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const eventData = {
      userId: req.userId,
      ...req.body,
      timestamp: new Date()
    };

    const event = await createEvent(eventData);

    res.status(201).json({
      message: 'Timeline event created successfully',
      event: {
        id: event._id,
        eventType: event.eventType,
        title: event.title,
        timestamp: event.timestamp
      }
    });
  } catch (error) {
    logger.error('Create event error:', error);
    res.status(500).json({ error: 'Failed to create timeline event' });
  }
});

// Get event statistics
app.get('/:userId/stats', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { period = '30d' } = req.query;

    // Verify the user can access this timeline
    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    let startDate;
    switch (period) {
      case '7d':
        startDate = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        break;
      case '30d':
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        break;
      case '90d':
        startDate = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);
        break;
      default:
        startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    }

    const stats = await TimelineEvent.aggregate([
      {
        $match: {
          userId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          eventTypes: { $addToSet: '$eventType' },
          categories: { $addToSet: '$category' },
          severities: { $addToSet: '$severity' },
          avgEventsPerDay: {
            $avg: {
              $divide: [
                { $subtract: ['$timestamp', startDate] },
                1000 * 60 * 60 * 24
              ]
            }
          }
        }
      }
    ]);

    const eventTypeStats = await TimelineEvent.aggregate([
      {
        $match: {
          userId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    const categoryStats = await TimelineEvent.aggregate([
      {
        $match: {
          userId,
          timestamp: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: '$category',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({
      period,
      startDate,
      endDate: new Date(),
      summary: stats[0] || {
        totalEvents: 0,
        eventTypes: [],
        categories: [],
        severities: [],
        avgEventsPerDay: 0
      },
      eventTypeBreakdown: eventTypeStats,
      categoryBreakdown: categoryStats
    });
  } catch (error) {
    logger.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get timeline statistics' });
  }
});

// Search timeline events
app.get('/:userId/search', verifyToken, async (req, res) => {
  try {
    const { userId } = req.params;
    const { q, limit = 20, offset = 0 } = req.query;

    // Verify the user can access this timeline
    if (req.userId !== userId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    if (!q) {
      return res.status(400).json({ error: 'Search query required' });
    }

    const searchQuery = {
      userId,
      $or: [
        { title: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
        { tags: { $in: [new RegExp(q, 'i')] } },
        { 'metadata.documentName': { $regex: q, $options: 'i' } }
      ]
    };

    const events = await TimelineEvent.find(searchQuery)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset));

    const total = await TimelineEvent.countDocuments(searchQuery);

    res.json({
      query: q,
      events,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + parseInt(limit)
      }
    });
  } catch (error) {
    logger.error('Search timeline error:', error);
    res.status(500).json({ error: 'Failed to search timeline' });
  }
});

// Kafka consumer setup for listening to events from other services
const startKafkaConsumer = async () => {
  try {
    await consumer.connect();
    await consumer.subscribe({ topic: 'document-events', fromBeginning: false });
    await consumer.subscribe({ topic: 'profile-events', fromBeginning: false });
    await consumer.subscribe({ topic: 'auth-events', fromBeginning: false });

    await consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const eventData = JSON.parse(message.value.toString());
          
          // Create timeline event based on the service event
          let timelineEvent = {
            userId: eventData.userId,
            timestamp: new Date(eventData.timestamp || Date.now()),
            metadata: eventData.metadata || {}
          };

          switch (topic) {
            case 'document-events':
              timelineEvent.eventType = eventData.eventType || 'document.uploaded';
              timelineEvent.title = `Document ${eventData.action || 'processed'}`;
              timelineEvent.description = `Document "${eventData.documentName}" was ${eventData.action || 'processed'}`;
              timelineEvent.category = 'medical';
              timelineEvent.metadata.documentId = eventData.documentId;
              timelineEvent.metadata.documentName = eventData.documentName;
              break;

            case 'profile-events':
              timelineEvent.eventType = eventData.eventType || 'profile.updated';
              timelineEvent.title = `Profile ${eventData.action || 'updated'}`;
              timelineEvent.description = `Profile information was ${eventData.action || 'updated'}`;
              timelineEvent.category = 'profile';
              break;

            case 'auth-events':
              timelineEvent.eventType = eventData.eventType || 'login';
              timelineEvent.title = `Authentication ${eventData.action || 'event'}`;
              timelineEvent.description = `User ${eventData.action || 'authenticated'}`;
              timelineEvent.category = 'security';
              timelineEvent.metadata.ipAddress = eventData.ipAddress;
              break;
          }

          await createEvent(timelineEvent);
        } catch (error) {
          logger.error('Kafka message processing error:', error);
        }
      }
    });

    logger.info('Kafka consumer started successfully');
  } catch (error) {
    logger.error('Kafka consumer error:', error);
  }
};

// Initialize Kafka producer
const startKafkaProducer = async () => {
  try {
    await producer.connect();
    logger.info('Kafka producer connected successfully');
  } catch (error) {
    logger.error('Kafka producer error:', error);
  }
};

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error('Timeline service error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start services
app.listen(PORT, async () => {
  logger.info(`Timeline service running on port ${PORT}`);
  
  // Start Kafka services
  await startKafkaProducer();
  await startKafkaConsumer();
});

module.exports = app;
