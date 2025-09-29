import { 
  IsEmail, 
  IsString, 
  IsOptional, 
  MinLength, 
  MaxLength, 
  IsEnum, 
  Matches,
  IsPhoneNumber,
  Length
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum UserRole {
  PATIENT = 'patient',
  DOCTOR = 'doctor',
  HOSPITAL_ADMIN = 'hospital_admin',
  INSURER = 'insurer',
  SYSTEM_ADMIN = 'system_admin',
}

export class RegisterDto {
  @ApiProperty({ 
    description: 'User email address',
    example: 'user@example.com'
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(100, { message: 'Email cannot exceed 100 characters' })
  email: string;

  @ApiProperty({ 
    description: 'User password (min 8 characters, must contain uppercase, lowercase, and number)',
    example: 'MySecure123'
  })
  @IsString({ message: 'Password must be a string' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Password cannot exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
  })
  password: string;

  @ApiProperty({ 
    description: 'User first name',
    example: 'John'
  })
  @IsString({ message: 'First name must be a string' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  @Matches(/^[a-zA-Z\s]+$/, { message: 'First name can only contain letters and spaces' })
  firstName: string;

  @ApiProperty({ 
    description: 'User last name',
    example: 'Doe'
  })
  @IsString({ message: 'Last name must be a string' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  @Matches(/^[a-zA-Z\s]+$/, { message: 'Last name can only contain letters and spaces' })
  lastName: string;

  @ApiProperty({ 
    description: 'User phone number (optional)',
    example: '+1234567890',
    required: false
  })
  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  @Matches(/^\+?[\d\s-()]+$/, { message: 'Please provide a valid phone number' })
  @MinLength(10, { message: 'Phone number must be at least 10 digits' })
  @MaxLength(15, { message: 'Phone number cannot exceed 15 characters' })
  phone?: string;

  @ApiProperty({ 
    description: 'User role', 
    enum: UserRole, 
    default: UserRole.PATIENT,
    example: UserRole.PATIENT
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be one of: patient, doctor, hospital_admin, insurer, system_admin' })
  role?: UserRole = UserRole.PATIENT;
}

export class ChangePasswordDto {
  @ApiProperty({ 
    description: 'Current password',
    example: 'CurrentPass123'
  })
  @IsString({ message: 'Current password must be a string' })
  @MinLength(8, { message: 'Current password must be at least 8 characters long' })
  @MaxLength(128, { message: 'Current password cannot exceed 128 characters' })
  currentPassword: string;

  @ApiProperty({ 
    description: 'New password (min 8 characters, must contain uppercase, lowercase, and number)',
    example: 'NewSecure123'
  })
  @IsString({ message: 'New password must be a string' })
  @MinLength(8, { message: 'New password must be at least 8 characters long' })
  @MaxLength(128, { message: 'New password cannot exceed 128 characters' })
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
    message: 'New password must contain at least one uppercase letter, one lowercase letter, and one number'
  })
  newPassword: string;
}

export class UpdateProfileDto {
  @ApiProperty({ 
    description: 'User email address', 
    required: false,
    example: 'user@example.com'
  })
  @IsOptional()
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @MaxLength(100, { message: 'Email cannot exceed 100 characters' })
  email?: string;

  @ApiProperty({ 
    description: 'User first name', 
    required: false,
    example: 'John'
  })
  @IsOptional()
  @IsString({ message: 'First name must be a string' })
  @MinLength(2, { message: 'First name must be at least 2 characters long' })
  @MaxLength(50, { message: 'First name cannot exceed 50 characters' })
  @Matches(/^[a-zA-Z\s]+$/, { message: 'First name can only contain letters and spaces' })
  firstName?: string;

  @ApiProperty({ 
    description: 'User last name', 
    required: false,
    example: 'Doe'
  })
  @IsOptional()
  @IsString({ message: 'Last name must be a string' })
  @MinLength(2, { message: 'Last name must be at least 2 characters long' })
  @MaxLength(50, { message: 'Last name cannot exceed 50 characters' })
  @Matches(/^[a-zA-Z\s]+$/, { message: 'Last name can only contain letters and spaces' })
  lastName?: string;

  @ApiProperty({ 
    description: 'User phone number', 
    required: false,
    example: '+1234567890'
  })
  @IsOptional()
  @IsString({ message: 'Phone number must be a string' })
  @Matches(/^\+?[\d\s-()]+$/, { message: 'Please provide a valid phone number format' })
  phone?: string;

  @ApiProperty({ 
    description: 'User bio', 
    required: false,
    example: 'Software developer passionate about health technology'
  })
  @IsOptional()
  @IsString({ message: 'Bio must be a string' })
  @MaxLength(500, { message: 'Bio cannot exceed 500 characters' })
  bio?: string;

  @ApiProperty({
    description: 'User avatar URL or base64 data URL',
    required: false,
    example: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAYABgAAD...'
  })
  @IsOptional()
  @IsString({ message: 'Avatar must be a string' })
  @MaxLength(2000000, { message: 'Avatar data cannot exceed 2MB' }) // Allow up to 2MB for base64 data URLs
  avatar?: string;

  // Medical Information Fields
  @ApiProperty({
    description: 'Emergency contact information',
    required: false,
    example: '+1234567890'
  })
  @IsOptional()
  @IsString({ message: 'Emergency contact must be a string' })
  @MaxLength(100, { message: 'Emergency contact cannot exceed 100 characters' })
  emergencyContact?: string;

  @ApiProperty({
    description: 'Blood type',
    required: false,
    example: 'O+'
  })
  @IsOptional()
  @IsString({ message: 'Blood type must be a string' })
  @MaxLength(10, { message: 'Blood type cannot exceed 10 characters' })
  @Matches(/^[ABO][+-]$/, { message: 'Please provide a valid blood type (e.g., A+, B-, O+, AB+)' })
  bloodType?: string;

  @ApiProperty({
    description: 'List of allergies (comma separated)',
    required: false,
    example: 'Peanuts, Shellfish, Pollen'
  })
  @IsOptional()
  @IsString({ message: 'Allergies must be a string' })
  @MaxLength(1000, { message: 'Allergies cannot exceed 1000 characters' })
  allergies?: string;

  @ApiProperty({
    description: 'Current medications (comma separated)',
    required: false,
    example: 'Aspirin, Metformin, Lisinopril'
  })
  @IsOptional()
  @IsString({ message: 'Medications must be a string' })
  @MaxLength(1000, { message: 'Medications cannot exceed 1000 characters' })
  medications?: string;

  @ApiProperty({
    description: 'Medical conditions (comma separated)',
    required: false,
    example: 'Diabetes, Hypertension, Asthma'
  })
  @IsOptional()
  @IsString({ message: 'Medical conditions must be a string' })
  @MaxLength(1000, { message: 'Medical conditions cannot exceed 1000 characters' })
  medicalConditions?: string;

  // Professional Information Fields
  @ApiProperty({
    description: 'Organization or workplace',
    required: false,
    example: 'Apollo Hospitals'
  })
  @IsOptional()
  @IsString({ message: 'Organization must be a string' })
  @MaxLength(200, { message: 'Organization cannot exceed 200 characters' })
  organization?: string;

  @ApiProperty({
    description: 'Professional license number',
    required: false,
    example: 'MED123456'
  })
  @IsOptional()
  @IsString({ message: 'License number must be a string' })
  @MaxLength(50, { message: 'License number cannot exceed 50 characters' })
  licenseNumber?: string;

  @ApiProperty({
    description: 'Professional specialization',
    required: false,
    example: 'Cardiology'
  })
  @IsOptional()
  @IsString({ message: 'Specialization must be a string' })
  @MaxLength(100, { message: 'Specialization cannot exceed 100 characters' })
  specialization?: string;
}
