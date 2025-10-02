import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

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

  @Prop({ 
    type: {
      maxHospitals: { type: Number, default: 10 },
      maxUsers: { type: Number, default: 100 },
      maxDocumentsPerMonth: { type: Number, default: 10000 },
      dataRetentionDays: { type: Number, default: 2555 }, // 7 years
      enableAuditLogging: { type: Boolean, default: true },
      enableAdvancedAnalytics: { type: Boolean, default: false },
      enableCustomBranding: { type: Boolean, default: false },
      enableSSO: { type: Boolean, default: false },
      enableMFA: { type: Boolean, default: false },
      allowedRegions: [{ type: String }],
      backupFrequency: { type: String, default: 'daily' },
      disasterRecoveryEnabled: { type: Boolean, default: false }
    },
    default: {}
  })
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

  @Prop({ 
    type: {
      subscriptionId: { type: String, default: '' },
      planId: { type: String, default: '' },
      billingCycle: { type: String, default: 'monthly' },
      nextBillingDate: { type: Date },
      amount: { type: Number, default: 0 },
      currency: { type: String, default: 'USD' },
      paymentMethod: { type: String, default: '' },
      lastPaymentDate: { type: Date },
      lastPaymentAmount: { type: Number },
      outstandingAmount: { type: Number, default: 0 },
      paymentStatus: { type: String, default: 'pending' }
    },
    default: {}
  })
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

  @Prop({ 
    type: {
      hospitals: {
        used: { type: Number, default: 0 },
        limit: { type: Number, default: 10 }
      },
      users: {
        used: { type: Number, default: 0 },
        limit: { type: Number, default: 100 }
      },
      documents: {
        used: { type: Number, default: 0 },
        limit: { type: Number, default: 10000 }
      },
      storage: {
        used: { type: Number, default: 0 }, // in bytes
        limit: { type: Number, default: 1073741824 } // 1GB in bytes
      },
      apiCalls: {
        used: { type: Number, default: 0 },
        limit: { type: Number, default: 100000 }
      }
    },
    default: {}
  })
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

  @Prop({ 
    type: {
      hipaaCompliant: { type: Boolean, default: false },
      soc2Compliant: { type: Boolean, default: false },
      iso27001Compliant: { type: Boolean, default: false },
      abdmCompliant: { type: Boolean, default: false },
      gdprCompliant: { type: Boolean, default: false },
      lastAuditDate: { type: Date },
      nextAuditDate: { type: Date },
      auditScore: { type: Number, default: 0 },
      certifications: [{ type: String }]
    },
    default: {}
  })
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

  @Prop({ 
    type: {
      passwordPolicy: {
        minLength: { type: Number, default: 8 },
        requireUppercase: { type: Boolean, default: true },
        requireLowercase: { type: Boolean, default: true },
        requireNumbers: { type: Boolean, default: true },
        requireSpecialChars: { type: Boolean, default: true },
        maxAge: { type: Number, default: 90 }, // in days
        preventReuse: { type: Number, default: 5 } // number of previous passwords
      },
      sessionPolicy: {
        timeout: { type: Number, default: 30 }, // in minutes
        maxConcurrentSessions: { type: Number, default: 3 },
        requireReauthForSensitive: { type: Boolean, default: true }
      },
      ipWhitelist: [{ type: String }],
      allowedCountries: [{ type: String }],
      blockedCountries: [{ type: String }]
    },
    default: {}
  })
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

  @Prop({ 
    type: {
      sso: {
        enabled: { type: Boolean, default: false },
        provider: { type: String, default: '' },
        configuration: { type: Map, of: MongooseSchema.Types.Mixed, default: {} }
      },
      ldap: {
        enabled: { type: Boolean, default: false },
        configuration: { type: Map, of: MongooseSchema.Types.Mixed, default: {} }
      },
      apiKeys: [{
        keyId: { type: String, required: true },
        name: { type: String, required: true },
        permissions: [{ type: String }],
        createdAt: { type: Date, default: Date.now },
        lastUsed: { type: Date },
        expiresAt: { type: Date }
      }],
      webhooks: [{
        url: { type: String, required: true },
        events: [{ type: String }],
        secret: { type: String, required: true },
        enabled: { type: Boolean, default: true }
      }]
    },
    default: {}
  })
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

  @Prop({ 
    type: {
      enableMetrics: { type: Boolean, default: true },
      enableLogging: { type: Boolean, default: true },
      enableTracing: { type: Boolean, default: false },
      retentionDays: { type: Number, default: 90 },
      alertThresholds: { type: Map, of: Number, default: {} }
    },
    default: {}
  })
  monitoring: {
    enableMetrics: boolean;
    enableLogging: boolean;
    enableTracing: boolean;
    retentionDays: number;
    alertThresholds: Record<string, number>;
  };

  @Prop({ 
    type: {
      plan: { type: String, default: 'basic' },
      contactEmail: { type: String, default: '' },
      contactPhone: { type: String, default: '' },
      sla: {
        responseTime: { type: String, default: '24h' },
        resolutionTime: { type: String, default: '72h' },
        uptime: { type: Number, default: 99.9 }
      },
      supportChannels: [{ type: String }]
    },
    default: {}
  })
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

  @Prop({ type: Map, of: MongooseSchema.Types.Mixed, default: {} })
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

  @Prop({ 
    type: {
      lastUpdated: { type: Date, default: Date.now },
      dailyApiCalls: { type: Number, default: 0 },
      dailyDocuments: { type: Number, default: 0 },
      dailyUsers: { type: Number, default: 0 },
      peakConcurrentUsers: { type: Number, default: 0 },
      averageResponseTime: { type: Number, default: 0 },
      errorRate: { type: Number, default: 0 }
    },
    default: {}
  })
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

