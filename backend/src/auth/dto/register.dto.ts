import { IsEmail, IsString, IsOptional, IsPhoneNumber, MinLength, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum RegistrationMethod {
  EMAIL = 'email',
  PHONE = 'phone',
  GOOGLE = 'google',
}

export class RegisterDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User password (min 8 characters)', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'User first name' })
  @IsString()
  firstName: string;

  @ApiProperty({ description: 'User last name' })
  @IsString()
  lastName: string;

  @ApiProperty({ description: 'User phone number', required: false })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({ description: 'Registration method', enum: RegistrationMethod })
  @IsEnum(RegistrationMethod)
  method: RegistrationMethod;

  @ApiProperty({ description: 'Google OAuth token', required: false })
  @IsOptional()
  @IsString()
  googleToken?: string;
}

export class VerifyEmailDto {
  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'OTP code sent to email' })
  @IsString()
  otpCode: string;
}

export class VerifyPhoneDto {
  @ApiProperty({ description: 'Phone number' })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({ description: 'OTP code sent to phone' })
  @IsString()
  otpCode: string;
}

export class ResendOtpDto {
  @ApiProperty({ description: 'Email or phone number' })
  @IsString()
  identifier: string;

  @ApiProperty({ description: 'Type of OTP to resend', enum: ['email', 'phone'] })
  @IsEnum(['email', 'phone'])
  type: 'email' | 'phone';
}
