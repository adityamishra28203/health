import { Injectable, UnauthorizedException, ConflictException, Logger, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { User, IUser } from '../schemas/user.schema';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

export interface LoginResponse {
  message: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    status: string;
    emailVerified: boolean;
    avatar?: string;
  };
  accessToken: string;
}

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    @InjectModel('User') private userModel: Model<IUser>,
    private jwtService: JwtService,
  ) {}

  async register(registerDto: RegisterDto): Promise<LoginResponse> {
    const { email, password, firstName, lastName, phone, role = 'patient' } = registerDto;

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Please provide a valid email address');
    }

    // Validate password strength
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/;
    if (!passwordRegex.test(password)) {
      throw new BadRequestException('Password must contain at least one uppercase letter, one lowercase letter, and one number');
    }

    // Validate name format
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(firstName) || !nameRegex.test(lastName)) {
      throw new BadRequestException('Name can only contain letters and spaces');
    }

    // Check if user already exists
    const existingUser = await this.userModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      throw new ConflictException('User with this email already exists');
    }

    // Create new user
    const user = new this.userModel({
      email: email.toLowerCase(),
      password,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      phone: phone?.trim(),
      role,
      status: 'active',
      emailVerified: false,
      loginAttempts: 0,
    });

    try {
      this.logger.log(`Attempting to save user: ${email}`);
      const savedUser = await user.save();
      this.logger.log(`User saved successfully with ID: ${savedUser._id}`);
    } catch (error: any) {
      this.logger.error(`Error saving user: ${error.message}`, error.stack);
      if (error.code === 11000) {
        throw new ConflictException('User with this email already exists');
      }
      throw new BadRequestException('Failed to create user: ' + error.message);
    }

    // Generate JWT token
    const accessToken = this.jwtService.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
      }
    );

    this.logger.log(`New user registered: ${email}`);

    return {
      message: 'Registration successful',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        avatar: user.avatar,
      },
      accessToken,
    };
  }

  async login(loginDto: LoginDto): Promise<LoginResponse> {
    const { email, password } = loginDto;

    // Validate input
    if (!email || !password) {
      throw new BadRequestException('Email and password are required');
    }

    // Validate email format
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('Please provide a valid email address');
    }

    // Find user by email
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.isLocked) {
      const lockTime = user.lockUntil;
      const timeRemaining = lockTime ? Math.ceil((lockTime.getTime() - Date.now()) / (1000 * 60)) : 0;
      throw new UnauthorizedException(`Account is temporarily locked. Try again in ${timeRemaining} minutes.`);
    }

    // Verify password
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      // Increment login attempts
      await user.incLoginAttempts();
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate JWT token
    const accessToken = this.jwtService.sign(
      { 
        userId: user._id, 
        email: user.email, 
        role: user.role 
      },
      { 
        expiresIn: process.env.JWT_EXPIRES_IN || '24h' 
      }
    );

    this.logger.log(`User logged in: ${email}`);

    return {
      message: 'Login successful',
      user: {
        id: user._id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        avatar: user.avatar,
      },
      accessToken,
    };
  }

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email: email.toLowerCase() });
    if (user && await user.comparePassword(password)) {
      const { password: _, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async findUserById(userId: string): Promise<IUser | null> {
    return this.userModel.findById(userId).select('-password');
  }

  async updateUserProfile(userId: string, updateData: Partial<IUser>): Promise<IUser> {
    // If email is being updated, check if it's already taken by another user
    if (updateData.email) {
      const existingUser = await this.userModel.findOne({ 
        email: updateData.email.toLowerCase(),
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        throw new ConflictException('Email is already taken by another user');
      }
      
      // Normalize email
      updateData.email = updateData.email.toLowerCase();
    }

    // If phone is being updated, check if it's already taken by another user
    if (updateData.phone && updateData.phone.trim() !== '') {
      const existingUser = await this.userModel.findOne({ 
        phone: updateData.phone,
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        throw new ConflictException('Phone number is already taken by another user');
      }
    }

    // Convert comma-separated strings to arrays for medical fields
    const processedData: any = { ...updateData };
    
    // Handle medical fields that come as comma-separated strings but need to be stored as arrays
    if (typeof processedData.allergies === 'string') {
      processedData.allergies = processedData.allergies
        .split(',')
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);
    }
    
    if (typeof processedData.medications === 'string') {
      processedData.medications = processedData.medications
        .split(',')
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);
    }
    
    if (typeof processedData.medicalConditions === 'string') {
      processedData.medicalConditions = processedData.medicalConditions
        .split(',')
        .map((item: string) => item.trim())
        .filter((item: string) => item.length > 0);
    }

    const user = await this.userModel.findByIdAndUpdate(
      userId,
      { ...processedData, updatedAt: new Date() },
      { new: true }
    ).select('-password');
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    
    this.logger.log(`User profile updated: ${user.email}`);
    return user;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isCurrentPasswordValid = await user.comparePassword(currentPassword);
    if (!isCurrentPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    user.password = newPassword;
    await user.save();
  }

  async deleteAccount(userId: string): Promise<void> {
    const user = await this.userModel.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    this.logger.log(`Deleting account for user: ${user.email}`);

    try {
      // Delete user's health records
      await this.userModel.db.collection('healthrecords').deleteMany({ patientId: userId });
      this.logger.log(`Deleted health records for user: ${userId}`);

      // Delete user's insurance claims
      await this.userModel.db.collection('insuranceclaims').deleteMany({ userId: userId });
      this.logger.log(`Deleted insurance claims for user: ${userId}`);

      // Delete user's notifications
      await this.userModel.db.collection('notifications').deleteMany({ userId: userId });
      this.logger.log(`Deleted notifications for user: ${userId}`);

      // Delete user's analytics data
      await this.userModel.db.collection('analytics').deleteMany({ userId: userId });
      this.logger.log(`Deleted analytics data for user: ${userId}`);

      // Finally, delete the user account
      await this.userModel.findByIdAndDelete(userId);
      this.logger.log(`Successfully deleted user account: ${userId}`);

    } catch (error) {
      this.logger.error(`Error deleting account for user ${userId}:`, error);
      throw new BadRequestException('Failed to delete account. Please try again.');
    }
  }
}