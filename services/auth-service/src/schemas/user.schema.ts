import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserType {
  PATIENT = 'patient',
  HOSPITAL_ADMIN = 'hospital_admin',
  HOSPITAL_USER = 'hospital_user',
  SYSTEM_ADMIN = 'system_admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
  BLOCKED = 'blocked',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  userId: string;

  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  userType: UserType;

  @Prop({ default: UserStatus.PENDING_VERIFICATION })
  status: UserStatus;

  @Prop()
  abhaId?: string;

  @Prop()
  keycloakId?: string;

  @Prop()
  firstName?: string;

  @Prop()
  lastName?: string;

  @Prop()
  phone?: string;

  @Prop()
  dateOfBirth?: Date;

  @Prop()
  gender?: string;

  @Prop()
  address?: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };

  @Prop()
  profilePicture?: string;

  @Prop({ default: false })
  emailVerified: boolean;

  @Prop({ default: false })
  phoneVerified: boolean;

  @Prop({ default: false })
  abhaVerified: boolean;

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
    location?: string;
    device?: string;
  }>;

  @Prop({ default: [] })
  failedLoginAttempts: Array<{
    timestamp: Date;
    ipAddress: string;
    userAgent: string;
    reason: string;
  }>;

  @Prop()
  lastLoginAt?: Date;

  @Prop()
  lastLoginIp?: string;

  @Prop()
  passwordChangedAt?: Date;

  @Prop({ default: [] })
  passwordHistory: string[];

  @Prop({ default: false })
  passwordChangeRequired: boolean;

  @Prop({ default: {} })
  preferences: {
    language: string;
    timezone: string;
    notifications: {
      email: boolean;
      sms: boolean;
      push: boolean;
      marketing: boolean;
    };
    privacy: {
      profileVisibility: string;
      dataSharing: boolean;
      analyticsOptIn: boolean;
    };
  };

  @Prop({ default: {} })
  metadata: {
    tenantId?: string;
    hospitalId?: string;
    role?: string;
    permissions?: string[];
    department?: string;
    employeeId?: string;
    licenseNumber?: string;
    specialization?: string;
    qualifications?: string[];
    [key: string]: any;
  };

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  suspendedAt?: Date;

  @Prop()
  suspendedBy?: string;

  @Prop()
  suspensionReason?: string;

  @Prop()
  blockedAt?: Date;

  @Prop()
  blockedBy?: string;

  @Prop()
  blockReason?: string;

  @Prop({ default: [] })
  tags: string[];

  @Prop({ default: {} })
  security: {
    accountLocked: boolean;
    lockReason?: string;
    lockExpiresAt?: Date;
    suspiciousActivityDetected: boolean;
    lastSecurityAlert?: Date;
    trustedDevices: Array<{
      deviceId: string;
      deviceName: string;
      lastUsed: Date;
      ipAddress: string;
    }>;
  };

  @Prop({ default: {} })
  consent: {
    termsAccepted: boolean;
    termsAcceptedAt?: Date;
    privacyPolicyAccepted: boolean;
    privacyPolicyAcceptedAt?: Date;
    dataProcessingConsent: boolean;
    dataProcessingConsentAt?: Date;
    marketingConsent: boolean;
    marketingConsentAt?: Date;
  };
}

export const UserSchema = SchemaFactory.createForClass(User);

// Indexes for performance
UserSchema.index({ userId: 1 });
UserSchema.index({ email: 1 });
UserSchema.index({ userType: 1 });
UserSchema.index({ status: 1 });
UserSchema.index({ abhaId: 1 });
UserSchema.index({ keycloakId: 1 });
UserSchema.index({ 'metadata.tenantId': 1 });
UserSchema.index({ 'metadata.hospitalId': 1 });
UserSchema.index({ createdAt: -1 });
UserSchema.index({ lastLoginAt: -1 });

