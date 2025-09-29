import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { HealthRecordsService } from './health-records.service';
import { HealthRecordsController } from './health-records.controller';
import { HealthRecord, HealthRecordSchema } from '../schemas/health-record.schema';
import { FileStorageModule } from '../file-storage/file-storage.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'HealthRecord', schema: HealthRecordSchema }]),
    FileStorageModule,
  ],
  providers: [HealthRecordsService],
  controllers: [HealthRecordsController],
  exports: [HealthRecordsService],
})
export class HealthRecordsModule {}
