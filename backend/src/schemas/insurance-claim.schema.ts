import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type InsuranceClaimDocument = InsuranceClaim & Document;

export enum ClaimStatus {
  DRAFT = 'draft',
  SUBMITTED = 'submitted',
  UNDER_REVIEW = 'under_review',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  PAID = 'paid',
  CANCELLED = 'cancelled',
}

export enum ClaimType {
  MEDICAL = 'medical',
  SURGERY = 'surgery',
  EMERGENCY = 'emergency',
  PREVENTIVE = 'preventive',
  MENTAL_HEALTH = 'mental_health',
  MATERNITY = 'maternity',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class InsuranceClaim {
  @Prop({ 
    required: [true, 'Patient ID is required'], 
    type: Types.ObjectId, 
    ref: 'User' 
  })
  patientId: Types.ObjectId;

  @Prop({ 
    required: [true, 'Insurer ID is required'], 
    type: Types.ObjectId, 
    ref: 'User' 
  })
  insurerId: Types.ObjectId;

  @Prop({ 
    required: [true, 'Claim number is required'],
    unique: true,
    trim: true,
    match: [/^CLM-[0-9]{8}$/, 'Claim number must be in format CLM-XXXXXXXX']
  })
  claimNumber: string;

  @Prop({ 
    required: [true, 'Policy number is required'],
    trim: true,
    minlength: [8, 'Policy number must be at least 8 characters long'],
    maxlength: [20, 'Policy number cannot exceed 20 characters']
  })
  policyNumber: string;

  @Prop({ type: String, enum: ClaimType, required: true })
  type: ClaimType;

  @Prop({ type: String, enum: ClaimStatus, default: ClaimStatus.DRAFT })
  status: ClaimStatus;

  @Prop({ 
    required: [true, 'Amount is required'],
    min: [0, 'Amount cannot be negative'],
    max: [10000000, 'Amount cannot exceed 10,000,000']
  })
  amount: number;

  @Prop({ 
    min: [0, 'Approved amount cannot be negative'],
    max: [10000000, 'Approved amount cannot exceed 10,000,000']
  })
  approvedAmount?: number;

  @Prop({ 
    required: [true, 'Description is required'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  })
  description: string;

  @Prop({ 
    required: [true, 'Incident date is required'],
    validate: {
      validator: function(v: Date) {
        return v <= new Date();
      },
      message: 'Incident date cannot be in the future'
    }
  })
  incidentDate: Date;

  @Prop()
  treatmentStartDate?: Date;

  @Prop()
  treatmentEndDate?: Date;

  @Prop({ type: [Types.ObjectId], ref: 'HealthRecord' })
  supportingRecords: Types.ObjectId[];

  @Prop({ type: [String] })
  documentHashes: string[];

  @Prop()
  blockchainTxHash?: string;

  @Prop()
  digitalSignature?: string;

  @Prop()
  patientSignature?: string;

  @Prop()
  doctorSignature?: string;

  @Prop()
  hospitalSignature?: string;

  @Prop()
  insurerSignature?: string;

  @Prop({ type: Object })
  verificationData?: Record<string, any>;

  @Prop()
  verificationStatus: string;

  @Prop()
  rejectionReason?: string;

  @Prop()
  approvalDate?: Date;

  @Prop()
  paymentDate?: Date;

  @Prop()
  paymentReference?: string;

  @Prop({ type: Object })
  metadata?: Record<string, any>;

  @Prop()
  isAutomated: boolean;

  @Prop()
  fraudScore?: number;

  @Prop()
  riskLevel?: string;

  @Prop({ type: [String] })
  tags?: string[];

  @Prop()
  priority: string;

  @Prop()
  assignedTo?: Types.ObjectId;

  @Prop()
  notes?: string;

  @Prop()
  version: number;

  @Prop()
  previousVersion?: Types.ObjectId;
}

export const InsuranceClaimSchema = SchemaFactory.createForClass(InsuranceClaim);
