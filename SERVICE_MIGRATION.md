# HealthWallet Service Migration Guide

This document outlines the complete migration from a monolithic backend to a microservices architecture for the HealthWallet patient application.

## 🏗️ Architecture Overview

### Before (Monolithic)
```
Frontend (React) → Backend (NestJS) → MongoDB
```

### After (Microservices)
```
Frontend (React) → API Gateway → Services → Databases
                                    ├── Auth Service → MongoDB
                                    ├── Profile Service → MongoDB  
                                    ├── Document Service → MongoDB + S3
                                    └── Timeline Service → MongoDB + Kafka
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+
- MongoDB (or use Docker)
- Kafka (or use Docker)

### 1. Deploy Services
```bash
cd services
./deploy.sh deploy
```

### 2. Update Frontend
```bash
cd frontend
npm install
npm run dev
```

### 3. Test Integration
```bash
# Check service health
curl http://localhost:3000/health

# Test auth endpoint
curl -X POST http://localhost:3000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'
```

## 📋 Service Details

### 1. API Gateway (Port 3000)
- **Purpose**: Single entry point for all API requests
- **Features**: 
  - Request routing to appropriate services
  - Rate limiting
  - JWT token validation
  - CORS handling
  - Health monitoring

### 2. Auth Service (Port 3001)
- **Purpose**: Authentication and user management
- **Endpoints**:
  - `POST /api/v1/auth/register` - User registration
  - `POST /api/v1/auth/login` - User login
  - `POST /api/v1/auth/google` - Google OAuth
  - `POST /api/v1/auth/phone-otp` - Phone OTP login
  - `POST /api/v1/auth/refresh` - Token refresh
  - `POST /api/v1/auth/logout` - User logout
  - `GET /api/v1/auth/me` - Get current user

### 3. Profile Service (Port 3002)
- **Purpose**: Patient profile management
- **Endpoints**:
  - `GET /api/v1/patients/{id}` - Get profile
  - `PUT /api/v1/patients/{id}` - Update profile
  - `POST /api/v1/patients/{id}/avatar` - Upload avatar
  - `POST /api/v1/patients/{id}/family` - Add family member
  - `PUT /api/v1/patients/{id}/family/{memberId}` - Update family member
  - `DELETE /api/v1/patients/{id}/family/{memberId}` - Delete family member
  - `PUT /api/v1/patients/{id}/preferences` - Update preferences

### 4. Document Service (Port 3003)
- **Purpose**: Document upload, storage, and verification
- **Endpoints**:
  - `POST /api/v1/documents/upload` - Upload document
  - `GET /api/v1/documents/{id}` - Get document metadata
  - `GET /api/v1/documents` - List user documents
  - `GET /api/v1/documents/{id}/download` - Download document
  - `POST /api/v1/documents/{id}/share` - Share document
  - `DELETE /api/v1/documents/{id}` - Delete document

### 5. Timeline Service (Port 3004)
- **Purpose**: Activity tracking and event aggregation
- **Endpoints**:
  - `GET /api/v1/timeline/{userId}` - Get user timeline
  - `GET /api/v1/timeline/{userId}/stats` - Get timeline statistics
  - `GET /api/v1/timeline/{userId}/search` - Search timeline
  - `POST /api/v1/timeline/events` - Create timeline event

## 🔧 Configuration

### Environment Variables

#### API Gateway
```env
NODE_ENV=development
PORT=3000
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-jwt-refresh-secret
AUTH_SERVICE_URL=http://auth-service:3001
PROFILE_SERVICE_URL=http://profile-service:3002
DOCUMENT_SERVICE_URL=http://document-service:3003
TIMELINE_SERVICE_URL=http://timeline-service:3004
FRONTEND_URL=http://localhost:3000
```

#### Auth Service
```env
NODE_ENV=development
PORT=3001
MONGODB_URI=mongodb://mongodb:27017/healthwallet_auth
JWT_SECRET=your-jwt-secret-key
JWT_REFRESH_SECRET=your-jwt-refresh-secret
FIREBASE_PROJECT_ID=your-firebase-project-id
FIREBASE_CLIENT_EMAIL=your-firebase-client-email
FIREBASE_PRIVATE_KEY=your-firebase-private-key
```

#### Profile Service
```env
NODE_ENV=development
PORT=3002
MONGODB_URI=mongodb://mongodb:27017/healthwallet_profiles
JWT_SECRET=your-jwt-secret-key
FRONTEND_URL=http://localhost:3000
```

#### Document Service
```env
NODE_ENV=development
PORT=3003
MONGODB_URI=mongodb://mongodb:27017/healthwallet_documents
JWT_SECRET=your-jwt-secret-key
FRONTEND_URL=http://localhost:3000
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
S3_BUCKET_NAME=healthwallet-documents
```

#### Timeline Service
```env
NODE_ENV=development
PORT=3004
MONGODB_URI=mongodb://mongodb:27017/healthwallet_timeline
JWT_SECRET=your-jwt-secret-key
FRONTEND_URL=http://localhost:3000
KAFKA_BROKER=kafka:9092
```

## 🗄️ Database Schema

### Auth Service Database
```javascript
// User collection
{
  _id: ObjectId,
  email: String,
  password: String, // hashed
  firstName: String,
  lastName: String,
  phone: String,
  role: String,
  status: String,
  emailVerified: Boolean,
  phoneVerified: Boolean,
  firebaseUid: String,
  avatar: String,
  // ... other fields
}

// Session collection
{
  _id: ObjectId,
  userId: ObjectId,
  refreshToken: String,
  expiresAt: Date,
  createdAt: Date
}
```

### Profile Service Database
```javascript
// Patient collection
{
  _id: ObjectId,
  userId: String, // Reference to auth service
  firstName: String,
  lastName: String,
  email: String,
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
    notifications: Boolean,
    dataSharing: Boolean,
    language: String,
    timezone: String
  },
  familyMembers: [{
    name: String,
    relationship: String,
    phone: String,
    email: String,
    isEmergencyContact: Boolean
  }],
  createdAt: Date,
  updatedAt: Date
}
```

### Document Service Database
```javascript
// Document collection
{
  _id: ObjectId,
  userId: String,
  originalName: String,
  fileName: String,
  fileType: String,
  fileSize: Number,
  mimeType: String,
  storagePath: String,
  sha256Hash: String,
  md5Hash: String,
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
    isVerified: Boolean,
    verifiedAt: Date,
    verificationMethod: String,
    blockchainTxId: String,
    ipfsHash: String
  },
  access: {
    isPublic: Boolean,
    sharedWith: [String],
    permissions: {
      view: Boolean,
      download: Boolean,
      share: Boolean
    }
  },
  tags: [String],
  category: String,
  status: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Timeline Service Database
```javascript
// TimelineEvent collection
{
  _id: ObjectId,
  userId: String,
  eventType: String,
  title: String,
  description: String,
  metadata: Object,
  severity: String,
  category: String,
  isPublic: Boolean,
  tags: [String],
  timestamp: Date,
  createdAt: Date
}
```

## 🔄 Migration Strategy

### Phase 1: Infrastructure Setup
1. Deploy microservices with Docker Compose
2. Set up monitoring and logging
3. Configure API Gateway routing
4. Test service health endpoints

### Phase 2: Frontend Integration
1. Update frontend API endpoints
2. Implement new service clients
3. Test authentication flow
4. Test profile management
5. Test document upload/download

### Phase 3: Data Migration
1. Export data from monolith
2. Transform data for new schema
3. Import data into service databases
4. Verify data integrity

### Phase 4: Cutover
1. Update DNS/routing to API Gateway
2. Monitor service performance
3. Handle any issues
4. Decommission monolith

## 🧪 Testing

### Unit Tests
```bash
# Test individual services
cd services/auth-service
npm test

cd services/profile-service
npm test

cd services/document-service
npm test

cd services/timeline-service
npm test
```

### Integration Tests
```bash
# Test API Gateway
curl http://localhost:3000/health

# Test service endpoints
curl http://localhost:3000/api/v1/auth/health
curl http://localhost:3000/api/v1/patients/health
curl http://localhost:3000/api/v1/documents/health
curl http://localhost:3000/api/v1/timeline/health
```

### Load Testing
```bash
# Install k6
npm install -g k6

# Run load tests
k6 run load-tests/auth-load-test.js
k6 run load-tests/document-load-test.js
```

## 📊 Monitoring

### Health Checks
- **API Gateway**: `http://localhost:3000/health`
- **Auth Service**: `http://localhost:3001/health`
- **Profile Service**: `http://localhost:3002/health`
- **Document Service**: `http://localhost:3003/health`
- **Timeline Service**: `http://localhost:3004/health`

### Service Status
```bash
# Check all services
./deploy.sh status

# Check service health
./deploy.sh health

# View logs
./deploy.sh logs
```

### Monitoring Dashboards
- **Prometheus**: `http://localhost:9090`
- **Grafana**: `http://localhost:3001` (admin/admin123)

## 🚨 Troubleshooting

### Common Issues

#### 1. Service Not Starting
```bash
# Check logs
docker-compose logs [service-name]

# Restart service
docker-compose restart [service-name]
```

#### 2. Database Connection Issues
```bash
# Check MongoDB
docker-compose logs mongodb

# Restart MongoDB
docker-compose restart mongodb
```

#### 3. Kafka Issues
```bash
# Check Kafka
docker-compose logs kafka

# Restart Kafka
docker-compose restart kafka zookeeper
```

#### 4. Frontend Connection Issues
```bash
# Check API Gateway
curl http://localhost:3000/health

# Check service routing
curl http://localhost:3000/api/v1/auth/health
```

### Performance Issues

#### 1. Slow Response Times
- Check database connections
- Monitor memory usage
- Check network latency

#### 2. High Memory Usage
- Check for memory leaks
- Optimize database queries
- Scale services horizontally

#### 3. Database Performance
- Check index usage
- Monitor query performance
- Optimize database schema

## 🔒 Security

### Authentication
- JWT tokens with expiration
- Refresh token rotation
- Secure token storage

### Authorization
- Role-based access control
- Resource-level permissions
- API endpoint protection

### Data Protection
- Encryption at rest
- Encryption in transit
- Secure file storage

### Audit Logging
- All API calls logged
- User actions tracked
- Security events monitored

## 📈 Scaling

### Horizontal Scaling
- Multiple service instances
- Load balancing
- Database sharding

### Vertical Scaling
- Increase memory/CPU
- Optimize database
- Cache frequently accessed data

### Auto-scaling
- Kubernetes deployment
- Auto-scaling policies
- Resource monitoring

## 🔄 Rollback Plan

### If Issues Occur
1. **Immediate**: Switch API Gateway routing back to monolith
2. **Short-term**: Fix service issues
3. **Long-term**: Re-deploy when ready

### Rollback Steps
```bash
# Stop microservices
./deploy.sh stop

# Start monolith
cd backend
npm start

# Update frontend API URL
# Change NEXT_PUBLIC_API_URL back to monolith
```

## 📚 Additional Resources

- [Docker Compose Documentation](https://docs.docker.com/compose/)
- [MongoDB Documentation](https://docs.mongodb.com/)
- [Kafka Documentation](https://kafka.apache.org/documentation/)
- [Prometheus Documentation](https://prometheus.io/docs/)
- [Grafana Documentation](https://grafana.com/docs/)

## 🤝 Support

For issues or questions:
1. Check the troubleshooting section
2. Review service logs
3. Check monitoring dashboards
4. Contact the development team
