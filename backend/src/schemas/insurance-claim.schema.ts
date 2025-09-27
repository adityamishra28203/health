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
  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  patientId: Types.ObjectId;

  @Prop({ required: true, type: Types.ObjectId, ref: 'User' })
  insurerId: Types.ObjectId;

  @Prop({ required: true })
  claimNumber: string;

  @Prop({ required: true })
  policyNumber: string;

  @Prop({ type: String, enum: ClaimType, required: true })
  type: ClaimType;

  @Prop({ type: String, enum: ClaimStatus, default: ClaimStatus.DRAFT })
  status: ClaimStatus;

  @Prop({ required: true })
  amount: number;

  @Prop()
  approvedAmount?: number;

  @Prop()
  description: string;

  @Prop({ required: true })
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
