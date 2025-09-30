import axios from 'axios';
import { authService } from './auth';

// Type for API error response
interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Helper function to extract error messages
function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof Error && 'response' in error) {
    const apiError = error as ApiErrorResponse;
    return apiError.response?.data?.message || defaultMessage;
  }
  return defaultMessage;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ? 'mock' : (process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin + '/api' : 'http://localhost:3003')).replace(/\/$/, '');

export interface HealthRecord {
  id: string;
  patientId: string;
  doctorId: string;
  hospitalId?: string;
  title: string;
  description?: string;
  type: string;
  status: 'pending' | 'verified' | 'rejected' | 'expired';
  fileHash: string;
  ipfsHash: string;
  fileName?: string;
  fileSize?: number;
  mimeType?: string;
  fileUrl?: string;
  blockchainTxHash?: string;
  digitalSignature?: string;
  doctorSignature?: string;
  hospitalSignature?: string;
  patientSignature?: string;
  recordDate: string;
  expiryDate?: string;
  tags?: string[];
  medicalData?: Record<string, unknown>;
  consentGiven: boolean;
  consentExpiry?: string;
  isEncrypted: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateHealthRecordDto {
  title: string;
  description?: string;
  type: string;
  recordDate: string;
  expiryDate?: string;
  tags?: string[];
  medicalData?: Record<string, unknown>;
  consentGiven: boolean;
  consentExpiry?: string;
  isEncrypted: boolean;
}

export interface HealthRecordsResponse {
  records: HealthRecord[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface HealthRecordStatistics {
  totalRecords: number;
  verifiedRecords: number;
  pendingRecords: number;
  recordsByType: Record<string, number>;
}

class HealthRecordsService {
  private getAuthHeaders() {
    return authService.getAuthHeaders();
  }

  private getFormDataHeaders() {
    return authService.getAuthHeaders();
  }

  async createHealthRecord(data: CreateHealthRecordDto): Promise<HealthRecord> {
    try {
      const response = await axios.post(`${API_BASE_URL}/health-records`, data, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to create health record'));
    }
  }

  async uploadHealthRecord(
    file: File,
    data: CreateHealthRecordDto
  ): Promise<{ record: HealthRecord; file: File }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      // Append other fields to formData
      Object.keys(data).forEach(key => {
        if (data[key as keyof CreateHealthRecordDto] !== undefined) {
          if (key === 'tags' && Array.isArray(data[key as keyof CreateHealthRecordDto])) {
            formData.append(key, JSON.stringify(data[key as keyof CreateHealthRecordDto]));
          } else if (key === 'medicalData' && typeof data[key as keyof CreateHealthRecordDto] === 'object') {
            formData.append(key, JSON.stringify(data[key as keyof CreateHealthRecordDto]));
          } else {
            formData.append(key, data[key as keyof CreateHealthRecordDto] as string);
          }
        }
      });

      const response = await axios.post(`${API_BASE_URL}/health-records/upload`, formData, {
        headers: this.getFormDataHeaders(),
      });
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to upload health record'));
    }
  }

  async getHealthRecords(page: number = 1, limit: number = 10): Promise<HealthRecordsResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/health-records`, {
        headers: this.getAuthHeaders(),
        params: { page, limit },
        timeout: 5000, // Reduced to 5 second timeout for faster loading
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to fetch health records:', error);
      
      // Return mock data for local development when backend is not available
      console.log('Using mock health records data for local development');
      return {
        records: [
          {
            id: '1',
            title: 'Blood Test Results',
            type: 'Lab Results',
            status: 'Verified',
            fileSize: 2.3,
            uploadedAt: new Date(Date.now() - 86400000).toISOString(),
            verifiedAt: new Date(Date.now() - 3600000).toISOString(),
            hash: 'mock-hash-1',
            ipfsHash: 'mock-ipfs-hash-1',
            fileUrl: '/mock-file-1.pdf',
            patientId: 'mock-patient-1',
            doctorId: 'mock-doctor-1',
            hospitalId: 'mock-hospital-1',
            metadata: {
              patientName: 'John Doe',
              doctorName: 'Dr. Smith',
              hospitalName: 'General Hospital'
            }
          },
          {
            id: '2',
            title: 'Prescription - Antibiotics',
            type: 'Prescription',
            status: 'Pending',
            fileSize: 1.8,
            uploadedAt: new Date(Date.now() - 172800000).toISOString(),
            verifiedAt: null,
            hash: 'mock-hash-2',
            ipfsHash: 'mock-ipfs-hash-2',
            fileUrl: '/mock-file-2.pdf',
            patientId: 'mock-patient-1',
            doctorId: 'mock-doctor-2',
            hospitalId: 'mock-hospital-1',
            metadata: {
              patientName: 'John Doe',
              doctorName: 'Dr. Johnson',
              hospitalName: 'General Hospital'
            }
          },
          {
            id: '3',
            title: 'MRI Scan Report',
            type: 'Medical Report',
            status: 'Verified',
            fileSize: 15.2,
            uploadedAt: new Date(Date.now() - 259200000).toISOString(),
            verifiedAt: new Date(Date.now() - 7200000).toISOString(),
            hash: 'mock-hash-3',
            ipfsHash: 'mock-ipfs-hash-3',
            fileUrl: '/mock-file-3.pdf',
            patientId: 'mock-patient-1',
            doctorId: 'mock-doctor-3',
            hospitalId: 'mock-hospital-2',
            metadata: {
              patientName: 'John Doe',
              doctorName: 'Dr. Williams',
              hospitalName: 'Medical Center'
            }
          }
        ],
        totalRecords: 3,
        totalPages: 1,
        currentPage: page,
        hasNextPage: false,
        hasPrevPage: false
      };
    }
  }

  async getHealthRecord(id: string): Promise<HealthRecord> {
    try {
      const response = await axios.get(`${API_BASE_URL}/health-records/${id}`, {
        headers: this.getAuthHeaders(),
        timeout: 10000, // 10 second timeout
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to fetch health record:', error);
      throw new Error(getErrorMessage(error, 'Unable to connect to server. Please check your internet connection and try again.'));
    }
  }

  async updateHealthRecord(id: string, data: Partial<CreateHealthRecordDto>): Promise<HealthRecord> {
    try {
      const response = await axios.patch(`${API_BASE_URL}/health-records/${id}`, data, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to update health record'));
    }
  }

  async deleteHealthRecord(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/health-records/${id}`, {
        headers: this.getAuthHeaders(),
      });
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to delete health record'));
    }
  }

  async searchHealthRecords(searchTerm: string): Promise<HealthRecord[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/health-records/search`, {
        headers: this.getAuthHeaders(),
        params: { q: searchTerm },
      });
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to search health records'));
    }
  }

  async getHealthRecordsByType(type: string): Promise<HealthRecord[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/health-records/by-type/${type}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to fetch health records by type'));
    }
  }

  async getHealthRecordsByStatus(status: string): Promise<HealthRecord[]> {
    try {
      const response = await axios.get(`${API_BASE_URL}/health-records/by-status/${status}`, {
        headers: this.getAuthHeaders(),
      });
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to fetch health records by status'));
    }
  }

  async getHealthRecordStatistics(): Promise<HealthRecordStatistics> {
    try {
      const response = await axios.get(`${API_BASE_URL}/health-records/statistics`, {
        headers: this.getAuthHeaders(),
        timeout: 3000, // Reduced to 3 second timeout for faster loading
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Failed to fetch health record statistics:', error);
      
      // Return mock data for local development when backend is not available
      console.log('Using mock statistics data for local development');
      return {
        totalRecords: 12,
        verifiedRecords: 8,
        pendingRecords: 3,
        rejectedRecords: 1,
        totalSize: 156.7,
        averageFileSize: 13.1,
        recordsByType: {
          'Lab Results': 5,
          'Prescription': 4,
          'Medical Report': 2,
          'Insurance': 1
        },
        recordsByStatus: {
          'Verified': 8,
          'Pending': 3,
          'Rejected': 1
        },
        lastUpdated: new Date().toISOString()
      };
    }
  }

  async verifyHealthRecord(id: string, signature: string): Promise<HealthRecord> {
    try {
      const response = await axios.post(`${API_BASE_URL}/health-records/${id}/verify`, 
        { signature }, 
        {
          headers: this.getAuthHeaders(),
        }
      );
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to verify health record'));
    }
  }

  // Helper function to format file size
  formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Helper function to get file type icon
  getFileTypeIcon(mimeType: string): string {
    if (mimeType?.includes('pdf')) return '📄';
    if (mimeType?.includes('image')) return '🖼️';
    if (mimeType?.includes('text')) return '📝';
    return '📁';
  }

  // Helper function to get status color
  getStatusColor(status: string): string {
    switch (status) {
      case 'verified': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'rejected': return 'text-red-600 bg-red-100';
      case 'expired': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  }

  // Helper function to get type display name
  getTypeDisplayName(type: string): string {
    const typeMap: Record<string, string> = {
      'prescription': 'Prescription',
      'lab_report': 'Lab Report',
      'discharge_summary': 'Discharge Summary',
      'imaging': 'Imaging',
      'vaccination': 'Vaccination',
      'medical_certificate': 'Medical Certificate',
      'other': 'Other',
    };
    return typeMap[type] || type;
  }
}

export const healthRecordsService = new HealthRecordsService();
