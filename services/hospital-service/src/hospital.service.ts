import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Hospital, HospitalDocument } from './schemas/hospital.schema';
import { HospitalUser, HospitalUserDocument } from './schemas/hospital-user.schema';
import { PatientLink, PatientLinkDocument } from './schemas/patient-link.schema';
import { Tenant, TenantDocument } from './schemas/tenant.schema';
import { HospitalRegistrationRequest, HospitalUserCreationRequest, PatientSearchRequest, HospitalStatsDto } from './dto/hospital.dto';
import { RBACService } from './rbac/rbac.service';
import { TenantService } from './tenant/tenant.service';
import { KafkaService } from './kafka/kafka.service';
import { DocumentService } from './document/document.service';
import { PatientService } from './patient/patient.service';
import { EncryptionService } from './encryption/encryption.service';
import { StorageService } from './storage/storage.service';
import { BlockchainService } from './blockchain/blockchain.service';

@Injectable()
export class HospitalService {
  private readonly logger = new Logger(HospitalService.name);

  constructor(
    @InjectModel(Hospital.name) private hospitalModel: Model<HospitalDocument>,
    @InjectModel(HospitalUser.name) private hospitalUserModel: Model<HospitalUserDocument>,
    @InjectModel(PatientLink.name) private patientLinkModel: Model<PatientLinkDocument>,
    @InjectModel(Tenant.name) private tenantModel: Model<TenantDocument>,
    private rbacService: RBACService,
    private tenantService: TenantService,
    private kafkaService: KafkaService,
    private documentService: DocumentService,
    private patientService: PatientService,
    private encryptionService: EncryptionService,
    private storageService: StorageService,
    private blockchainService: BlockchainService,
  ) {}

  async registerHospital(request: HospitalRegistrationRequest): Promise<any> {
    this.logger.log(`Registering hospital: ${request.name}`);

    // Check if hospital already exists
    const existingHospital = await this.hospitalModel.findOne({
      $or: [
        { registrationNumber: request.registrationNumber },
        { 'contactInfo.email': request.contactInfo.email },
      ],
    });

    if (existingHospital) {
      throw new ConflictException('Hospital with this registration number or email already exists');
    }

    // Create or get tenant
    const tenant = await this.tenantService.getOrCreateTenant(request.ownerEmail, {
      name: `${request.name} - Healthcare Organization`,
      domain: request.contactInfo.email.split('@')[1],
      ownerEmail: request.ownerEmail,
      ownerName: request.ownerName,
    });

    // Create hospital
    const hospitalId = this.generateHospitalId();
    const hospital = new this.hospitalModel({
      hospitalId,
      name: request.name,
      registrationNumber: request.registrationNumber,
      type: request.type,
      address: request.address,
      contactInfo: request.contactInfo,
      specialties: request.specialties || [],
      kycDocuments: request.kycDocuments || [],
      status: 'pending',
      tenantId: tenant.tenantId,
      ownerEmail: request.ownerEmail,
      ownerName: request.ownerName,
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await (hospital as any).save();

    // Emit event
    await this.kafkaService.emitEvent('hospital.events', {
      eventType: 'hospital.registered',
      hospitalId,
      tenantId: tenant.tenantId,
      name: request.name,
      timestamp: new Date(),
    });

    return {
      hospitalId,
      status: 'pending',
      message: 'Hospital registered successfully. Awaiting verification.',
    };
  }

  async getHospital(hospitalId: string): Promise<Hospital> {
    const hospital = await this.hospitalModel.findOne({ hospitalId });
    if (!hospital) {
      throw new NotFoundException('Hospital not found');
    }
    return hospital;
  }

  async getHospitals(tenantId: string, page: number = 1, limit: number = 20): Promise<any> {
    const skip = (page - 1) * limit;
    const hospitals = await this.hospitalModel
      .find({ tenantId })
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await this.hospitalModel.countDocuments({ tenantId });

    return {
      hospitals,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async verifyHospital(hospitalId: string, certificateId?: string): Promise<any> {
    const hospital = await this.hospitalModel.findOne({ hospitalId });
    if (!hospital) {
      throw new NotFoundException('Hospital not found');
    }

    (hospital as any).status = 'active';
    hospital.verifiedAt = new Date();
    if (certificateId) {
      hospital.certificateId = certificateId;
    }

    await (hospital as any).save();

    // Emit event
    await this.kafkaService.emitEvent('hospital.events', {
      eventType: 'hospital.verified',
      hospitalId,
      certificateId,
      timestamp: new Date(),
    });

    return { message: 'Hospital verified successfully', status: 'active' };
  }

  async suspendHospital(hospitalId: string, reason: string, suspendedBy?: string): Promise<any> {
    const hospital = await this.hospitalModel.findOne({ hospitalId });
    if (!hospital) {
      throw new NotFoundException('Hospital not found');
    }

    (hospital as any).status = 'suspended';
    hospital.suspendedAt = new Date();
    hospital.suspensionReason = reason;
    hospital.suspendedBy = suspendedBy;

    await (hospital as any).save();

    // Emit event
    await this.kafkaService.emitEvent('hospital.events', {
      eventType: 'hospital.suspended',
      hospitalId,
      reason,
      suspendedBy,
      timestamp: new Date(),
    });

    return { message: 'Hospital suspended successfully', status: 'suspended' };
  }

  async createHospitalUser(hospitalId: string, request: HospitalUserCreationRequest, createdBy: string): Promise<any> {
    // Check if hospital exists
    const hospital = await this.hospitalModel.findOne({ hospitalId });
    if (!hospital) {
      throw new NotFoundException('Hospital not found');
    }

    // Check if user already exists
    const existingUser = await this.hospitalUserModel.findOne({
      hospitalId,
      email: request.email,
    });

    if (existingUser) {
      throw new ConflictException('User with this email already exists in this hospital');
    }

    const user = new this.hospitalUserModel({
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
    });

    await (user as any).save();

    // Emit event
    await this.kafkaService.emitEvent('hospital.events', {
      eventType: 'hospital.user.created',
      hospitalId,
      userId: user._id,
      role: request.role,
      timestamp: new Date(),
    });

    return { message: 'User created successfully', userId: user._id };
  }

  async getHospitalUsers(
    hospitalId: string,
    page: number = 1,
    limit: number = 20,
    role?: string,
    status?: string,
  ): Promise<any> {
    const filter: any = { hospitalId };
    if (role) filter.role = role;
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const users = await this.hospitalUserModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await this.hospitalUserModel.countDocuments(filter);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async searchPatients(hospitalId: string, searchRequest: PatientSearchRequest): Promise<any> {
    // This would integrate with the Patient Service
    const results = await this.patientService.searchPatients(searchRequest);
    return results;
  }

  async linkPatient(
    hospitalId: string,
    patientId: string,
    abhaId: string,
    patientInfo: any,
    linkType: string,
    linkedByUserId: string,
  ): Promise<any> {
    const link = new this.patientLinkModel({
      hospitalId,
      patientId,
      abhaId,
      patientInfo,
      linkType: linkType || 'treatment',
      status: 'pending',
      linkedByUserId,
      createdAt: new Date(),
    });

    await (link as any).save();

    // Emit event
    await this.kafkaService.emitEvent('hospital.events', {
      eventType: 'patient.linked',
      hospitalId,
      patientId,
      abhaId,
      linkType,
      timestamp: new Date(),
    });

    return { message: 'Patient linked successfully', linkId: link._id };
  }

  async getLinkedPatients(hospitalId: string, page: number = 1, limit: number = 20, status?: string): Promise<any> {
    const filter: any = { hospitalId };
    if (status) filter.status = status;

    const skip = (page - 1) * limit;
    const links = await this.patientLinkModel
      .find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await this.patientLinkModel.countDocuments(filter);

    return {
      links,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    };
  }

  async uploadDocument(hospitalId: string, patientId: string, documentType: string, metadata?: any): Promise<any> {
    // This would integrate with the Document Service
    const result = await this.documentService.uploadDocument(null, metadata);
    return result;
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
    const hospital = await this.hospitalModel.findOne({ hospitalId });
    if (!hospital) {
      throw new NotFoundException('Hospital not found');
    }

    (hospital as any).settings = { ...(hospital as any).settings, ...settings };
    (hospital as any).updatedAt = new Date();
    (hospital as any).updatedBy = updatedBy;

    await (hospital as any).save();

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
      logs: [],
      pagination: {
        page,
        limit,
        total: 0,
        pages: 0,
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
      reports: [],
      generatedAt: new Date(),
    };
  }

  async getHospitalStats(hospitalId: string): Promise<HospitalStatsDto> {
    const [totalUsers, totalPatients, totalDocuments, activeUsers, pendingVerifications] = await Promise.all([
      this.hospitalUserModel.countDocuments({ hospitalId }),
      this.patientLinkModel.countDocuments({ hospitalId }),
      0, // Would come from document service
      this.hospitalUserModel.countDocuments({ hospitalId, status: 'active' }),
      this.hospitalUserModel.countDocuments({ hospitalId, status: 'pending_verification' }),
    ]);

    return {
      totalUsers,
      totalPatients,
      totalDocuments,
      activeUsers,
      pendingVerifications,
    };
  }

  private generateHospitalId(): string {
    return `HOSP_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}