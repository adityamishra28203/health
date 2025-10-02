import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { NotificationController } from './notification.controller';
import { NotificationService } from './notification.service';
import { EmailService } from './email/email.service';
import { SmsService } from './sms/sms.service';
import { PushService } from './push/push.service';
import { TemplateService } from './template/template.service';
import { NotificationGateway } from './notification.gateway';
import { NotificationSchema } from './schemas/notification.schema';
import { NotificationTemplateSchema } from './schemas/notification-template.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/notification-service',
      }),
    }),
    MongooseModule.forFeature([
      { name: 'Notification', schema: NotificationSchema },
      { name: 'NotificationTemplate', schema: NotificationTemplateSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'notification-service-secret',
      signOptions: { expiresIn: '24h' },
    }),
    EventEmitterModule.forRoot(),
  ],
  controllers: [NotificationController],
  providers: [
    NotificationService,
    EmailService,
    SmsService,
    PushService,
    TemplateService,
    NotificationGateway,
  ],
  exports: [NotificationService],
})
export class AppModule {}


