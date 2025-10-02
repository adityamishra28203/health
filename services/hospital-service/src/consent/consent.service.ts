import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Consent, ConsentDocument, ConsentHistory, ConsentHistoryDocument, ConsentType, ConsentStatus, ActorType } from '../schemas/consent.schema';
import { v4 as uuidv4 } from 'uuid';

export interface ConsentRequestDto {
  patientId: string;
  consentType: ConsentType;
  purpose: string;
  dataTypes?: string[];
  duration?: number; // in days
  emergencyAccess?: boolean;
  metadata?: any;
}

export interface ConsentResponseDto {
  consentId: string;
  patientId: string;
  hospitalId: string;
  consentType: ConsentType;
  status: ConsentStatus;
  grantedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class ConsentService {
  constructor(
    @InjectModel(Consent.name) private consentModel: Model<ConsentDocument>,
    @InjectModel(ConsentHistory.name) private consentHistoryModel: Model<ConsentHistoryDocument>,
  ) {}

  async createConsentRequest(
    hospitalId: string,
    requestedBy: string,
    consentData: ConsentRequestDto
  ): Promise<ConsentResponseDto> {
    // Check if active consent already exists
    const existingConsent = await this.consentModel.findOne({
      patientId: consentData.patientId,
      hospitalId,
      consentType: consentData.consentType,
      status: { $in: [ConsentStatus.GRANTED, ConsentStatus.PENDING] },
      isActive: true,
    });

    if (existingConsent) {
      throw new BadRequestException('Active consent request already exists for this patient');
    }

    const consentId = uuidv4();
    const expiresAt = consentData.duration 
      ? new Date(Date.now() + consentData.duration * 24 * 60 * 60 * 1000)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // Default 30 days

    const consent = new this.consentModel({
      consentId,
      patientId: consentData.patientId,
      hospitalId,
      consentType: consentData.consentType,
      status: ConsentStatus.PENDING,
      expiresAt,
      metadata: {
        purpose: consentData.purpose,
        dataTypes: consentData.dataTypes || [],
        duration: consentData.duration || 30,
        emergencyAccess: consentData.emergencyAccess || false,
      },
      requestedBy,
    });

    const savedConsent = await consent.save();

    // Log consent creation
    await this.logConsentAction(
      consentId,
      'created',
      requestedBy,
      ActorType.HOSPITAL,
      { reason: 'New consent request created' }
    );

    return this.mapToResponseDto(savedConsent);
  }

  async grantConsent(
    consentId: string,
    grantedBy: string,
    actorType: ActorType = ActorType.PATIENT
  ): Promise<ConsentResponseDto> {
    const consent = await this.consentModel.findOne({ consentId, isActive: true });

    if (!consent) {
      throw new NotFoundException('Consent request not found');
    }

    if (consent.status !== ConsentStatus.PENDING) {
      throw new BadRequestException('Consent request is not pending');
    }

    if (consent.expiresAt && consent.expiresAt < new Date()) {
      consent.status = ConsentStatus.EXPIRED;
      await consent.save();
      throw new BadRequestException('Consent request has expired');
    }

    consent.status = ConsentStatus.GRANTED;
    consent.grantedAt = new Date();
    consent.grantedBy = grantedBy;

    const updatedConsent = await consent.save();

    // Log consent grant
    await this.logConsentAction(
      consentId,
      'granted',
      grantedBy,
      actorType,
      { reason: 'Consent granted by patient' }
    );

    return this.mapToResponseDto(updatedConsent);
  }

  async denyConsent(
    consentId: string,
    deniedBy: string,
    reason?: string,
    actorType: ActorType = ActorType.PATIENT
  ): Promise<ConsentResponseDto> {
    const consent = await this.consentModel.findOne({ consentId, isActive: true });

    if (!consent) {
      throw new NotFoundException('Consent request not found');
    }

    if (consent.status !== ConsentStatus.PENDING) {
      throw new BadRequestException('Consent request is not pending');
    }

    consent.status = ConsentStatus.DENIED;
    consent.deniedAt = new Date();
    consent.deniedBy = deniedBy;

    const updatedConsent = await consent.save();

    // Log consent denial
    await this.logConsentAction(
      consentId,
      'denied',
      deniedBy,
      actorType,
      { reason: reason || 'Consent denied by patient' }
    );

    return this.mapToResponseDto(updatedConsent);
  }

  async revokeConsent(
    consentId: string,
    revokedBy: string,
    reason?: string,
    actorType: ActorType = ActorType.PATIENT
  ): Promise<ConsentResponseDto> {
    const consent = await this.consentModel.findOne({ consentId, isActive: true });

    if (!consent) {
      throw new NotFoundException('Consent request not found');
    }

    if (consent.status !== ConsentStatus.GRANTED) {
      throw new BadRequestException('Only granted consents can be revoked');
    }

    consent.status = ConsentStatus.REVOKED;
    consent.revokedAt = new Date();
    consent.revokedBy = revokedBy;
    consent.revocationReason = reason;

    const updatedConsent = await consent.save();

    // Log consent revocation
    await this.logConsentAction(
      consentId,
      'revoked',
      revokedBy,
      actorType,
      { reason: reason || 'Consent revoked by patient' }
    );

    return this.mapToResponseDto(updatedConsent);
  }

  async getConsent(
    consentId: string,
    hospitalId?: string
  ): Promise<ConsentResponseDto> {
    const query: any = { consentId, isActive: true };
    if (hospitalId) {
      query.hospitalId = hospitalId;
    }

    const consent = await this.consentModel.findOne(query);

    if (!consent) {
      throw new NotFoundException('Consent request not found');
    }

    return this.mapToResponseDto(consent);
  }

  async getPatientConsents(
    patientId: string,
    hospitalId?: string,
    status?: ConsentStatus
  ): Promise<ConsentResponseDto[]> {
    const query: any = { patientId, isActive: true };
    if (hospitalId) {
      query.hospitalId = hospitalId;
    }
    if (status) {
      query.status = status;
    }

    const consents = await this.consentModel.find(query).sort({ createdAt: -1 });

    return consents.map(consent => this.mapToResponseDto(consent));
  }

  async getHospitalConsents(
    hospitalId: string,
    status?: ConsentStatus,
    patientId?: string
  ): Promise<ConsentResponseDto[]> {
    const query: any = { hospitalId, isActive: true };
    if (status) {
      query.status = status;
    }
    if (patientId) {
      query.patientId = patientId;
    }

    const consents = await this.consentModel.find(query).sort({ createdAt: -1 });

    return consents.map(consent => this.mapToResponseDto(consent));
  }

  async checkConsent(
    patientId: string,
    hospitalId: string,
    consentType: ConsentType
  ): Promise<{ hasConsent: boolean; consent?: ConsentResponseDto }> {
    const consent = await this.consentModel.findOne({
      patientId,
      hospitalId,
      consentType,
      status: ConsentStatus.GRANTED,
      isActive: true,
      $or: [
        { expiresAt: { $exists: false } },
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    return {
      hasConsent: !!consent,
      consent: consent ? this.mapToResponseDto(consent) : undefined
    };
  }

  async getConsentHistory(consentId: string): Promise<any[]> {
    const history = await this.consentHistoryModel
      .find({ consentId })
      .sort({ timestamp: -1 });

    return history.map(record => ({
      historyId: record.historyId,
      action: record.action,
      actorId: record.actorId,
      actorType: record.actorType,
      metadata: record.metadata,
      timestamp: record.timestamp,
    }));
  }

  async expireConsents(): Promise<number> {
    const expiredConsents = await this.consentModel.updateMany(
      {
        status: { $in: [ConsentStatus.PENDING, ConsentStatus.GRANTED] },
        expiresAt: { $lt: new Date() },
        isActive: true,
      },
      {
        status: ConsentStatus.EXPIRED,
      }
    );

    // Log expiration for each consent
    const consents = await this.consentModel.find({
      status: ConsentStatus.EXPIRED,
      expiresAt: { $lt: new Date() },
    });

    for (const consent of consents) {
      await this.logConsentAction(
        consent.consentId,
        'expired',
        'system',
        ActorType.SYSTEM,
        { reason: 'Consent automatically expired' }
      );
    }

    return expiredConsents.modifiedCount;
  }

  private async logConsentAction(
    consentId: string,
    action: string,
    actorId: string,
    actorType: ActorType,
    metadata?: any
  ): Promise<void> {
    const history = new this.consentHistoryModel({
      historyId: uuidv4(),
      consentId,
      action,
      actorId,
      actorType,
      metadata,
      timestamp: new Date(),
    });

    await history.save();
  }

  private mapToResponseDto(consent: ConsentDocument): ConsentResponseDto {
    return {
      consentId: consent.consentId,
      patientId: consent.patientId,
      hospitalId: consent.hospitalId,
      consentType: consent.consentType,
      status: consent.status,
      grantedAt: consent.grantedAt,
      expiresAt: consent.expiresAt,
      createdAt: consent.createdAt,
      updatedAt: consent.updatedAt,
    };
  }
}
