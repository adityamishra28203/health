import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type AuditLogDocument = AuditLog & Document;

export enum ActionType {
  CREATE = 'create',
  READ = 'read',
  UPDATE = 'update',
  DELETE = 'delete',
  LOGIN = 'login',
  LOGOUT = 'logout',
  SHARE = 'share',
  ACCESS = 'access',
  EXPORT = 'export',
  IMPORT = 'import',
}

export enum ResourceType {
  USER = 'user',
  HEALTH_RECORD = 'health_record',
  INSURANCE_CLAIM = 'insurance_claim',
  CONSENT = 'consent',
  NOTIFICATION = 'notification',
  SYSTEM = 'system',
}

export enum LogLevel {
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
  DEBUG = 'debug',
}

@Schema({ timestamps: true })
export class AuditLog {
  @Prop({ 
    required: [true, 'User ID is required'], 
    type: Types.ObjectId, 
    ref: 'User' 
  })
  userId: Types.ObjectId;

  @Prop({ 
    type: String, 
    enum: ActionType, 
    required: [true, 'Action type is required'] 
  })
  action: ActionType;

  @Prop({ 
    type: String, 
    enum: ResourceType, 
    required: [true, 'Resource type is required'] 
  })
  resourceType: ResourceType;

  @Prop({ 
    type: Types.ObjectId,
    required: false
  })
  resourceId?: Types.ObjectId;

  @Prop({ 
    trim: true,
    maxlength: [500, 'Description cannot exceed 500 characters']
  })
  description?: string;

  @Prop({ 
    type: String, 
    enum: LogLevel, 
    default: LogLevel.INFO 
  })
  level: LogLevel;

  @Prop({ 
    type: Object,
    default: {}
  })
  metadata?: Record<string, any>;

  @Prop({ 
    type: Object,
    default: {}
  })
  changes?: Record<string, any>;

  @Prop({ 
    trim: true,
    maxlength: [45, 'IP address cannot exceed 45 characters']
  })
  ipAddress?: string;

  @Prop({ 
    trim: true,
    maxlength: [500, 'User agent cannot exceed 500 characters']
  })
  userAgent?: string;

  @Prop({ 
    type: Boolean,
    default: false
  })
  isSuccess: boolean;

  @Prop({ 
    trim: true,
    maxlength: [1000, 'Error message cannot exceed 1000 characters']
  })
  errorMessage?: string;

  @Prop({ 
    type: Number,
    default: 0
  })
  duration?: number; // in milliseconds

  @Prop({ 
    type: String,
    maxlength: [100, 'Session ID cannot exceed 100 characters']
  })
  sessionId?: string;

  @Prop({ 
    type: [String],
    default: []
  })
  tags?: string[];

  @Prop({ 
    type: Boolean,
    default: false
  })
  isSensitive: boolean;

  @Prop({ 
    type: Date,
    default: Date.now
  })
  timestamp: Date;
}

export const AuditLogSchema = SchemaFactory.createForClass(AuditLog);

// Indexes for performance
AuditLogSchema.index({ userId: 1, timestamp: -1 });
AuditLogSchema.index({ action: 1, resourceType: 1 });
AuditLogSchema.index({ timestamp: -1 });
AuditLogSchema.index({ level: 1, isSuccess: 1 });
AuditLogSchema.index({ resourceId: 1, resourceType: 1 });
AuditLogSchema.index({ sessionId: 1 });

// Virtual for log age
AuditLogSchema.virtual('ageInMinutes').get(function() {
  const now = new Date();
  const timestamp = this.timestamp;
  return Math.floor((now.getTime() - timestamp.getTime()) / (1000 * 60));
});

// Pre-save middleware
AuditLogSchema.pre('save', function(next) {
  if (this.isNew) {
    this.timestamp = new Date();
  }
  next();
});


