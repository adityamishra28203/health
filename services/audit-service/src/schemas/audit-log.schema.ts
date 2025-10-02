import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

export enum AuditEventType {
  // Authentication Events
  USER_LOGIN = 'user_login',
  USER_LOGOUT = 'user_logout',
  LOGIN_FAILED = 'login_failed',
  PASSWORD_CHANGED = 'password_changed',
  TWO_FACTOR_ENABLED = 'two_factor_enabled',
  TWO_FACTOR_DISABLED = 'two_factor_disabled',

  // Document Events
  DOCUMENT_UPLOADED = 'document_uploaded',
  DOCUMENT_DOWNLOADED = 'document_downloaded',
  DOCUMENT_VIEWED = 'document_viewed',
  DOCUMENT_DELETED = 'document_deleted',
  DOCUMENT_SHARED = 'document_shared',
  DOCUMENT_VERIFIED = 'document_verified',

  // Consent Events
  CONSENT_REQUESTED = 'consent_requested',
  CONSENT_GRANTED = 'consent_granted',
  CONSENT_DENIED = 'consent_denied',
  CONSENT_REVOKED = 'consent_revoked',
  CONSENT_EXPIRED = 'consent_expired',

  // Hospital Events
  HOSPITAL_REGISTERED = 'hospital_registered',
  HOSPITAL_VERIFIED = 'hospital_verified',
  HOSPITAL_SUSPENDED = 'hospital_suspended',
  HOSPITAL_USER_ADDED = 'hospital_user_added',
  HOSPITAL_USER_REMOVED = 'hospital_user_removed',

  // Patient Events
  PATIENT_REGISTERED = 'patient_registered',
  PATIENT_PROFILE_UPDATED = 'patient_profile_updated',
  PATIENT_LINKED_TO_HOSPITAL = 'patient_linked_to_hospital',
  PATIENT_UNLINKED_FROM_HOSPITAL = 'patient_unlinked_from_hospital',

  // System Events
  SYSTEM_ERROR = 'system_error',
  SECURITY_BREACH = 'security_breach',
  DATA_EXPORT = 'data_export',
  DATA_IMPORT = 'data_import',
  BACKUP_CREATED = 'backup_created',
  BACKUP_RESTORED = 'backup_restored',

  // API Events
  API_ACCESS = 'api_access',
  API_ERROR = 'api_error',
  RATE_LIMIT_EXCEEDED = 'rate_limit_exceeded',

  // Insurance Events
  CLAIM_SUBMITTED = 'claim_submitted',
  CLAIM_APPROVED = 'claim_approved',
  CLAIM_REJECTED = 'claim_rejected',
  CLAIM_PROCESSED = 'claim_processed',
}

export enum AuditSeverity {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

export enum AuditCategory {
  AUTHENTICATION = 'authentication',
  AUTHORIZATION = 'authorization',
  DATA_ACCESS = 'data_access',
  DATA_MODIFICATION = 'data_modification',
  SYSTEM_ADMINISTRATION = 'system_administration',
  SECURITY = 'security',
  COMPLIANCE = 'compliance',
  BUSINESS_OPERATION = 'business_operation',
}

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ required: true })
  logId: string;

  @Prop({ required: true, enum: AuditEventType })
  eventType: AuditEventType;

  @Prop({ required: true, enum: AuditCategory })
  category: AuditCategory;

  @Prop({ required: true, enum: AuditSeverity })
  severity: AuditSeverity;

  @Prop({ required: true })
  timestamp: Date;

  @Prop({ required: true })
  userId: string;

  @Prop()
  userType: 'patient' | 'hospital' | 'admin' | 'system';

  @Prop()
  userName: string;

  @Prop()
  userEmail: string;

  @Prop()
  sessionId: string;

  @Prop({ required: true })
  action: string;

  @Prop({ required: true })
  resource: string;

  @Prop()
  resourceId: string;

  @Prop()
  resourceType: string;

  @Prop({ required: true })
  ipAddress: string;

  @Prop()
  userAgent: string;

  @Prop()
  deviceInfo: {
    type: string;
    os: string;
    browser: string;
    version: string;
  };

  @Prop()
  location: {
    country: string;
    region: string;
    city: string;
    coordinates: {
      latitude: number;
      longitude: number;
    };
  };

  @Prop({ type: Object, default: {} })
  requestData: Record<string, any>;

  @Prop({ type: Object, default: {} })
  responseData: Record<string, any>;

  @Prop()
  statusCode: number;

  @Prop()
  errorMessage: string;

  @Prop()
  errorStack: string;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop()
  hospitalId: string;

  @Prop()
  patientId: string;

  @Prop()
  documentId: string;

  @Prop()
  consentId: string;

  @Prop()
  claimId: string;

  @Prop({ default: false })
  isSensitive: boolean;

  @Prop({ default: false })
  isComplianceRelevant: boolean;

  @Prop()
  complianceStandard: string; // HIPAA, GDPR, IRDAI, SOX, etc.

  @Prop()
  retentionPeriod: number; // Days to retain this log

  @Prop()
  hash: string; // Cryptographic hash for integrity verification

  @Prop({ default: false })
  isEncrypted: boolean;

  @Prop()
  encryptionKey: string;

  @Prop({ default: false })
  isAnonymized: boolean;

  @Prop({ type: [String], default: [] })
  tags: string[];

  @Prop()
  correlationId: string; // For tracking related events

  @Prop()
  parentLogId: string; // For event chains

  @Prop({ default: false })
  isReplicated: boolean; // For backup/replication tracking

  @Prop()
  source: string; // Which service generated this log

  @Prop()
  version: string; // Log format version

  @Prop({ default: 0 })
  size: number; // Log entry size in bytes
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Indexes for better query performance
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ eventType: 1, timestamp: -1 });
AuditLogSchema.index({ category: 1, timestamp: -1 });
AuditLogSchema.index({ severity: 1, timestamp: -1 });
AuditLogSchema.index({ hospitalId: 1, timestamp: -1 });
AuditLogSchema.index({ patientId: 1, timestamp: -1 });
AuditLogSchema.index({ resourceId: 1, timestamp: -1 });
AuditLogSchema.index({ ipAddress: 1, timestamp: -1 });
AuditLogSchema.index({ isComplianceRelevant: 1, timestamp: -1 });
AuditLogSchema.index({ correlationId: 1 });
AuditLogSchema.index({ logId: 1 }, { unique: true });


