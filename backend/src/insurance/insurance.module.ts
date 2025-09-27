import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';

import { InsuranceService } from './insurance.service';
import { InsuranceController } from './insurance.controller';
import { InsuranceClaim, InsuranceClaimSchema } from '../schemas/insurance-claim.schema';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: InsuranceClaim.name, schema: InsuranceClaimSchema }]),
  ],
  providers: [InsuranceService],
  controllers: [InsuranceController],
  exports: [InsuranceService],
})
export class InsuranceModule {}
