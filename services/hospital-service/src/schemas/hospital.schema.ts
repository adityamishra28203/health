import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HospitalDocument = Hospital & Document;

export enum HospitalStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  SUSPENDED = 'suspended',
  REJECTED = 'rejected',
}

export enum HospitalType {
  GENERAL = 'general',
  SPECIALTY = 'specialty',
  CLINIC = 'clinic',
  LABORATORY = 'laboratory',
  DIAGNOSTIC = 'diagnostic',
  PHARMACY = 'pharmacy',
}

@Schema({ timestamps: true })
export class Hospital {
  @Prop({ required: true, unique: true })
  hospitalId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true, unique: true })
  registrationNumber: string;

  @Prop({ required: true })
  type: HospitalType;

  @Prop({ required: true })
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @Prop({ required: true })
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };

  @Prop({ type: [String], default: [] })
  specialties: string[];

  @Prop({ default: HospitalStatus.PENDING })
  status: HospitalStatus;

  @Prop({ type: [String], default: [] })
  kycDocuments: string[];

  @Prop()
  verifiedAt?: Date;

  @Prop()
  verifiedBy?: string;

  @Prop()
  certificateId?: string;

  @Prop()
  certificateIssuedAt?: Date;

  @Prop({ default: {} })
  metadata: Record<string, any>;

  @Prop({ required: true })
  tenantId: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  suspendedAt?: Date;

  @Prop()
  suspendedBy?: string;

  @Prop()
  suspensionReason?: string;

  @Prop({ type: [String], default: [] })
  allowedDomains: string[];

  @Prop({ default: {} })
  settings: {
    maxUsers?: number;
    maxDocumentsPerDay?: number;
    allowedDocumentTypes?: string[];
    requireApprovalForDocuments?: boolean;
    enableAuditLogging?: boolean;
    dataRetentionDays?: number;
  };

  @Prop({ default: {} })
  compliance: {
    hipaaCompliant: boolean;
    abdmRegistered: boolean;
    abdmHealthId: string;
    certificationExpiry?: Date;
    lastAuditDate?: Date;
    auditScore?: number;
  };

  @Prop({ type: [String], default: [] })
  tags: string[];
}

export const HospitalSchema = SchemaFactory.createForClass(Hospital);

// Indexes for performance
HospitalSchema.index({ hospitalId: 1 });
HospitalSchema.index({ registrationNumber: 1 });
HospitalSchema.index({ tenantId: 1 });
HospitalSchema.index({ status: 1 });
HospitalSchema.index({ type: 1 });
HospitalSchema.index({ 'address.city': 1 });
HospitalSchema.index({ 'address.state': 1 });
HospitalSchema.index({ specialties: 1 });
HospitalSchema.index({ createdAt: -1 });

