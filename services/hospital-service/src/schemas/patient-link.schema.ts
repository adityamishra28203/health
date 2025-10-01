import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type PatientLinkDocument = PatientLink & Document;

export enum LinkStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  REVOKED = 'revoked',
}

export enum LinkType {
  REGULAR = 'regular',
  EMERGENCY = 'emergency',
  RESEARCH = 'research',
  INSURANCE = 'insurance',
}

@Schema({ timestamps: true })
export class PatientLink {
  @Prop({ required: true })
  linkId: string;

  @Prop({ required: true })
  hospitalId: string;

  @Prop({ required: true })
  patientId: string;

  @Prop({ required: true })
  abhaId: string;

  @Prop({ required: true })
  tenantId: string;

  @Prop({ default: LinkStatus.PENDING })
  status: LinkStatus;

  @Prop({ default: LinkType.REGULAR })
  type: LinkType;

  @Prop({ required: true })
  linkedBy: string;

  @Prop({ required: true })
  linkedByUserId: string;

  @Prop()
  linkedAt?: Date;

  @Prop()
  verifiedAt?: Date;

  @Prop()
  verifiedBy?: string;

  @Prop()
  revokedAt?: Date;

  @Prop()
  revokedBy?: string;

  @Prop()
  revocationReason?: string;

  @Prop({ default: {} })
  patientInfo: {
    name: string;
    dateOfBirth: Date;
    gender: string;
    phone?: string;
    email?: string;
    address?: {
      street: string;
      city: string;
      state: string;
      postalCode: string;
      country: string;
    };
  };

  @Prop({ default: [] })
  consentRecords: Array<{
    consentId: string;
    purpose: string;
    grantedAt: Date;
    expiresAt?: Date;
    grantedBy: string;
    blockchainTx?: string;
  }>;

  @Prop({ default: [] })
  accessHistory: Array<{
    timestamp: Date;
    action: string;
    performedBy: string;
    details: Record<string, any>;
  }>;

  @Prop({ default: [] })
  documentAccess: Array<{
    documentId: string;
    accessedAt: Date;
    accessedBy: string;
    purpose: string;
    duration: number; // in seconds
  }>;

  @Prop({ default: {} })
  permissions: {
    canViewDocuments: boolean;
    canUploadDocuments: boolean;
    canModifyDocuments: boolean;
    canAccessEmergencyData: boolean;
    allowedDocumentTypes: string[];
    restrictedHours: {
      start: string;
      end: string;
    }[];
  };

  @Prop({ default: {} })
  metadata: Record<string, any>;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: [] })
  tags: string[];

  @Prop()
  lastAccessedAt?: Date;

  @Prop()
  lastAccessedBy?: string;

  @Prop({ default: 0 })
  accessCount: number;

  @Prop({ default: [] })
  notifications: Array<{
    type: string;
    message: string;
    timestamp: Date;
    read: boolean;
  }>;
}

export const PatientLinkSchema = SchemaFactory.createForClass(PatientLink);

// Indexes for performance
PatientLinkSchema.index({ linkId: 1 });
PatientLinkSchema.index({ hospitalId: 1 });
PatientLinkSchema.index({ patientId: 1 });
PatientLinkSchema.index({ abhaId: 1 });
PatientLinkSchema.index({ tenantId: 1 });
PatientLinkSchema.index({ status: 1 });
PatientLinkSchema.index({ type: 1 });
PatientLinkSchema.index({ linkedBy: 1 });
PatientLinkSchema.index({ linkedAt: -1 });
PatientLinkSchema.index({ lastAccessedAt: -1 });

