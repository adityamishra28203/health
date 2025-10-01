import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface Document {
  id: string;
  originalName: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  sha256Hash: string;
  metadata: {
    title: string;
    author?: string;
    subject?: string;
    keywords?: string[];
    creationDate?: string;
    modificationDate?: string;
    pageCount?: number;
    dimensions?: {
      width: number;
      height: number;
    };
  };
  verification: {
    isVerified: boolean;
    verifiedAt?: string;
    verificationMethod?: string;
    blockchainTxId?: string;
    ipfsHash?: string;
  };
  access: {
    isPublic: boolean;
    sharedWith: string[];
    permissions: {
      view: boolean;
      download: boolean;
      share: boolean;
    };
  };
  tags: string[];
  category: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface DocumentUploadResponse {
  message: string;
  document: Document;
}

export interface DocumentListResponse {
  documents: Document[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

class DocumentService {
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
  }

  async uploadDocument(file: File, metadata?: {
    title?: string;
    category?: string;
    tags?: string;
  }): Promise<DocumentUploadResponse> {
    try {
      const formData = new FormData();
      formData.append('document', file);
      if (metadata) {
        Object.keys(metadata).forEach(key => {
          if (metadata[key as keyof typeof metadata]) {
            formData.append(key, metadata[key as keyof typeof metadata] as string);
          }
        });
      }

      const response = await axios.post(`${API_BASE_URL}/api/v1/documents/upload`, formData, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Upload document error:', error);
      throw new Error('Failed to upload document');
    }
  }

  async getDocument(documentId: string): Promise<Document> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/documents/${documentId}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Get document error:', error);
      throw new Error('Failed to get document');
    }
  }

  async getUserDocuments(params?: {
    category?: string;
    status?: string;
    limit?: number;
    offset?: number;
  }): Promise<DocumentListResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/documents`, {
        headers: this.getAuthHeaders(),
        params
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Get documents error:', error);
      throw new Error('Failed to get documents');
    }
  }

  async downloadDocument(documentId: string): Promise<Blob> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/documents/${documentId}/download`, {
        headers: this.getAuthHeaders(),
        responseType: 'blob'
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Download document error:', error);
      throw new Error('Failed to download document');
    }
  }

  async shareDocument(documentId: string, shareData: {
    sharedWith: string[];
    permissions: {
      view?: boolean;
      download?: boolean;
      share?: boolean;
    };
  }): Promise<{ message: string; access: any }> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/documents/${documentId}/share`, shareData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Share document error:', error);
      throw new Error('Failed to share document');
    }
  }

  async deleteDocument(documentId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/documents/${documentId}`, {
        headers: this.getAuthHeaders()
      });
    } catch (error: unknown) {
      console.error('Delete document error:', error);
      throw new Error('Failed to delete document');
    }
  }

  async getDocumentMetadata(documentId: string): Promise<Document> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/documents/${documentId}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Get document metadata error:', error);
      throw new Error('Failed to get document metadata');
    }
  }

  async searchDocuments(query: string, params?: {
    category?: string;
    tags?: string[];
    limit?: number;
    offset?: number;
  }): Promise<DocumentListResponse> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/documents/search`, {
        headers: this.getAuthHeaders(),
        params: { q: query, ...params }
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Search documents error:', error);
      throw new Error('Failed to search documents');
    }
  }
}

export const documentService = new DocumentService();
