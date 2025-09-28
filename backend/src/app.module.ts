import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './auth/auth.module';
import { UserModule } from './users/user.module';
import { HealthRecordsModule } from './health-records/health-records.module';
import { InsuranceModule } from './insurance/insurance.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AdminModule } from './admin/admin.module';
import { NotificationsModule } from './notifications/notifications.module';
import { FileStorageModule } from './file-storage/file-storage.module';
import { BlockchainModule } from './blockchain/blockchain.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthwallet'),
    AuthModule,
    UserModule,
    HealthRecordsModule,
    InsuranceModule,
    AnalyticsModule,
    AdminModule,
    NotificationsModule,
    FileStorageModule,
    BlockchainModule,
  ],
})
export class AppModule {}