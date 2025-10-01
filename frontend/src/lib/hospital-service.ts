import axios from 'axios';

const HOSPITAL_API_BASE_URL = 'http://localhost:3003/api/v1';

export interface HospitalAddress {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
}

export interface HospitalContactInfo {
  phone: string;
  email: string;
  website?: string;
}

export interface Hospital {
  hospitalId: string;
  name: string;
  registrationNumber: string;
  type: 'general' | 'specialty' | 'clinic' | 'diagnostic_center' | 'pharmacy';
  address: HospitalAddress;
  contactInfo: HospitalContactInfo;
  specialties: string[];
  kycDocuments?: string[];
  status: 'pending' | 'active' | 'suspended' | 'inactive';
  tenantId?: string;
  ownerEmail: string;
  ownerName: string;
  verifiedAt?: string;
  suspendedAt?: string;
  suspensionReason?: string;
  suspendedBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface HospitalRegistrationRequest {
  name: string;
  registrationNumber: string;
  type: string;
  address: HospitalAddress;
  contactInfo: HospitalContactInfo;
  specialties: string[];
  kycDocuments?: string[];
  ownerEmail: string;
  ownerName: string;
}

export interface HospitalUser {
  userId: string;
  hospitalId: string;
  email: string;
  name: string;
  role: 'admin' | 'doctor' | 'nurse' | 'billing_clerk' | 'lab_technician' | 'radiologist' | 'pharmacist' | 'receptionist' | 'viewer';
  phone?: string;
  department?: string;
  employeeId?: string;
  accessControl?: any;
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  createdBy?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface PatientLink {
  linkId: string;
  hospitalId: string;
  patientId: string;
  abhaId: string;
  patientInfo: any;
  linkType: string;
  status: 'pending' | 'active' | 'inactive' | 'revoked';
  linkedByUserId?: string;
  createdAt: string;
  updatedAt?: string;
}

export interface HospitalStats {
  totalUsers: number;
  totalPatients: number;
  totalDocuments: number;
  activeUsers: number;
  pendingVerifications: number;
}

export interface ApiResponse<T> {
  data?: T;
  message?: string;
  error?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

class HospitalService {
  private baseURL: string;

  constructor() {
    this.baseURL = HOSPITAL_API_BASE_URL;
  }

  // Health Check
  async healthCheck(): Promise<{ status: string; timestamp: string; service: string; version: string }> {
    const response = await axios.get(`${this.baseURL}/hospitals/health`);
    return response.data;
  }

  // Hospital Management
  async registerHospital(data: HospitalRegistrationRequest): Promise<{ hospitalId: string; status: string; message: string }> {
    const response = await axios.post(`${this.baseURL}/hospitals`, data);
    return response.data;
  }

  async getHospitals(page: number = 1, limit: number = 20): Promise<{ hospitals: Hospital[]; pagination: any }> {
    const response = await axios.get(`${this.baseURL}/hospitals`, {
      params: { page, limit }
    });
    return response.data;
  }

  async getHospital(hospitalId: string): Promise<Hospital> {
    const response = await axios.get(`${this.baseURL}/hospitals/${hospitalId}`);
    return response.data;
  }

  async verifyHospital(hospitalId: string, certificateId?: string): Promise<{ message: string; status: string }> {
    const response = await axios.put(`${this.baseURL}/hospitals/${hospitalId}/verify`, {
      certificateId
    });
    return response.data;
  }

  async suspendHospital(hospitalId: string, reason: string): Promise<{ message: string; status: string }> {
    const response = await axios.put(`${this.baseURL}/hospitals/${hospitalId}/suspend`, {
      reason
    });
    return response.data;
  }

  // User Management
  async getHospitalUsers(hospitalId: string, page: number = 1, limit: number = 20, role?: string, status?: string): Promise<{ users: HospitalUser[]; pagination: any }> {
    const response = await axios.get(`${this.baseURL}/hospitals/${hospitalId}/users`, {
      params: { page, limit, role, status }
    });
    return response.data;
  }

  async createHospitalUser(hospitalId: string, userData: Partial<HospitalUser>): Promise<{ message: string; userId: string }> {
    const response = await axios.post(`${this.baseURL}/hospitals/${hospitalId}/users`, userData);
    return response.data;
  }

  // Patient Management
  async searchPatients(hospitalId: string, searchCriteria: any): Promise<any> {
    const response = await axios.post(`${this.baseURL}/hospitals/${hospitalId}/patients/search`, searchCriteria);
    return response.data;
  }

  async linkPatient(hospitalId: string, patientId: string, linkData: any): Promise<{ message: string; linkId: string }> {
    const response = await axios.post(`${this.baseURL}/hospitals/${hospitalId}/patients/${patientId}/link`, linkData);
    return response.data;
  }

  async getLinkedPatients(hospitalId: string, page: number = 1, limit: number = 20, status?: string): Promise<{ links: PatientLink[]; pagination: any }> {
    const response = await axios.get(`${this.baseURL}/hospitals/${hospitalId}/patients`, {
      params: { page, limit, status }
    });
    return response.data;
  }

  // Document Management
  async uploadDocument(hospitalId: string, documentData: any): Promise<{ message: string; documentId: string }> {
    const response = await axios.post(`${this.baseURL}/hospitals/${hospitalId}/documents`, documentData);
    return response.data;
  }

  async getHospitalDocuments(hospitalId: string, page: number = 1, limit: number = 20, documentType?: string, status?: string): Promise<{ documents: any[]; pagination: any }> {
    const response = await axios.get(`${this.baseURL}/hospitals/${hospitalId}/documents`, {
      params: { page, limit, documentType, status }
    });
    return response.data;
  }

  // Statistics and Reports
  async getHospitalStats(hospitalId: string): Promise<HospitalStats> {
    const response = await axios.get(`${this.baseURL}/hospitals/${hospitalId}/stats`);
    return response.data;
  }

  async getHospitalReports(hospitalId: string, type?: string, period?: string, startDate?: string, endDate?: string): Promise<any> {
    const response = await axios.get(`${this.baseURL}/hospitals/${hospitalId}/reports`, {
      params: { type, period, startDate, endDate }
    });
    return response.data;
  }

  // Settings
  async updateHospitalSettings(hospitalId: string, settings: any): Promise<{ message: string }> {
    const response = await axios.put(`${this.baseURL}/hospitals/${hospitalId}/settings`, settings);
    return response.data;
  }

  // Audit Logs
  async getAuditLogs(hospitalId: string, page: number = 1, limit: number = 20, startDate?: string, endDate?: string, action?: string): Promise<{ logs: any[]; pagination: any }> {
    const response = await axios.get(`${this.baseURL}/hospitals/${hospitalId}/audit`, {
      params: { page, limit, startDate, endDate, action }
    });
    return response.data;
  }

  // Utility methods
  async isServiceHealthy(): Promise<boolean> {
    try {
      await this.healthCheck();
      return true;
    } catch (error) {
      return false;
    }
  }

  // Error handling
  private handleError(error: any): never {
    if (error.response) {
      // Server responded with error status
      throw new Error(error.response.data.message || error.response.data.error || 'Server error');
    } else if (error.request) {
      // Request was made but no response received
      throw new Error('Network error - please check your connection');
    } else {
      // Something else happened
      throw new Error(error.message || 'An unexpected error occurred');
    }
  }
}

export const hospitalService = new HospitalService();
