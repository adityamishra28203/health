import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as twilio from 'twilio';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);
  private twilioClient: twilio.Twilio;

  constructor(private configService: ConfigService) {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    
    if (accountSid && authToken) {
      this.twilioClient = twilio(accountSid, authToken);
    } else {
      this.logger.warn('Twilio credentials not configured. SMS service will not work.');
    }
  }

  /**
   * Send OTP via SMS
   */
  async sendOtp(phoneNumber: string, otpCode: string): Promise<boolean> {
    try {
      if (!this.twilioClient) {
        this.logger.error('Twilio client not initialized');
        return false;
      }

      const message = await this.twilioClient.messages.create({
        body: `Your HealthWallet verification code is: ${otpCode}. This code will expire in 10 minutes.`,
        from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
        to: phoneNumber,
      });

      this.logger.log(`SMS sent successfully to ${phoneNumber}. Message SID: ${message.sid}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send SMS to ${phoneNumber}:`, error);
      return false;
    }
  }

  /**
   * Send welcome SMS
   */
  async sendWelcomeSms(phoneNumber: string, firstName: string): Promise<boolean> {
    try {
      if (!this.twilioClient) {
        this.logger.error('Twilio client not initialized');
        return false;
      }

      const message = await this.twilioClient.messages.create({
        body: `Welcome to HealthWallet, ${firstName}! Your account has been successfully created.`,
        from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
        to: phoneNumber,
      });

      this.logger.log(`Welcome SMS sent successfully to ${phoneNumber}. Message SID: ${message.sid}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send welcome SMS to ${phoneNumber}:`, error);
      return false;
    }
  }

  /**
   * Send password reset SMS
   */
  async sendPasswordResetSms(phoneNumber: string, resetToken: string): Promise<boolean> {
    try {
      if (!this.twilioClient) {
        this.logger.error('Twilio client not initialized');
        return false;
      }

      const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${resetToken}`;
      
      const message = await this.twilioClient.messages.create({
        body: `Your HealthWallet password reset link: ${resetUrl}. This link will expire in 1 hour.`,
        from: this.configService.get<string>('TWILIO_PHONE_NUMBER'),
        to: phoneNumber,
      });

      this.logger.log(`Password reset SMS sent successfully to ${phoneNumber}. Message SID: ${message.sid}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send password reset SMS to ${phoneNumber}:`, error);
      return false;
    }
  }

  /**
   * Validate phone number format
   */
  validatePhoneNumber(phoneNumber: string): boolean {
    // Basic phone number validation (can be enhanced)
    const phoneRegex = /^\+[1-9]\d{1,14}$/;
    return phoneRegex.test(phoneNumber);
  }

  /**
   * Format phone number for international use
   */
  formatPhoneNumber(phoneNumber: string, countryCode: string = '+1'): string {
    // Remove all non-digit characters
    const digits = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present
    if (!phoneNumber.startsWith('+')) {
      return `${countryCode}${digits}`;
    }
    
    return phoneNumber;
  }
}
