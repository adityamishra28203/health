import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { HealthRecordsService } from './health-records.service';
import { HealthRecordsController } from './health-records.controller';
import { HealthRecord, HealthRecordSchema } from '../schemas/health-record.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: HealthRecord.name, schema: HealthRecordSchema }]),
  ],
  providers: [HealthRecordsService],
  controllers: [HealthRecordsController],
  exports: [HealthRecordsService],
})
export class HealthRecordsModule {}
