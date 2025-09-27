import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { HealthRecordsModule } from './health-records/health-records.module';
import { InsuranceModule } from './insurance/insurance.module';
import { FileStorageModule } from './file-storage/file-storage.module';
import { BlockchainModule } from './blockchain/blockchain.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AnalyticsModule } from './analytics/analytics.module';
import { AdminModule } from './admin/admin.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    MongooseModule.forRoot(process.env.MONGODB_URI || 'mongodb://localhost:27017/healthwallet'),
    AuthModule,
    UsersModule,
    HealthRecordsModule,
    InsuranceModule,
    FileStorageModule,
    BlockchainModule,
    NotificationsModule,
    AnalyticsModule,
    AdminModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}