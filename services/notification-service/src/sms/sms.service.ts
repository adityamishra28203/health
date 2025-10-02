import { Injectable, Logger } from '@nestjs/common';
import { Notification } from '../schemas/notification.schema';

@Injectable()
export class SmsService {
  private readonly logger = new Logger(SmsService.name);

  async sendSms(notification: Notification): Promise<void> {
    // Mock implementation - replace with actual SMS service
    this.logger.log(`Sending SMS to ${notification.channel}: ${notification.message}`);
    
    // Simulate SMS sending
    await new Promise(resolve => setTimeout(resolve, 500));
    
    this.logger.log(`SMS sent successfully to ${notification.channel}`);
  }
}


