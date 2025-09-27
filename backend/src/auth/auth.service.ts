import { Injectable, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcryptjs';
import * as crypto from 'crypto';

import { User, UserDocument, UserRole, UserStatus } from '../schemas/user.schema';

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
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
    private jwtService: JwtService,
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
}