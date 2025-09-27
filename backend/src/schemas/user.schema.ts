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

  @Prop({ type: Object })
  preferences?: Record<string, any>;

  @Prop({ type: Object })
  metadata?: Record<string, any>;
}

export const UserSchema = SchemaFactory.createForClass(User);
