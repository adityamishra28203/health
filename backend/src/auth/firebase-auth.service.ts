import { adminAuth, adminDb } from '../config/firebase-admin';
import { User } from '../schemas/user.schema';
import { jwtService } from './jwt.service';

export interface FirebaseUserData {
  uid: string;
  email?: string;
  phoneNumber?: string;
  displayName?: string;
  photoURL?: string;
  emailVerified: boolean;
  phoneNumberVerified: boolean;
}

export interface AuthResult {
  user: any;
  accessToken: string;
  refreshToken: string;
}

export class FirebaseAuthService {
  /**
   * Verify Firebase ID token and get user data
   */
  async verifyFirebaseToken(idToken: string): Promise<FirebaseUserData> {
    try {
      const decodedToken = await adminAuth.verifyIdToken(idToken);
      
      return {
        uid: decodedToken.uid,
        email: decodedToken.email,
        phoneNumber: decodedToken.phone_number,
        displayName: decodedToken.name,
        photoURL: decodedToken.picture,
        emailVerified: decodedToken.email_verified || false,
        phoneNumberVerified: !!decodedToken.phone_number,
      };
    } catch (error) {
      throw new Error('Invalid Firebase token');
    }
  }

  /**
   * Create or update user in database from Firebase data
   */
  async createOrUpdateUser(firebaseUser: FirebaseUserData, additionalData?: any): Promise<any> {
    try {
      // Check if user already exists
      let user = await User.findOne({ firebaseUid: firebaseUser.uid });
      
      if (user) {
        // Update existing user
        user.email = firebaseUser.email || user.email;
        user.phone = firebaseUser.phoneNumber || user.phone;
        user.avatar = firebaseUser.photoURL || user.avatar;
        user.emailVerified = firebaseUser.emailVerified;
        user.phoneVerified = firebaseUser.phoneNumberVerified;
        user.lastLogin = new Date();
        
        if (firebaseUser.displayName) {
          const nameParts = firebaseUser.displayName.split(' ');
          user.firstName = nameParts[0] || user.firstName;
          user.lastName = nameParts.slice(1).join(' ') || user.lastName;
        }
        
        await user.save();
        return user;
      } else {
        // Create new user
        const nameParts = firebaseUser.displayName?.split(' ') || ['User', ''];
        
        const newUser = new User({
          firebaseUid: firebaseUser.uid,
          email: firebaseUser.email || '',
          firstName: nameParts[0] || 'User',
          lastName: nameParts.slice(1).join(' ') || '',
          phone: firebaseUser.phoneNumber,
          avatar: firebaseUser.photoURL,
          emailVerified: firebaseUser.emailVerified,
          phoneVerified: firebaseUser.phoneNumberVerified,
          role: additionalData?.role || 'patient',
          status: 'active',
          lastLogin: new Date(),
          ...additionalData
        });
        
        await newUser.save();
        return newUser;
      }
    } catch (error) {
      throw new Error('Failed to create or update user');
    }
  }

  /**
   * Generate email verification link
   */
  async generateEmailVerificationLink(email: string): Promise<string> {
    try {
      const actionCodeSettings = {
        url: `${process.env.FRONTEND_URL}/auth/verify-email`,
        handleCodeInApp: true,
      };
      
      return await adminAuth.generateEmailVerificationLink(email, actionCodeSettings);
    } catch (error) {
      throw new Error('Failed to generate email verification link');
    }
  }

  /**
   * Generate password reset link
   */
  async generatePasswordResetLink(email: string): Promise<string> {
    try {
      const actionCodeSettings = {
        url: `${process.env.FRONTEND_URL}/auth/reset-password`,
        handleCodeInApp: true,
      };
      
      return await adminAuth.generatePasswordResetLink(email, actionCodeSettings);
    } catch (error) {
      throw new Error('Failed to generate password reset link');
    }
  }

  /**
   * Verify email verification code
   */
  async verifyEmailVerificationCode(code: string): Promise<FirebaseUserData> {
    try {
      const decodedToken = await adminAuth.verifyIdToken(code);
      
      return {
        uid: decodedToken.uid,
        email: decodedToken.email,
        displayName: decodedToken.name,
        photoURL: decodedToken.picture,
        emailVerified: decodedToken.email_verified || false,
        phoneNumberVerified: false,
      };
    } catch (error) {
      throw new Error('Invalid email verification code');
    }
  }

  /**
   * Create custom token for user
   */
  async createCustomToken(uid: string, additionalClaims?: any): Promise<string> {
    try {
      return await adminAuth.createCustomToken(uid, additionalClaims);
    } catch (error) {
      throw new Error('Failed to create custom token');
    }
  }

  /**
   * Revoke all refresh tokens for a user
   */
  async revokeRefreshTokens(uid: string): Promise<void> {
    try {
      await adminAuth.revokeRefreshTokens(uid);
    } catch (error) {
      throw new Error('Failed to revoke refresh tokens');
    }
  }

  /**
   * Delete user from Firebase
   */
  async deleteFirebaseUser(uid: string): Promise<void> {
    try {
      await adminAuth.deleteUser(uid);
    } catch (error) {
      throw new Error('Failed to delete Firebase user');
    }
  }

  /**
   * Get user by Firebase UID
   */
  async getUserByFirebaseUid(uid: string): Promise<any> {
    try {
      return await User.findOne({ firebaseUid: uid });
    } catch (error) {
      throw new Error('Failed to get user by Firebase UID');
    }
  }

  /**
   * Update user claims
   */
  async setCustomUserClaims(uid: string, claims: any): Promise<void> {
    try {
      await adminAuth.setCustomUserClaims(uid, claims);
    } catch (error) {
      throw new Error('Failed to set custom user claims');
    }
  }

  /**
   * Complete authentication flow
   */
  async authenticateUser(firebaseUser: FirebaseUserData, additionalData?: any): Promise<AuthResult> {
    try {
      // Create or update user in database
      const user = await this.createOrUpdateUser(firebaseUser, additionalData);
      
      // Generate JWT tokens
      const tokens = jwtService.generateTokenPair({
        userId: user._id,
        email: user.email,
        role: user.role
      });
      
      // Store refresh token in user document
      if (!user.refreshTokens) {
        user.refreshTokens = [];
      }
      user.refreshTokens.push(tokens.refreshToken);
      
      // Keep only last 5 refresh tokens
      if (user.refreshTokens.length > 5) {
        user.refreshTokens = user.refreshTokens.slice(-5);
      }
      
      await user.save();
      
      return {
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified,
        },
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken
      };
    } catch (error) {
      throw new Error('Authentication failed');
    }
  }
}

export const firebaseAuthService = new FirebaseAuthService();
