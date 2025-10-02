import { IsString, IsEnum, IsOptional, IsObject, IsArray, IsBoolean, IsDateString, IsNumber } from 'class-validator';
import { NotificationType, NotificationStatus, NotificationPriority, NotificationCategory } from '../schemas/notification.schema';

export class CreateNotificationDto {
  @IsString()
  recipientId: string;

  @IsString()
  recipientType: 'patient' | 'hospital' | 'admin';

  @IsEnum(NotificationType)
  type: NotificationType;

  @IsEnum(NotificationCategory)
  category: NotificationCategory;

  @IsString()
  title: string;

  @IsString()
  message: string;

  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @IsOptional()
  @IsEnum(NotificationPriority)
  priority?: NotificationPriority;

  @IsOptional()
  @IsDateString()
  scheduledAt?: Date;

  @IsOptional()
  @IsString()
  channel?: string;

  @IsOptional()
  @IsString()
  templateId?: string;

  @IsOptional()
  @IsObject()
  templateData?: Record<string, any>;

  @IsOptional()
  @IsString()
  hospitalId?: string;

  @IsOptional()
  @IsString()
  patientId?: string;

  @IsOptional()
  @IsString()
  documentId?: string;

  @IsOptional()
  @IsString()
  consentId?: string;

  @IsOptional()
  @IsDateString()
  expiresAt?: Date;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class UpdateNotificationDto {
  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @IsOptional()
  @IsDateString()
  readAt?: Date;

  @IsOptional()
  @IsDateString()
  deliveredAt?: Date;

  @IsOptional()
  @IsDateString()
  failedAt?: Date;

  @IsOptional()
  @IsString()
  failureReason?: string;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;

  @IsOptional()
  @IsBoolean()
  isArchived?: boolean;

  @IsOptional()
  @IsNumber()
  retryCount?: number;

  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}

export class NotificationQueryDto {
  @IsOptional()
  @IsNumber()
  page?: number;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  recipientId?: string;

  @IsOptional()
  @IsEnum(NotificationType)
  type?: NotificationType;

  @IsOptional()
  @IsEnum(NotificationCategory)
  category?: NotificationCategory;

  @IsOptional()
  @IsEnum(NotificationStatus)
  status?: NotificationStatus;

  @IsOptional()
  @IsString()
  recipientType?: string;

  @IsOptional()
  @IsBoolean()
  isRead?: boolean;
}
