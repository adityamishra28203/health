import { Injectable, Logger } from '@nestjs/common';
import { Notification } from '../schemas/notification.schema';

@Injectable()
export class EmailService {
  private readonly logger = new Logger(EmailService.name);

  async sendEmail(notification: Notification): Promise<void> {
    // Mock implementation - replace with actual email service
    this.logger.log(`Sending email to ${notification.channel}: ${notification.title}`);
    
    // Simulate email sending
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    this.logger.log(`Email sent successfully to ${notification.channel}`);
  }
}


