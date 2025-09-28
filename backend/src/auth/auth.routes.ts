import { Router } from 'express';
import { body } from 'express-validator';
import { authController } from './auth.controller';
import { authRateLimit, otpRateLimit } from '../middleware/security.middleware';

const router = Router();

// Phone OTP Sign-in
router.post('/phone-otp', 
  otpRateLimit,
  [
    body('idToken').notEmpty().withMessage('Firebase ID token is required'),
    body('role').optional().isIn(['patient', 'doctor', 'hospital_admin', 'insurer', 'system_admin'])
  ],
  authController.phoneOTPSignIn
);

// Google Sign-in
router.post('/google', 
  authRateLimit,
  [
    body('idToken').notEmpty().withMessage('Firebase ID token is required'),
    body('role').optional().isIn(['patient', 'doctor', 'hospital_admin', 'insurer', 'system_admin'])
  ],
  authController.googleSignIn
);

// Email/Password Sign-up
router.post('/signup', 
  authRateLimit,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }).matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/),
    body('firstName').isLength({ min: 2, max: 50 }),
    body('lastName').isLength({ min: 2, max: 50 }),
    body('role').optional().isIn(['patient', 'doctor', 'hospital_admin', 'insurer', 'system_admin'])
  ],
  authController.emailSignUp
);

// Email/Password Sign-in
router.post('/signin', 
  authRateLimit,
  [
    body('email').isEmail().normalizeEmail(),
    body('password').notEmpty()
  ],
  authController.emailSignIn
);

// Refresh Token
router.post('/refresh', authController.refreshToken);

// Logout
router.post('/logout', authController.logout);

// Get Current User
router.get('/me', authController.getCurrentUser);

export default router;
