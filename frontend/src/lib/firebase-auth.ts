import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPhoneNumber,
  RecaptchaVerifier,
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  User,
  sendEmailVerification,
  sendPasswordResetEmail,
  updatePassword,
  reauthenticateWithCredential,
  EmailAuthProvider,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from './firebase';
import { authFallbackService } from './auth-fallback';

interface ConfirmationResult {
  confirm: (otp: string) => Promise<{ user: unknown }>;
}

export interface UserProfile {
  uid: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: 'patient' | 'doctor' | 'hospital_admin' | 'insurer' | 'system_admin';
  status: 'active' | 'inactive' | 'suspended' | 'pending_verification';
  emailVerified: boolean;
  phoneVerified: boolean;
  avatar?: string;
  bio?: string;
  emergencyContact?: string;
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  medicalConditions?: string[];
  organization?: string;
  licenseNumber?: string;
  specialization?: string;
  aadhaarNumber?: string;
  aadhaarVerified: boolean;
  createdAt: unknown;
  updatedAt: unknown;
}

class FirebaseAuthService {
  private recaptchaVerifier: RecaptchaVerifier | null = null;

  // Initialize reCAPTCHA for phone authentication
  initRecaptcha(containerId: string) {
    if (typeof window !== 'undefined') {
      this.recaptchaVerifier = new RecaptchaVerifier(auth, containerId, {
        size: 'invisible',
        callback: () => {
          console.log('reCAPTCHA solved');
        },
        'expired-callback': () => {
          console.log('reCAPTCHA expired');
        }
      });
    }
  }

  // Email/Password Authentication
  async signUpWithEmail(email: string, password: string, userData: Partial<UserProfile>) {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Create user profile in Firestore
      const userProfile: UserProfile = {
        uid: user.uid,
        email: user.email!,
        firstName: userData.firstName || '',
        lastName: userData.lastName || '',
        phone: userData.phone,
        role: userData.role || 'patient',
        status: 'pending_verification',
        emailVerified: false,
        phoneVerified: false,
        aadhaarVerified: false,
        ...userData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      await setDoc(doc(db, 'users', user.uid), userProfile);

      // Send email verification
      await sendEmailVerification(user);

      return { user, userProfile };
    } catch (error) {
      throw error;
    }
  }

  async signInWithEmail(email: string, password: string) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userProfile = await this.getUserProfile(userCredential.user.uid);
      return { user: userCredential.user, userProfile };
    } catch (error) {
      throw error;
    }
  }

  // Phone Authentication
  async sendPhoneOTP(phoneNumber: string) {
    try {
      if (!this.recaptchaVerifier) {
        this.initRecaptcha('recaptcha-container');
      }

      const confirmationResult = await signInWithPhoneNumber(
        auth,
        phoneNumber,
        this.recaptchaVerifier!
      );

      return confirmationResult;
    } catch (error) {
      throw error;
    }
  }

  async verifyPhoneOTP(confirmationResult: ConfirmationResult, otp: string) {
    try {
      const result = await confirmationResult.confirm(otp);
      const userProfile = await this.getUserProfile((result.user as User).uid);
      return { user: result.user as User, userProfile };
    } catch (error) {
      throw error;
    }
  }

  // Google Authentication
  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('email');
      provider.addScope('profile');

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      // Check if user exists in Firestore
      let userProfile = await this.getUserProfile(user.uid);

      if (!userProfile) {
        // Create new user profile
        userProfile = {
          uid: user.uid,
          email: user.email!,
          firstName: user.displayName?.split(' ')[0] || '',
          lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
          role: 'patient',
          status: 'active',
          emailVerified: user.emailVerified,
          phoneVerified: false,
          aadhaarVerified: false,
          avatar: user.photoURL || '',
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        };

        try {
          await setDoc(doc(db, 'users', user.uid), userProfile);
        } catch (firestoreError) {
          console.warn('Failed to save user profile to Firestore (offline?):', firestoreError);
          // Use fallback authentication when offline
          const fallbackUser = await authFallbackService.handleOfflineAuth({
            email: user.email!,
            firstName: user.displayName?.split(' ')[0] || '',
            lastName: user.displayName?.split(' ').slice(1).join(' ') || '',
            role: 'patient',
            avatar: user.photoURL || undefined,
          });
          userProfile = fallbackUser as unknown as UserProfile;
        }
      }

      return { user, userProfile };
    } catch (error) {
      throw error;
    }
  }

  // Get user profile from Firestore
  async getUserProfile(uid: string): Promise<UserProfile | null> {
    try {
      const userDoc = await getDoc(doc(db, 'users', uid));
      return userDoc.exists() ? (userDoc.data() as UserProfile) : null;
    } catch (error) {
      console.error('Error getting user profile:', error);
      return null;
    }
  }

  // Update user profile
  async updateUserProfile(uid: string, updates: Partial<UserProfile>) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...updates,
        updatedAt: serverTimestamp(),
      });
    } catch (error) {
      throw error;
    }
  }

  // Password reset
  async resetPassword(email: string) {
    try {
      await sendPasswordResetEmail(auth, email);
    } catch (error) {
      throw error;
    }
  }

  // Update password
  async updateUserPassword(currentPassword: string, newPassword: string) {
    try {
      const user = auth.currentUser;
      if (!user) throw new Error('No user logged in');

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email!, currentPassword);
      await reauthenticateWithCredential(user, credential);

      // Update password
      await updatePassword(user, newPassword);
    } catch (error) {
      throw error;
    }
  }

  // Sign out
  async signOut() {
    try {
      await signOut(auth);
    } catch (error) {
      throw error;
    }
  }

  // Auth state listener
  onAuthStateChanged(callback: (user: User | null) => void) {
    return onAuthStateChanged(auth, callback);
  }

  // Get current user
  getCurrentUser() {
    return auth.currentUser;
  }

  // Verify email
  async sendEmailVerification() {
    try {
      const user = auth.currentUser;
      if (user) {
        await sendEmailVerification(user);
      }
    } catch (error) {
      throw error;
    }
  }
}

export const firebaseAuthService = new FirebaseAuthService();
export default firebaseAuthService;
