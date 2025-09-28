import { Injectable, UnauthorizedException, BadRequestException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

import { User, UserDocument, UserRole, UserStatus } from '../schemas/user.schema';
import { RegisterDto, LoginDto, VerifyEmailDto, VerifyPhoneDto, ResendOtpDto, OtpLoginDto, RefreshTokenDto, ForgotPasswordDto, ResetPasswordDto } from './dto/register.dto';
import { OtpService } from './services/otp.service';
import { SmsService } from './services/sms.service';
import { EmailService } from './services/email.service';
import { GoogleOAuthService, GoogleUserInfo } from './services/google-oauth.service';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  access_token: string;
  refresh_token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: UserRole;
    status: string;
  };
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
    private otpService: OtpService,
    private smsService: SmsService,
    private emailService: EmailService,
    private googleOAuthService: GoogleOAuthService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email }).select('+password');
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    const { password: _, ...result } = user.toObject();
    return result;
  }

  async login(user: any): Promise<LoginResponse> {
    const payload: JwtPayload = {
      sub: (user._id as any).toString(),
      email: user.email,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Update last login
    await this.userModel.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
    });

    return {
      access_token,
      refresh_token,
      user: {
        id: (user._id as any).toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      },
    };
  }

  async register(registerData: {
    email: string;
    password: string;
    firstName: string;
    lastName: string;
    phone?: string;
    role: UserRole;
    organization?: string;
    licenseNumber?: string;
    specialization?: string;
  }): Promise<LoginResponse> {
    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email: registerData.email });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(registerData.password, saltRounds);

    // Generate verification token
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const verificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

    // Create user
    const user = new this.userModel({
      ...registerData,
      password: hashedPassword,
      verificationToken,
      verificationExpires,
      status: UserStatus.PENDING_VERIFICATION,
    });

    await user.save();

    // Generate tokens
    const payload: JwtPayload = {
      sub: (user._id as any).toString(),
      email: user.email,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      access_token,
      refresh_token,
      user: {
        id: (user._id as any).toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      },
    };
  }

  async refreshToken(userId: string): Promise<{ access_token: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload: JwtPayload = {
      sub: (user._id as any).toString(),
      email: user.email,
      role: user.role,
    };

    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async verifyEmail(token: string): Promise<boolean> {
    const user = await this.userModel.findOne({
      verificationToken: token,
      verificationExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired verification token');
    }

    user.emailVerified = true;
    user.status = UserStatus.ACTIVE;
    user.verificationToken = undefined;
    user.verificationExpires = undefined;

    await user.save();
    return true;
  }

  async forgotPassword(email: string): Promise<boolean> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      // Don't reveal if user exists or not
      return true;
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = resetExpires;

    await user.save();

    // TODO: Send email with reset link
    return true;
  }

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await this.userModel.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: new Date() },
    });

    if (!user) {
      throw new BadRequestException('Invalid or expired reset token');
    }

    const saltRounds = 12;
    user.password = await bcrypt.hash(newPassword, saltRounds);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();
    return true;
  }

  async enableTwoFactor(userId: string): Promise<{ secret: string; qrCode: string }> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Generate secret
    const secret = crypto.randomBytes(32).toString('base64');
    user.twoFactorSecret = secret;
    user.twoFactorEnabled = true;

    await user.save();

    // TODO: Generate QR code
    const qrCode = `otpauth://totp/HealthWallet:${user.email}?secret=${secret}&issuer=HealthWallet`;

    return { secret, qrCode };
  }

  async verifyTwoFactor(userId: string, token: string): Promise<boolean> {
    const user = await this.userModel.findById(userId);
    if (!user || !user.twoFactorSecret) {
      throw new UnauthorizedException('Two-factor authentication not enabled');
    }

    // TODO: Implement TOTP verification
    // For now, just return true
    return true;
  }

  // Multi-Factor Authentication Methods

  async register(registerDto: RegisterDto): Promise<LoginResponse> {
    const { email, password, firstName, lastName, phone, method, googleToken } = registerDto;

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email });
    if (existingUser) {
      throw new BadRequestException('User already exists');
    }

    let user: UserDocument;

    if (method === 'google' && googleToken) {
      // Google OAuth registration
      const googleUserInfo = await this.googleOAuthService.verifyGoogleToken(googleToken);
      
      // Check if Google user already exists
      const existingGoogleUser = await this.userModel.findOne({ googleId: googleUserInfo.googleId });
      if (existingGoogleUser) {
        throw new BadRequestException('Google account already registered');
      }

      user = new this.userModel({
        email: googleUserInfo.email,
        firstName: googleUserInfo.firstName,
        lastName: googleUserInfo.lastName,
        googleId: googleUserInfo.googleId,
        googleEmail: googleUserInfo.email,
        emailVerified: googleUserInfo.emailVerified,
        status: UserStatus.ACTIVE,
        role: UserRole.PATIENT,
        password: crypto.randomBytes(32).toString('hex'), // Random password for Google users
      });
    } else {
      // Traditional registration
      const hashedPassword = await bcrypt.hash(password, 12);
      const verificationToken = this.otpService.generateVerificationToken();

      user = new this.userModel({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        status: UserStatus.PENDING_VERIFICATION,
        role: UserRole.PATIENT,
        verificationToken,
        verificationExpires: this.otpService.generateExpiryDate(24 * 60), // 24 hours
      });

      // Send verification email
      await this.emailService.sendEmailVerification(email, verificationToken, firstName);
    }

    await user.save();

    // Generate tokens
    const payload: JwtPayload = {
      sub: (user._id as any).toString(),
      email: user.email,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    return {
      access_token,
      refresh_token,
      user: {
        id: (user._id as any).toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { identifier, password, method, googleToken } = loginDto;

    if (method === 'google' && googleToken) {
      return this.googleAuth(googleToken);
    }

    // Traditional email/password login
    const user = await this.userModel.findOne({ email: identifier }).select('+password');
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (user.status !== UserStatus.ACTIVE) {
      throw new UnauthorizedException('Account is not active');
    }

    return this.generateLoginResponse(user);
  }

  async googleAuth(googleToken: string): Promise<LoginResponse> {
    const googleUserInfo = await this.googleOAuthService.verifyGoogleToken(googleToken);
    
    let user = await this.userModel.findOne({ googleId: googleUserInfo.googleId });
    
    if (!user) {
      // Check if user exists with same email
      user = await this.userModel.findOne({ email: googleUserInfo.email });
      if (user) {
        // Link Google account to existing user
        user.googleId = googleUserInfo.googleId;
        user.googleEmail = googleUserInfo.email;
        await user.save();
      } else {
        // Create new user
        user = new this.userModel({
          email: googleUserInfo.email,
          firstName: googleUserInfo.firstName,
          lastName: googleUserInfo.lastName,
          googleId: googleUserInfo.googleId,
          googleEmail: googleUserInfo.email,
          emailVerified: googleUserInfo.emailVerified,
          status: UserStatus.ACTIVE,
          role: UserRole.PATIENT,
          password: crypto.randomBytes(32).toString('hex'),
        });
        await user.save();
      }
    }

    return this.generateLoginResponse(user);
  }

  async getGoogleAuthUrl(): Promise<{ url: string }> {
    const url = this.googleOAuthService.getGoogleAuthUrl();
    return { url };
  }

  async loginWithOtp(otpLoginDto: OtpLoginDto): Promise<LoginResponse> {
    const { identifier, otpCode, type } = otpLoginDto;

    let user: UserDocument;
    let isValidOtp = false;

    if (type === 'email') {
      user = await this.userModel.findOne({ email: identifier });
      if (user && user.emailOtpCode && user.emailOtpExpiry) {
        isValidOtp = this.otpService.verifyOtp(otpCode, user.emailOtpCode) && 
                     !this.otpService.isOtpExpired(user.emailOtpExpiry);
      }
    } else {
      user = await this.userModel.findOne({ phone: identifier });
      if (user && user.phoneOtpCode && user.phoneOtpExpiry) {
        isValidOtp = this.otpService.verifyOtp(otpCode, user.phoneOtpCode) && 
                     !this.otpService.isOtpExpired(user.phoneOtpExpiry);
      }
    }

    if (!user || !isValidOtp) {
      throw new UnauthorizedException('Invalid OTP');
    }

    // Clear OTP after successful login
    if (type === 'email') {
      user.emailOtpCode = undefined;
      user.emailOtpExpiry = undefined;
    } else {
      user.phoneOtpCode = undefined;
      user.phoneOtpExpiry = undefined;
    }
    await user.save();

    return this.generateLoginResponse(user);
  }

  async sendOtp(identifier: string, type: 'email' | 'phone'): Promise<{ message: string }> {
    const otpCode = this.otpService.generateOtp();
    const hashedOtp = this.otpService.hashOtp(otpCode);
    const expiryDate = this.otpService.generateExpiryDate();

    if (type === 'email') {
      const user = await this.userModel.findOne({ email: identifier });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      user.emailOtpCode = hashedOtp;
      user.emailOtpExpiry = expiryDate;
      await user.save();

      await this.emailService.sendOtpEmail(identifier, otpCode, user.firstName);
    } else {
      const user = await this.userModel.findOne({ phone: identifier });
      if (!user) {
        throw new BadRequestException('User not found');
      }

      user.phoneOtpCode = hashedOtp;
      user.phoneOtpExpiry = expiryDate;
      await user.save();

      await this.smsService.sendOtp(identifier, otpCode);
    }

    return { message: `OTP sent to ${type}` };
  }

  async verifyEmailOtp(verifyEmailDto: VerifyEmailDto): Promise<{ message: string }> {
    const { email, otpCode } = verifyEmailDto;
    
    const user = await this.userModel.findOne({ email });
    if (!user || !user.emailOtpCode || !user.emailOtpExpiry) {
      throw new BadRequestException('Invalid OTP request');
    }

    const isValidOtp = this.otpService.verifyOtp(otpCode, user.emailOtpCode) && 
                       !this.otpService.isOtpExpired(user.emailOtpExpiry);

    if (!isValidOtp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    user.emailVerified = true;
    user.emailOtpCode = undefined;
    user.emailOtpExpiry = undefined;
    if (user.status === UserStatus.PENDING_VERIFICATION) {
      user.status = UserStatus.ACTIVE;
    }
    await user.save();

    return { message: 'Email verified successfully' };
  }

  async verifyPhoneOtp(verifyPhoneDto: VerifyPhoneDto): Promise<{ message: string }> {
    const { phone, otpCode } = verifyPhoneDto;
    
    const user = await this.userModel.findOne({ phone });
    if (!user || !user.phoneOtpCode || !user.phoneOtpExpiry) {
      throw new BadRequestException('Invalid OTP request');
    }

    const isValidOtp = this.otpService.verifyOtp(otpCode, user.phoneOtpCode) && 
                       !this.otpService.isOtpExpired(user.phoneOtpExpiry);

    if (!isValidOtp) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    user.phoneVerified = true;
    user.phoneOtpCode = undefined;
    user.phoneOtpExpiry = undefined;
    await user.save();

    return { message: 'Phone verified successfully' };
  }

  async resendOtp(resendOtpDto: ResendOtpDto): Promise<{ message: string }> {
    const { identifier, type } = resendOtpDto;
    return this.sendOtp(identifier, type);
  }

  async getProfile(userId: string): Promise<any> {
    const user = await this.userModel.findById(userId).select('-password -refreshToken');
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }

  async logout(userId: string): Promise<{ message: string }> {
    await this.userModel.findByIdAndUpdate(userId, {
      refreshToken: undefined,
      refreshTokenExpiry: undefined,
    });
    return { message: 'Logout successful' };
  }

  private async generateLoginResponse(user: UserDocument): Promise<LoginResponse> {
    const payload: JwtPayload = {
      sub: (user._id as any).toString(),
      email: user.email,
      role: user.role,
    };

    const access_token = this.jwtService.sign(payload);
    const refresh_token = this.jwtService.sign(payload, { expiresIn: '7d' });

    // Update last login
    await this.userModel.findByIdAndUpdate(user._id, {
      lastLogin: new Date(),
    });

    return {
      access_token,
      refresh_token,
      user: {
        id: (user._id as any).toString(),
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
      },
    };
  }
}