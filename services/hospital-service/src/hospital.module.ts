import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { JwtModule } from '@nestjs/jwt';
import { HospitalController } from './hospital.controller';
import { HospitalService } from './hospital.service';
import { PatientService } from './patient/patient.service';
import { DocumentService } from './document/document.service';
import { RBACService } from './rbac/rbac.service';
import { TenantService } from './tenant/tenant.service';
import { KafkaService } from './kafka/kafka.service';
import { EncryptionService } from './encryption/encryption.service';
import { StorageService } from './storage/storage.service';
import { BlockchainService } from './blockchain/blockchain.service';
import { HospitalSchema } from './schemas/hospital.schema';
import { HospitalUserSchema } from './schemas/hospital-user.schema';
import { PatientLinkSchema } from './schemas/patient-link.schema';
import { TenantSchema } from './schemas/tenant.schema';

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
    MongooseModule.forRootAsync({
      useFactory: () => {
        const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/hospital-service';
        // Skip MongoDB connection if in mock mode
        if (uri.startsWith('mock://')) {
          return { uri: 'mongodb://localhost:27017/hospital-service-mock' };
        }
        return {
          uri,
          useNewUrlParser: true,
          useUnifiedTopology: true,
        };
      },
    }),
    MongooseModule.forFeature([
      { name: 'Hospital', schema: HospitalSchema },
      { name: 'HospitalUser', schema: HospitalUserSchema },
      { name: 'PatientLink', schema: PatientLinkSchema },
      { name: 'Tenant', schema: TenantSchema },
    ]),
  ],
  controllers: [HospitalController],
  providers: [
    HospitalService,
    PatientService,
    DocumentService,
    RBACService,
    TenantService,
    KafkaService,
    EncryptionService,
    StorageService,
    BlockchainService,
  ],
  exports: [HospitalService, RBACService, TenantService],
})
export class HospitalModule {}

