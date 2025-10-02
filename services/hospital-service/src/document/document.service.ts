import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { DocumentEntity, DocumentDocument, DocumentAccessLog, DocumentAccessLogDocument, DocumentCategory, VerificationStatus } from '../schemas/document.schema';
import { ConsentService } from '../consent/consent.service';
import { ConsentType } from '../schemas/consent.schema';
import { v4 as uuidv4 } from 'uuid';
import * as crypto from 'crypto';
import * as fs from 'fs';

export interface DocumentUploadDto {
  patientId: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  filePath: string;
  originalFileName: string;
  mimeType: string;
  metadata?: any;
}

export interface DocumentResponseDto {
  documentId: string;
  patientId: string;
  hospitalId: string;
  uploaderId: string;
  title: string;
  description?: string;
  category: DocumentCategory;
  filePath: string;
  fileHash: string;
  fileSize: number;
  mimeType: string;
  originalFileName?: string;
  blockchainHash?: string;
  verificationStatus: VerificationStatus;
  verifiedAt?: Date;
  verifiedBy?: string;
  verificationNotes?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

@Injectable()
export class DocumentService {
  constructor(
    @InjectModel(DocumentEntity.name) private documentModel: Model<DocumentDocument>,
    @InjectModel(DocumentAccessLog.name) private accessLogModel: Model<DocumentAccessLogDocument>,
    private consentService: ConsentService,
  ) {}

  async uploadDocument(
    hospitalId: string,
    uploaderId: string,
    uploadData: DocumentUploadDto,
    fileBuffer: Buffer
  ): Promise<DocumentResponseDto> {
    // Check if hospital has consent to upload documents for this patient
    const consentCheck = await this.consentService.checkConsent(
      uploadData.patientId,
      hospitalId,
      ConsentType.UPLOAD_RECORDS
    );

    if (!consentCheck.hasConsent) {
      throw new ForbiddenException('No consent to upload documents for this patient');
    }

    // Generate file hash
    const fileHash = crypto.createHash('sha256').update(fileBuffer).digest('hex');
    
    // Check for duplicate files
    const existingDocument = await this.documentModel.findOne({
      patientId: uploadData.patientId,
      fileHash,
      isActive: true,
    });

    if (existingDocument) {
      throw new BadRequestException('Document with same content already exists');
    }

    const documentId = uuidv4();
    
    // Create document record
    const document = new this.documentModel({
      documentId,
      patientId: uploadData.patientId,
      hospitalId,
      uploaderId,
      title: uploadData.title,
      description: uploadData.description,
      category: uploadData.category,
      filePath: uploadData.filePath,
      fileHash,
      fileSize: fileBuffer.length,
      mimeType: uploadData.mimeType,
      originalFileName: uploadData.originalFileName,
      verificationStatus: VerificationStatus.PENDING,
      metadata: uploadData.metadata,
    });

    const savedDocument = await document.save();

    // TODO: Store file in S3/MinIO
    // TODO: Store hash in blockchain
    // TODO: Emit document.uploaded event

    return this.mapToResponseDto(savedDocument);
  }

  async getDocument(
    documentId: string,
    requestedBy: string,
    hospitalId?: string
  ): Promise<DocumentResponseDto> {
    const query: any = { documentId, isActive: true };
    if (hospitalId) {
      query.hospitalId = hospitalId;
    }

    const document = await this.documentModel.findOne(query);

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    // Check consent for viewing
    const consentCheck = await this.consentService.checkConsent(
      document.patientId,
      document.hospitalId,
      ConsentType.VIEW_RECORDS
    );

    if (!consentCheck.hasConsent) {
      throw new ForbiddenException('No consent to view this document');
    }

    // Log access
    await this.logDocumentAccess(
      documentId,
      requestedBy,
      'view',
      { consentId: consentCheck.consent?.consentId }
    );

    return this.mapToResponseDto(document);
  }

  async getPatientDocuments(
    patientId: string,
    hospitalId: string,
    requestedBy: string,
    category?: DocumentCategory
  ): Promise<DocumentResponseDto[]> {
    // Check consent for viewing patient documents
    const consentCheck = await this.consentService.checkConsent(
      patientId,
      hospitalId,
      ConsentType.VIEW_RECORDS
    );

    if (!consentCheck.hasConsent) {
      throw new ForbiddenException('No consent to view patient documents');
    }

    const query: any = { patientId, hospitalId, isActive: true };
    if (category) {
      query.category = category;
    }

    const documents = await this.documentModel
      .find(query)
      .sort({ createdAt: -1 });

    // Log access
    await this.logDocumentAccess(
      'patient_documents',
      requestedBy,
      'view',
      { 
        patientId,
        documentCount: documents.length,
        consentId: consentCheck.consent?.consentId 
      }
    );

    return documents.map(doc => this.mapToResponseDto(doc));
  }

  async downloadDocument(
    documentId: string,
    requestedBy: string,
    hospitalId?: string
  ): Promise<{ document: DocumentResponseDto; fileBuffer: Buffer }> {
    const document = await this.getDocument(documentId, requestedBy, hospitalId);

    // TODO: Retrieve file from S3/MinIO
    // For now, simulate file reading
    let fileBuffer: Buffer;
    try {
      fileBuffer = fs.readFileSync(document.filePath);
    } catch (error) {
      throw new NotFoundException('Document file not found');
    }

    // Log download access
    await this.logDocumentAccess(
      documentId,
      requestedBy,
      'download',
      { 
        fileSize: fileBuffer.length,
        consentId: 'consent_id_here' // Get from consent check
      }
    );

    return { document, fileBuffer };
  }

  async verifyDocument(
    documentId: string,
    verifierId: string,
    notes?: string
  ): Promise<DocumentResponseDto> {
    const document = await this.documentModel.findOne({ documentId, isActive: true });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    if (document.verificationStatus === VerificationStatus.VERIFIED) {
      throw new BadRequestException('Document is already verified');
    }

    // TODO: Verify file hash against blockchain
    const isVerified = true; // Placeholder

    document.verificationStatus = isVerified ? VerificationStatus.VERIFIED : VerificationStatus.FAILED;
    document.verifiedAt = new Date();
    document.verifiedBy = verifierId;
    document.verificationNotes = notes;

    if (isVerified) {
      // TODO: Generate blockchain hash
      document.blockchainHash = `blockchain_hash_${documentId}`;
    }

    const updatedDocument = await document.save();

    // Log verification
    await this.logDocumentAccess(
      documentId,
      verifierId,
      'verify',
      { 
        verificationStatus: document.verificationStatus,
        notes 
      }
    );

    return this.mapToResponseDto(updatedDocument);
  }

  async getDocumentAccessLogs(
    documentId: string,
    limit: number = 50
  ): Promise<any[]> {
    const logs = await this.accessLogModel
      .find({ documentId })
      .sort({ timestamp: -1 })
      .limit(limit);

    return logs.map(log => ({
      logId: log.logId,
      documentId: log.documentId,
      accessedBy: log.accessedBy,
      accessType: log.accessType,
      ipAddress: log.ipAddress,
      userAgent: log.userAgent,
      metadata: log.metadata,
      timestamp: log.timestamp,
    }));
  }

  async deleteDocument(
    documentId: string,
    deletedBy: string,
    reason?: string
  ): Promise<void> {
    const document = await this.documentModel.findOne({ documentId, isActive: true });

    if (!document) {
      throw new NotFoundException('Document not found');
    }

    document.isActive = false;
    document.deletedAt = new Date();
    document.deletedBy = deletedBy;
    document.deletionReason = reason;

    await document.save();

    // TODO: Soft delete file from S3/MinIO
    // TODO: Emit document.deleted event
  }

  async getHospitalDocuments(
    hospitalId: string,
    category?: DocumentCategory,
    verificationStatus?: VerificationStatus,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ documents: DocumentResponseDto[]; total: number }> {
    const query: any = { hospitalId, isActive: true };
    if (category) {
      query.category = category;
    }
    if (verificationStatus) {
      query.verificationStatus = verificationStatus;
    }

    const [documents, total] = await Promise.all([
      this.documentModel
        .find(query)
        .sort({ createdAt: -1 })
        .limit(limit)
        .skip(offset),
      this.documentModel.countDocuments(query),
    ]);

    return {
      documents: documents.map(doc => this.mapToResponseDto(doc)),
      total,
    };
  }

  private async logDocumentAccess(
    documentId: string,
    accessedBy: string,
    accessType: string,
    metadata?: any
  ): Promise<void> {
    const log = new this.accessLogModel({
      logId: uuidv4(),
      documentId,
      accessedBy,
      accessType,
      metadata,
      timestamp: new Date(),
    });

    await log.save();
  }

  private mapToResponseDto(document: DocumentDocument): DocumentResponseDto {
    return {
      documentId: document.documentId,
      patientId: document.patientId,
      hospitalId: document.hospitalId,
      uploaderId: document.uploaderId,
      title: document.title,
      description: document.description,
      category: document.category,
      filePath: document.filePath,
      fileHash: document.fileHash,
      fileSize: document.fileSize,
      mimeType: document.mimeType,
      originalFileName: document.originalFileName,
      blockchainHash: document.blockchainHash,
      verificationStatus: document.verificationStatus,
      verifiedAt: document.verifiedAt,
      verifiedBy: document.verifiedBy,
      verificationNotes: document.verificationNotes,
      metadata: document.metadata,
      createdAt: document.createdAt,
      updatedAt: document.updatedAt,
    };
  }
}