import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type ConsentDocument = Consent & Document;

export enum ConsentType {
  HEALTH_RECORD_ACCESS = 'health_record_access',
  DATA_SHARING = 'data_sharing',
  RESEARCH_PARTICIPATION = 'research_participation',
  MARKETING = 'marketing',
  THIRD_PARTY_SHARING = 'third_party_sharing',
}

export enum ConsentStatus {
  PENDING = 'pending',
  GRANTED = 'granted',
  REVOKED = 'revoked',
  EXPIRED = 'expired',
}

@Schema({ timestamps: true })
export class Consent {
  @Prop({ 
    required: [true, 'Patient ID is required'], 
    type: Types.ObjectId, 
    ref: 'User' 
  })
  patientId: Types.ObjectId;

  @Prop({ 
    required: [true, 'Grantee ID is required'], 
    type: Types.ObjectId, 
    ref: 'User' 
  })
  granteeId: Types.ObjectId;

  @Prop({ 
    type: String, 
    enum: ConsentType, 
    required: [true, 'Consent type is required'] 
  })
  type: ConsentType;

  @Prop({ 
    type: String, 
    enum: ConsentStatus, 
    default: ConsentStatus.PENDING 
  })
  status: ConsentStatus;

  @Prop({ 
    required: [true, 'Purpose is required'],
    trim: true,
    minlength: [10, 'Purpose must be at least 10 characters long'],
    maxlength: [500, 'Purpose cannot exceed 500 characters']
  })
  purpose: string;

  @Prop({ 
    trim: true,
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  })
  description?: string;

  @Prop({ 
    required: [true, 'Granted date is required'],
    validate: {
      validator: function(v: Date) {
        return v <= new Date();
      },
      message: 'Granted date cannot be in the future'
    }
  })
  grantedDate: Date;

  @Prop({ 
    required: [true, 'Expiry date is required'],
    validate: {
      validator: function(v: Date) {
        return v > new Date();
      },
      message: 'Expiry date must be in the future'
    }
  })
  expiryDate: Date;

  @Prop({ 
    type: [Types.ObjectId], 
    ref: 'HealthRecord',
    default: []
  })
  accessibleRecords: Types.ObjectId[];

  @Prop({ 
    type: Object,
    default: {}
  })
  permissions: Record<string, boolean>;

  @Prop({ 
    match: [/^0x[a-fA-F0-9]{64}$/, 'Blockchain transaction hash must be a valid hex string']
  })
  blockchainTxHash?: string;

  @Prop({ 
    maxlength: [2048, 'Digital signature cannot exceed 2048 characters']
  })
  digitalSignature?: string;

  @Prop({ 
    maxlength: [2048, 'Patient signature cannot exceed 2048 characters']
  })
  patientSignature?: string;

  @Prop({ 
    maxlength: [2048, 'Grantee signature cannot exceed 2048 characters']
  })
  granteeSignature?: string;

  @Prop({ 
    type: Object,
    default: {}
  })
  metadata?: Record<string, any>;

  @Prop({ 
    default: 0,
    min: [0, 'Access count cannot be negative']
  })
  accessCount: number;

  @Prop()
  lastAccessed?: Date;

  @Prop({ 
    trim: true,
    maxlength: [500, 'Revocation reason cannot exceed 500 characters']
  })
  revocationReason?: string;

  @Prop()
  revokedDate?: Date;

  @Prop({ 
    default: 1,
    min: [1, 'Version must be at least 1']
  })
  version: number;

  @Prop({ 
    type: Types.ObjectId, 
    ref: 'Consent'
  })
  previousVersion?: Types.ObjectId;

  @Prop({ 
    type: [String],
    default: []
  })
  tags?: string[];

  @Prop({ 
    type: Boolean,
    default: false
  })
  isAutomated: boolean;

  @Prop({ 
    type: Boolean,
    default: true
  })
  canBeRevoked: boolean;
}

export const ConsentSchema = SchemaFactory.createForClass(Consent);

// Indexes for performance
ConsentSchema.index({ patientId: 1, granteeId: 1 });
ConsentSchema.index({ type: 1, status: 1 });
ConsentSchema.index({ grantedDate: 1 });
ConsentSchema.index({ expiryDate: 1 });
ConsentSchema.index({ blockchainTxHash: 1 });

// Virtual for consent validity
ConsentSchema.virtual('isValid').get(function() {
  return this.status === ConsentStatus.GRANTED && 
         this.expiryDate > new Date();
});

// Pre-save middleware
ConsentSchema.pre('save', function(next) {
  if (this.isNew) {
    this.grantedDate = new Date();
  }
  next();
});