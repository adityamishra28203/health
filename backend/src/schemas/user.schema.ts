import { Schema, model, Document } from 'mongoose';

export interface IUser extends Document {
  comparePassword(candidatePassword: string): Promise<boolean>;
  incLoginAttempts(): Promise<any>;
  resetLoginAttempts(): Promise<any>;
  isLocked: boolean;
  _id: string;
  email: string;
  password: string; // Required for all users
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'patient' | 'doctor' | 'hospital_admin' | 'insurer' | 'system_admin';
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  emailVerified: boolean;
  phoneVerified: boolean;
  avatar?: string;
  bio?: string;
  emergencyContact?: string;
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  medicalConditions?: string[];
  organization?: string;
  licenseNumber?: string;
  specialization?: string;
  aadhaarNumber?: string;
  aadhaarVerified: boolean;
  lastLogin?: Date;
  loginAttempts: number;
  lockUntil?: Date;
  refreshTokens?: string[];
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address'],
    maxlength: [100, 'Email cannot exceed 100 characters'],
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [8, 'Password must be at least 8 characters long'],
    maxlength: [128, 'Password cannot exceed 128 characters'],
    validate: {
      validator: function(v: string) {
        // Password must contain at least one uppercase letter, one lowercase letter, and one number
        return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(v);
      },
      message: 'Password must contain at least one uppercase letter, one lowercase letter, and one number'
    }
  },
  firstName: {
    type: String,
    required: [true, 'First name is required'],
    trim: true,
    minlength: [2, 'First name must be at least 2 characters long'],
    maxlength: [50, 'First name cannot exceed 50 characters'],
    match: [/^[a-zA-Z\s]+$/, 'First name can only contain letters and spaces'],
  },
  lastName: {
    type: String,
    required: [true, 'Last name is required'],
    trim: true,
    minlength: [2, 'Last name must be at least 2 characters long'],
    maxlength: [50, 'Last name cannot exceed 50 characters'],
    match: [/^[a-zA-Z\s]+$/, 'Last name can only contain letters and spaces'],
  },
  phone: {
    type: String,
    trim: true,
    validate: {
      validator: function(v: string) {
        if (!v) return true; // Allow empty phone numbers
        // Remove all non-digit characters for counting
        const digitsOnly = v.replace(/\D/g, '');
        // Check if it has 10-15 digits
        return digitsOnly.length >= 10 && digitsOnly.length <= 15;
      },
      message: 'Phone number must contain 10-15 digits'
    },
  },
  role: {
    type: String,
    enum: ['patient', 'doctor', 'hospital_admin', 'insurer', 'system_admin'],
    default: 'patient',
  },
  status: {
    type: String,
    enum: ['active', 'inactive', 'suspended', 'pending_verification'],
    default: 'pending_verification',
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  phoneVerified: {
    type: Boolean,
    default: false,
  },
  avatar: {
    type: String,
    maxlength: 2000000, // Allow up to 2MB for base64 data URLs
  },
  bio: {
    type: String,
    maxlength: 500,
  },
  emergencyContact: {
    type: String,
  },
  bloodType: {
    type: String,
  },
  allergies: [{
    type: String,
  }],
  medications: [{
    type: String,
  }],
  medicalConditions: [{
    type: String,
  }],
  organization: {
    type: String,
  },
  licenseNumber: {
    type: String,
  },
  specialization: {
    type: String,
  },
  aadhaarNumber: {
    type: String,
  },
  aadhaarVerified: {
    type: Boolean,
    default: false,
  },
  lastLogin: {
    type: Date,
  },
  loginAttempts: {
    type: Number,
    default: 0,
  },
  lockUntil: {
    type: Date,
  },
  refreshTokens: [{
    type: String,
  }],
}, {
  timestamps: true,
});

// Indexes for performance
userSchema.index({ email: 1 });
userSchema.index({ phone: 1 });
userSchema.index({ role: 1 });
userSchema.index({ status: 1 });

// Virtual for full name
userSchema.virtual('fullName').get(function() {
  return `${this.firstName} ${this.lastName}`;
});

// Virtual for account lock status
userSchema.virtual('isLocked').get(function() {
  return !!(this.lockUntil && this.lockUntil > new Date());
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }

  try {
    const bcrypt = require('bcryptjs');
    const saltRounds = 12;
    this.password = await bcrypt.hash(this.password, saltRounds);
    next();
  } catch (error) {
    next(error as Error);
  }
});

// Method to compare password
userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  
  try {
    const bcrypt = require('bcryptjs');
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Method to increment login attempts
userSchema.methods.incLoginAttempts = function() {
  // If we have a previous lock that has expired, restart at 1
  if (this.lockUntil && this.lockUntil < new Date()) {
    return this.updateOne({
      $unset: { lockUntil: 1 },
      $set: { loginAttempts: 1 }
    });
  }
  
  const updates: any = { $inc: { loginAttempts: 1 } };
  
  // Lock account after 5 failed attempts for 2 hours
  if (this.loginAttempts + 1 >= 5 && !this.isLocked) {
    updates.$set = { lockUntil: new Date(Date.now() + 2 * 60 * 60 * 1000) };
  }
  
  return this.updateOne(updates);
};

// Method to reset login attempts
userSchema.methods.resetLoginAttempts = function() {
  return this.updateOne({
    $unset: { loginAttempts: 1, lockUntil: 1 }
  });
};

export const User = model<IUser>('User', userSchema);
export { userSchema as UserSchema };
export type UserDocument = IUser;