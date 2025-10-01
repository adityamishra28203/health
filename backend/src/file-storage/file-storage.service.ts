import { Injectable, Logger, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Multer } from 'multer';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);
  private readonly encryptionKey: string;
  private readonly uploadDir: string;

  constructor(private configService: ConfigService) {
    this.encryptionKey = this.configService.get<string>('FILE_ENCRYPTION_KEY') || crypto.randomBytes(32).toString('hex');
    this.uploadDir = this.configService.get<string>('UPLOAD_DIR') || './uploads';
    
    // Ensure upload directory exists
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  /**
   * Encrypt file buffer using AES-256-GCM
   */
  private encryptFile(buffer: Buffer): { encryptedData: Buffer; iv: Buffer; tag: Buffer } {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    cipher.setAAD(Buffer.from('health-record', 'utf8'));
    
    let encrypted = cipher.update(buffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    const tag = cipher.getAuthTag();
    
    return { encryptedData: encrypted, iv, tag };
  }

  /**
   * Decrypt file buffer using AES-256-GCM
   */
  private decryptFile(encryptedData: Buffer, iv: Buffer, tag: Buffer): Buffer {
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAAD(Buffer.from('health-record', 'utf8'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted;
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

    return true;
  }

  async uploadFile(file: Multer.File): Promise<{
    fileHash: string;
    ipfsHash: string;
    url: string;
    metadata: {
      originalName: string;
      mimeType: string;
      size: number;
      uploadedAt: Date;
    };
  }> {
    try {
      // Validate file content for malicious patterns
      if (!this.validateFileContent(file.buffer, file.mimetype)) {
        throw new BadRequestException('File content validation failed. File may contain malicious content.');
      }

      // Generate file hash for integrity verification
      const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
      
      // Encrypt file content
      const { encryptedData, iv, tag } = this.encryptFile(file.buffer);
      
      // Generate unique file identifier
      const ipfsHash = 'Qm' + crypto.randomBytes(32).toString('hex');
      
      // In production, store encrypted file to secure storage (AWS S3, etc.)
      // For development, store encrypted file locally
      const encryptedFilePath = path.join(this.uploadDir, `${ipfsHash}.enc`);
      const metadataFilePath = path.join(this.uploadDir, `${ipfsHash}.meta`);
      
      // Write encrypted file
      fs.writeFileSync(encryptedFilePath, encryptedData);
      
      // Write metadata (iv, tag, file info)
      const metadata = {
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        uploadedAt: new Date(),
        iv: iv.toString('base64'),
        tag: tag.toString('base64'),
        fileHash,
      };
      
      fs.writeFileSync(metadataFilePath, JSON.stringify(metadata, null, 2));
      
      // For development: return base64 data URL (unencrypted for preview)
      const base64Data = file.buffer.toString('base64');
      const dataUrl = `data:${file.mimetype};base64,${base64Data}`;
      
      this.logger.log(`File uploaded securely: ${ipfsHash} (${file.originalname})`);
      
      return {
        fileHash,
        ipfsHash,
        url: dataUrl, // Use data URL for development
        metadata: {
          originalName: file.originalname,
          mimeType: file.mimetype,
          size: file.size,
          uploadedAt: new Date(),
        },
      };
    } catch (error) {
      this.logger.error(`File upload failed: ${error.message}`);
      throw new BadRequestException(`File upload failed: ${error.message}`);
    }
  }

  async downloadFile(ipfsHash: string): Promise<Buffer> {
    try {
      const encryptedFilePath = path.join(this.uploadDir, `${ipfsHash}.enc`);
      const metadataFilePath = path.join(this.uploadDir, `${ipfsHash}.meta`);
      
      // Check if files exist
      if (!fs.existsSync(encryptedFilePath) || !fs.existsSync(metadataFilePath)) {
        throw new BadRequestException('File not found');
      }
      
      // Read metadata
      const metadataContent = fs.readFileSync(metadataFilePath, 'utf8');
      const metadata = JSON.parse(metadataContent);
      
      // Read encrypted file
      const encryptedData = fs.readFileSync(encryptedFilePath);
      
      // Decrypt file
      const iv = Buffer.from(metadata.iv, 'base64');
      const tag = Buffer.from(metadata.tag, 'base64');
      const decryptedData = this.decryptFile(encryptedData, iv, tag);
      
      // Verify file integrity
      const calculatedHash = crypto.createHash('sha256').update(decryptedData).digest('hex');
      if (calculatedHash !== metadata.fileHash) {
        throw new BadRequestException('File integrity verification failed');
      }
      
      this.logger.log(`File downloaded and decrypted: ${ipfsHash}`);
      return decryptedData;
    } catch (error) {
      this.logger.error(`File download failed: ${error.message}`);
      throw new BadRequestException(`File download failed: ${error.message}`);
    }
  }

  async verifyFile(fileHash: string, file: Multer.File): Promise<boolean> {
    const calculatedHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
    return calculatedHash === fileHash;
  }

  async deleteFile(ipfsHash: string): Promise<boolean> {
    try {
      const encryptedFilePath = path.join(this.uploadDir, `${ipfsHash}.enc`);
      const metadataFilePath = path.join(this.uploadDir, `${ipfsHash}.meta`);
      
      // Delete encrypted file
      if (fs.existsSync(encryptedFilePath)) {
        fs.unlinkSync(encryptedFilePath);
      }
      
      // Delete metadata file
      if (fs.existsSync(metadataFilePath)) {
        fs.unlinkSync(metadataFilePath);
      }
      
      this.logger.log(`File deleted securely: ${ipfsHash}`);
      return true;
    } catch (error) {
      this.logger.error(`File deletion failed: ${error.message}`);
      return false;
    }
  }

  async getFileMetadata(ipfsHash: string): Promise<{
    originalName: string;
    mimeType: string;
    size: number;
    uploadedAt: Date;
    fileHash: string;
  }> {
    try {
      const metadataFilePath = path.join(this.uploadDir, `${ipfsHash}.meta`);
      
      if (!fs.existsSync(metadataFilePath)) {
        throw new BadRequestException('File metadata not found');
      }
      
      const metadataContent = fs.readFileSync(metadataFilePath, 'utf8');
      const metadata = JSON.parse(metadataContent);
      
      return {
        originalName: metadata.originalName,
        mimeType: metadata.mimeType,
        size: metadata.size,
        uploadedAt: metadata.uploadedAt,
        fileHash: metadata.fileHash,
      };
    } catch (error) {
      this.logger.error(`Metadata retrieval failed: ${error.message}`);
      throw new BadRequestException(`Metadata retrieval failed: ${error.message}`);
    }
  }
}
