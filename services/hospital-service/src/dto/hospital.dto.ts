import { IsString, IsEmail, IsOptional, IsArray, IsEnum, IsNumber, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export enum HospitalType {
  GENERAL = 'general',
  SPECIALTY = 'specialty',
  CLINIC = 'clinic',
  DIAGNOSTIC_CENTER = 'diagnostic_center',
  PHARMACY = 'pharmacy',
}

export enum HospitalStatus {
  PENDING = 'pending',
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  INACTIVE = 'inactive',
}

export class AddressDto {
  @ApiProperty({ description: 'Street address' })
  @IsString()
  street: string;

  @ApiProperty({ description: 'City' })
  @IsString()
  city: string;

  @ApiProperty({ description: 'State' })
  @IsString()
  state: string;

  @ApiProperty({ description: 'Postal code' })
  @IsString()
  postalCode: string;

  @ApiProperty({ description: 'Country' })
  @IsString()
  country: string;
}

export class ContactInfoDto {
  @ApiProperty({ description: 'Phone number' })
  @IsString()
  phone: string;

  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Website URL', required: false })
  @IsOptional()
  @IsString()
  website?: string;
}

export class HospitalRegistrationRequest {
  @ApiProperty({ description: 'Hospital name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Hospital registration number' })
  @IsString()
  registrationNumber: string;

  @ApiProperty({ description: 'Hospital type', enum: HospitalType })
  @IsEnum(HospitalType)
  type: HospitalType;

  @ApiProperty({ description: 'Hospital address' })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiProperty({ description: 'Contact information' })
  @ValidateNested()
  @Type(() => ContactInfoDto)
  contactInfo: ContactInfoDto;

  @ApiProperty({ description: 'List of specialties', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @ApiProperty({ description: 'KYC documents', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  kycDocuments?: string[];

  @ApiProperty({ description: 'Owner email address' })
  @IsEmail()
  ownerEmail: string;

  @ApiProperty({ description: 'Owner name' })
  @IsString()
  ownerName: string;
}

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

export class HospitalUserCreationRequest {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User name' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'User role', enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiProperty({ description: 'User phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ description: 'Department', required: false })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiProperty({ description: 'Employee ID', required: false })
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiProperty({ description: 'Access control settings', required: false })
  @IsOptional()
  @IsObject()
  accessControl?: any;
}

export enum PatientSearchType {
  ABHA_ID = 'abha_id',
  MOBILE = 'mobile',
  EMAIL = 'email',
  NAME = 'name',
  DOB = 'dob',
}

export class PatientSearchRequest {
  @ApiProperty({ description: 'Search type', enum: PatientSearchType })
  @IsEnum(PatientSearchType)
  searchType: PatientSearchType;

  @ApiProperty({ description: 'Search value' })
  @IsString()
  searchValue: string;

  @ApiProperty({ description: 'Additional search criteria', required: false })
  @IsOptional()
  @IsObject()
  additionalCriteria?: any;
}

export class HospitalStatsDto {
  @ApiProperty({ description: 'Total users' })
  totalUsers: number;

  @ApiProperty({ description: 'Total patients' })
  totalPatients: number;

  @ApiProperty({ description: 'Total documents' })
  totalDocuments: number;

  @ApiProperty({ description: 'Active users' })
  activeUsers: number;

  @ApiProperty({ description: 'Pending verifications' })
  pendingVerifications: number;
}
