import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';
import { Multer } from 'multer';

@Injectable()
export class FileStorageService {
  private readonly logger = new Logger(FileStorageService.name);

  constructor(private configService: ConfigService) {}

  async uploadFile(file: Multer.File): Promise<{
    fileHash: string;
    ipfsHash: string;
    url: string;
  }> {
    // Generate file hash
    const fileHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
    
    // For development: return base64 data URL instead of fake IPFS URL
    const base64Data = file.buffer.toString('base64');
    const dataUrl = `data:${file.mimetype};base64,${base64Data}`;
    
    // Generate a unique identifier for the file
    const ipfsHash = 'Qm' + crypto.randomBytes(32).toString('hex');
    
    this.logger.log(`File uploaded (development mode): ${ipfsHash}`);
    
    return {
      fileHash,
      ipfsHash,
      url: dataUrl, // Use data URL for development
    };
  }

  async downloadFile(ipfsHash: string): Promise<Buffer> {
    // Simulate IPFS download
    this.logger.log(`Downloading file from IPFS: ${ipfsHash}`);
    
    // In production, this would download from IPFS
    return Buffer.from('Simulated file content');
  }

  async verifyFile(fileHash: string, file: Multer.File): Promise<boolean> {
    const calculatedHash = crypto.createHash('sha256').update(file.buffer).digest('hex');
    return calculatedHash === fileHash;
  }

  async deleteFile(ipfsHash: string): Promise<boolean> {
    // Simulate IPFS deletion
    this.logger.log(`Deleting file from IPFS: ${ipfsHash}`);
    return true;
  }

  async getFileMetadata(ipfsHash: string): Promise<{
    size: number;
    type: string;
    createdAt: Date;
  }> {
    // Simulate metadata retrieval
    return {
      size: 1024,
      type: 'application/pdf',
      createdAt: new Date(),
    };
  }
}
