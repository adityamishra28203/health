import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type HealthRecordDocument = HealthRecord & Document;

export enum RecordType {
  PRESCRIPTION = 'prescription',
  LAB_REPORT = 'lab_report',
  DISCHARGE_SUMMARY = 'discharge_summary',
  IMAGING = 'imaging',
  VACCINATION = 'vaccination',
  MEDICAL_CERTIFICATE = 'medical_certificate',
  OTHER = 'other',
}

export enum RecordStatus {
  PENDING = 'pending',
  VERIFIED = 'verified',
  REJECTED = 'rejected',
  EXPIRED = 'expired',
}

@Schema({ timestamps: true })
export class HealthRecord {
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  patientId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  doctorId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  hospitalId: Types.ObjectId;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: String, enum: RecordType, required: true })
  type: RecordType;

  @Prop({ type: String, enum: RecordStatus, default: RecordStatus.PENDING })
  status: RecordStatus;

  @Prop({ required: true })
  fileHash: string;

  @Prop({ required: true })
  ipfsHash: string;

  @Prop()
  blockchainTxHash?: string;

  @Prop()
  digitalSignature?: string;

  @Prop()
  doctorSignature?: string;

  @Prop()
  hospitalSignature?: string;

  @Prop()
  patientSignature?: string;

  @Prop({ required: true })
  recordDate: Date;

  @Prop()
  expiryDate?: Date;

  @Prop({ type: [String] })
  tags?: string[];

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop({ type: Object })
  medicalData?: Record<string, any>;

  @Prop()
  consentGiven: boolean;

  @Prop()
  consentExpiry?: Date;

  @Prop({ type: [Types.ObjectId], ref: 'User' })
  sharedWith?: Types.ObjectId[];

  @Prop()
  accessCount: number;

  @Prop()
  lastAccessed?: Date;

  @Prop({ type: Object })
  encryptionKey?: Record<string, any>;

  @Prop()
  isEncrypted: boolean;

  @Prop()
  version: number;

  @Prop()
  previousVersion?: Types.ObjectId;
}

export const HealthRecordSchema = SchemaFactory.createForClass(HealthRecord);
