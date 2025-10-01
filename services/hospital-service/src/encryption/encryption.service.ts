import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly logger = new Logger(EncryptionService.name);
  private readonly encryptionKey: string;

  constructor(private configService: ConfigService) {
    this.encryptionKey = this.configService.get<string>('FILE_ENCRYPTION_KEY') || 
                        crypto.randomBytes(32).toString('hex');
  }

  async encryptFile(buffer: Buffer): Promise<{
    encryptedData: Buffer;
    iv: Buffer;
    tag: Buffer;
    keyId: string;
  }> {
    const iv = crypto.randomBytes(16);
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
    cipher.setAAD(Buffer.from('health-record', 'utf8'));
    
    let encrypted = cipher.update(buffer);
    encrypted = Buffer.concat([encrypted, cipher.final()]);
    
    const tag = cipher.getAuthTag();
    const keyId = crypto.randomUUID();
    
    return { encryptedData: encrypted, iv, tag, keyId };
  }

  async decryptFile(
    encryptedData: Buffer,
    keyId: string,
    iv: Buffer,
    tag: Buffer,
  ): Promise<Buffer> {
    const key = crypto.scryptSync(this.encryptionKey, 'salt', 32);
    const decipher = crypto.createDecipheriv('aes-256-gcm', key, iv);
    decipher.setAAD(Buffer.from('health-record', 'utf8'));
    decipher.setAuthTag(tag);
    
    let decrypted = decipher.update(encryptedData);
    decrypted = Buffer.concat([decrypted, decipher.final()]);
    
    return decrypted;
  }

  async signDocument(fileHash: string, certificateId: string): Promise<string> {
    // Mock implementation - in real scenario, this would use actual digital signing
    const signature = crypto.createHash('sha256')
      .update(fileHash + certificateId + Date.now())
      .digest('base64');
    
    return signature;
  }
}
