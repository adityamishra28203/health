import { IsString, IsEmail, IsOptional, IsArray, IsEnum, IsObject, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum HospitalType {
  GENERAL = 'general',
  SPECIALTY = 'specialty',
  CLINIC = 'clinic',
  LABORATORY = 'laboratory',
  DIAGNOSTIC = 'diagnostic',
  PHARMACY = 'pharmacy',
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

export class AddressDto {
  @ApiProperty()
  @IsString()
  street: string;

  @ApiProperty()
  @IsString()
  city: string;

  @ApiProperty()
  @IsString()
  state: string;

  @ApiProperty()
  @IsString()
  postalCode: string;

  @ApiProperty()
  @IsString()
  country: string;
}

export class ContactInfoDto {
  @ApiProperty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  website?: string;
}

export class HospitalRegistrationRequest {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  registrationNumber: string;

  @ApiProperty({ enum: HospitalType })
  @IsEnum(HospitalType)
  type: HospitalType;

  @ApiProperty({ type: AddressDto })
  @ValidateNested()
  @Type(() => AddressDto)
  address: AddressDto;

  @ApiProperty({ type: ContactInfoDto })
  @ValidateNested()
  @Type(() => ContactInfoDto)
  contactInfo: ContactInfoDto;

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialties?: string[];

  @ApiPropertyOptional({ type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  kycDocuments?: string[];

  @ApiProperty()
  @IsEmail()
  ownerEmail: string;

  @ApiProperty()
  @IsString()
  ownerName: string;
}

export class HospitalUserCreationRequest {
  @ApiProperty()
  @IsEmail()
  email: string;

  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole)
  role: UserRole;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  employeeId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsObject()
  accessControl?: any;
}

export class PatientSearchRequest {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  abhaId?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  dateOfBirth?: string;
}

export class HospitalStatsDto {
  @ApiProperty()
  totalUsers: number;

  @ApiProperty()
  totalPatients: number;

  @ApiProperty()
  totalDocuments: number;

  @ApiProperty()
  activeUsers: number;

  @ApiProperty()
  pendingVerifications: number;
}