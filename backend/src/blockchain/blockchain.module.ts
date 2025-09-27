import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';

import { BlockchainService } from './blockchain.service';
import { BlockchainController } from './blockchain.controller';
import { SmartContractService } from './smart-contract.service';

@Module({
  imports: [ConfigModule],
  providers: [BlockchainService, SmartContractService],
  controllers: [BlockchainController],
  exports: [BlockchainService, SmartContractService],
})
export class BlockchainModule {}
