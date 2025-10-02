import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ConsentDocument = Consent & Document;

export enum ConsentType {
  VIEW_RECORDS = 'view_records',
  UPLOAD_RECORDS = 'upload_records',
  SHARE_DATA = 'share_data',
  EMERGENCY_ACCESS = 'emergency_access'
}

export enum ConsentStatus {
  PENDING = 'pending',
  GRANTED = 'granted',
  DENIED = 'denied',
  REVOKED = 'revoked',
  EXPIRED = 'expired'
}

export enum ActorType {
  PATIENT = 'patient',
  HOSPITAL = 'hospital',
  SYSTEM = 'system'
}

@Schema({ timestamps: true })
export class Consent {
  @Prop({ required: true, unique: true })
  consentId: string;

  @Prop({ required: true })
  patientId: string;

  @Prop({ required: true })
  hospitalId: string;

  @Prop({ required: true, enum: ConsentType })
  consentType: ConsentType;

  @Prop({ required: true, enum: ConsentStatus, default: ConsentStatus.PENDING })
  status: ConsentStatus;

  @Prop()
  grantedAt?: Date;

  @Prop()
  expiresAt?: Date;

  @Prop()
  deniedAt?: Date;

  @Prop()
  revokedAt?: Date;

  @Prop()
  revokedBy?: string;

  @Prop()
  revocationReason?: string;

  @Prop({ type: Object })
  metadata?: {
    purpose?: string;
    dataTypes?: string[];
    duration?: number; // in days
    emergencyAccess?: boolean;
  };

  @Prop({ required: true })
  requestedBy: string;

  @Prop()
  grantedBy?: string;

  @Prop()
  deniedBy?: string;

  @Prop({ default: true })
  isActive: boolean;
}

@Schema({ timestamps: true })
export class ConsentHistory {
  @Prop({ required: true, unique: true })
  historyId: string;

  @Prop({ required: true })
  consentId: string;

  @Prop({ required: true, enum: ['created', 'granted', 'denied', 'revoked', 'expired'] })
  action: string;

  @Prop({ required: true })
  actorId: string;

  @Prop({ required: true, enum: ActorType })
  actorType: ActorType;

  @Prop({ type: Object })
  metadata?: {
    reason?: string;
    ipAddress?: string;
    userAgent?: string;
    previousStatus?: ConsentStatus;
  };

  @Prop({ required: true })
  timestamp: Date;
}

export const ConsentSchema = SchemaFactory.createForClass(Consent);
export const ConsentHistorySchema = SchemaFactory.createForClass(ConsentHistory);

// Indexes
ConsentSchema.index({ patientId: 1, hospitalId: 1 });
ConsentSchema.index({ consentId: 1 }, { unique: true });
ConsentSchema.index({ status: 1 });
ConsentSchema.index({ expiresAt: 1 });

ConsentHistorySchema.index({ consentId: 1 });
ConsentHistorySchema.index({ timestamp: -1 });
