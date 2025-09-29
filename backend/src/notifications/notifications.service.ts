import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Notification, NotificationDocument, NotificationType, NotificationPriority } from '../schemas/notification.schema';

@Injectable()
export class NotificationsService {
  constructor(
    @InjectModel('Notification') private notificationModel: Model<NotificationDocument>,
  ) {}

  async sendNotification(
    userId: string, 
    message: string, 
    type: NotificationType,
    priority: NotificationPriority = NotificationPriority.MEDIUM
  ) {
    const notification = new this.notificationModel({
      userId,
      message,
      type,
      priority,
      status: 'unread'
    });
    
    const savedNotification = await notification.save();
    console.log(`Notification sent to user ${userId}: ${message}`);
    
    return { 
      success: true, 
      messageId: (savedNotification._id as any).toString(),
      notification: savedNotification
    };
  }

  async getUserNotifications(userId: string, limit: number = 10) {
    return this.notificationModel
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit);
  }

  async markAsRead(notificationId: string) {
    return this.notificationModel.findByIdAndUpdate(
      notificationId,
      { status: 'read' },
      { new: true }
    );
  }
}
