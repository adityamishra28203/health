import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type HospitalUserDocument = HospitalUser & Document;

export enum UserRole {
  ADMIN = 'admin',
  DOCTOR = 'doctor',
  NURSE = 'nurse',
  BILLING_CLERK = 'billing_clerk',
  LAB_TECHNICIAN = 'lab_technician',
  RADIOLOGIST = 'radiologist',
  PHARMACIST = 'pharmacist',
  RECEPTIONIST = 'receptionist',
  VIEWER = 'viewer',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

@Schema({ timestamps: true })
export class HospitalUser {
  @Prop({ required: true })
  userId: string;

  @Prop({ required: true })
  hospitalId: string;

  @Prop({ required: true })
  tenantId: string;

  @Prop({ required: true })
  email: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop({ required: true })
  role: UserRole;

  @Prop({ type: [String], default: [] })
  permissions: string[];

  @Prop({ default: UserStatus.PENDING_VERIFICATION })
  status: UserStatus;

  @Prop()
  phone?: string;

  @Prop()
  department?: string;

  @Prop()
  employeeId?: string;

  @Prop()
  licenseNumber?: string;

  @Prop()
  specialization?: string;

  @Prop()
  qualifications?: string[];

  @Prop()
  lastLoginAt?: Date;

  @Prop()
  lastLoginIp?: string;

  @Prop({ default: false })
  twoFactorEnabled: boolean;

  @Prop()
  twoFactorSecret?: string;

  @Prop({ default: [] })
  twoFactorBackupCodes: string[];

  @Prop({ default: [] })
  loginHistory: Array<{
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    success: boolean;
  }>;

  @Prop({ default: [] })
  failedLoginAttempts: Array<{
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
  }>;

  @Prop({ default: false })
  passwordChangeRequired: boolean;

  @Prop()
  passwordChangedAt?: Date;

  @Prop({ default: [] })
  passwordHistory: string[];

  @Prop({ default: {} })
  preferences: {
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
    };
    dashboard: {
      defaultView: string;
      widgets: string[];
    };
  };

  @Prop({ default: {} })
  metadata: Record<string, any>;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  createdBy?: string;

  @Prop()
  updatedBy?: string;

  @Prop()
  suspendedAt?: Date;

  @Prop()
  suspendedBy?: string;

  @Prop()
  suspensionReason?: string;

  @Prop({ default: [] })
  assignedPatients: string[];

  @Prop({ default: [] })
  assignedDepartments: string[];

  @Prop({ default: {} })
  accessControl: {
    allowedDocumentTypes: string[];
    maxDocumentsPerDay: number;
    allowedPatientData: string[];
    restrictedHours: {
      start: string;
      end: string;
    }[];
  };
}

export const HospitalUserSchema = SchemaFactory.createForClass(HospitalUser);

// Indexes for performance
HospitalUserSchema.index({ userId: 1 });
HospitalUserSchema.index({ hospitalId: 1 });
HospitalUserSchema.index({ tenantId: 1 });
HospitalUserSchema.index({ email: 1 });
HospitalUserSchema.index({ role: 1 });
HospitalUserSchema.index({ status: 1 });
HospitalUserSchema.index({ 'accessControl.allowedDocumentTypes': 1 });
HospitalUserSchema.index({ createdAt: -1 });

