import { Injectable, Logger, BadRequestException, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import axios, { AxiosInstance } from 'axios';
import * as crypto from 'crypto';

export interface ABHAProfile {
  abhaId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  mobile: string;
  email?: string;
  address?: {
    street: string;
    city: string;
    state: string;
    pincode: string;
    country: string;
  };
  verified: boolean;
  kycVerified: boolean;
}

export interface ABHASearchResult {
  abhaId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: string;
  mobile: string;
  email?: string;
  verified: boolean;
}

export interface ABHAVerificationRequest {
  abhaId: string;
  otp: string;
}

export interface ABHAOTPResponse {
  txnId: string;
  expiry: number;
  message: string;
}

@Injectable()
export class ABHAService {
  private readonly logger = new Logger(ABHAService.name);
  private readonly abhaUrl: string;
  private readonly clientId: string;
  private readonly clientSecret: string;
  private readonly privateKey: string;
  private readonly publicKey: string;
  private readonly httpClient: AxiosInstance;

  constructor(private configService: ConfigService) {
    this.abhaUrl = this.configService.get('ABHA_URL', 'https://abha.abdm.gov.in/api');
    this.clientId = this.configService.get('ABHA_CLIENT_ID', '');
    this.clientSecret = this.configService.get('ABHA_CLIENT_SECRET', '');
    this.privateKey = this.configService.get('ABHA_PRIVATE_KEY', '');
    this.publicKey = this.configService.get('ABHA_PUBLIC_KEY', '');

    this.httpClient = axios.create({
      baseURL: this.abhaUrl,
      timeout: 30000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
    });
  }

  /**
   * Generate ABHA authentication token
   */
  private async generateAuthToken(): Promise<string> {
    try {
      const timestamp = Date.now().toString();
      const nonce = crypto.randomBytes(16).toString('hex');
      
      // Create signature payload
      const payload = {
        clientId: this.clientId,
        timestamp,
        nonce,
      };

      // Sign the payload with private key
      const signature = this.signPayload(JSON.stringify(payload));

      const response = await this.httpClient.post('/auth/token', {
        clientId: this.clientId,
        clientSecret: this.clientSecret,
        timestamp,
        nonce,
        signature,
      });

      return response.data.access_token;
    } catch (error) {
      this.logger.error(`ABHA auth token generation failed: ${error.message}`);
      throw new BadRequestException('Failed to generate ABHA authentication token');
    }
  }

  /**
   * Sign payload with private key
   */
  private signPayload(payload: string): string {
    try {
      const sign = crypto.createSign('SHA256');
      sign.update(payload);
      return sign.sign(this.privateKey, 'base64');
    } catch (error) {
      this.logger.error(`Payload signing failed: ${error.message}`);
      throw new BadRequestException('Failed to sign payload');
    }
  }

  /**
   * Verify ABHA ID
   */
  async verifyABHAId(abhaId: string): Promise<boolean> {
    try {
      const authToken = await this.generateAuthToken();
      
      const response = await this.httpClient.get(`/profile/${abhaId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      return response.status === 200;
    } catch (error) {
      this.logger.error(`ABHA ID verification failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get ABHA profile
   */
  async getABHAProfile(abhaId: string): Promise<ABHAProfile> {
    try {
      const authToken = await this.generateAuthToken();
      
      const response = await this.httpClient.get(`/profile/${abhaId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      const profile = response.data;
      
      return {
        abhaId: profile.abhaId,
        firstName: profile.firstName,
        lastName: profile.lastName,
        dateOfBirth: profile.dateOfBirth,
        gender: profile.gender,
        mobile: profile.mobile,
        email: profile.email,
        address: profile.address,
        verified: profile.verified,
        kycVerified: profile.kycVerified,
      };
    } catch (error) {
      this.logger.error(`Get ABHA profile failed: ${error.message}`);
      if (error.response?.status === 404) {
        throw new BadRequestException('ABHA ID not found');
      }
      throw new BadRequestException('Failed to get ABHA profile');
    }
  }

  /**
   * Search patients by ABHA ID
   */
  async searchByABHAId(abhaId: string): Promise<ABHASearchResult[]> {
    try {
      const authToken = await this.generateAuthToken();
      
      const response = await this.httpClient.post('/search/abha', {
        abhaId,
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      return response.data.map((patient: any) => ({
        abhaId: patient.abhaId,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        mobile: patient.mobile,
        email: patient.email,
        verified: patient.verified,
      }));
    } catch (error) {
      this.logger.error(`ABHA search failed: ${error.message}`);
      throw new BadRequestException('ABHA search failed');
    }
  }

  /**
   * Search patients by mobile number
   */
  async searchByMobile(mobile: string): Promise<ABHASearchResult[]> {
    try {
      const authToken = await this.generateAuthToken();
      
      const response = await this.httpClient.post('/search/mobile', {
        mobile,
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      return response.data.map((patient: any) => ({
        abhaId: patient.abhaId,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        mobile: patient.mobile,
        email: patient.email,
        verified: patient.verified,
      }));
    } catch (error) {
      this.logger.error(`Mobile search failed: ${error.message}`);
      throw new BadRequestException('Mobile search failed');
    }
  }

  /**
   * Search patients by name and date of birth
   */
  async searchByNameAndDOB(name: string, dateOfBirth: string): Promise<ABHASearchResult[]> {
    try {
      const authToken = await this.generateAuthToken();
      
      const response = await this.httpClient.post('/search/name-dob', {
        name,
        dateOfBirth,
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      return response.data.map((patient: any) => ({
        abhaId: patient.abhaId,
        firstName: patient.firstName,
        lastName: patient.lastName,
        dateOfBirth: patient.dateOfBirth,
        gender: patient.gender,
        mobile: patient.mobile,
        email: patient.email,
        verified: patient.verified,
      }));
    } catch (error) {
      this.logger.error(`Name and DOB search failed: ${error.message}`);
      throw new BadRequestException('Name and DOB search failed');
    }
  }

  /**
   * Send OTP for ABHA verification
   */
  async sendOTP(abhaId: string): Promise<ABHAOTPResponse> {
    try {
      const authToken = await this.generateAuthToken();
      
      const response = await this.httpClient.post('/otp/send', {
        abhaId,
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      return {
        txnId: response.data.txnId,
        expiry: response.data.expiry,
        message: response.data.message,
      };
    } catch (error) {
      this.logger.error(`OTP send failed: ${error.message}`);
      throw new BadRequestException('Failed to send OTP');
    }
  }

  /**
   * Verify OTP for ABHA
   */
  async verifyOTP(request: ABHAVerificationRequest): Promise<boolean> {
    try {
      const authToken = await this.generateAuthToken();
      
      const response = await this.httpClient.post('/otp/verify', {
        abhaId: request.abhaId,
        otp: request.otp,
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      return response.data.verified === true;
    } catch (error) {
      this.logger.error(`OTP verification failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Link ABHA ID to patient
   */
  async linkABHAId(abhaId: string, patientId: string): Promise<boolean> {
    try {
      const authToken = await this.generateAuthToken();
      
      const response = await this.httpClient.post('/link', {
        abhaId,
        patientId,
      }, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      return response.status === 200;
    } catch (error) {
      this.logger.error(`ABHA linking failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Unlink ABHA ID from patient
   */
  async unlinkABHAId(abhaId: string, patientId: string): Promise<boolean> {
    try {
      const authToken = await this.generateAuthToken();
      
      const response = await this.httpClient.delete('/link', {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
        data: {
          abhaId,
          patientId,
        },
      });

      return response.status === 200;
    } catch (error) {
      this.logger.error(`ABHA unlinking failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Get ABHA consent records
   */
  async getConsentRecords(abhaId: string): Promise<any[]> {
    try {
      const authToken = await this.generateAuthToken();
      
      const response = await this.httpClient.get(`/consent/${abhaId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Get consent records failed: ${error.message}`);
      throw new BadRequestException('Failed to get consent records');
    }
  }

  /**
   * Create consent request
   */
  async createConsentRequest(consentData: {
    abhaId: string;
    purpose: string;
    hiTypes: string[];
    dataEraseAt: string;
    requester: {
      name: string;
      identifier: string;
      type: string;
    };
  }): Promise<any> {
    try {
      const authToken = await this.generateAuthToken();
      
      const response = await this.httpClient.post('/consent/request', consentData, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Create consent request failed: ${error.message}`);
      throw new BadRequestException('Failed to create consent request');
    }
  }

  /**
   * Get health information
   */
  async getHealthInfo(abhaId: string, consentId: string): Promise<any> {
    try {
      const authToken = await this.generateAuthToken();
      
      const response = await this.httpClient.get(`/health-info/${abhaId}/${consentId}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });

      return response.data;
    } catch (error) {
      this.logger.error(`Get health info failed: ${error.message}`);
      throw new BadRequestException('Failed to get health information');
    }
  }

  /**
   * Health check for ABHA service
   */
  async healthCheck(): Promise<{ status: string; version?: string }> {
    try {
      const response = await this.httpClient.get('/health');
      return {
        status: 'healthy',
        version: response.data.version,
      };
    } catch (error) {
      this.logger.error(`ABHA health check failed: ${error.message}`);
      return {
        status: 'unhealthy',
      };
    }
  }

  /**
   * Validate ABHA ID format
   */
  validateABHAIdFormat(abhaId: string): boolean {
    // ABHA ID format: 14 digits starting with 2-9
    const abhaIdRegex = /^[2-9]\d{13}$/;
    return abhaIdRegex.test(abhaId);
  }

  /**
   * Generate ABHA QR code data
   */
  generateABHAQRData(abhaId: string): string {
    return JSON.stringify({
      abhaId,
      timestamp: Date.now(),
      version: '1.0',
    });
  }
}

