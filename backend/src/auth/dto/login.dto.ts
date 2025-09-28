import { IsEmail, IsString, IsOptional, IsPhoneNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export enum LoginMethod {
  EMAIL = 'email',
  PHONE = 'phone',
  GOOGLE = 'google',
}

export class LoginDto {
  @ApiProperty({ description: 'Email address or phone number' })
  @IsString()
  identifier: string;

  @ApiProperty({ description: 'Password (not required for Google OAuth)' })
  @IsOptional()
  @IsString()
  password?: string;

  @ApiProperty({ description: 'Login method', enum: LoginMethod })
  @IsEnum(LoginMethod)
  method: LoginMethod;

  @ApiProperty({ description: 'Google OAuth token', required: false })
  @IsOptional()
  @IsString()
  googleToken?: string;

  @ApiProperty({ description: 'Remember me for extended session', required: false })
  @IsOptional()
  rememberMe?: boolean;
}

export class OtpLoginDto {
  @ApiProperty({ description: 'Phone number or email' })
  @IsString()
  identifier: string;

  @ApiProperty({ description: 'OTP code' })
  @IsString()
  otpCode: string;

  @ApiProperty({ description: 'Type of OTP', enum: ['email', 'phone'] })
  @IsEnum(['email', 'phone'])
  type: 'email' | 'phone';
}

export class RefreshTokenDto {
  @ApiProperty({ description: 'Refresh token' })
  @IsString()
  refreshToken: string;
}

export class ForgotPasswordDto {
  @ApiProperty({ description: 'Email address' })
  @IsEmail()
  email: string;
}

export class ResetPasswordDto {
  @ApiProperty({ description: 'Reset token' })
  @IsString()
  token: string;

  @ApiProperty({ description: 'New password' })
  @IsString()
  newPassword: string;
}
