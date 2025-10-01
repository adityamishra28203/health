import { Injectable, Logger, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import { Document, DocumentDocument } from './schemas/document.schema';
import { DocumentMetadata, DocumentMetadataDocument } from './schemas/document-metadata.schema';
import { EncryptionService } from './encryption/encryption.service';
import { StorageService } from './storage/storage.service';
import { BlockchainService } from './blockchain/blockchain.service';
import { KafkaService } from './kafka/kafka.service';
import { Multer } from 'multer';

export interface DocumentUploadResult {
  documentId: string;
  fileHash: string;
  ipfsHash: string;
  blockchainTx?: string;
  url: string;
  metadata: DocumentMetadata;
}

export interface DocumentVerificationResult {
  documentId: string;
  verified: boolean;
  blockchainTx?: string;
  verifiedBy: string;
  verificationMethod: 'blockchain_hash' | 'digital_signature' | 'manual_review';
  timestamp: Date;
}

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);
  private readonly uploadDir: string;

  constructor(
    @InjectModel(Document.name) private documentModel: Model<DocumentDocument>,
    @InjectModel(DocumentMetadata.name) private metadataModel: Model<DocumentMetadataDocument>,
    private encryptionService: EncryptionService,
    private storageService: StorageService,
    private blockchainService: BlockchainService,
    private kafkaService: KafkaService,
  ) {
    this.uploadDir = process.env.UPLOAD_DIR || './uploads';
    this.ensureUploadDirectory();
  }

  private ensureUploadDirectory(): void {
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Validate file content for malicious patterns
   */
  private validateFileContent(buffer: Buffer, mimeType: string): boolean {
    // Check for common malicious file signatures
    const maliciousSignatures = [
      Buffer.from([0x4D, 0x5A]), // PE executable
      Buffer.from([0x7F, 0x45, 0x4C, 0x46]), // ELF executable
      Buffer.from([0xFE, 0xED, 0xFA, 0xCE]), // Mach-O binary
      Buffer.from([0xCA, 0xFE, 0xBA, 0xBE]), // Java class file
    ];

    for (const signature of maliciousSignatures) {
      if (buffer.indexOf(signature) !== -1) {
        this.logger.warn(`Malicious file signature detected: ${signature.toString('hex')}`);
        return false;
      }
    }

    // Additional validation for specific file types
    if (mimeType === 'application/pdf') {
      // Check PDF header
      if (!buffer.slice(0, 4).equals(Buffer.from('%PDF'))) {
        return false;
      }
    }

    // Check file size limits
    if (buffer.length > 50 * 1024 * 1024) { // 50MB limit
      return false;
    }

    return true;
  }

  /**
   * Generate SHA-256 hash of file content
   */
  private generateFileHash(buffer: Buffer): string {
    return crypto.createHash('sha256').update(buffer).digest('hex');
  }

  /**
   * Generate unique document ID
   */
  private generateDocumentId(): string {
    return `doc_${crypto.randomBytes(16).toString('hex')}`;
  }

  /**
   * Upload and process document
   */
  async uploadDocument(
    file: Multer.File,
    patientId: string,
    hospitalId: string,
    documentType: string,
    metadata?: any,
  ): Promise<DocumentUploadResult> {
    try {
      this.logger.log(`Uploading document for patient ${patientId} from hospital ${hospitalId}`);

      // Validate file content
      if (!this.validateFileContent(file.buffer, file.mimetype)) {
        throw new BadRequestException('File content validation failed. File may contain malicious content.');
      }

      // Generate document ID and file hash
      const documentId = this.generateDocumentId();
      const fileHash = this.generateFileHash(file.buffer);

      // Check for duplicate files
      const existingDocument = await this.documentModel.findOne({ fileHash });
      if (existingDocument) {
        this.logger.warn(`Duplicate file detected: ${fileHash}`);
        throw new BadRequestException('This file has already been uploaded');
      }

      // Encrypt file content
      const { encryptedData, iv, tag, keyId } = await this.encryptionService.encryptFile(file.buffer);

      // Store encrypted file
      const ipfsHash = await this.storageService.storeFile(encryptedData, documentId);

      // Create document metadata
      const documentMetadata = new this.metadataModel({
        documentId,
        patientId,
        hospitalId,
        type: documentType,
        fileHash,
        ipfsHash,
        signedBy: hospitalId,
        uploadedAt: new Date(),
        status: 'pending',
        size: file.size,
        mimeType: file.mimetype,
        originalName: file.originalname,
        encryptionKeyId: keyId,
        encryptionIv: iv,
        encryptionTag: tag,
        metadata: metadata || {},
      });

      await documentMetadata.save();

      // Store document record
      const document = new this.documentModel({
        documentId,
        fileHash,
        ipfsHash,
        encryptedData: encryptedData.toString('base64'),
        status: 'pending',
      });

      await document.save();

      // Emit document uploaded event
      await this.kafkaService.emitEvent('document.uploaded', {
        eventId: crypto.randomUUID(),
        eventType: 'document.uploaded',
        timestamp: new Date().toISOString(),
        documentId,
        hospitalId,
        patientId,
        fileHash,
        ipfsHash,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        documentType,
        metadata: metadata || {},
      });

      // For development: return base64 data URL (unencrypted for preview)
      const base64Data = file.buffer.toString('base64');
      const url = `data:${file.mimetype};base64,${base64Data}`;

      this.logger.log(`Document uploaded successfully: ${documentId}`);

      return {
        documentId,
        fileHash,
        ipfsHash,
        url,
        metadata: documentMetadata,
      };
    } catch (error) {
      this.logger.error(`Document upload failed: ${error.message}`, error.stack);
      throw new BadRequestException(`Document upload failed: ${error.message}`);
    }
  }

  /**
   * Sign document with hospital's digital signature
   */
  async signDocument(
    documentId: string,
    hospitalId: string,
    signedBy: string,
    certificateId: string,
  ): Promise<DocumentVerificationResult> {
    try {
      this.logger.log(`Signing document ${documentId} by hospital ${hospitalId}`);

      const document = await this.metadataModel.findOne({ documentId });
      if (!document) {
        throw new NotFoundException('Document not found');
      }

      // Generate digital signature
      const signature = await this.encryptionService.signDocument(document.fileHash, certificateId);

      // Update document with signature
      document.signature = signature;
      document.signedBy = signedBy;
      document.certificateId = certificateId;
      document.status = 'signed';
      document.signedAt = new Date();

      await document.save();

      // Emit document signed event
      await this.kafkaService.emitEvent('document.signed', {
        eventId: crypto.randomUUID(),
        eventType: 'document.signed',
        timestamp: new Date().toISOString(),
        documentId,
        hospitalId,
        signedBy,
        signature,
        certificateId,
        signatureValid: true,
      });

      this.logger.log(`Document signed successfully: ${documentId}`);

      return {
        documentId,
        verified: true,
        verifiedBy: signedBy,
        verificationMethod: 'digital_signature',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Document signing failed: ${error.message}`, error.stack);
      throw new BadRequestException(`Document signing failed: ${error.message}`);
    }
  }

  /**
   * Verify document on blockchain
   */
  async verifyDocument(documentId: string, verifiedBy: string): Promise<DocumentVerificationResult> {
    try {
      this.logger.log(`Verifying document ${documentId} on blockchain`);

      const document = await this.metadataModel.findOne({ documentId });
      if (!document) {
        throw new NotFoundException('Document not found');
      }

      // Store hash on blockchain
      const blockchainTx = await this.blockchainService.storeHash(document.fileHash, documentId);

      // Update document with blockchain verification
      document.blockchainTx = blockchainTx;
      document.status = 'verified';
      document.verifiedAt = new Date();
      document.verifiedBy = verifiedBy;

      await document.save();

      // Emit document verified event
      await this.kafkaService.emitEvent('document.verified', {
        eventId: crypto.randomUUID(),
        eventType: 'document.verified',
        timestamp: new Date().toISOString(),
        documentId,
        blockchainTx,
        verifiedBy,
        verificationMethod: 'blockchain_hash',
      });

      this.logger.log(`Document verified on blockchain: ${documentId}`);

      return {
        documentId,
        verified: true,
        blockchainTx,
        verifiedBy,
        verificationMethod: 'blockchain_hash',
        timestamp: new Date(),
      };
    } catch (error) {
      this.logger.error(`Document verification failed: ${error.message}`, error.stack);
      throw new BadRequestException(`Document verification failed: ${error.message}`);
    }
  }

  /**
   * Get document metadata
   */
  async getDocumentMetadata(documentId: string): Promise<DocumentMetadata> {
    const document = await this.metadataModel.findOne({ documentId });
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    return document;
  }

  /**
   * Download and decrypt document
   */
  async downloadDocument(documentId: string): Promise<Buffer> {
    try {
      const document = await this.metadataModel.findOne({ documentId });
      if (!document) {
        throw new NotFoundException('Document not found');
      }

      // Retrieve encrypted file from storage
      const encryptedData = await this.storageService.retrieveFile(document.ipfsHash);

      // Decrypt file
      const decryptedData = await this.encryptionService.decryptFile(
        encryptedData,
        document.encryptionKeyId,
        document.encryptionIv,
        document.encryptionTag,
      );

      return decryptedData;
    } catch (error) {
      this.logger.error(`Document download failed: ${error.message}`, error.stack);
      throw new BadRequestException(`Document download failed: ${error.message}`);
    }
  }

  /**
   * Delete document
   */
  async deleteDocument(documentId: string): Promise<boolean> {
    try {
      const document = await this.metadataModel.findOne({ documentId });
      if (!document) {
        throw new NotFoundException('Document not found');
      }

      // Delete from storage
      await this.storageService.deleteFile(document.ipfsHash);

      // Delete from database
      await this.metadataModel.deleteOne({ documentId });
      await this.documentModel.deleteOne({ documentId });

      this.logger.log(`Document deleted successfully: ${documentId}`);
      return true;
    } catch (error) {
      this.logger.error(`Document deletion failed: ${error.message}`, error.stack);
      return false;
    }
  }

  /**
   * Get patient's documents
   */
  async getPatientDocuments(
    patientId: string,
    documentType?: string,
    verified?: boolean,
  ): Promise<DocumentMetadata[]> {
    const filter: any = { patientId };
    
    if (documentType) {
      filter.type = documentType;
    }
    
    if (verified !== undefined) {
      filter.status = verified ? 'verified' : 'pending';
    }

    return this.metadataModel.find(filter).sort({ uploadedAt: -1 });
  }

  /**
   * Verify document hash on blockchain
   */
  async verifyDocumentHash(hash: string): Promise<any> {
    return this.blockchainService.verifyHash(hash);
  }
}

