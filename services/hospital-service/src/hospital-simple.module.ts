import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { HospitalController } from './hospital.controller';
import { HospitalSimpleService } from './hospital-simple.service';
import { PatientService } from './patient/patient.service';
import { DocumentService } from './document/document.service';
import { RBACService } from './rbac/rbac.service';
import { TenantService } from './tenant/tenant.service';
import { KafkaService } from './kafka/kafka.service';
import { EncryptionService } from './encryption/encryption.service';
import { StorageService } from './storage/storage.service';
import { BlockchainService } from './blockchain/blockchain.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'your-secret-key',
      signOptions: { expiresIn: process.env.JWT_EXPIRES_IN || '15m' },
    }),
  ],
  controllers: [HospitalController],
  providers: [
    HospitalSimpleService,
    PatientService,
    DocumentService,
    RBACService,
    TenantService,
    KafkaService,
    EncryptionService,
    StorageService,
    BlockchainService,
  ],
  exports: [HospitalSimpleService, RBACService, TenantService],
})
export class HospitalSimpleModule {}
