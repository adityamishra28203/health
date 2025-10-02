import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

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

  @Prop({ 
    type: {
      street: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      postalCode: { type: String, required: true },
      country: { type: String, required: true }
    },
    required: true 
  })
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @Prop({ 
    type: {
      phone: { type: String, required: true },
      email: { type: String, required: true },
      website: { type: String, required: false }
    },
    required: true 
  })
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

  @Prop({ type: Map, of: MongooseSchema.Types.Mixed, default: {} })
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

  @Prop({ 
    type: {
      maxUsers: { type: Number, default: 100 },
      maxDocumentsPerDay: { type: Number, default: 1000 },
      allowedDocumentTypes: [{ type: String }],
      requireApprovalForDocuments: { type: Boolean, default: false },
      enableAuditLogging: { type: Boolean, default: true },
      dataRetentionDays: { type: Number, default: 2555 } // 7 years
    },
    default: {}
  })
  settings: {
    maxUsers?: number;
    maxDocumentsPerDay?: number;
    allowedDocumentTypes?: string[];
    requireApprovalForDocuments?: boolean;
    enableAuditLogging?: boolean;
    dataRetentionDays?: number;
  };

  @Prop({ 
    type: {
      hipaaCompliant: { type: Boolean, default: false },
      abdmRegistered: { type: Boolean, default: false },
      abdmHealthId: { type: String, default: '' },
      certificationExpiry: { type: Date },
      lastAuditDate: { type: Date },
      auditScore: { type: Number, default: 0 }
    },
    default: {}
  })
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

