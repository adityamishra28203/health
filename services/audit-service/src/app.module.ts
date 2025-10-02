import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AuditController } from './audit.controller';
import { AuditService } from './audit.service';
import { AuditLogSchema } from './schemas/audit-log.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/audit-service',
      }),
    }),
    MongooseModule.forFeature([
      { name: 'AuditLog', schema: AuditLogSchema },
    ]),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'audit-service-secret',
      signOptions: { expiresIn: '24h' },
    }),
    EventEmitterModule.forRoot(),
  ],
  controllers: [AuditController],
  providers: [AuditService],
  exports: [AuditService],
})
export class AppModule {}


