import { Injectable, Logger, UnauthorizedException, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';

export interface KeycloakUser {
  id: string;
  username: string;
  email: string;
  firstName?: string;
  lastName?: string;
  enabled: boolean;
  emailVerified: boolean;
  attributes?: Record<string, string[]>;
}

export interface KeycloakTokenResponse {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  refresh_expires_in: number;
  token_type: string;
  scope: string;
}

export interface KeycloakUserInfo {
  sub: string;
  email: string;
  preferred_username: string;
  given_name?: string;
  family_name?: string;
  email_verified: boolean;
  realm_access?: {
    roles: string[];
  };
  resource_access?: Record<string, {
    roles: string[];
  }>;
}

@Injectable()
export class KeycloakService {
  private readonly logger = new Logger(KeycloakService.name);
  private readonly keycloakUrl: string;
  private readonly realm: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly adminClientId: string;
  private readonly adminClientSecret: string;
  private readonly httpClient: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.keycloakUrl = this.configService.get('KEYCLOAK_URL', 'http://localhost:8080');
    this.realm = this.configService.get('KEYCLOAK_REALM', 'securehealth');
    this.clientId = this.configService.get('KEYCLOAK_CLIENT_ID', 'securehealth-client');
    this.clientSecret = this.configService.get('KEYCLOAK_CLIENT_SECRET', '');
    this.adminClientId = this.configService.get('KEYCLOAK_ADMIN_CLIENT_ID', 'admin-cli');
    this.adminClientSecret = this.configService.get('KEYCLOAK_ADMIN_CLIENT_SECRET', '');

    this.httpClient = axios.create({
      baseURL: `${this.keycloakUrl}/realms/${this.realm}`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
    });
  }

  /**
   * Authenticate user with username/password
   */
  async authenticateUser(username: string, password: string): Promise<KeycloakTokenResponse> {
    try {
      const response = await this.httpClient.post('/protocol/openid-connect/token', {
        grant_type: 'password',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        username,
        password,
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Keycloak authentication failed: ${error.message}`);
      if (error.response?.status === 401) {
        throw new UnauthorizedException('Invalid credentials');
      }
      throw new BadRequestException('Authentication failed');
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<KeycloakTokenResponse> {
    try {
      const response = await this.httpClient.post('/protocol/openid-connect/token', {
        grant_type: 'refresh_token',
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Token refresh failed: ${error.message}`);
      throw new UnauthorizedException('Invalid or expired refresh token');
    }
  }

  /**
   * Get user info from access token
   */
  async getUserInfo(accessToken: string): Promise<KeycloakUserInfo> {
    try {
      const response = await this.httpClient.get('/protocol/openid-connect/userinfo', {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Get user info failed: ${error.message}`);
      throw new UnauthorizedException('Invalid access token');
    }
  }

  /**
   * Validate access token
   */
  async validateToken(accessToken: string): Promise<boolean> {
    try {
      await this.getUserInfo(accessToken);
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Logout user (revoke refresh token)
   */
  async logoutUser(refreshToken: string): Promise<void> {
    try {
      await this.httpClient.post('/protocol/openid-connect/logout', {
        client_id: this.clientId,
        client_secret: this.clientSecret,
        refresh_token: refreshToken,
      });
    } catch (error) {
      this.logger.error(`Logout failed: ${error.message}`);
      // Don't throw error as logout should always succeed from client perspective
    }
  }

  /**
   * Create user in Keycloak
   */
  async createUser(userData: {
    username: string;
    email: string;
    firstName?: string;
    lastName?: string;
    password: string;
    enabled?: boolean;
    emailVerified?: boolean;
    attributes?: Record<string, string[]>;
  }): Promise<string> {
    try {
      const adminToken = await this.getAdminToken();
      
      const response = await axios.post(
        `${this.keycloakUrl}/admin/realms/${this.realm}/users`,
        {
          username: userData.username,
          email: userData.email,
          firstName: userData.firstName,
          lastName: userData.lastName,
          enabled: userData.enabled !== false,
          emailVerified: userData.emailVerified || false,
          credentials: [
            {
              type: 'password',
              value: userData.password,
              temporary: false,
            },
          ],
          attributes: userData.attributes || {},
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      // Extract user ID from Location header
      const location = response.headers.location;
      const userId = location.split('/').pop();
      
      return userId;
    } catch (error) {
      this.logger.error(`User creation failed: ${error.message}`);
      throw new BadRequestException('Failed to create user');
    }
  }

  /**
   * Update user in Keycloak
   */
  async updateUser(userId: string, userData: Partial<KeycloakUser>): Promise<void> {
    try {
      const adminToken = await this.getAdminToken();
      
      await axios.put(
        `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}`,
        userData,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      this.logger.error(`User update failed: ${error.message}`);
      throw new BadRequestException('Failed to update user');
    }
  }

  /**
   * Delete user from Keycloak
   */
  async deleteUser(userId: string): Promise<void> {
    try {
      const adminToken = await this.getAdminToken();
      
      await axios.delete(
        `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
    } catch (error) {
      this.logger.error(`User deletion failed: ${error.message}`);
      throw new BadRequestException('Failed to delete user');
    }
  }

  /**
   * Get user by ID
   */
  async getUserById(userId: string): Promise<KeycloakUser> {
    try {
      const adminToken = await this.getAdminToken();
      
      const response = await axios.get(
        `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error(`Get user failed: ${error.message}`);
      throw new BadRequestException('User not found');
    }
  }

  /**
   * Search users
   */
  async searchUsers(query: {
    username?: string;
    email?: string;
    firstName?: string;
    lastName?: string;
    exact?: boolean;
    first?: number;
    max?: number;
  }): Promise<KeycloakUser[]> {
    try {
      const adminToken = await this.getAdminToken();
      
      const params = new URLSearchParams();
      Object.entries(query).forEach(([key, value]) => {
        if (value !== undefined) {
          params.append(key, value.toString());
        }
      });

      const response = await axios.get(
        `${this.keycloakUrl}/admin/realms/${this.realm}/users?${params.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      return response.data;
    } catch (error) {
      this.logger.error(`User search failed: ${error.message}`);
      throw new BadRequestException('User search failed');
    }
  }

  /**
   * Reset user password
   */
  async resetPassword(userId: string, newPassword: string, temporary = false): Promise<void> {
    try {
      const adminToken = await this.getAdminToken();
      
      await axios.put(
        `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}/reset-password`,
        {
          type: 'password',
          value: newPassword,
          temporary,
        },
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      this.logger.error(`Password reset failed: ${error.message}`);
      throw new BadRequestException('Failed to reset password');
    }
  }

  /**
   * Send verification email
   */
  async sendVerificationEmail(userId: string): Promise<void> {
    try {
      const adminToken = await this.getAdminToken();
      
      await axios.put(
        `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}/send-verify-email`,
        {},
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );
    } catch (error) {
      this.logger.error(`Send verification email failed: ${error.message}`);
      throw new BadRequestException('Failed to send verification email');
    }
  }

  /**
   * Get admin token for administrative operations
   */
  private async getAdminToken(): Promise<string> {
    try {
      const response = await axios.post(
        `${this.keycloakUrl}/realms/master/protocol/openid-connect/token`,
        {
          grant_type: 'client_credentials',
          client_id: this.adminClientId,
          client_secret: this.adminClientSecret,
        },
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      return response.data.access_token;
    } catch (error) {
      this.logger.error(`Admin token request failed: ${error.message}`);
      throw new BadRequestException('Failed to get admin token');
    }
  }

  /**
   * Get user roles
   */
  async getUserRoles(userId: string): Promise<string[]> {
    try {
      const adminToken = await this.getAdminToken();
      
      const response = await axios.get(
        `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}/role-mappings/realm`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      return response.data.map((role: any) => role.name);
    } catch (error) {
      this.logger.error(`Get user roles failed: ${error.message}`);
      return [];
    }
  }

  /**
   * Assign roles to user
   */
  async assignRoles(userId: string, roles: string[]): Promise<void> {
    try {
      const adminToken = await this.getAdminToken();
      
      // First get available roles
      const availableRolesResponse = await axios.get(
        `${this.keycloakUrl}/admin/realms/${this.realm}/roles`,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
          },
        }
      );

      const availableRoles = availableRolesResponse.data;
      const rolesToAssign = availableRoles.filter((role: any) => roles.includes(role.name));

      if (rolesToAssign.length === 0) {
        throw new BadRequestException('No valid roles found');
      }

      await axios.post(
        `${this.keycloakUrl}/admin/realms/${this.realm}/users/${userId}/role-mappings/realm`,
        rolesToAssign,
        {
          headers: {
            Authorization: `Bearer ${adminToken}`,
            'Content-Type': 'application/json',
          },
        }
      );
    } catch (error) {
      this.logger.error(`Role assignment failed: ${error.message}`);
      throw new BadRequestException('Failed to assign roles');
    }
  }

  /**
   * Health check for Keycloak
   */
  async healthCheck(): Promise<{ status: string; version?: string }> {
    try {
      const response = await axios.get(`${this.keycloakUrl}/health`);
      return {
        status: 'healthy',
        version: response.data.version,
      };
    } catch (error) {
      this.logger.error(`Keycloak health check failed: ${error.message}`);
      return {
        status: 'unhealthy',
      };
    }
  }
}

