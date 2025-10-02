import { Injectable, Logger } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);

  async encryptData(data: string): Promise<string> {
    this.logger.log('Encrypting data...');
    
    // Simple encryption for demo
    const cipher = crypto.createCipher('aes192', 'secret-key');
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    
    return encrypted;
  }

  async decryptData(encryptedData: string): Promise<string> {
    this.logger.log('Decrypting data...');
    
    // Simple decryption for demo
    const decipher = crypto.createDecipher('aes192', 'secret-key');
    let decrypted = decipher.update(encryptedData, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    
    return decrypted;
  }
}