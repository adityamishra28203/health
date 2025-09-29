import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  SYSTEM = 'system',
  HEALTH_RECORD = 'health_record',
  INSURANCE_CLAIM = 'insurance_claim',
  CONSENT = 'consent',
  SECURITY = 'security',
  REMINDER = 'reminder',
}

export enum NotificationPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationStatus {
  UNREAD = 'unread',
  READ = 'read',
  ARCHIVED = 'archived',
  DELETED = 'deleted',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ 
    required: [true, 'User ID is required'], 
    type: Types.ObjectId, 
    ref: 'User' 
  })
  userId: Types.ObjectId;

  @Prop({ 
    type: String, 
    enum: NotificationType, 
    required: [true, 'Notification type is required'] 
  })
  type: NotificationType;

  @Prop({ 
    type: String, 
    enum: NotificationPriority, 
    default: NotificationPriority.MEDIUM 
  })
  priority: NotificationPriority;

  @Prop({ 
    type: String, 
    enum: NotificationStatus, 
    default: NotificationStatus.UNREAD 
  })
  status: NotificationStatus;

  @Prop({ 
    required: [true, 'Title is required'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters long'],
    maxlength: [200, 'Title cannot exceed 200 characters']
  })
  title: string;

  @Prop({ 
    required: [true, 'Message is required'],
    trim: true,
    minlength: [10, 'Message must be at least 10 characters long'],
    maxlength: [1000, 'Message cannot exceed 1000 characters']
  })
  message: string;

  @Prop({ 
    trim: true,
    maxlength: [500, 'Action URL cannot exceed 500 characters']
  })
  actionUrl?: string;

  @Prop({ 
    trim: true,
    maxlength: [100, 'Action text cannot exceed 100 characters']
  })
  actionText?: string;

  @Prop({ 
    type: Object,
    default: {}
  })
  metadata?: Record<string, any>;

  @Prop({ 
    type: Types.ObjectId,
    refPath: 'relatedModel'
  })
  relatedId?: Types.ObjectId;

  @Prop({ 
    type: String,
    enum: ['User', 'HealthRecord', 'InsuranceClaim', 'Consent'],
    required: false
  })
  relatedModel?: string;

  @Prop({ 
    type: Date,
    default: Date.now
  })
  readAt?: Date;

  @Prop({ 
    type: Date
  })
  expiresAt?: Date;

  @Prop({ 
    type: Boolean,
    default: false
  })
  isPersistent: boolean;

  @Prop({ 
    type: [String],
    default: []
  })
  tags?: string[];

  @Prop({ 
    type: String,
    enum: ['email', 'push', 'sms', 'in_app'],
    default: ['in_app']
  })
  channels?: string[];

  @Prop({ 
    type: Boolean,
    default: false
  })
  isRead: boolean;

  @Prop({ 
    type: Number,
    default: 0,
    min: [0, 'Retry count cannot be negative']
  })
  retryCount: number;

  @Prop({ 
    type: Date
  })
  scheduledFor?: Date;

  @Prop({ 
    type: Boolean,
    default: false
  })
  isScheduled: boolean;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

// Indexes for performance
NotificationSchema.index({ userId: 1, status: 1 });
NotificationSchema.index({ type: 1, priority: 1 });
NotificationSchema.index({ createdAt: -1 });
NotificationSchema.index({ expiresAt: 1 });
NotificationSchema.index({ scheduledFor: 1 });

// Virtual for notification age
NotificationSchema.virtual('ageInHours').get(function() {
  const now = new Date();
  const created = (this as any).createdAt;
  return Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60));
});

// Virtual for expiry status
NotificationSchema.virtual('isExpired').get(function() {
  return this.expiresAt && this.expiresAt <= new Date();
});

// Pre-save middleware
NotificationSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === NotificationStatus.READ && !this.readAt) {
    this.readAt = new Date();
    this.isRead = true;
  }
  next();
});
