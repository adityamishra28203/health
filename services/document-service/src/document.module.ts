import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { DocumentController } from './document.controller';
import { DocumentService } from './document.service';
import { EncryptionService } from './encryption/encryption.service';
import { StorageService } from './storage/storage.service';
import { BlockchainService } from './blockchain/blockchain.service';
import { KafkaService } from './kafka/kafka.service';
import { DocumentSchema } from './schemas/document.schema';
import { DocumentMetadataSchema } from './schemas/document-metadata.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),
    MongooseModule.forRootAsync({
      useFactory: () => ({
        uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/document-service',
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }),
    }),
    MongooseModule.forFeature([
      { name: 'Document', schema: DocumentSchema },
      { name: 'DocumentMetadata', schema: DocumentMetadataSchema },
    ]),
  ],
  controllers: [DocumentController],
  providers: [
    DocumentService,
    EncryptionService,
    StorageService,
    BlockchainService,
    KafkaService,
  ],
  exports: [DocumentService, EncryptionService, StorageService],
})
export class DocumentModule {}

