import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Notification, NotificationDocument, NotificationStatus, NotificationType, NotificationCategory } from './schemas/notification.schema';
import { NotificationTemplate, NotificationTemplateDocument } from './schemas/notification-template.schema';
import { EmailService } from './email/email.service';
import { SmsService } from './sms/sms.service';
import { PushService } from './push/push.service';
import { TemplateService } from './template/template.service';
import { CreateNotificationDto, UpdateNotificationDto, NotificationQueryDto } from './dto/notification.dto';

@Injectable()
export class NotificationService {
  private readonly logger = new Logger(NotificationService.name);

  constructor(
    @InjectModel(Notification.name) private notificationModel: Model<NotificationDocument>,
    @InjectModel(NotificationTemplate.name) private templateModel: Model<NotificationTemplateDocument>,
    private emailService: EmailService,
    private smsService: SmsService,
    private pushService: PushService,
    private templateService: TemplateService,
    private eventEmitter: EventEmitter2,
  ) {}

  async create(createNotificationDto: CreateNotificationDto): Promise<Notification> {
    const notification = new this.notificationModel(createNotificationDto);
    const saved = await notification.save();

    // Emit event for processing
    this.eventEmitter.emit('notification.created', saved);

    this.logger.log(`Created notification ${saved._id} for ${createNotificationDto.recipientId}`);
    return saved;
  }

  async findAll(query: NotificationQueryDto): Promise<{ notifications: Notification[]; total: number }> {
    const { page = 1, limit = 20, recipientId, type, category, status, recipientType } = query;
    
    const filter: any = {};
    if (recipientId) filter.recipientId = recipientId;
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (recipientType) filter.recipientType = recipientType;

    const notifications = await this.notificationModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await this.notificationModel.countDocuments(filter);

    return { notifications, total };
  }

  async findOne(id: string): Promise<Notification> {
    return this.notificationModel.findById(id).exec();
  }

  async findByRecipient(recipientId: string, query: NotificationQueryDto): Promise<{ notifications: Notification[]; total: number }> {
    const { page = 1, limit = 20, type, category, status, isRead } = query;
    
    const filter: any = { recipientId };
    if (type) filter.type = type;
    if (category) filter.category = category;
    if (status) filter.status = status;
    if (isRead !== undefined) filter.isRead = isRead;

    const notifications = await this.notificationModel
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await this.notificationModel.countDocuments(filter);

    return { notifications, total };
  }

  async update(id: string, updateNotificationDto: UpdateNotificationDto): Promise<Notification> {
    const updated = await this.notificationModel
      .findByIdAndUpdate(id, updateNotificationDto, { new: true })
      .exec();

    if (updated) {
      this.eventEmitter.emit('notification.updated', updated);
    }

    return updated;
  }

  async markAsRead(id: string): Promise<Notification> {
    return this.update(id, { 
      isRead: true, 
      readAt: new Date(),
      status: NotificationStatus.READ 
    });
  }

  async markAsDelivered(id: string): Promise<Notification> {
    return this.update(id, { 
      deliveredAt: new Date(),
      status: NotificationStatus.DELIVERED 
    });
  }

  async markAsFailed(id: string, reason: string): Promise<Notification> {
    const notification = await this.findOne(id);
    if (notification && notification.retryCount < notification.maxRetries) {
      // Retry logic
      notification.retryCount += 1;
      notification.status = NotificationStatus.PENDING;
      await this.notificationModel.findByIdAndUpdate((notification as any)._id, {
        retryCount: notification.retryCount,
        status: notification.status
      });
      
      // Schedule retry
      setTimeout(() => {
        this.processNotification((notification as any)._id.toString());
      }, Math.pow(2, notification.retryCount) * 1000); // Exponential backoff
    } else {
      // Mark as failed
      await this.update(id, { 
        failedAt: new Date(),
        failureReason: reason,
        status: NotificationStatus.FAILED 
      });
    }

    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.notificationModel.findByIdAndDelete(id).exec();
    this.eventEmitter.emit('notification.deleted', { id });
  }

  async processNotification(id: string): Promise<void> {
    const notification = await this.findOne(id);
    if (!notification || notification.status !== NotificationStatus.PENDING) {
      return;
    }

    try {
      this.logger.log(`Processing notification ${id} of type ${notification.type}`);

      switch (notification.type) {
        case NotificationType.EMAIL:
          await this.emailService.sendEmail(notification);
          break;
        case NotificationType.SMS:
          await this.smsService.sendSms(notification);
          break;
        case NotificationType.PUSH:
          await this.pushService.sendPush(notification);
          break;
        default:
          throw new Error(`Unsupported notification type: ${notification.type}`);
      }

      await this.markAsDelivered(id);
      this.logger.log(`Successfully processed notification ${id}`);
    } catch (error) {
      this.logger.error(`Failed to process notification ${id}: ${error.message}`);
      await this.markAsFailed(id, error.message);
    }
  }

  async sendBulk(notifications: CreateNotificationDto[]): Promise<Notification[]> {
    const results = [];
    for (const notificationDto of notifications) {
      const notification = await this.create(notificationDto);
      results.push(notification);
    }
    return results;
  }

  async getUnreadCount(recipientId: string): Promise<number> {
    return this.notificationModel.countDocuments({
      recipientId,
      isRead: false,
      status: { $in: [NotificationStatus.SENT, NotificationStatus.DELIVERED] }
    });
  }

  async getNotificationStats(recipientId: string): Promise<any> {
    const stats = await this.notificationModel.aggregate([
      { $match: { recipientId } },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          unread: { $sum: { $cond: [{ $eq: ['$isRead', false] }, 1, 0] } },
          byType: {
            $push: {
              type: '$type',
              status: '$status'
            }
          }
        }
      }
    ]);

    return stats[0] || { total: 0, unread: 0, byType: [] };
  }

  // Event handlers for other services
  async handleDocumentUploaded(event: any): Promise<void> {
    const notification = await this.create({
      recipientId: event.patientId,
      recipientType: 'patient',
      type: NotificationType.EMAIL,
      category: NotificationCategory.DOCUMENT_UPLOAD,
      title: 'Document Uploaded',
      message: `Your document "${event.documentName}" has been successfully uploaded and is being processed.`,
      data: {
        documentId: event.documentId,
        documentName: event.documentName,
        uploadTime: event.timestamp
      },
      channel: event.patientEmail,
      patientId: event.patientId,
      documentId: event.documentId,
    });
  }

  async handleConsentRequested(event: any): Promise<void> {
    const notification = await this.create({
      recipientId: event.patientId,
      recipientType: 'patient',
      type: NotificationType.PUSH,
      category: NotificationCategory.CONSENT_REQUEST,
      title: 'New Consent Request',
      message: `${event.hospitalName} is requesting access to your medical records.`,
      data: {
        hospitalId: event.hospitalId,
        hospitalName: event.hospitalName,
        documentIds: event.documentIds
      },
      channel: event.deviceToken,
      patientId: event.patientId,
      hospitalId: event.hospitalId,
      consentId: event.consentId,
    });
  }

  async handleConsentGranted(event: any): Promise<void> {
    const notification = await this.create({
      recipientId: event.hospitalId,
      recipientType: 'hospital',
      type: NotificationType.EMAIL,
      category: NotificationCategory.CONSENT_GRANTED,
      title: 'Consent Granted',
      message: `Patient ${event.patientName} has granted access to their medical records.`,
      data: {
        patientId: event.patientId,
        patientName: event.patientName,
        documentIds: event.documentIds
      },
      channel: event.hospitalEmail,
      patientId: event.patientId,
      hospitalId: event.hospitalId,
      consentId: event.consentId,
    });
  }

  async handleAppointmentReminder(event: any): Promise<void> {
    const notification = await this.create({
      recipientId: event.patientId,
      recipientType: 'patient',
      type: NotificationType.SMS,
      category: NotificationCategory.APPOINTMENT_REMINDER,
      title: 'Appointment Reminder',
      message: `You have an appointment with ${event.doctorName} tomorrow at ${event.appointmentTime}.`,
      data: {
        appointmentId: event.appointmentId,
        doctorName: event.doctorName,
        appointmentTime: event.appointmentTime,
        location: event.location
      },
      channel: event.patientPhone,
      patientId: event.patientId,
      hospitalId: event.hospitalId,
    });
  }
}
