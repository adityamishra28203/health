import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';

export interface HealthRecord {
  id: string;
  patientId: string;
  title: string;
  type: 'LAB_REPORT' | 'RADIOLOGY' | 'PRESCRIPTION' | 'VACCINATION' | 'SURGERY' | 'OTHER';
  date: Timestamp;
  doctor: string;
  hospital: string;
  diagnosis?: string;
  treatment?: string;
  medications?: string[];
  attachments?: string[];
  status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  verifiedBy?: string;
  verifiedAt?: Timestamp;
  blockchainHash?: string;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface InsuranceClaim {
  id: string;
  patientId: string;
  claimNumber: string;
  policyNumber: string;
  type: 'MEDICAL' | 'SURGERY' | 'EMERGENCY' | 'PREVENTIVE';
  amount: number;
  status: 'PENDING' | 'APPROVED' | 'REJECTED' | 'UNDER_REVIEW';
  submittedDate: Timestamp;
  approvedDate?: Timestamp;
  approvedAmount?: number;
  rejectionReason?: string;
  documents?: string[];
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  phone: string;
  email: string;
  specialties: string[];
  facilities: string[];
  rating: number;
  isVerified: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

export interface InsuranceProvider {
  id: string;
  name: string;
  description: string;
  coverage: string[];
  premium: number;
  maxCoverage: number;
  waitingPeriod: number;
  isActive: boolean;
  createdAt: Timestamp;
  updatedAt: Timestamp;
}

class FirebaseDatabaseService {
  // Health Records
  async createHealthRecord(recordData: Omit<HealthRecord, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'healthRecords'), {
        ...recordData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      throw error;
    }
  }

  async getHealthRecords(patientId: string, limitCount: number = 10) {
    try {
      const q = query(
        collection(db, 'healthRecords'),
        where('patientId', '==', patientId),
        orderBy('date', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HealthRecord[];
    } catch (error) {
      throw error;
    }
  }

  async updateHealthRecord(recordId: string, updates: Partial<HealthRecord>) {
    try {
      await updateDoc(doc(db, 'healthRecords', recordId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw error;
    }
  }

  async deleteHealthRecord(recordId: string) {
    try {
      await deleteDoc(doc(db, 'healthRecords', recordId));
    } catch (error) {
      throw error;
    }
  }

  // Insurance Claims
  async createInsuranceClaim(claimData: Omit<InsuranceClaim, 'id' | 'createdAt' | 'updatedAt'>) {
    try {
      const docRef = await addDoc(collection(db, 'insuranceClaims'), {
        ...claimData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      return docRef.id;
    } catch (error) {
      throw error;
    }
  }

  async getInsuranceClaims(patientId: string, limitCount: number = 10) {
    try {
      const q = query(
        collection(db, 'insuranceClaims'),
        where('patientId', '==', patientId),
        orderBy('submittedDate', 'desc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InsuranceClaim[];
    } catch (error) {
      throw error;
    }
  }

  async updateInsuranceClaim(claimId: string, updates: Partial<InsuranceClaim>) {
    try {
      await updateDoc(doc(db, 'insuranceClaims', claimId), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw error;
    }
  }

  // Hospitals
  async getHospitals(city?: string, specialty?: string, limitCount: number = 20) {
    try {
      let q = query(collection(db, 'hospitals'), where('isVerified', '==', true));
      
      if (city) {
        q = query(q, where('city', '==', city));
      }
      
      if (specialty) {
        q = query(q, where('specialties', 'array-contains', specialty));
      }
      
      q = query(q, orderBy('rating', 'desc'), limit(limitCount));
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as Hospital[];
    } catch (error) {
      throw error;
    }
  }

  async getHospitalById(hospitalId: string) {
    try {
      const docSnap = await getDoc(doc(db, 'hospitals', hospitalId));
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() } as Hospital;
      }
      return null;
    } catch (error) {
      throw error;
    }
  }

  // Insurance Providers
  async getInsuranceProviders(limitCount: number = 20) {
    try {
      const q = query(
        collection(db, 'insuranceProviders'),
        where('isActive', '==', true),
        orderBy('premium', 'asc'),
        limit(limitCount)
      );
      
      const querySnapshot = await getDocs(q);
      return querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InsuranceProvider[];
    } catch (error) {
      throw error;
    }
  }

  // Real-time listeners
  subscribeToHealthRecords(patientId: string, callback: (records: HealthRecord[]) => void) {
    const q = query(
      collection(db, 'healthRecords'),
      where('patientId', '==', patientId),
      orderBy('date', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const records = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as HealthRecord[];
      callback(records);
    });
  }

  subscribeToInsuranceClaims(patientId: string, callback: (claims: InsuranceClaim[]) => void) {
    const q = query(
      collection(db, 'insuranceClaims'),
      where('patientId', '==', patientId),
      orderBy('submittedDate', 'desc')
    );

    return onSnapshot(q, (querySnapshot) => {
      const claims = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as InsuranceClaim[];
      callback(claims);
    });
  }

  // Analytics
  async getAnalytics(patientId: string) {
    try {
      const [healthRecordsSnapshot, claimsSnapshot] = await Promise.all([
        getDocs(query(collection(db, 'healthRecords'), where('patientId', '==', patientId))),
        getDocs(query(collection(db, 'insuranceClaims'), where('patientId', '==', patientId)))
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
        trends: [] // You can implement trend calculation here
      };
    } catch (error) {
      throw error;
    }
  }
}

export const firebaseDbService = new FirebaseDatabaseService();
export default firebaseDbService;
