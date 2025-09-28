import { Injectable, Logger, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2Client } from 'google-auth-library';

@Injectable()
export class GoogleOAuthService {
  private readonly logger = new Logger(GoogleOAuthService.name);
  private readonly client: OAuth2Client;

  constructor(private configService: ConfigService) {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    if (clientId) {
      this.client = new OAuth2Client(clientId);
    } else {
      this.logger.warn('Google OAuth client ID not configured. Google authentication will not work.');
    }
  }

  /**
   * Verify Google OAuth token and get user information
   */
  async verifyGoogleToken(token: string): Promise<GoogleUserInfo> {
    try {
      if (!this.client) {
        throw new UnauthorizedException('Google OAuth not configured');
      }

      const ticket = await this.client.verifyIdToken({
        idToken: token,
        audience: this.configService.get<string>('GOOGLE_CLIENT_ID'),
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new UnauthorizedException('Invalid Google token');
      }

      return {
        googleId: payload.sub,
        email: payload.email,
        firstName: payload.given_name,
        lastName: payload.family_name,
        avatar: payload.picture,
        emailVerified: payload.email_verified,
      };
    } catch (error) {
      this.logger.error('Google token verification failed:', error);
      throw new UnauthorizedException('Invalid Google token');
    }
  }

  /**
   * Get Google OAuth URL for authentication
   */
  getGoogleAuthUrl(): string {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');
    
    if (!clientId || !redirectUri) {
      throw new Error('Google OAuth not properly configured');
    }

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: 'openid email profile',
      access_type: 'offline',
      prompt: 'consent',
    });

    return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
  }

  /**
   * Exchange authorization code for tokens
   */
  async exchangeCodeForTokens(code: string): Promise<GoogleTokens> {
    try {
      if (!this.client) {
        throw new UnauthorizedException('Google OAuth not configured');
      }

      const { tokens } = await this.client.getToken({
        code,
        redirect_uri: this.configService.get<string>('GOOGLE_REDIRECT_URI'),
      });

      return {
        accessToken: tokens.access_token,
        refreshToken: tokens.refresh_token,
        idToken: tokens.id_token,
        expiresIn: tokens.expiry_date,
      };
    } catch (error) {
      this.logger.error('Failed to exchange code for tokens:', error);
      throw new UnauthorizedException('Failed to exchange authorization code');
    }
  }

  /**
   * Get user info from access token
   */
  async getUserInfoFromAccessToken(accessToken: string): Promise<GoogleUserInfo> {
    try {
      const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (!response.ok) {
        throw new UnauthorizedException('Failed to get user info from Google');
      }

      const userInfo = await response.json();
      
      return {
        googleId: userInfo.id,
        email: userInfo.email,
        firstName: userInfo.given_name,
        lastName: userInfo.family_name,
        avatar: userInfo.picture,
        emailVerified: userInfo.verified_email,
      };
    } catch (error) {
      this.logger.error('Failed to get user info from access token:', error);
      throw new UnauthorizedException('Failed to get user information');
    }
  }

  /**
   * Validate Google OAuth configuration
   */
  validateConfiguration(): boolean {
    const clientId = this.configService.get<string>('GOOGLE_CLIENT_ID');
    const clientSecret = this.configService.get<string>('GOOGLE_CLIENT_SECRET');
    const redirectUri = this.configService.get<string>('GOOGLE_REDIRECT_URI');
    
    return !!(clientId && clientSecret && redirectUri);
  }
}

export interface GoogleUserInfo {
  googleId: string;
  email: string;
  firstName: string;
  lastName: string;
  avatar?: string;
  emailVerified: boolean;
}

export interface GoogleTokens {
  accessToken: string;
  refreshToken?: string;
  idToken?: string;
  expiresIn?: number;
}
