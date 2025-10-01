# Frontend Integration with Microservices

This document outlines how to integrate the existing React frontend with the new microservices architecture.

## API Endpoint Changes

### Current Endpoints → New Service Endpoints

| Current Endpoint | New Service Endpoint | Service |
|------------------|----------------------|---------|
| `/api/auth/*` | `/api/v1/auth/*` | Auth Service |
| `/api/profile/*` | `/api/v1/patients/*` | Profile Service |
| `/api/documents/*` | `/api/v1/documents/*` | Document Service |
| `/api/timeline/*` | `/api/v1/timeline/*` | Timeline Service |

## Frontend Changes Required

### 1. Update API Base URL

Update `frontend/src/lib/auth.ts`:

```typescript
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
```

### 2. Update Auth Service

The auth service already uses the correct endpoints, but ensure it handles the new response format:

```typescript
// In frontend/src/lib/auth.ts
export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
  refreshToken?: string; // New field
}
```

### 3. Update Profile Service Calls

Create new profile service client:

```typescript
// frontend/src/lib/profile-service.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface PatientProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  emergencyContact?: string;
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  medicalConditions?: string[];
  organization?: string;
  licenseNumber?: string;
  specialization?: string;
  preferences: {
    notifications: boolean;
    dataSharing: boolean;
    language: string;
    timezone: string;
  };
  familyMembers: Array<{
    name: string;
    relationship: string;
    phone?: string;
    email?: string;
    isEmergencyContact: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

class ProfileService {
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
  }

  async getProfile(userId: string): Promise<PatientProfile> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/patients/${userId}`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async updateProfile(userId: string, profileData: Partial<PatientProfile>): Promise<PatientProfile> {
    const response = await axios.put(`${API_BASE_URL}/api/v1/patients/${userId}`, profileData, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async uploadAvatar(userId: string, file: File): Promise<{ avatar: string }> {
    const formData = new FormData();
    formData.append('avatar', file);

    const response = await axios.post(`${API_BASE_URL}/api/v1/patients/${userId}/avatar`, formData, {
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data;
  }

  async addFamilyMember(userId: string, memberData: any): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/api/v1/patients/${userId}/family`, memberData, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async updateFamilyMember(userId: string, memberId: string, memberData: any): Promise<any> {
    const response = await axios.put(`${API_BASE_URL}/api/v1/patients/${userId}/family/${memberId}`, memberData, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async deleteFamilyMember(userId: string, memberId: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/api/v1/patients/${userId}/family/${memberId}`, {
      headers: this.getAuthHeaders()
    });
  }

  async updatePreferences(userId: string, preferences: any): Promise<any> {
    const response = await axios.put(`${API_BASE_URL}/api/v1/patients/${userId}/preferences`, preferences, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }
}

export const profileService = new ProfileService();
```

### 4. Update Document Service Calls

Create new document service client:

```typescript
// frontend/src/lib/document-service.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Document {
  id: string;
  originalName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  sha256Hash: string;
  metadata: {
    title: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    creationDate?: string;
    modificationDate?: string;
    pageCount?: number;
  };
  verification: {
    isVerified: boolean;
    verifiedAt?: string;
    verificationMethod?: string;
    blockchainTxId?: string;
    ipfsHash?: string;
  };
  access: {
    isPublic: boolean;
    sharedWith: string[];
    permissions: {
      view: boolean;
      download: boolean;
      share: boolean;
    };
  };
  tags: string[];
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

class DocumentService {
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
  }

  async uploadDocument(file: File, metadata?: any): Promise<Document> {
    const formData = new FormData();
    formData.append('document', file);
    if (metadata) {
      Object.keys(metadata).forEach(key => {
        formData.append(key, metadata[key]);
      });
    }

    const response = await axios.post(`${API_BASE_URL}/api/v1/documents/upload`, formData, {
      headers: {
        ...this.getAuthHeaders(),
        'Content-Type': 'multipart/form-data',
      }
    });
    return response.data.document;
  }

  async getDocument(documentId: string): Promise<Document> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/documents/${documentId}`, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async getUserDocuments(params?: any): Promise<{ documents: Document[]; pagination: any }> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/documents`, {
      headers: this.getAuthHeaders(),
      params
    });
    return response.data;
  }

  async downloadDocument(documentId: string): Promise<Blob> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/documents/${documentId}/download`, {
      headers: this.getAuthHeaders(),
      responseType: 'blob'
    });
    return response.data;
  }

  async shareDocument(documentId: string, shareData: any): Promise<any> {
    const response = await axios.post(`${API_BASE_URL}/api/v1/documents/${documentId}/share`, shareData, {
      headers: this.getAuthHeaders()
    });
    return response.data;
  }

  async deleteDocument(documentId: string): Promise<void> {
    await axios.delete(`${API_BASE_URL}/api/v1/documents/${documentId}`, {
      headers: this.getAuthHeaders()
    });
  }
}

export const documentService = new DocumentService();
```

### 5. Update Timeline Service Calls

Create new timeline service client:

```typescript
// frontend/src/lib/timeline-service.ts
import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface TimelineEvent {
  id: string;
  eventType: string;
  title: string;
  description?: string;
  metadata: any;
  severity: 'info' | 'warning' | 'error' | 'critical';
  category: 'general' | 'security' | 'medical' | 'sharing' | 'profile';
  isPublic: boolean;
  tags: string[];
  timestamp: string;
}

class TimelineService {
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
  }

  async getTimeline(userId: string, params?: any): Promise<{ events: any; pagination: any; summary: any }> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/timeline/${userId}`, {
      headers: this.getAuthHeaders(),
      params
    });
    return response.data;
  }

  async getTimelineStats(userId: string, period?: string): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/timeline/${userId}/stats`, {
      headers: this.getAuthHeaders(),
      params: { period }
    });
    return response.data;
  }

  async searchTimeline(userId: string, query: string, params?: any): Promise<any> {
    const response = await axios.get(`${API_BASE_URL}/api/v1/timeline/${userId}/search`, {
      headers: this.getAuthHeaders(),
      params: { q: query, ...params }
    });
    return response.data;
  }
}

export const timelineService = new TimelineService();
```

## Environment Variables

Update your `.env.local` file:

```env
NEXT_PUBLIC_API_URL=http://localhost:3000
NEXT_PUBLIC_USE_MOCK_DATA=false
```

## Migration Strategy

### Phase 1: Parallel Running
1. Deploy microservices alongside existing monolith
2. Update frontend to use API Gateway
3. Test all functionality

### Phase 2: Gradual Migration
1. Route specific endpoints to services
2. Monitor performance and errors
3. Gradually migrate more endpoints

### Phase 3: Full Cutover
1. Route all traffic through API Gateway
2. Decommission monolith
3. Optimize service performance

## Testing

### Unit Tests
- Test each service client independently
- Mock API responses for frontend components

### Integration Tests
- Test end-to-end user flows
- Verify data consistency across services

### Load Tests
- Test API Gateway performance
- Test individual service performance
- Test database connections under load

## Monitoring

### Frontend Monitoring
- Track API call success rates
- Monitor response times
- Log errors for debugging

### Service Monitoring
- Health checks for each service
- Database connection monitoring
- Kafka message processing monitoring

## Rollback Plan

If issues arise:
1. Switch API Gateway routing back to monolith
2. Update frontend API URLs
3. Investigate and fix service issues
4. Re-deploy when ready
