import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export interface OfflineDocument {
  id: string;
  name: string;
  type: string;
  data: ArrayBuffer | Blob;
  metadata: {
    patientId: string;
    hospitalId: string;
    uploadTime: Date;
    hash: string;
    size: number;
    mimeType: string;
  };
  status: 'pending' | 'uploading' | 'completed' | 'failed';
  retryCount: number;
  maxRetries: number;
  error?: string;
}

export interface SyncStatus {
  isOnline: boolean;
  pendingUploads: number;
  lastSyncTime: Date | null;
  syncInProgress: boolean;
}

@Injectable()
export class OfflineSyncService {
  private readonly logger = new Logger(OfflineSyncService.name);
  private readonly STORAGE_KEY = 'offline_documents';
  private readonly SYNC_STATUS_KEY = 'sync_status';
  private isOnline = navigator.onLine;
  private pendingDocuments: OfflineDocument[] = [];
  private syncInProgress = false;

  constructor(private eventEmitter: EventEmitter2) {
    this.initializeOfflineSupport();
    this.loadPendingDocuments();
  }

  private initializeOfflineSupport(): void {
    // Listen for online/offline events
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.logger.log('Device is online - starting sync process');
      this.eventEmitter.emit('device.online');
      this.processPendingDocuments();
    });

    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.logger.log('Device is offline - documents will be queued');
      this.eventEmitter.emit('device.offline');
    });

    // Periodic sync check
    setInterval(() => {
      if (this.isOnline && this.pendingDocuments.length > 0 && !this.syncInProgress) {
        this.processPendingDocuments();
      }
    }, 30000); // Check every 30 seconds
  }

  async queueDocument(document: Omit<OfflineDocument, 'id' | 'status' | 'retryCount'>): Promise<string> {
    const documentId = this.generateDocumentId();
    const offlineDocument: OfflineDocument = {
      ...document,
      id: documentId,
      status: 'pending',
      retryCount: 0,
      maxRetries: 3,
    };

    this.pendingDocuments.push(offlineDocument);
    await this.savePendingDocuments();

    this.logger.log(`Document ${documentId} queued for upload`);

    if (this.isOnline) {
      // Try to upload immediately if online
      this.processPendingDocuments();
    } else {
      // Store in local storage for later sync
      this.eventEmitter.emit('document.queued', offlineDocument);
    }

    return documentId;
  }

  async processPendingDocuments(): Promise<void> {
    if (this.syncInProgress || !this.isOnline) {
      return;
    }

    this.syncInProgress = true;
    this.logger.log(`Starting sync process for ${this.pendingDocuments.length} pending documents`);

    try {
      const documentsToProcess = [...this.pendingDocuments];
      
      for (const document of documentsToProcess) {
        if (document.status === 'pending' || document.status === 'failed') {
          await this.uploadDocument(document);
        }
      }

      await this.updateSyncStatus({
        isOnline: true,
        pendingUploads: this.pendingDocuments.filter(d => d.status === 'pending').length,
        lastSyncTime: new Date(),
        syncInProgress: false,
      });

      this.logger.log('Sync process completed');
    } catch (error) {
      this.logger.error('Error during sync process:', error);
    } finally {
      this.syncInProgress = false;
    }
  }

  private async uploadDocument(document: OfflineDocument): Promise<void> {
    try {
      document.status = 'uploading';
      this.eventEmitter.emit('document.uploading', document);

      // Convert ArrayBuffer/Blob to FormData
      const formData = new FormData();
      formData.append('file', new Blob([document.data]), document.name);
      formData.append('patientId', document.metadata.patientId);
      formData.append('hospitalId', document.metadata.hospitalId);
      formData.append('type', document.type);
      formData.append('metadata', JSON.stringify(document.metadata));

      // Upload to document service
      const response = await fetch('/api/v1/documents/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const result = await response.json();
      
      document.status = 'completed';
      this.eventEmitter.emit('document.uploaded', {
        ...document,
        documentId: result.documentId,
      });

      // Remove from pending documents
      this.pendingDocuments = this.pendingDocuments.filter(d => d.id !== document.id);
      await this.savePendingDocuments();

      this.logger.log(`Document ${document.id} uploaded successfully`);
    } catch (error) {
      document.retryCount++;
      document.error = error.message;
      
      if (document.retryCount >= document.maxRetries) {
        document.status = 'failed';
        this.logger.error(`Document ${document.id} failed after ${document.maxRetries} retries`);
        this.eventEmitter.emit('document.upload.failed', document);
      } else {
        document.status = 'pending';
        this.logger.warn(`Document ${document.id} failed, will retry (${document.retryCount}/${document.maxRetries})`);
        
        // Exponential backoff for retry
        setTimeout(() => {
          this.uploadDocument(document);
        }, Math.pow(2, document.retryCount) * 1000);
      }

      await this.savePendingDocuments();
    }
  }

  private async loadPendingDocuments(): Promise<void> {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (stored) {
        const documents = JSON.parse(stored);
        this.pendingDocuments = documents.map((doc: any) => ({
          ...doc,
          data: new Blob([doc.data]), // Reconstruct Blob from stored data
        }));
        this.logger.log(`Loaded ${this.pendingDocuments.length} pending documents from storage`);
      }
    } catch (error) {
      this.logger.error('Error loading pending documents:', error);
      this.pendingDocuments = [];
    }
  }

  private async savePendingDocuments(): Promise<void> {
    try {
      // Convert Blob data to storable format
      const storableDocuments = await Promise.all(
        this.pendingDocuments.map(async (doc) => ({
          ...doc,
          data: await this.blobToArrayBuffer(doc.data),
        }))
      );
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(storableDocuments));
    } catch (error) {
      this.logger.error('Error saving pending documents:', error);
    }
  }

  private async blobToArrayBuffer(blob: Blob | ArrayBuffer): Promise<ArrayBuffer> {
    if (blob instanceof ArrayBuffer) {
      return blob;
    }
    return await blob.arrayBuffer();
  }

  private generateDocumentId(): string {
    return `offline_doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  async getSyncStatus(): Promise<SyncStatus> {
    try {
      const stored = localStorage.getItem(this.SYNC_STATUS_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      this.logger.error('Error loading sync status:', error);
    }

    return {
      isOnline: this.isOnline,
      pendingUploads: this.pendingDocuments.length,
      lastSyncTime: null,
      syncInProgress: this.syncInProgress,
    };
  }

  private async updateSyncStatus(status: SyncStatus): Promise<void> {
    try {
      localStorage.setItem(this.SYNC_STATUS_KEY, JSON.stringify(status));
    } catch (error) {
      this.logger.error('Error saving sync status:', error);
    }
  }

  async getPendingDocuments(): Promise<OfflineDocument[]> {
    return [...this.pendingDocuments];
  }

  async removePendingDocument(documentId: string): Promise<boolean> {
    const initialLength = this.pendingDocuments.length;
    this.pendingDocuments = this.pendingDocuments.filter(d => d.id !== documentId);
    
    if (this.pendingDocuments.length < initialLength) {
      await this.savePendingDocuments();
      this.eventEmitter.emit('document.removed', { documentId });
      return true;
    }
    
    return false;
  }

  async retryFailedDocument(documentId: string): Promise<boolean> {
    const document = this.pendingDocuments.find(d => d.id === documentId);
    if (document && document.status === 'failed') {
      document.status = 'pending';
      document.retryCount = 0;
      document.error = undefined;
      
      await this.savePendingDocuments();
      
      if (this.isOnline) {
        this.uploadDocument(document);
      }
      
      return true;
    }
    
    return false;
  }

  async clearCompletedDocuments(): Promise<number> {
    const initialLength = this.pendingDocuments.length;
    this.pendingDocuments = this.pendingDocuments.filter(d => d.status !== 'completed');
    
    if (this.pendingDocuments.length < initialLength) {
      await this.savePendingDocuments();
    }
    
    return initialLength - this.pendingDocuments.length;
  }

  // Service Worker integration
  async registerServiceWorker(): Promise<void> {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.register('/sw.js');
        this.logger.log('Service Worker registered:', registration);
        
        // Listen for messages from service worker
        navigator.serviceWorker.addEventListener('message', (event) => {
          if (event.data.type === 'DOCUMENT_UPLOAD_COMPLETE') {
            this.processPendingDocuments();
          }
        });
      } catch (error) {
        this.logger.error('Service Worker registration failed:', error);
      }
    }
  }

  // Network quality monitoring
  async checkNetworkQuality(): Promise<'good' | 'poor' | 'offline'> {
    if (!this.isOnline) {
      return 'offline';
    }

    try {
      const startTime = Date.now();
      await fetch('/api/v1/health', { method: 'HEAD' });
      const endTime = Date.now();
      
      const responseTime = endTime - startTime;
      
      if (responseTime < 1000) {
        return 'good';
      } else {
        return 'poor';
      }
    } catch (error) {
      return 'poor';
    }
  }

  // Storage quota management
  async getStorageUsage(): Promise<{ used: number; quota: number; percentage: number }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        const used = estimate.usage || 0;
        const quota = estimate.quota || 0;
        const percentage = quota > 0 ? (used / quota) * 100 : 0;
        
        return { used, quota, percentage };
      } catch (error) {
        this.logger.error('Error getting storage usage:', error);
      }
    }
    
    return { used: 0, quota: 0, percentage: 0 };
  }

  async cleanupOldDocuments(maxAge: number = 7 * 24 * 60 * 60 * 1000): Promise<number> {
    const cutoffTime = new Date(Date.now() - maxAge);
    const initialLength = this.pendingDocuments.length;
    
    this.pendingDocuments = this.pendingDocuments.filter(doc => {
      return new Date(doc.metadata.uploadTime) > cutoffTime;
    });
    
    if (this.pendingDocuments.length < initialLength) {
      await this.savePendingDocuments();
    }
    
    return initialLength - this.pendingDocuments.length;
  }
}


