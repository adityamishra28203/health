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
  @Prop({ 
    required: [true, 'Patient ID is required'], 
    type: Types.ObjectId, 
    ref: 'User' 
  })
  patientId: Types.ObjectId;

  @Prop({ 
    required: [true, 'Doctor ID is required'], 
    type: Types.ObjectId, 
    ref: 'User' 
  })
  doctorId: Types.ObjectId;

  @Prop({ 
    type: Types.ObjectId, 
    ref: 'User',
    required: false 
  })
  hospitalId?: Types.ObjectId;

  @Prop({ 
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  })
  title: string;

  @Prop({ 
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  })
  description?: string;

  @Prop({ type: String, enum: RecordType, required: true })
  type: RecordType;

  @Prop({ type: String, enum: RecordStatus, default: RecordStatus.PENDING })
  status: RecordStatus;

  @Prop({ 
    required: [true, 'File hash is required'],
    match: [/^[a-fA-F0-9]{64}$/, 'File hash must be a valid SHA-256 hash']
  })
  fileHash: string;

  @Prop({ 
    required: [true, 'IPFS hash is required'],
    match: [/^Qm[1-9A-HJ-NP-Za-km-z]{44}$/, 'IPFS hash must be a valid CID']
  })
  ipfsHash: string;

  @Prop({ 
    required: false,
    trim: true,
    maxlength: [255, 'File name cannot exceed 255 characters']
  })
  fileName?: string;

  @Prop({ 
    required: false,
    min: [0, 'File size must be positive']
  })
  fileSize?: number;

  @Prop({ 
    required: false,
    trim: true,
    maxlength: [100, 'MIME type cannot exceed 100 characters']
  })
  mimeType?: string;

  @Prop({ 
    required: false,
    trim: true,
    maxlength: [2048, 'File URL cannot exceed 2048 characters']
  })
  fileUrl?: string;

  @Prop({ 
    match: [/^0x[a-fA-F0-9]{64}$/, 'Blockchain transaction hash must be a valid hex string']
  })
  blockchainTxHash?: string;

  @Prop({ 
    maxlength: [2048, 'Digital signature cannot exceed 2048 characters']
  })
  digitalSignature?: string;

  @Prop({ 
    maxlength: [2048, 'Doctor signature cannot exceed 2048 characters']
  })
  doctorSignature?: string;

  @Prop({ 
    maxlength: [2048, 'Hospital signature cannot exceed 2048 characters']
  })
  hospitalSignature?: string;

  @Prop({ 
    maxlength: [2048, 'Patient signature cannot exceed 2048 characters']
  })
  patientSignature?: string;

  @Prop({ 
    required: [true, 'Record date is required'],
    validate: {
      validator: function(v: Date) {
        return v <= new Date();
      },
      message: 'Record date cannot be in the future'
    }
  })
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
