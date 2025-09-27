# HealthWallet API Documentation

This document provides comprehensive API documentation for the HealthWallet backend service.

## Base URL

- **Development**: `http://localhost:3001`
- **Production**: `https://api.healthwallet.com`

## Authentication

All protected endpoints require a JWT token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## API Endpoints

### Authentication

#### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890",
  "aadhaarNumber": "123456789012",
  "role": "patient"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "patient"
    },
    "token": "jwt_token_here"
  }
}
```

#### Login User
```http
POST /auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "patient"
    },
    "token": "jwt_token_here"
  }
}
```

### Health Records

#### Get User's Health Records
```http
GET /health-records
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "record_id",
      "patientId": "user_id",
      "title": "Blood Test Results",
      "description": "Complete blood count",
      "fileHash": "ipfs_hash",
      "fileUrl": "https://ipfs.io/ipfs/hash",
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Health Record
```http
POST /health-records
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "title": "Blood Test Results",
  "description": "Complete blood count",
  "file": <file_upload>
}
```

**Response:**
```json
{
  "success": true,
  "message": "Health record created successfully",
  "data": {
    "id": "record_id",
    "patientId": "user_id",
    "title": "Blood Test Results",
    "description": "Complete blood count",
    "fileHash": "ipfs_hash",
    "fileUrl": "https://ipfs.io/ipfs/hash",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

#### Get Health Record by ID
```http
GET /health-records/:id
Authorization: Bearer <token>
```

#### Update Health Record
```http
PUT /health-records/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated description"
}
```

#### Delete Health Record
```http
DELETE /health-records/:id
Authorization: Bearer <token>
```

### Insurance Claims

#### Get User's Insurance Claims
```http
GET /insurance/claims
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "claim_id",
      "patientId": "user_id",
      "policyNumber": "POL123456",
      "claimAmount": 5000,
      "status": "PENDING",
      "description": "Medical treatment claim",
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### Create Insurance Claim
```http
POST /insurance/claims
Authorization: Bearer <token>
Content-Type: application/json

{
  "policyNumber": "POL123456",
  "claimAmount": 5000,
  "description": "Medical treatment claim",
  "healthRecordIds": ["record_id_1", "record_id_2"]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Insurance claim created successfully",
  "data": {
    "id": "claim_id",
    "patientId": "user_id",
    "policyNumber": "POL123456",
    "claimAmount": 5000,
    "status": "PENDING",
    "description": "Medical treatment claim",
    "createdAt": "2025-01-01T00:00:00Z"
  }
}
```

#### Update Claim Status (Admin only)
```http
PUT /insurance/claims/:id/status
Authorization: Bearer <admin_token>
Content-Type: application/json

{
  "status": "APPROVED",
  "notes": "Claim approved after verification"
}
```

### File Storage

#### Upload File
```http
POST /file-storage/upload
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "file": <file_upload>
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "fileId": "file_id",
    "fileName": "document.pdf",
    "fileSize": 1024000,
    "fileHash": "sha256_hash",
    "ipfsHash": "ipfs_hash",
    "fileUrl": "https://ipfs.io/ipfs/hash"
  }
}
```

#### Verify File
```http
POST /file-storage/verify
Authorization: Bearer <token>
Content-Type: multipart/form-data

{
  "fileHash": "sha256_hash",
  "file": <file_upload>
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "message": "File verification successful"
  }
}
```

### Notifications

#### Get User Notifications
```http
GET /notifications
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": "notification_id",
      "userId": "user_id",
      "title": "New Health Record Added",
      "message": "Your blood test results have been uploaded",
      "type": "INFO",
      "isRead": false,
      "createdAt": "2025-01-01T00:00:00Z"
    }
  ]
}
```

#### Mark Notification as Read
```http
PUT /notifications/:id/read
Authorization: Bearer <token>
```

#### Send Notification
```http
POST /notifications/send
Authorization: Bearer <token>
Content-Type: application/json

{
  "userId": "user_id",
  "title": "Notification Title",
  "message": "Notification message",
  "type": "INFO"
}
```

### Analytics

#### Get Health Analytics
```http
GET /analytics/health
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalRecords": 25,
    "totalClaims": 5,
    "healthScore": 85,
    "recentActivity": [
      {
        "type": "RECORD_ADDED",
        "description": "Blood test results uploaded",
        "date": "2025-01-01T00:00:00Z"
      }
    ]
  }
}
```

#### Get System Analytics (Admin only)
```http
GET /analytics/system
Authorization: Bearer <admin_token>
```

### Blockchain

#### Get Blockchain Status
```http
GET /blockchain/status
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "isConnected": true,
    "networkId": 1337,
    "blockNumber": 12345,
    "contractAddress": "0x1234567890abcdef"
  }
}
```

#### Verify Record on Blockchain
```http
POST /blockchain/verify
Authorization: Bearer <token>
Content-Type: application/json

{
  "recordId": "record_id",
  "fileHash": "sha256_hash"
}
```

## Error Responses

All error responses follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "error": "ERROR_CODE",
  "statusCode": 400
}
```

### Common Error Codes

- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `422` - Validation Error
- `500` - Internal Server Error

### Validation Errors

```json
{
  "success": false,
  "message": "Validation failed",
  "error": "VALIDATION_ERROR",
  "statusCode": 422,
  "details": [
    {
      "field": "email",
      "message": "Email is required"
    }
  ]
}
```

## Rate Limiting

- **General API**: 100 requests per minute per IP
- **Authentication**: 10 requests per minute per IP
- **File Upload**: 5 requests per minute per user

## Pagination

For endpoints that return lists, use these query parameters:

- `page` - Page number (default: 1)
- `limit` - Items per page (default: 10, max: 100)
- `sort` - Sort field (default: createdAt)
- `order` - Sort order (asc/desc, default: desc)

**Example:**
```
GET /health-records?page=1&limit=20&sort=createdAt&order=desc
```

**Response:**
```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

## WebSocket Events

Connect to `ws://localhost:3001` for real-time updates:

### Events

#### `notification`
```json
{
  "type": "notification",
  "data": {
    "id": "notification_id",
    "title": "New Notification",
    "message": "You have a new message"
  }
}
```

#### `claim_status_update`
```json
{
  "type": "claim_status_update",
  "data": {
    "claimId": "claim_id",
    "status": "APPROVED",
    "message": "Your claim has been approved"
  }
}
```

## SDK Examples

### JavaScript/TypeScript

```typescript
class HealthWalletAPI {
  private baseUrl: string;
  private token: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string) {
    this.token = token;
  }

  async request(endpoint: string, options: RequestInit = {}) {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    });

    return response.json();
  }

  async getHealthRecords() {
    return this.request('/health-records');
  }

  async createHealthRecord(data: FormData) {
    return this.request('/health-records', {
      method: 'POST',
      body: data,
      headers: {
        'Authorization': `Bearer ${this.token}`,
        // Don't set Content-Type for FormData
      },
    });
  }
}

// Usage
const api = new HealthWalletAPI('http://localhost:3001');
api.setToken('your-jwt-token');
const records = await api.getHealthRecords();
```

### Python

```python
import requests
import json

class HealthWalletAPI:
    def __init__(self, base_url):
        self.base_url = base_url
        self.token = None

    def set_token(self, token):
        self.token = token

    def request(self, endpoint, method='GET', data=None, files=None):
        headers = {'Authorization': f'Bearer {self.token}'}
        
        if files:
            response = requests.request(method, f'{self.base_url}{endpoint}', 
                                      data=data, files=files, headers=headers)
        else:
            headers['Content-Type'] = 'application/json'
            response = requests.request(method, f'{self.base_url}{endpoint}', 
                                      data=json.dumps(data) if data else None, 
                                      headers=headers)
        
        return response.json()

    def get_health_records(self):
        return self.request('/health-records')

    def create_health_record(self, title, description, file_path):
        with open(file_path, 'rb') as f:
            files = {'file': f}
            data = {'title': title, 'description': description}
            return self.request('/health-records', 'POST', data=data, files=files)

# Usage
api = HealthWalletAPI('http://localhost:3001')
api.set_token('your-jwt-token')
records = api.get_health_records()
```

## Testing

### Using cURL

```bash
# Register user
curl -X POST http://localhost:3001/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","firstName":"John","lastName":"Doe"}'

# Login
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Get health records (replace TOKEN with actual token)
curl -X GET http://localhost:3001/health-records \
  -H "Authorization: Bearer TOKEN"
```

### Using Postman

1. Import the API collection
2. Set the base URL to `http://localhost:3001`
3. Use the authentication endpoint to get a token
4. Set the token in the Authorization header for protected endpoints

## Support

For API support and questions:
- **Email**: api-support@healthwallet.com
- **Documentation**: https://docs.healthwallet.com/api
- **Status Page**: https://status.healthwallet.com
