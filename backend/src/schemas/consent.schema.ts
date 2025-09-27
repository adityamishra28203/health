import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConsentDocument = Consent & Document;

export enum ConsentStatus {
  ACTIVE = 'active',
  EXPIRED = 'expired',
  REVOKED = 'revoked',
  PENDING = 'pending',
}

export enum ConsentType {
  VIEW = 'view',
  DOWNLOAD = 'download',
  SHARE = 'share',
  PROCESS = 'process',
  FULL_ACCESS = 'full_access',
}

@Schema({ timestamps: true })
export class Consent {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  patientId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  grantedToId: Types.ObjectId;

  @Prop({ type: [Types.ObjectId], ref: 'HealthRecord' })
  recordIds: Types.ObjectId[];

  @Prop({ type: [String], enum: ConsentType, required: true })
  permissions: ConsentType[];

  @Prop({ type: String, enum: ConsentStatus, default: ConsentStatus.PENDING })
  status: ConsentStatus;

  @Prop({ required: true })
  purpose: string;

  @Prop()
  description?: string;

  @Prop({ required: true })
  expiryDate: Date;

  @Prop()
  accessToken?: string;

  @Prop()
  qrCode?: string;

  @Prop()
  consentHash?: string;

  @Prop()
  blockchainTxHash?: string;

  @Prop()
  digitalSignature?: string;

  @Prop()
  patientSignature?: string;

  @Prop()
  grantedToSignature?: string;

  @Prop()
  accessCount: number;

  @Prop()
  lastAccessed?: Date;

  @Prop({ type: Object })
  accessLog?: Record<string, any>[];

  @Prop()
  isRevocable: boolean;

  @Prop()
  isTransferable: boolean;

  @Prop({ type: Object })
  conditions?: Record<string, any>;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop()
  version: number;

  @Prop()
  previousVersion?: Types.ObjectId;
}

export const ConsentSchema = SchemaFactory.createForClass(Consent);
