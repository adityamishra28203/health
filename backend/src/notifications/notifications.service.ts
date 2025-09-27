import { Injectable } from '@nestjs/common';

@Injectable()
export class NotificationsService {
  async sendNotification(userId: string, message: string, type: string) {
    // Simulate notification sending
    console.log(`Notification sent to user ${userId}: ${message}`);
    return { success: true, messageId: 'notif_' + Date.now() };
  }
}
