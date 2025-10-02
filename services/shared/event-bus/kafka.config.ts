import { Kafka } from 'kafkajs';

export const kafkaConfig = {
  clientId: process.env.KAFKA_CLIENT_ID || 'securehealth-platform',
  brokers: process.env.KAFKA_BROKERS?.split(',') || ['localhost:9092'],
  retry: {
    initialRetryTime: 100,
    retries: 8
  },
  connectionTimeout: 3000,
  requestTimeout: 25000,
};

export const kafka = new Kafka(kafkaConfig);

// Topics configuration
export const TOPICS = {
  // Patient events
  PATIENT_EVENTS: 'patient.events',
  PATIENT_REGISTERED: 'patient.registered',
  PATIENT_UPDATED: 'patient.updated',
  PATIENT_DELETED: 'patient.deleted',

  // Hospital events
  HOSPITAL_EVENTS: 'hospital.events',
  HOSPITAL_REGISTERED: 'hospital.registered',
  HOSPITAL_UPDATED: 'hospital.updated',
  HOSPITAL_VERIFIED: 'hospital.verified',

  // Document events
  DOCUMENT_EVENTS: 'document.events',
  DOCUMENT_UPLOADED: 'document.uploaded',
  DOCUMENT_DOWNLOADED: 'document.downloaded',
  DOCUMENT_DELETED: 'document.deleted',
  DOCUMENT_VERIFIED: 'document.verified',

  // Consent events
  CONSENT_EVENTS: 'consent.events',
  CONSENT_REQUESTED: 'consent.requested',
  CONSENT_GRANTED: 'consent.granted',
  CONSENT_DENIED: 'consent.denied',
  CONSENT_REVOKED: 'consent.revoked',

  // Notification events
  NOTIFICATION_EVENTS: 'notification.events',
  NOTIFICATION_SENT: 'notification.sent',
  NOTIFICATION_DELIVERED: 'notification.delivered',
  NOTIFICATION_FAILED: 'notification.failed',

  // Audit events
  AUDIT_EVENTS: 'audit.events',
  AUDIT_LOG_CREATED: 'audit.log.created',

  // Authentication events
  AUTH_EVENTS: 'auth.events',
  USER_LOGIN: 'user.login',
  USER_LOGOUT: 'user.logout',
  LOGIN_FAILED: 'login.failed',

  // Insurance events
  INSURANCE_EVENTS: 'insurance.events',
  CLAIM_SUBMITTED: 'claim.submitted',
  CLAIM_PROCESSED: 'claim.processed',
  CLAIM_APPROVED: 'claim.approved',
  CLAIM_REJECTED: 'claim.rejected',

  // System events
  SYSTEM_EVENTS: 'system.events',
  SYSTEM_ERROR: 'system.error',
  SYSTEM_HEALTH: 'system.health',
  SERVICE_UP: 'service.up',
  SERVICE_DOWN: 'service.down',
};

// Event schemas
export interface BaseEvent {
  eventId: string;
  eventType: string;
  timestamp: Date;
  source: string;
  version: string;
  correlationId?: string;
  metadata?: Record<string, any>;
}

export interface PatientEvent extends BaseEvent {
  patientId: string;
  data: {
    name?: string;
    email?: string;
    phone?: string;
    abhaId?: string;
    [key: string]: any;
  };
}

export interface DocumentEvent extends BaseEvent {
  documentId: string;
  patientId: string;
  hospitalId?: string;
  data: {
    name: string;
    type: string;
    size: number;
    hash: string;
    uploadTime: Date;
    [key: string]: any;
  };
}

export interface ConsentEvent extends BaseEvent {
  consentId: string;
  patientId: string;
  hospitalId: string;
  data: {
    type: string;
    scope: string;
    status: string;
    documentIds?: string[];
    [key: string]: any;
  };
}

export interface NotificationEvent extends BaseEvent {
  notificationId: string;
  recipientId: string;
  data: {
    type: string;
    category: string;
    title: string;
    message: string;
    channel: string;
    [key: string]: any;
  };
}

export interface AuditEvent extends BaseEvent {
  logId: string;
  userId: string;
  data: {
    eventType: string;
    category: string;
    severity: string;
    action: string;
    resource: string;
    ipAddress: string;
    [key: string]: any;
  };
}

// Event producer class
export class EventProducer {
  private producer;

  constructor() {
    this.producer = kafka.producer();
  }

  async connect(): Promise<void> {
    await this.producer.connect();
  }

  async disconnect(): Promise<void> {
    await this.producer.disconnect();
  }

  async sendEvent(topic: string, event: BaseEvent): Promise<void> {
    try {
      await this.producer.send({
        topic,
        messages: [
          {
            key: event.eventId,
            value: JSON.stringify(event),
            timestamp: event.timestamp.getTime().toString(),
            headers: {
              eventType: event.eventType,
              source: event.source,
              version: event.version,
              correlationId: event.correlationId || '',
            },
          },
        ],
      });
    } catch (error) {
      console.error(`Failed to send event to topic ${topic}:`, error);
      throw error;
    }
  }

  async sendPatientEvent(event: PatientEvent): Promise<void> {
    await this.sendEvent(TOPICS.PATIENT_EVENTS, event);
  }

  async sendDocumentEvent(event: DocumentEvent): Promise<void> {
    await this.sendEvent(TOPICS.DOCUMENT_EVENTS, event);
  }

  async sendConsentEvent(event: ConsentEvent): Promise<void> {
    await this.sendEvent(TOPICS.CONSENT_EVENTS, event);
  }

  async sendNotificationEvent(event: NotificationEvent): Promise<void> {
    await this.sendEvent(TOPICS.NOTIFICATION_EVENTS, event);
  }

  async sendAuditEvent(event: AuditEvent): Promise<void> {
    await this.sendEvent(TOPICS.AUDIT_EVENTS, event);
  }
}

// Event consumer class
export class EventConsumer {
  private consumer;

  constructor(groupId: string) {
    this.consumer = kafka.consumer({ groupId });
  }

  async connect(): Promise<void> {
    await this.consumer.connect();
  }

  async disconnect(): Promise<void> {
    await this.consumer.disconnect();
  }

  async subscribe(topics: string[]): Promise<void> {
    await this.consumer.subscribe({ topics });
  }

  async run(handler: (message: any) => Promise<void>): Promise<void> {
    await this.consumer.run({
      eachMessage: async ({ topic, partition, message }) => {
        try {
          const event = JSON.parse(message.value?.toString() || '{}');
          await handler({
            topic,
            partition,
            offset: message.offset,
            key: message.key?.toString(),
            value: event,
            headers: message.headers,
            timestamp: message.timestamp,
          });
        } catch (error) {
          console.error(`Error processing message from topic ${topic}:`, error);
        }
      },
    });
  }
}

// Utility functions
export function generateEventId(): string {
  return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function generateCorrelationId(): string {
  return `corr_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

export function createBaseEvent(
  eventType: string,
  source: string,
  correlationId?: string
): BaseEvent {
  return {
    eventId: generateEventId(),
    eventType,
    timestamp: new Date(),
    source,
    version: '1.0',
    correlationId: correlationId || generateCorrelationId(),
    metadata: {},
  };
}


