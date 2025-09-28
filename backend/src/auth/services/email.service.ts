import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as sgMail from '@sendgrid/mail';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('SENDGRID_API_KEY');
    if (apiKey) {
      sgMail.setApiKey(apiKey);
    } else {
      this.logger.warn('SendGrid API key not configured. Email service will not work.');
    }
  }

  /**
   * Send OTP via email
   */
  async sendOtpEmail(email: string, otpCode: string, firstName?: string): Promise<boolean> {
    try {
      const msg = {
        to: email,
        from: this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@healthwallet.com',
        subject: 'Your HealthWallet Verification Code',
        html: this.generateOtpEmailTemplate(otpCode, firstName),
      };

      await sgMail.send(msg);
      this.logger.log(`OTP email sent successfully to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send OTP email to ${email}:`, error);
      return false;
    }
  }

  /**
   * Send welcome email
   */
  async sendWelcomeEmail(email: string, firstName: string): Promise<boolean> {
    try {
      const msg = {
        to: email,
        from: this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@healthwallet.com',
        subject: 'Welcome to HealthWallet!',
        html: this.generateWelcomeEmailTemplate(firstName),
      };

      await sgMail.send(msg);
      this.logger.log(`Welcome email sent successfully to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send welcome email to ${email}:`, error);
      return false;
    }
  }

  /**
   * Send password reset email
   */
  async sendPasswordResetEmail(email: string, resetToken: string, firstName?: string): Promise<boolean> {
    try {
      const resetUrl = `${this.configService.get<string>('FRONTEND_URL')}/reset-password?token=${resetToken}`;
      
      const msg = {
        to: email,
        from: this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@healthwallet.com',
        subject: 'Reset Your HealthWallet Password',
        html: this.generatePasswordResetEmailTemplate(resetUrl, firstName),
      };

      await sgMail.send(msg);
      this.logger.log(`Password reset email sent successfully to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${email}:`, error);
      return false;
    }
  }

  /**
   * Send email verification
   */
  async sendEmailVerification(email: string, verificationToken: string, firstName?: string): Promise<boolean> {
    try {
      const verificationUrl = `${this.configService.get<string>('FRONTEND_URL')}/verify-email?token=${verificationToken}`;
      
      const msg = {
        to: email,
        from: this.configService.get<string>('SENDGRID_FROM_EMAIL') || 'noreply@healthwallet.com',
        subject: 'Verify Your HealthWallet Email',
        html: this.generateEmailVerificationTemplate(verificationUrl, firstName),
      };

      await sgMail.send(msg);
      this.logger.log(`Email verification sent successfully to ${email}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to send email verification to ${email}:`, error);
      return false;
    }
  }

  /**
   * Generate OTP email template
   */
  private generateOtpEmailTemplate(otpCode: string, firstName?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>HealthWallet Verification Code</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">HealthWallet Verification</h2>
          <p>${firstName ? `Hello ${firstName},` : 'Hello,'}</p>
          <p>Your verification code is:</p>
          <div style="background-color: #f3f4f6; padding: 20px; text-align: center; margin: 20px 0;">
            <h1 style="color: #2563eb; font-size: 32px; margin: 0; letter-spacing: 5px;">${otpCode}</h1>
          </div>
          <p>This code will expire in 10 minutes.</p>
          <p>If you didn't request this code, please ignore this email.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 14px;">© 2024 HealthWallet. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate welcome email template
   */
  private generateWelcomeEmailTemplate(firstName: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Welcome to HealthWallet</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Welcome to HealthWallet, ${firstName}!</h2>
          <p>Your account has been successfully created. You can now:</p>
          <ul>
            <li>Manage your health records securely</li>
            <li>Track your medical history</li>
            <li>Connect with healthcare providers</li>
            <li>Manage your insurance claims</li>
          </ul>
          <p>Get started by logging into your account.</p>
          <a href="${this.configService.get<string>('FRONTEND_URL')}/login" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Login to HealthWallet
          </a>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 14px;">© 2024 HealthWallet. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate password reset email template
   */
  private generatePasswordResetEmailTemplate(resetUrl: string, firstName?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Reset Your HealthWallet Password</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Password Reset Request</h2>
          <p>${firstName ? `Hello ${firstName},` : 'Hello,'}</p>
          <p>You requested to reset your HealthWallet password. Click the button below to reset it:</p>
          <a href="${resetUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
            Reset Password
          </a>
          <p>This link will expire in 1 hour.</p>
          <p>If you didn't request this password reset, please ignore this email.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 14px;">© 2024 HealthWallet. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }

  /**
   * Generate email verification template
   */
  private generateEmailVerificationTemplate(verificationUrl: string, firstName?: string): string {
    return `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Verify Your HealthWallet Email</title>
      </head>
      <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
        <div style="max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2 style="color: #2563eb;">Verify Your Email Address</h2>
          <p>${firstName ? `Hello ${firstName},` : 'Hello,'}</p>
          <p>Please verify your email address to complete your HealthWallet registration:</p>
          <a href="${verificationUrl}" 
             style="background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block; margin: 20px 0;">
            Verify Email Address
          </a>
          <p>This link will expire in 24 hours.</p>
          <p>If you didn't create a HealthWallet account, please ignore this email.</p>
          <hr style="margin: 30px 0;">
          <p style="color: #666; font-size: 14px;">© 2024 HealthWallet. All rights reserved.</p>
        </div>
      </body>
      </html>
    `;
  }
}
