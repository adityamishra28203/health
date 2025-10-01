# Hospital Service - Local Development

## 🏥 Overview

The Hospital Service is a microservice for managing hospital operations, user management, and patient linking in the SecureHealth platform.

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Docker and Docker Compose
- MongoDB (or use Docker)

### Local Development Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Environment Configuration**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start Dependencies (Docker)**
   ```bash
   docker-compose -f ../../docker-compose.local.yml up -d mongodb redis kafka
   ```

4. **Start Development Server**
   ```bash
   npm run start:dev
   ```

5. **Test the Service**
   ```bash
   node ../../scripts/test-hospital-service.js
   ```

## 📋 API Endpoints

### Hospital Management
- `POST /api/v1/hospitals` - Register new hospital
- `GET /api/v1/hospitals` - List hospitals
- `GET /api/v1/hospitals/{id}` - Get hospital details
- `PUT /api/v1/hospitals/{id}/verify` - Verify hospital
- `PUT /api/v1/hospitals/{id}/suspend` - Suspend hospital

### User Management
- `GET /api/v1/hospitals/{id}/users` - Get hospital users
- `POST /api/v1/hospitals/{id}/users` - Create hospital user

### Patient Management
- `POST /api/v1/hospitals/{id}/patients/search` - Search patients
- `POST /api/v1/hospitals/{id}/patients/{patientId}/link` - Link patient

### Document Management
- `GET /api/v1/hospitals/{id}/documents` - Get hospital documents
- `POST /api/v1/hospitals/{id}/documents` - Upload document

## 🔧 Development Commands

```bash
# Development
npm run start:dev

# Production build
npm run build
npm run start:prod

# Testing
npm run test
npm run test:e2e

# Linting
npm run lint

# Format code
npm run format
```

## 🏗️ Architecture

### Core Components

- **Hospital Service** - Main business logic
- **RBAC Service** - Role-based access control
- **Tenant Service** - Multi-tenant isolation
- **Kafka Service** - Event streaming
- **Encryption Service** - File encryption
- **Storage Service** - File storage management
- **Blockchain Service** - Blockchain integration

### Database Schemas

- **Hospital** - Hospital information and settings
- **HospitalUser** - User profiles and permissions
- **PatientLink** - Patient-hospital relationships
- **Tenant** - Multi-tenant configuration

## 🔐 Security Features

- JWT authentication
- Role-based access control (RBAC)
- Multi-tenant isolation
- File encryption (AES-256-GCM)
- Rate limiting
- Input validation
- Audit logging

## 📊 Monitoring

- Health check endpoint: `/health`
- Metrics endpoint: `/metrics`
- Swagger documentation: `/api/docs`

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Failed**
   ```bash
   # Check if MongoDB is running
   docker ps | grep mongodb
   
   # Restart MongoDB
   docker-compose -f ../../docker-compose.local.yml restart mongodb
   ```

2. **Kafka Connection Failed**
   ```bash
   # Check if Kafka is running
   docker ps | grep kafka
   
   # Restart Kafka
   docker-compose -f ../../docker-compose.local.yml restart kafka
   ```

3. **Port Already in Use**
   ```bash
   # Check what's using port 3003
   lsof -i :3003
   
   # Kill the process
   kill -9 <PID>
   ```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Service port | `3003` |
| `MONGODB_URI` | MongoDB connection string | `mongodb://localhost:27017/hospital-service` |
| `KAFKA_BROKERS` | Kafka broker addresses | `localhost:9092` |
| `JWT_SECRET` | JWT signing secret | `your-jwt-secret-key-here` |
| `ALLOWED_ORIGINS` | CORS allowed origins | `http://localhost:3000,http://localhost:3001` |

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details.
