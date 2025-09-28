import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as admin from 'firebase-admin';

@Injectable()
export class FirebaseAdminService {
  private readonly logger = new Logger(FirebaseAdminService.name);
  private db: admin.firestore.Firestore;

  constructor(private configService: ConfigService) {
    this.initializeFirebase();
  }

  private initializeFirebase() {
    try {
      // Initialize Firebase Admin SDK
      if (!admin.apps.length) {
        const serviceAccount = {
          type: 'service_account',
          project_id: this.configService.get<string>('FIREBASE_PROJECT_ID'),
          private_key_id: this.configService.get<string>('FIREBASE_PRIVATE_KEY_ID'),
          private_key: this.configService.get<string>('FIREBASE_PRIVATE_KEY')?.replace(/\\n/g, '\n'),
          client_email: this.configService.get<string>('FIREBASE_CLIENT_EMAIL'),
          client_id: this.configService.get<string>('FIREBASE_CLIENT_ID'),
          auth_uri: 'https://accounts.google.com/o/oauth2/auth',
          token_uri: 'https://oauth2.googleapis.com/token',
          auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
          client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${this.configService.get<string>('FIREBASE_CLIENT_EMAIL')}`,
        };

        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
          projectId: this.configService.get<string>('FIREBASE_PROJECT_ID'),
        });
      }

      this.db = admin.firestore();
      this.logger.log('Firebase Admin SDK initialized successfully');
    } catch (error) {
      this.logger.error('Failed to initialize Firebase Admin SDK:', error);
    }
  }

  getFirestore(): admin.firestore.Firestore {
    return this.db;
  }

  // User Management
  async createUser(userData: any): Promise<string> {
    try {
      const docRef = await this.db.collection('users').add({
        ...userData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      this.logger.error('Error creating user:', error);
      throw error;
    }
  }

  async getUserById(userId: string): Promise<any> {
    try {
      const doc = await this.db.collection('users').doc(userId).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
      this.logger.error('Error getting user:', error);
      throw error;
    }
  }

  async getUserByEmail(email: string): Promise<any> {
    try {
      const snapshot = await this.db.collection('users').where('email', '==', email).limit(1).get();
      if (snapshot.empty) return null;
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() };
    } catch (error) {
      this.logger.error('Error getting user by email:', error);
      throw error;
    }
  }

  async updateUser(userId: string, userData: any): Promise<void> {
    try {
      await this.db.collection('users').doc(userId).update({
        ...userData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      this.logger.error('Error updating user:', error);
      throw error;
    }
  }

  async deleteUser(userId: string): Promise<void> {
    try {
      await this.db.collection('users').doc(userId).delete();
    } catch (error) {
      this.logger.error('Error deleting user:', error);
      throw error;
    }
  }

  // Health Records Management
  async createHealthRecord(recordData: any): Promise<string> {
    try {
      const docRef = await this.db.collection('healthRecords').add({
        ...recordData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      this.logger.error('Error creating health record:', error);
      throw error;
    }
  }

  async getHealthRecords(patientId: string, limitCount: number = 10): Promise<any[]> {
    try {
      const snapshot = await this.db
        .collection('healthRecords')
        .where('patientId', '==', patientId)
        .orderBy('date', 'desc')
        .limit(limitCount)
        .get();

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      this.logger.error('Error getting health records:', error);
      throw error;
    }
  }

  async updateHealthRecord(recordId: string, recordData: any): Promise<void> {
    try {
      await this.db.collection('healthRecords').doc(recordId).update({
        ...recordData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      this.logger.error('Error updating health record:', error);
      throw error;
    }
  }

  async deleteHealthRecord(recordId: string): Promise<void> {
    try {
      await this.db.collection('healthRecords').doc(recordId).delete();
    } catch (error) {
      this.logger.error('Error deleting health record:', error);
      throw error;
    }
  }

  // Insurance Claims Management
  async createInsuranceClaim(claimData: any): Promise<string> {
    try {
      const docRef = await this.db.collection('insuranceClaims').add({
        ...claimData,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      this.logger.error('Error creating insurance claim:', error);
      throw error;
    }
  }

  async getInsuranceClaims(patientId: string, limitCount: number = 10): Promise<any[]> {
    try {
      const snapshot = await this.db
        .collection('insuranceClaims')
        .where('patientId', '==', patientId)
        .orderBy('submittedDate', 'desc')
        .limit(limitCount)
        .get();

      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      this.logger.error('Error getting insurance claims:', error);
      throw error;
    }
  }

  async updateInsuranceClaim(claimId: string, claimData: any): Promise<void> {
    try {
      await this.db.collection('insuranceClaims').doc(claimId).update({
        ...claimData,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      this.logger.error('Error updating insurance claim:', error);
      throw error;
    }
  }

  // Analytics
  async getAnalytics(patientId: string): Promise<any> {
    try {
      const [healthRecordsSnapshot, claimsSnapshot] = await Promise.all([
        this.db.collection('healthRecords').where('patientId', '==', patientId).get(),
        this.db.collection('insuranceClaims').where('patientId', '==', patientId).get()
      ]);

      const records = healthRecordsSnapshot.docs.map(doc => doc.data());
      const claims = claimsSnapshot.docs.map(doc => doc.data());

      const totalRecords = records.length;
      const verifiedRecords = records.filter(r => r.status === 'VERIFIED').length;
      const pendingRecords = records.filter(r => r.status === 'PENDING').length;

      const totalClaims = claims.length;
      const approvedClaims = claims.filter(c => c.status === 'APPROVED').length;
      const pendingClaims = claims.filter(c => c.status === 'PENDING').length;
      const rejectedClaims = claims.filter(c => c.status === 'REJECTED').length;

      const totalClaimAmount = claims.reduce((sum, claim) => sum + (claim.amount || 0), 0);
      const approvedAmount = claims
        .filter(c => c.status === 'APPROVED')
        .reduce((sum, claim) => sum + (claim.approvedAmount || 0), 0);

      return {
        healthScore: Math.round((verifiedRecords / totalRecords) * 100) || 0,
        totalRecords,
        verifiedRecords,
        pendingRecords,
        totalClaims,
        approvedClaims,
        pendingClaims,
        rejectedClaims,
        totalClaimAmount,
        approvedAmount,
        trends: []
      };
    } catch (error) {
      this.logger.error('Error getting analytics:', error);
      throw error;
    }
  }

  // Generic collection operations
  async createDocument(collection: string, data: any): Promise<string> {
    try {
      const docRef = await this.db.collection(collection).add({
        ...data,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      this.logger.error(`Error creating document in ${collection}:`, error);
      throw error;
    }
  }

  async getDocument(collection: string, docId: string): Promise<any> {
    try {
      const doc = await this.db.collection(collection).doc(docId).get();
      return doc.exists ? { id: doc.id, ...doc.data() } : null;
    } catch (error) {
      this.logger.error(`Error getting document from ${collection}:`, error);
      throw error;
    }
  }

  async updateDocument(collection: string, docId: string, data: any): Promise<void> {
    try {
      await this.db.collection(collection).doc(docId).update({
        ...data,
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    } catch (error) {
      this.logger.error(`Error updating document in ${collection}:`, error);
      throw error;
    }
  }

  async deleteDocument(collection: string, docId: string): Promise<void> {
    try {
      await this.db.collection(collection).doc(docId).delete();
    } catch (error) {
      this.logger.error(`Error deleting document from ${collection}:`, error);
      throw error;
    }
  }

  async queryDocuments(collection: string, field: string, operator: any, value: any, limitCount?: number): Promise<any[]> {
    try {
      let query = this.db.collection(collection).where(field, operator, value);
      
      if (limitCount) {
        query = query.limit(limitCount);
      }

      const snapshot = await query.get();
      return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (error) {
      this.logger.error(`Error querying documents from ${collection}:`, error);
      throw error;
    }
  }
}
