import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TenantDocument = Tenant & Document;

export enum TenantStatus {
  ACTIVE = 'active',
  SUSPENDED = 'suspended',
  PENDING = 'pending',
  EXPIRED = 'expired',
}

export enum TenantTier {
  BASIC = 'basic',
  PROFESSIONAL = 'professional',
  ENTERPRISE = 'enterprise',
  CUSTOM = 'custom',
}

@Schema({ timestamps: true })
export class Tenant {
  @Prop({ required: true, unique: true })
  tenantId: string;

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  domain: string;

  @Prop({ default: TenantStatus.PENDING })
  status: TenantStatus;

  @Prop({ default: TenantTier.BASIC })
  tier: TenantTier;

  @Prop({ required: true })
  ownerId: string;

  @Prop({ required: true })
  ownerEmail: string;

  @Prop({ default: {} })
  settings: {
    maxHospitals: number;
    maxUsers: number;
    maxDocumentsPerMonth: number;
    dataRetentionDays: number;
    enableAuditLogging: boolean;
    enableAdvancedAnalytics: boolean;
    enableCustomBranding: boolean;
    enableSSO: boolean;
    enableMFA: boolean;
    allowedRegions: string[];
    backupFrequency: string;
    disasterRecoveryEnabled: boolean;
  };

  @Prop({ default: {} })
  billing: {
    subscriptionId: string;
    planId: string;
    billingCycle: string; // monthly, yearly
    nextBillingDate: Date;
    amount: number;
    currency: string;
    paymentMethod: string;
    lastPaymentDate?: Date;
    lastPaymentAmount?: number;
    outstandingAmount: number;
    paymentStatus: string;
  };

  @Prop({ default: {} })
  limits: {
    hospitals: {
      used: number;
      limit: number;
    };
    users: {
      used: number;
      limit: number;
    };
    documents: {
      used: number;
      limit: number;
    };
    storage: {
      used: number; // in bytes
      limit: number; // in bytes
    };
    apiCalls: {
      used: number;
      limit: number;
    };
  };

  @Prop({ default: [] })
  features: string[];

  @Prop({ default: {} })
  compliance: {
    hipaaCompliant: boolean;
    soc2Compliant: boolean;
    iso27001Compliant: boolean;
    abdmCompliant: boolean;
    gdprCompliant: boolean;
    lastAuditDate?: Date;
    nextAuditDate?: Date;
    auditScore?: number;
    certifications: string[];
  };

  @Prop({ default: {} })
  security: {
    passwordPolicy: {
      minLength: number;
      requireUppercase: boolean;
      requireLowercase: boolean;
      requireNumbers: boolean;
      requireSpecialChars: boolean;
      maxAge: number; // in days
      preventReuse: number; // number of previous passwords
    };
    sessionPolicy: {
      timeout: number; // in minutes
      maxConcurrentSessions: number;
      requireReauthForSensitive: boolean;
    };
    ipWhitelist: string[];
    allowedCountries: string[];
    blockedCountries: string[];
  };

  @Prop({ default: {} })
  integrations: {
    sso: {
      enabled: boolean;
      provider: string;
      configuration: Record<string, any>;
    };
    ldap: {
      enabled: boolean;
      configuration: Record<string, any>;
    };
    apiKeys: Array<{
      keyId: string;
      name: string;
      permissions: string[];
      createdAt: Date;
      lastUsed?: Date;
      expiresAt?: Date;
    }>;
    webhooks: Array<{
      url: string;
      events: string[];
      secret: string;
      enabled: boolean;
    }>;
  };

  @Prop({ default: {} })
  monitoring: {
    enableMetrics: boolean;
    enableLogging: boolean;
    enableTracing: boolean;
    retentionDays: number;
    alertThresholds: Record<string, number>;
  };

  @Prop({ default: {} })
  support: {
    plan: string;
    contactEmail: string;
    contactPhone: string;
    sla: {
      responseTime: string;
      resolutionTime: string;
      uptime: number;
    };
    supportChannels: string[];
  };

  @Prop({ default: {} })
  metadata: Record<string, any>;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  suspendedAt?: Date;

  @Prop()
  suspendedBy?: string;

  @Prop()
  suspensionReason?: string;

  @Prop()
  expiresAt?: Date;

  @Prop({ default: [] })
  tags: string[];

  @Prop({ default: {} })
  usage: {
    lastUpdated: Date;
    dailyApiCalls: number;
    dailyDocuments: number;
    dailyUsers: number;
    peakConcurrentUsers: number;
    averageResponseTime: number;
    errorRate: number;
  };
}

export const TenantSchema = SchemaFactory.createForClass(Tenant);

// Indexes for performance
TenantSchema.index({ tenantId: 1 });
TenantSchema.index({ domain: 1 });
TenantSchema.index({ status: 1 });
TenantSchema.index({ tier: 1 });
TenantSchema.index({ ownerId: 1 });
TenantSchema.index({ createdAt: -1 });
TenantSchema.index({ expiresAt: 1 });

