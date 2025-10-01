import { Injectable, Logger } from '@nestjs/common';
import { HospitalRegistrationRequest, HospitalUserCreationRequest, PatientSearchRequest, HospitalStatsDto } from './dto/hospital.dto';

@Injectable()
export class HospitalSimpleService {
  private readonly logger = new Logger(HospitalSimpleService.name);
  private hospitals: any[] = [];
  private users: any[] = [];
  private patients: any[] = [];

  async registerHospital(request: HospitalRegistrationRequest): Promise<any> {
    this.logger.log(`Registering hospital: ${request.name}`);

    // Check if hospital already exists
    const existingHospital = this.hospitals.find(h => 
      h.registrationNumber === request.registrationNumber || 
      h.contactInfo.email === request.contactInfo.email
    );

    if (existingHospital) {
      throw new Error('Hospital with this registration number or email already exists');
    }

    // Create hospital
    const hospitalId = this.generateHospitalId();
    const hospital = {
      hospitalId,
      name: request.name,
      registrationNumber: request.registrationNumber,
      type: request.type,
      address: request.address,
      contactInfo: request.contactInfo,
      specialties: request.specialties || [],
      kycDocuments: request.kycDocuments || [],
      status: 'pending',
      ownerEmail: request.ownerEmail,
      ownerName: request.ownerName,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.hospitals.push(hospital);

    return {
      hospitalId,
      status: 'pending',
      message: 'Hospital registered successfully. Awaiting verification.',
    };
  }

  async getHospital(hospitalId: string): Promise<any> {
    const hospital = this.hospitals.find(h => h.hospitalId === hospitalId);
    if (!hospital) {
      throw new Error('Hospital not found');
    }
    return hospital;
  }

  async getHospitals(tenantId: string, page: number = 1, limit: number = 20): Promise<any> {
    const skip = (page - 1) * limit;
    const paginatedHospitals = this.hospitals.slice(skip, skip + limit);

    return {
      hospitals: paginatedHospitals,
      pagination: {
        page,
        limit,
        total: this.hospitals.length,
        pages: Math.ceil(this.hospitals.length / limit),
      },
    };
  }

  async verifyHospital(hospitalId: string, certificateId?: string): Promise<any> {
    const hospital = this.hospitals.find(h => h.hospitalId === hospitalId);
    if (!hospital) {
      throw new Error('Hospital not found');
    }

    hospital.status = 'active';
    hospital.verifiedAt = new Date();
    if (certificateId) {
      hospital.certificateId = certificateId;
    }

    return { message: 'Hospital verified successfully', status: 'active' };
  }

  async suspendHospital(hospitalId: string, reason: string, suspendedBy?: string): Promise<any> {
    const hospital = this.hospitals.find(h => h.hospitalId === hospitalId);
    if (!hospital) {
      throw new Error('Hospital not found');
    }

    hospital.status = 'suspended';
    hospital.suspendedAt = new Date();
    hospital.suspensionReason = reason;
    hospital.suspendedBy = suspendedBy;

    return { message: 'Hospital suspended successfully', status: 'suspended' };
  }

  async createHospitalUser(hospitalId: string, request: HospitalUserCreationRequest, createdBy: string): Promise<any> {
    // Check if hospital exists
    const hospital = this.hospitals.find(h => h.hospitalId === hospitalId);
    if (!hospital) {
      throw new Error('Hospital not found');
    }

    // Check if user already exists
    const existingUser = this.users.find(u => 
      u.hospitalId === hospitalId && u.email === request.email
    );

    if (existingUser) {
      throw new Error('User with this email already exists in this hospital');
    }

    const user = {
      hospitalId,
      email: request.email,
      name: request.name,
      role: request.role,
      phone: request.phone,
      department: request.department,
      employeeId: request.employeeId,
      accessControl: request.accessControl || {},
      status: 'active',
      createdBy,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    this.users.push(user);

    return { message: 'User created successfully', userId: Date.now().toString() };
  }

  async getHospitalUsers(
    hospitalId: string,
    page: number = 1,
    limit: number = 20,
    role?: string,
    status?: string,
  ): Promise<any> {
    let filteredUsers = this.users.filter(u => u.hospitalId === hospitalId);
    
    if (role) filteredUsers = filteredUsers.filter(u => u.role === role);
    if (status) filteredUsers = filteredUsers.filter(u => u.status === status);

    const skip = (page - 1) * limit;
    const paginatedUsers = filteredUsers.slice(skip, skip + limit);

    return {
      users: paginatedUsers,
      pagination: {
        page,
        limit,
        total: filteredUsers.length,
        pages: Math.ceil(filteredUsers.length / limit),
      },
    };
  }

  async searchPatients(hospitalId: string, searchRequest: PatientSearchRequest): Promise<any> {
    // Mock implementation
    return {
      patients: [
        {
          patientId: 'PAT_001',
          name: 'John Doe',
          abhaId: '12345678901234',
          mobile: '+91-9876543210',
          email: 'john.doe@example.com',
          dob: '1990-01-01',
        }
      ],
      total: 1,
    };
  }

  async linkPatient(
    hospitalId: string,
    patientId: string,
    abhaId: string,
    patientInfo: any,
    linkType: string,
    linkedByUserId: string,
  ): Promise<any> {
    const link = {
      hospitalId,
      patientId,
      abhaId,
      patientInfo,
      linkType: linkType || 'treatment',
      status: 'pending',
      linkedByUserId,
      createdAt: new Date(),
    };

    this.patients.push(link);

    return { message: 'Patient linked successfully', linkId: Date.now().toString() };
  }

  async getLinkedPatients(hospitalId: string, page: number = 1, limit: number = 20, status?: string): Promise<any> {
    let filteredPatients = this.patients.filter(p => p.hospitalId === hospitalId);
    if (status) filteredPatients = filteredPatients.filter(p => p.status === status);

    const skip = (page - 1) * limit;
    const paginatedPatients = filteredPatients.slice(skip, skip + limit);

    return {
      links: paginatedPatients,
      pagination: {
        page,
        limit,
        total: filteredPatients.length,
        pages: Math.ceil(filteredPatients.length / limit),
      },
    };
  }

  async uploadDocument(hospitalId: string, patientId: string, documentType: string, metadata?: any): Promise<any> {
    // Mock implementation
    return {
      documentId: `DOC_${Date.now()}`,
      status: 'uploaded',
      message: 'Document uploaded successfully',
    };
  }

  async getHospitalDocuments(
    hospitalId: string,
    page: number = 1,
    limit: number = 20,
    documentType?: string,
    status?: string,
  ): Promise<any> {
    // Mock implementation
    return {
      documents: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0,
      },
    };
  }

  async updateHospitalSettings(hospitalId: string, settings: any, updatedBy: string): Promise<any> {
    const hospital = this.hospitals.find(h => h.hospitalId === hospitalId);
    if (!hospital) {
      throw new Error('Hospital not found');
    }

    hospital.settings = { ...hospital.settings, ...settings };
    hospital.updatedAt = new Date();
    hospital.updatedBy = updatedBy;

    return { message: 'Settings updated successfully' };
  }

  async getAuditLogs(
    hospitalId: string,
    page: number = 1,
    limit: number = 20,
    startDate?: string,
    endDate?: string,
    action?: string,
  ): Promise<any> {
    // Mock implementation
    return {
      logs: [
        {
          id: 'LOG_001',
          action: 'user.login',
          userId: 'USER_001',
          timestamp: new Date(),
          details: 'User logged in successfully',
        }
      ],
      pagination: {
        page,
        limit,
        total: 1,
        pages: 1,
      },
    };
  }

  async getHospitalReports(
    hospitalId: string,
    type?: string,
    period?: string,
    startDate?: string,
    endDate?: string,
  ): Promise<any> {
    // Mock implementation
    return {
      reports: [
        {
          id: 'REPORT_001',
          type: 'monthly',
          period: '2024-01',
          generatedAt: new Date(),
          data: {
            totalPatients: 150,
            totalDocuments: 300,
            activeUsers: 25,
          },
        }
      ],
      generatedAt: new Date(),
    };
  }

  async getHospitalStats(hospitalId: string): Promise<HospitalStatsDto> {
    const hospitalUsers = this.users.filter(u => u.hospitalId === hospitalId);
    const hospitalPatients = this.patients.filter(p => p.hospitalId === hospitalId);

    return {
      totalUsers: hospitalUsers.length,
      totalPatients: hospitalPatients.length,
      totalDocuments: 0, // Would come from document service
      activeUsers: hospitalUsers.filter(u => u.status === 'active').length,
      pendingVerifications: hospitalUsers.filter(u => u.status === 'pending_verification').length,
    };
  }

  private generateHospitalId(): string {
    return `HOSP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
