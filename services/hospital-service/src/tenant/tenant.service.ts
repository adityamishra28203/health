import { Injectable, Logger, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as crypto from 'crypto';
import { Tenant, TenantDocument, TenantStatus, TenantTier } from '../schemas/tenant.schema';

export interface TenantCreationRequest {
  name: string;
  domain: string;
  ownerName: string;
  ownerEmail: string;
  tier?: TenantTier;
  settings?: any;
}

@Injectable()
export class TenantService {
  private readonly logger = new Logger(TenantService.name);

  constructor(
    @InjectModel('Tenant') private tenantModel: Model<TenantDocument>,
  ) {}

  /**
   * Generate unique tenant ID
   */
  private generateTenantId(): string {
    return `tenant_${crypto.randomBytes(8).toString('hex')}`;
  }

  /**
   * Get or create tenant
   */
  async getOrCreateTenant(ownerEmail: string, request: TenantCreationRequest): Promise<Tenant> {
    try {
      // Check if tenant already exists
      let tenant = await this.tenantModel.findOne({
        $or: [
          { ownerEmail },
          { domain: request.domain },
        ],
      });

      if (tenant) {
        return tenant;
      }

      // Create new tenant
      const tenantId = this.generateTenantId();
      const tier = request.tier || TenantTier.BASIC;

      tenant = new this.tenantModel({
        tenantId,
        name: request.name,
        domain: request.domain,
        status: TenantStatus.PENDING,
        tier,
        ownerId: `owner_${crypto.randomBytes(8).toString('hex')}`,
        ownerEmail,
        settings: {
          maxHospitals: this.getTierLimits(tier).maxHospitals,
          maxUsers: this.getTierLimits(tier).maxUsers,
          maxDocumentsPerMonth: this.getTierLimits(tier).maxDocumentsPerMonth,
          dataRetentionDays: 2555, // 7 years
          enableAuditLogging: true,
          enableAdvancedAnalytics: tier !== TenantTier.BASIC,
          enableCustomBranding: tier === TenantTier.ENTERPRISE,
          enableSSO: tier !== TenantTier.BASIC,
          enableMFA: tier !== TenantTier.BASIC,
          allowedRegions: ['IN'], // India by default
          backupFrequency: 'daily',
          disasterRecoveryEnabled: tier === TenantTier.ENTERPRISE,
          ...request.settings,
        },
        billing: {
          subscriptionId: `sub_${crypto.randomBytes(8).toString('hex')}`,
          planId: `plan_${tier}`,
          billingCycle: 'monthly',
          nextBillingDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
          amount: this.getTierPricing(tier).monthly,
          currency: 'INR',
          paymentMethod: 'credit_card',
          outstandingAmount: 0,
          paymentStatus: 'pending',
        },
        limits: {
          hospitals: { used: 0, limit: this.getTierLimits(tier).maxHospitals },
          users: { used: 0, limit: this.getTierLimits(tier).maxUsers },
          documents: { used: 0, limit: this.getTierLimits(tier).maxDocumentsPerMonth },
          storage: { used: 0, limit: this.getTierLimits(tier).maxStorage },
          apiCalls: { used: 0, limit: this.getTierLimits(tier).maxApiCalls },
        },
        features: this.getTierFeatures(tier),
        compliance: {
          hipaaCompliant: tier !== TenantTier.BASIC,
          soc2Compliant: tier === TenantTier.ENTERPRISE,
          iso27001Compliant: tier === TenantTier.ENTERPRISE,
          abdmCompliant: true,
          gdprCompliant: tier !== TenantTier.BASIC,
          certifications: this.getTierCertifications(tier),
        },
        security: {
          passwordPolicy: {
            minLength: 8,
            requireUppercase: true,
            requireLowercase: true,
            requireNumbers: true,
            requireSpecialChars: tier !== TenantTier.BASIC,
            maxAge: tier === TenantTier.BASIC ? 90 : 60,
            preventReuse: 5,
          },
          sessionPolicy: {
            timeout: tier === TenantTier.BASIC ? 480 : 240, // 8 hours or 4 hours
            maxConcurrentSessions: tier === TenantTier.BASIC ? 3 : 10,
            requireReauthForSensitive: tier !== TenantTier.BASIC,
          },
          ipWhitelist: [],
          allowedCountries: ['IN'],
          blockedCountries: [],
        },
        integrations: {
          sso: {
            enabled: tier !== TenantTier.BASIC,
            provider: 'none',
            configuration: {},
          },
          ldap: {
            enabled: tier === TenantTier.ENTERPRISE,
            configuration: {},
          },
          apiKeys: [],
          webhooks: [],
        },
        monitoring: {
          enableMetrics: true,
          enableLogging: true,
          enableTracing: tier !== TenantTier.BASIC,
          retentionDays: tier === TenantTier.BASIC ? 30 : 90,
          alertThresholds: {
            errorRate: 0.05,
            responseTime: 2000,
            cpuUsage: 0.8,
            memoryUsage: 0.8,
          },
        },
        support: {
          plan: tier === TenantTier.BASIC ? 'email' : tier === TenantTier.PROFESSIONAL ? 'email_phone' : 'dedicated',
          contactEmail: ownerEmail,
          contactPhone: '',
          sla: {
            responseTime: tier === TenantTier.BASIC ? '24h' : tier === TenantTier.PROFESSIONAL ? '8h' : '2h',
            resolutionTime: tier === TenantTier.BASIC ? '72h' : tier === TenantTier.PROFESSIONAL ? '24h' : '8h',
            uptime: 0.999,
          },
          supportChannels: tier === TenantTier.BASIC ? ['email'] : ['email', 'phone', 'chat'],
        },
        metadata: {
          createdVia: 'hospital_registration',
          createdBy: ownerEmail,
        },
        isActive: true,
      });

      await (tenant as any).save();

      this.logger.log(`Tenant created successfully: ${tenantId}`);
      return tenant;
    } catch (error) {
      this.logger.error(`Tenant creation failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get tenant by ID
   */
  async getTenant(tenantId: string): Promise<Tenant> {
    const tenant = await this.tenantModel.findOne({ tenantId, isActive: true });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  /**
   * Get tenant by domain
   */
  async getTenantByDomain(domain: string): Promise<Tenant> {
    const tenant = await this.tenantModel.findOne({ domain, isActive: true });
    if (!tenant) {
      throw new NotFoundException('Tenant not found');
    }
    return tenant;
  }

  /**
   * Update tenant limits
   */
  async updateTenantLimits(tenantId: string, resource: string, increment = 1): Promise<Tenant> {
    try {
      const tenant = await this.getTenant(tenantId);
      
      const updateField = `limits.${resource}.used`;
      const newUsed = (tenant.limits[resource]?.used || 0) + increment;
      
      // Check if limit would be exceeded
      const limit = tenant.limits[resource]?.limit || 0;
      if (newUsed > limit) {
        throw new ConflictException(`${resource} limit exceeded for tenant ${tenantId}`);
      }

      await this.tenantModel.updateOne(
        { tenantId },
        { $set: { [updateField]: newUsed } },
      );

      return this.getTenant(tenantId);
    } catch (error) {
      this.logger.error(`Tenant limits update failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Check tenant limits
   */
  async checkTenantLimits(tenantId: string, resource: string): Promise<{
    canProceed: boolean;
    currentUsage: number;
    limit: number;
    remaining: number;
  }> {
    const tenant = await this.getTenant(tenantId);
    const currentUsage = tenant.limits[resource]?.used || 0;
    const limit = tenant.limits[resource]?.limit || 0;
    
    return {
      canProceed: currentUsage < limit,
      currentUsage,
      limit,
      remaining: Math.max(0, limit - currentUsage),
    };
  }

  /**
   * Upgrade tenant tier
   */
  async upgradeTenantTier(
    tenantId: string,
    newTier: TenantTier,
    upgradedBy: string,
  ): Promise<Tenant> {
    try {
      const tenant = await this.getTenant(tenantId);
      const oldTier = tenant.tier;

      if (this.getTierLevel(newTier) <= this.getTierLevel(oldTier)) {
        throw new ConflictException('Cannot downgrade tenant tier');
      }

      // Update tier and limits
      const newLimits = this.getTierLimits(newTier);
      tenant.tier = newTier;
      tenant.limits = {
        hospitals: { used: tenant.limits.hospitals.used, limit: newLimits.maxHospitals },
        users: { used: tenant.limits.users.used, limit: newLimits.maxUsers },
        documents: { used: tenant.limits.documents.used, limit: newLimits.maxDocumentsPerMonth },
        storage: { used: tenant.limits.storage.used, limit: newLimits.maxStorage },
        apiCalls: { used: tenant.limits.apiCalls.used, limit: newLimits.maxApiCalls },
      };
      tenant.features = this.getTierFeatures(newTier);
      tenant.settings = {
        ...tenant.settings,
        enableAdvancedAnalytics: newTier !== TenantTier.BASIC,
        enableCustomBranding: newTier === TenantTier.ENTERPRISE,
        enableSSO: newTier !== TenantTier.BASIC,
        enableMFA: newTier !== TenantTier.BASIC,
      };
      tenant.billing.planId = `plan_${newTier}`;
      tenant.billing.amount = this.getTierPricing(newTier).monthly;
      tenant.metadata = {
        ...tenant.metadata,
        tierUpgraded: {
          from: oldTier,
          to: newTier,
          upgradedBy,
          upgradedAt: new Date(),
        },
      };

      await (tenant as any).save();

      this.logger.log(`Tenant tier upgraded: ${tenantId} from ${oldTier} to ${newTier}`);
      return tenant;
    } catch (error) {
      this.logger.error(`Tenant tier upgrade failed: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Get tier limits
   */
  private getTierLimits(tier: TenantTier): {
    maxHospitals: number;
    maxUsers: number;
    maxDocumentsPerMonth: number;
    maxStorage: number;
    maxApiCalls: number;
  } {
    const limits = {
      [TenantTier.BASIC]: {
        maxHospitals: 1,
        maxUsers: 10,
        maxDocumentsPerMonth: 1000,
        maxStorage: 10 * 1024 * 1024 * 1024, // 10GB
        maxApiCalls: 10000,
      },
      [TenantTier.PROFESSIONAL]: {
        maxHospitals: 5,
        maxUsers: 100,
        maxDocumentsPerMonth: 10000,
        maxStorage: 100 * 1024 * 1024 * 1024, // 100GB
        maxApiCalls: 100000,
      },
      [TenantTier.ENTERPRISE]: {
        maxHospitals: 50,
        maxUsers: 1000,
        maxDocumentsPerMonth: 100000,
        maxStorage: 1024 * 1024 * 1024 * 1024, // 1TB
        maxApiCalls: 1000000,
      },
      [TenantTier.CUSTOM]: {
        maxHospitals: 1000,
        maxUsers: 10000,
        maxDocumentsPerMonth: 1000000,
        maxStorage: 10 * 1024 * 1024 * 1024 * 1024, // 10TB
        maxApiCalls: 10000000,
      },
    };

    return limits[tier];
  }

  /**
   * Get tier pricing
   */
  private getTierPricing(tier: TenantTier): { monthly: number; yearly: number } {
    const pricing = {
      [TenantTier.BASIC]: { monthly: 5000, yearly: 50000 },
      [TenantTier.PROFESSIONAL]: { monthly: 15000, yearly: 150000 },
      [TenantTier.ENTERPRISE]: { monthly: 50000, yearly: 500000 },
      [TenantTier.CUSTOM]: { monthly: 100000, yearly: 1000000 },
    };

    return pricing[tier];
  }

  /**
   * Get tier features
   */
  private getTierFeatures(tier: TenantTier): string[] {
    const features = {
      [TenantTier.BASIC]: [
        'basic_hospital_management',
        'patient_linking',
        'document_upload',
        'basic_reporting',
        'email_support',
      ],
      [TenantTier.PROFESSIONAL]: [
        'advanced_hospital_management',
        'patient_linking',
        'document_upload',
        'advanced_reporting',
        'analytics_dashboard',
        'api_access',
        'sso_integration',
        'mfa_support',
        'email_phone_support',
      ],
      [TenantTier.ENTERPRISE]: [
        'enterprise_hospital_management',
        'patient_linking',
        'document_upload',
        'advanced_reporting',
        'analytics_dashboard',
        'api_access',
        'sso_integration',
        'ldap_integration',
        'mfa_support',
        'custom_branding',
        'audit_logging',
        'disaster_recovery',
        'dedicated_support',
        'custom_integrations',
      ],
      [TenantTier.CUSTOM]: [
        'unlimited_hospitals',
        'unlimited_users',
        'unlimited_documents',
        'custom_features',
        'dedicated_infrastructure',
        'white_label_solution',
        'custom_sla',
        '24x7_support',
      ],
    };

    return features[tier];
  }

  /**
   * Get tier certifications
   */
  private getTierCertifications(tier: TenantTier): string[] {
    const certifications = {
      [TenantTier.BASIC]: ['ABDM'],
      [TenantTier.PROFESSIONAL]: ['ABDM', 'HIPAA'],
      [TenantTier.ENTERPRISE]: ['ABDM', 'HIPAA', 'SOC2', 'ISO27001'],
      [TenantTier.CUSTOM]: ['ABDM', 'HIPAA', 'SOC2', 'ISO27001', 'GDPR', 'Custom'],
    };

    return certifications[tier];
  }

  /**
   * Get tier level for comparison
   */
  private getTierLevel(tier: TenantTier): number {
    const levels = {
      [TenantTier.BASIC]: 1,
      [TenantTier.PROFESSIONAL]: 2,
      [TenantTier.ENTERPRISE]: 3,
      [TenantTier.CUSTOM]: 4,
    };

    return levels[tier];
  }

  /**
   * Get tenant usage statistics
   */
  async getTenantUsage(tenantId: string): Promise<any> {
    const tenant = await this.getTenant(tenantId);
    
    return {
      tenantId: tenant.tenantId,
      tier: tenant.tier,
      limits: tenant.limits,
      usage: tenant.usage,
      lastUpdated: new Date(),
    };
  }

  /**
   * Suspend tenant
   */
  async suspendTenant(
    tenantId: string,
    suspendedBy: string,
    reason: string,
  ): Promise<Tenant> {
    try {
      const tenant = await this.getTenant(tenantId);
      
      tenant.status = TenantStatus.SUSPENDED;
      tenant.suspendedAt = new Date();
      tenant.suspendedBy = suspendedBy;
      tenant.suspensionReason = reason;
      tenant.isActive = false;

      await (tenant as any).save();

      this.logger.log(`Tenant suspended: ${tenantId}`);
      return tenant;
    } catch (error) {
      this.logger.error(`Tenant suspension failed: ${error.message}`, error.stack);
      throw error;
    }
  }
}

