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

export class LoginDto {
  @ApiProperty({ description: 'User email or phone number' })
  @IsString()
  identifier: string;

  @ApiProperty({ description: 'User password', required: false })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ description: 'Login method', enum: ['password', 'otp', 'google'] })
  @IsEnum(['password', 'otp', 'google'])
  method: 'password' | 'otp' | 'google' = 'password';

  @ApiProperty({ description: 'Google OAuth token', required: false })
  @IsOptional()
  @IsString()
  googleToken?: string;
}

export class OtpLoginDto {
  @ApiProperty({ description: 'User email or phone number' })
  @IsString()
  identifier: string;

  @ApiProperty({ description: 'OTP code for login' })
  @IsString()
  otpCode: string;

  @ApiProperty({ description: 'Type of identifier', enum: ['email', 'phone'] })
  @IsEnum(['email', 'phone'])
  type: 'email' | 'phone';
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token' })
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Password reset token' })
  @IsString()
  token: string;

  @ApiProperty({ description: 'New password (min 8 characters)', minLength: 8 })
  @IsString()
  @MinLength(8)
  newPassword: string;
}
