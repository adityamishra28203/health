import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type NotificationDocument = Notification & Document;

export enum NotificationType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  IN_APP = 'in_app',
}

export enum NotificationStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  FAILED = 'failed',
  READ = 'read',
}

export enum NotificationPriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent',
}

export enum NotificationCategory {
  DOCUMENT_UPLOAD = 'document_upload',
  DOCUMENT_APPROVAL = 'document_approval',
  CONSENT_REQUEST = 'consent_request',
  CONSENT_GRANTED = 'consent_granted',
  CONSENT_DENIED = 'consent_denied',
  HOSPITAL_INVITE = 'hospital_invite',
  APPOINTMENT_REMINDER = 'appointment_reminder',
  INSURANCE_CLAIM = 'insurance_claim',
  SYSTEM_ALERT = 'system_alert',
  SECURITY_ALERT = 'security_alert',
}

@Schema({ timestamps: true })
export class Notification {
  @Prop({ required: true })
  recipientId: string;

  @Prop({ required: true })
  recipientType: 'patient' | 'hospital' | 'admin';

  @Prop({ required: true, enum: NotificationType })
  type: NotificationType;

  @Prop({ required: true, enum: NotificationCategory })
  category: NotificationCategory;

  @Prop({ required: true })
  title: string;

  @Prop({ required: true })
  message: string;

  @Prop({ type: Object, default: {} })
  data: Record<string, any>;

  @Prop({ required: true, enum: NotificationStatus, default: NotificationStatus.PENDING })
  status: NotificationStatus;

  @Prop({ enum: NotificationPriority, default: NotificationPriority.NORMAL })
  priority: NotificationPriority;

  @Prop()
  scheduledAt: Date;

  @Prop()
  sentAt: Date;

  @Prop()
  deliveredAt: Date;

  @Prop()
  readAt: Date;

  @Prop()
  failedAt: Date;

  @Prop()
  failureReason: string;

  @Prop()
  retryCount: number;

  @Prop({ default: 3 })
  maxRetries: number;

  @Prop()
  externalId: string; // ID from email/SMS provider

  @Prop()
  channel: string; // email address, phone number, device token

  @Prop()
  templateId: string;

  @Prop({ type: Object, default: {} })
  templateData: Record<string, any>;

  @Prop()
  hospitalId: string;

  @Prop()
  patientId: string;

  @Prop()
  documentId: string;

  @Prop()
  consentId: string;

  @Prop({ default: false })
  isRead: boolean;

  @Prop({ default: false })
  isArchived: boolean;

  @Prop()
  expiresAt: Date;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);


