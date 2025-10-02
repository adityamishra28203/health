import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConsentDocument = Consent & Document;

export enum ConsentStatus {
  PENDING = 'pending',
  GRANTED = 'granted',
  DENIED = 'denied',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
}

export enum ConsentType {
  DOCUMENT_ACCESS = 'document_access',
  MEDICAL_RECORD_SHARING = 'medical_record_sharing',
  TREATMENT_CONSENT = 'treatment_consent',
  DATA_PROCESSING = 'data_processing',
  RESEARCH_PARTICIPATION = 'research_participation',
  INSURANCE_SHARING = 'insurance_sharing',
}

export enum ConsentScope {
  SINGLE_DOCUMENT = 'single_document',
  DOCUMENT_TYPE = 'document_type',
  ALL_DOCUMENTS = 'all_documents',
  SPECIFIC_TIME_PERIOD = 'specific_time_period',
  ONGOING_ACCESS = 'ongoing_access',
}

@Schema({ timestamps: true })
export class Consent {
  @Prop({ required: true })
  consentId: string;

  @Prop({ required: true })
  patientId: string;

  @Prop({ required: true })
  hospitalId: string;

  @Prop()
  requesterId: string; // Hospital staff who requested consent

  @Prop({ required: true, enum: ConsentType })
  type: ConsentType;

  @Prop({ required: true, enum: ConsentScope })
  scope: ConsentScope;

  @Prop({ required: true, enum: ConsentStatus, default: ConsentStatus.PENDING })
  status: ConsentStatus;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  description: string;

  @Prop({ type: [String], default: [] })
  documentIds: string[];

  @Prop({ type: [String], default: [] })
  documentTypes: string[];

  @Prop()
  timePeriodStart: Date;

  @Prop()
  timePeriodEnd: Date;

  @Prop()
  requestedAt: Date;

  @Prop()
  respondedAt: Date;

  @Prop()
  expiresAt: Date;

  @Prop()
  revokedAt: Date;

  @Prop()
  revocationReason: string;

  @Prop({ type: Object, default: {} })
  patientResponse: {
    decision: 'granted' | 'denied';
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    signature?: string;
    notes?: string;
  };

  @Prop({ type: Object, default: {} })
  hospitalRequest: {
    purpose: string;
    duration: string;
    dataTypes: string[];
    recipients: string[];
    notes?: string;
  };

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop({ default: false })
  isActive: boolean;

  @Prop({ default: false })
  isRevocable: boolean;

  @Prop({ default: false })
  requiresSignature: boolean;

  @Prop()
  signatureData: string;

  @Prop()
  consentVersion: string;

  @Prop()
  previousConsentId: string; // Link to previous version if updated

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  complianceStandard: string; // HIPAA, GDPR, IRDAI, etc.

  @Prop({ default: 0 })
  accessCount: number;

  @Prop()
  lastAccessedAt: Date;

  @Prop({ type: [Object], default: [] })
  accessLog: Array<{
    timestamp: Date;
    userId: string;
    action: string;
    ipAddress: string;
    userAgent: string;
  }>;

  @Prop({ default: false })
  isEmergencyConsent: boolean;

  @Prop()
  emergencyReason: string;

  @Prop()
  emergencyExpiresAt: Date;
}

export const ConsentSchema = SchemaFactory.createForClass(Consent);


