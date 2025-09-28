import { Request, Response } from 'express';
import { User } from '../schemas/user.schema';
import { firebaseAuthService } from './firebase-auth.service';
import { jwtService } from './jwt.service';

export class AuthController {
  async phoneOTPSignIn(req: Request, res: Response) {
    try {
      const { idToken, role } = req.body;
      const firebaseUser = await firebaseAuthService.verifyFirebaseToken(idToken);
      const authResult = await firebaseAuthService.authenticateUser(firebaseUser, { role });

      res.cookie('refreshToken', authResult.refreshToken, jwtService.getCookieOptions(true));
      res.cookie('accessToken', authResult.accessToken, jwtService.getCookieOptions(false));

      res.json({
        success: true,
        message: 'Phone OTP sign-in successful',
        user: authResult.user,
        accessToken: authResult.accessToken
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Phone OTP sign-in failed'
      });
    }
  }

  async googleSignIn(req: Request, res: Response) {
    try {
      const { idToken, role } = req.body;
      const firebaseUser = await firebaseAuthService.verifyFirebaseToken(idToken);
      const authResult = await firebaseAuthService.authenticateUser(firebaseUser, { role });

      res.cookie('refreshToken', authResult.refreshToken, jwtService.getCookieOptions(true));
      res.cookie('accessToken', authResult.accessToken, jwtService.getCookieOptions(false));

      res.json({
        success: true,
        message: 'Google sign-in successful',
        user: authResult.user,
        accessToken: authResult.accessToken
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Google sign-in failed'
      });
    }
  }

  async emailSignUp(req: Request, res: Response) {
    try {
      const { email, password, firstName, lastName, role } = req.body;

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      const user = new User({
        email,
        password,
        firstName,
        lastName,
        role: role || 'patient',
        status: 'pending_verification',
        emailVerified: false
      });

      await user.save();

      const verificationLink = await firebaseAuthService.generateEmailVerificationLink(email);
      console.log('Email verification link:', verificationLink);

      res.status(201).json({
        success: true,
        message: 'User created successfully. Please check your email for verification.',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          emailVerified: user.emailVerified
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Sign-up failed'
      });
    }
  }

  async emailSignIn(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      
      if (!user || !(await user.comparePassword(password))) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      const tokens = jwtService.generateTokenPair({
        userId: user._id,
        email: user.email,
        role: user.role
      });

      res.cookie('refreshToken', tokens.refreshToken, jwtService.getCookieOptions(true));
      res.cookie('accessToken', tokens.accessToken, jwtService.getCookieOptions(false));

      res.json({
        success: true,
        message: 'Sign-in successful',
        user: {
          id: user._id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
          emailVerified: user.emailVerified
        },
        accessToken: tokens.accessToken
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Sign-in failed'
      });
    }
  }

  async refreshToken(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken || req.body.refreshToken;
      const decoded = jwtService.verifyRefreshToken(refreshToken);
      const user = await User.findById(decoded.userId);
      
      if (!user || !user.refreshTokens?.includes(refreshToken)) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      const newAccessToken = jwtService.generateAccessToken({
        userId: user._id,
        email: user.email,
        role: user.role
      });

      res.cookie('accessToken', newAccessToken, jwtService.getCookieOptions(false));

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        accessToken: newAccessToken
      });
    } catch (error) {
      res.status(401).json({
        success: false,
        message: 'Token refresh failed'
      });
    }
  }

  async logout(req: Request, res: Response) {
    try {
      const refreshToken = req.cookies.refreshToken;
      
      if (refreshToken) {
        const decoded = jwtService.verifyRefreshToken(refreshToken);
        const user = await User.findById(decoded.userId);
        
        if (user && user.refreshTokens) {
          user.refreshTokens = user.refreshTokens.filter(token => token !== refreshToken);
          await user.save();
        }
      }

      res.clearCookie('accessToken');
      res.clearCookie('refreshToken');

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  }

  async getCurrentUser(req: Request, res: Response) {
    try {
      const user = req.user;
      
      res.json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          avatar: user.avatar,
          emailVerified: user.emailVerified,
          phoneVerified: user.phoneVerified
        }
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: 'Failed to get user information'
      });
    }
  }
}

export const authController = new AuthController();
