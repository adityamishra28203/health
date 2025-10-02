import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type DocumentDocument = DocumentEntity & Document;

export enum DocumentCategory {
  LAB_REPORT = 'lab_report',
  PRESCRIPTION = 'prescription',
  DISCHARGE_SUMMARY = 'discharge_summary',
  CONSULTATION = 'consultation',
  RADIOLOGY = 'radiology',
  PATHOLOGY = 'pathology',
  SURGERY_REPORT = 'surgery_report',
  EMERGENCY_REPORT = 'emergency_report',
  VACCINATION = 'vaccination',
  OTHER = 'other'
}

export enum VerificationStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  FAILED = 'failed',
  EXPIRED = 'expired'
}

@Schema({ timestamps: true })
export class DocumentEntity {
  @Prop({ required: true, unique: true })
  documentId: string;

  @Prop({ required: true })
  patientId: string;

  @Prop({ required: true })
  hospitalId: string;

  @Prop({ required: true })
  uploaderId: string;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ required: true, enum: DocumentCategory })
  category: DocumentCategory;

  @Prop({ required: true })
  filePath: string;

  @Prop({ required: true })
  fileHash: string;

  @Prop({ required: true })
  fileSize: number;

  @Prop({ required: true })
  mimeType: string;

  @Prop()
  originalFileName?: string;

  @Prop()
  blockchainHash?: string;

  @Prop({ required: true, enum: VerificationStatus, default: VerificationStatus.PENDING })
  verificationStatus: VerificationStatus;

  @Prop()
  verifiedAt?: Date;

  @Prop()
  verifiedBy?: string;

  @Prop()
  verificationNotes?: string;

  @Prop({ type: Object })
  metadata?: {
    visitId?: string;
    doctorName?: string;
    department?: string;
    diagnosis?: string;
    treatment?: string;
    followUpDate?: Date;
    urgency?: 'low' | 'medium' | 'high' | 'critical';
    tags?: string[];
  };

  @Prop({ type: Object })
  accessControl?: {
    isPublic: boolean;
    allowedRoles?: string[];
    allowedUsers?: string[];
    expiresAt?: Date;
  };

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  deletedAt?: Date;

  @Prop()
  deletedBy?: string;

  @Prop()
  deletionReason?: string;
}

@Schema({ timestamps: true })
export class DocumentAccessLog {
  @Prop({ required: true, unique: true })
  logId: string;

  @Prop({ required: true })
  documentId: string;

  @Prop({ required: true })
  accessedBy: string;

  @Prop({ required: true, enum: ['view', 'download', 'verify', 'share'] })
  accessType: string;

  @Prop()
  ipAddress?: string;

  @Prop()
  userAgent?: string;

  @Prop({ type: Object })
  metadata?: {
    reason?: string;
    consentId?: string;
    duration?: number; // in seconds
    bytesTransferred?: number;
  };

  @Prop({ required: true })
  timestamp: Date;
}

export const DocumentSchema = SchemaFactory.createForClass(DocumentEntity);
export const DocumentAccessLogSchema = SchemaFactory.createForClass(DocumentAccessLog);

// Indexes
DocumentSchema.index({ patientId: 1, hospitalId: 1 });
DocumentSchema.index({ documentId: 1 }, { unique: true });
DocumentSchema.index({ uploaderId: 1 });
DocumentSchema.index({ category: 1 });
DocumentSchema.index({ verificationStatus: 1 });
DocumentSchema.index({ createdAt: -1 });
DocumentSchema.index({ fileHash: 1 });

DocumentAccessLogSchema.index({ documentId: 1 });
DocumentAccessLogSchema.index({ accessedBy: 1 });
DocumentAccessLogSchema.index({ timestamp: -1 });
