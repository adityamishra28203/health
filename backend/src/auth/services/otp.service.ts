import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(private configService: ConfigService) {}

  /**
   * Generate a random OTP code
   */
  generateOtp(length: number = 6): string {
    const digits = '0123456789';
    let otp = '';
    for (let i = 0; i < length; i++) {
      otp += digits[Math.floor(Math.random() * digits.length)];
    }
    return otp;
  }

  /**
   * Generate a secure random token
   */
  generateToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }

  /**
   * Hash OTP for secure storage
   */
  hashOtp(otp: string): string {
    return crypto.createHash('sha256').update(otp).digest('hex');
  }

  /**
   * Verify OTP
   */
  verifyOtp(providedOtp: string, hashedOtp: string): boolean {
    const hashedProvidedOtp = this.hashOtp(providedOtp);
    return hashedProvidedOtp === hashedOtp;
  }

  /**
   * Check if OTP is expired
   */
  isOtpExpired(expiryDate: Date): boolean {
    return new Date() > expiryDate;
  }

  /**
   * Generate expiry date for OTP (default 10 minutes)
   */
  generateExpiryDate(minutes: number = 10): Date {
    const now = new Date();
    return new Date(now.getTime() + minutes * 60 * 1000);
  }

  /**
   * Generate secure verification token
   */
  generateVerificationToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }

  /**
   * Generate password reset token
   */
  generatePasswordResetToken(): string {
    return crypto.randomBytes(32).toString('hex');
  }
}
