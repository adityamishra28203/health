import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
  listAll,
  getMetadata,
  updateMetadata,
} from 'firebase/storage';
import { storage } from './firebase';

export interface FileUpload {
  file: File;
  path: string;
  metadata?: {
    contentType?: string;
    customMetadata?: Record<string, string>;
  };
}

export interface UploadedFile {
  name: string;
  url: string;
  size: number;
  contentType: string;
  fullPath: string;
  timeCreated: string;
  updated: string;
}

class FirebaseStorageService {
  // Upload single file
  async uploadFile(fileUpload: FileUpload): Promise<UploadedFile> {
    try {
      const { file, path, metadata } = fileUpload;
      const storageRef = ref(storage, path);
      
      // Upload file
      const snapshot = await uploadBytes(storageRef, file, metadata);
      
      // Get download URL
      const downloadURL = await getDownloadURL(snapshot.ref);
      
      // Get file metadata
      const fileMetadata = await getMetadata(storageRef);
      
      return {
        name: fileMetadata.name,
        url: downloadURL,
        size: fileMetadata.size,
        contentType: fileMetadata.contentType || 'application/octet-stream',
        fullPath: fileMetadata.fullPath,
        timeCreated: fileMetadata.timeCreated,
        updated: fileMetadata.updated,
      };
    } catch (error) {
      throw error;
    }
  }

  // Upload multiple files
  async uploadFiles(fileUploads: FileUpload[]): Promise<UploadedFile[]> {
    try {
      const uploadPromises = fileUploads.map(fileUpload => this.uploadFile(fileUpload));
      return await Promise.all(uploadPromises);
    } catch (error) {
      throw error;
    }
  }

  // Upload health record document
  async uploadHealthRecordDocument(
    file: File,
    patientId: string,
    recordId: string,
    documentType: string
  ): Promise<UploadedFile> {
    try {
      const path = `health-records/${patientId}/${recordId}/${documentType}/${file.name}`;
      
      return await this.uploadFile({
        file,
        path,
        metadata: {
          contentType: file.type,
          customMetadata: {
            patientId,
            recordId,
            documentType,
            uploadedAt: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  // Upload insurance claim document
  async uploadInsuranceClaimDocument(
    file: File,
    patientId: string,
    claimId: string,
    documentType: string
  ): Promise<UploadedFile> {
    try {
      const path = `insurance-claims/${patientId}/${claimId}/${documentType}/${file.name}`;
      
      return await this.uploadFile({
        file,
        path,
        metadata: {
          contentType: file.type,
          customMetadata: {
            patientId,
            claimId,
            documentType,
            uploadedAt: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  // Upload user avatar
  async uploadUserAvatar(file: File, userId: string): Promise<UploadedFile> {
    try {
      const path = `avatars/${userId}/${file.name}`;
      
      return await this.uploadFile({
        file,
        path,
        metadata: {
          contentType: file.type,
          customMetadata: {
            userId,
            uploadedAt: new Date().toISOString(),
          },
        },
      });
    } catch (error) {
      throw error;
    }
  }

  // Get file download URL
  async getDownloadURL(path: string): Promise<string> {
    try {
      const storageRef = ref(storage, path);
      return await getDownloadURL(storageRef);
    } catch (error) {
      throw error;
    }
  }

  // Delete file
  async deleteFile(path: string): Promise<void> {
    try {
      const storageRef = ref(storage, path);
      await deleteObject(storageRef);
    } catch (error) {
      throw error;
    }
  }

  // List files in directory
  async listFiles(path: string): Promise<UploadedFile[]> {
    try {
      const listRef = ref(storage, path);
      const result = await listAll(listRef);
      
      const files: UploadedFile[] = [];
      
      for (const itemRef of result.items) {
        try {
          const metadata = await getMetadata(itemRef);
          const url = await getDownloadURL(itemRef);
          
          files.push({
            name: metadata.name,
            url,
            size: metadata.size,
            contentType: metadata.contentType || 'application/octet-stream',
            fullPath: metadata.fullPath,
            timeCreated: metadata.timeCreated,
            updated: metadata.updated,
          });
        } catch (error) {
          console.error('Error getting file metadata:', error);
        }
      }
      
      return files;
    } catch (error) {
      throw error;
    }
  }

  // Get file metadata
  async getFileMetadata(path: string) {
    try {
      const storageRef = ref(storage, path);
      return await getMetadata(storageRef);
    } catch (error) {
      throw error;
    }
  }

  // Update file metadata
  async updateFileMetadata(path: string, metadata: Record<string, unknown>) {
    try {
      const storageRef = ref(storage, path);
      await updateMetadata(storageRef, metadata);
    } catch (error) {
      throw error;
    }
  }

  // Generate unique filename
  generateUniqueFilename(originalName: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const extension = originalName.split('.').pop();
    return `${timestamp}_${randomString}.${extension}`;
  }

  // Validate file type
  validateFileType(file: File, allowedTypes: string[]): boolean {
    return allowedTypes.includes(file.type);
  }

  // Validate file size
  validateFileSize(file: File, maxSizeInMB: number): boolean {
    const maxSizeInBytes = maxSizeInMB * 1024 * 1024;
    return file.size <= maxSizeInBytes;
  }

  // Get file size in human readable format
  getFileSizeString(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }
}

export const firebaseStorageService = new FirebaseStorageService();
export default firebaseStorageService;
