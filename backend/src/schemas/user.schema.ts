import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  HOSPITAL_ADMIN = 'hospital_admin',
  INSURER = 'insurer',
  SYSTEM_ADMIN = 'system_admin',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
  PENDING_VERIFICATION = 'pending_verification',
}

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  phone?: string;

  @Prop()
  avatar?: string;

  @Prop({ type: String, enum: UserRole, default: UserRole.PATIENT })
  role: UserRole;

  @Prop({ type: String, enum: UserStatus, default: UserStatus.PENDING_VERIFICATION })
  status: UserStatus;

  @Prop()
  organization?: string;

  @Prop()
  licenseNumber?: string;

  @Prop()
  specialization?: string;

  @Prop()
  aadhaarNumber?: string;

  @Prop()
  aadhaarVerified: boolean;

  @Prop()
  mobileVerified: boolean;

  @Prop()
  emailVerified: boolean;

  @Prop()
  lastLogin?: Date;

  @Prop()
  twoFactorEnabled: boolean;

  @Prop()
  twoFactorSecret?: string;

  @Prop()
  refreshToken?: string;

  @Prop()
  resetPasswordToken?: string;

  @Prop()
  resetPasswordExpires?: Date;

  @Prop()
  verificationToken?: string;

  @Prop()
  verificationExpires?: Date;

  // Google OAuth
  @Prop()
  googleId?: string;

  @Prop()
  googleEmail?: string;

  // OTP Verification
  @Prop()
  phoneOtpCode?: string;

  @Prop()
  phoneOtpExpiry?: Date;

  @Prop()
  emailOtpCode?: string;

  @Prop()
  emailOtpExpiry?: Date;

  // Login Attempts
  @Prop({ default: 0 })
  loginAttempts: number;

  @Prop()
  lockUntil?: Date;

  // Security
  @Prop()
  refreshTokenExpiry?: Date;

  // Profile
  @Prop()
  bio?: string;

  @Prop()
  emergencyContact?: string;

  @Prop()
  bloodType?: string;

  @Prop()
  allergies?: string[];

  @Prop()
  medications?: string[];

  @Prop()
  medicalConditions?: string[];

  @Prop({ type: Object })
  preferences?: Record<string, any>;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const UserSchema = SchemaFactory.createForClass(User);

// Add indexes for better performance
UserSchema.index({ email: 1 });
UserSchema.index({ phone: 1 });
UserSchema.index({ googleId: 1 });
UserSchema.index({ verificationToken: 1 });
UserSchema.index({ resetPasswordToken: 1 });
UserSchema.index({ phoneOtpCode: 1 });
UserSchema.index({ emailOtpCode: 1 });
