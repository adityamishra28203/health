import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type TimelineEventDocument = TimelineEvent & Document;

export enum EventType {
  VISIT = 'visit',
  DOCUMENT_UPLOAD = 'document_upload',
  CONSENT_GRANTED = 'consent_granted',
  CONSENT_REVOKED = 'consent_revoked',
  PRESCRIPTION_ISSUED = 'prescription_issued',
  TEST_ORDERED = 'test_ordered',
  TEST_RESULT = 'test_result',
  DIAGNOSIS = 'diagnosis',
  TREATMENT = 'treatment',
  FOLLOW_UP = 'follow_up',
  EMERGENCY_VISIT = 'emergency_visit',
  HOSPITALIZATION = 'hospitalization',
  DISCHARGE = 'discharge',
  VACCINATION = 'vaccination',
  MEDICATION_CHANGE = 'medication_change',
  ALLERGY_NOTED = 'allergy_noted',
  OTHER = 'other'
}

export enum EventPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical'
}

@Schema({ timestamps: true })
export class TimelineEvent {
  @Prop({ required: true, unique: true })
  eventId: string;

  @Prop({ required: true })
  patientId: string;

  @Prop({ required: true })
  hospitalId: string;

  @Prop({ required: true })
  createdBy: string;

  @Prop({ required: true, enum: EventType })
  eventType: EventType;

  @Prop({ required: true })
  title: string;

  @Prop()
  description?: string;

  @Prop({ type: Object })
  metadata?: {
    visitId?: string;
    documentId?: string;
    consentId?: string;
    doctorName?: string;
    department?: string;
    diagnosis?: string;
    treatment?: string;
    medications?: string[];
    testResults?: any;
    vitalSigns?: any;
    followUpDate?: Date;
    duration?: number; // in minutes
    location?: string;
    urgency?: EventPriority;
    tags?: string[];
    attachments?: string[];
  };

  @Prop({ required: true, enum: EventPriority, default: EventPriority.MEDIUM })
  priority: EventPriority;

  @Prop()
  eventDate?: Date;

  @Prop({ type: Object })
  location?: {
    type: string; // 'hospital', 'clinic', 'home', 'emergency'
    name?: string;
    address?: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
  };

  @Prop({ type: Object })
  participants?: {
    doctors?: string[];
    nurses?: string[];
    specialists?: string[];
    familyMembers?: string[];
  };

  @Prop({ type: Object })
  clinicalData?: {
    vitalSigns?: {
      bloodPressure?: string;
      heartRate?: number;
      temperature?: number;
      respiratoryRate?: number;
      oxygenSaturation?: number;
    };
    symptoms?: string[];
    diagnosis?: string[];
    treatment?: string[];
    medications?: {
      name: string;
      dosage: string;
      frequency: string;
      duration: string;
    }[];
    allergies?: string[];
    notes?: string;
  };

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  archivedAt?: Date;

  @Prop()
  archivedBy?: string;

  @Prop()
  archiveReason?: string;
}

export const TimelineEventSchema = SchemaFactory.createForClass(TimelineEvent);

// Indexes
TimelineEventSchema.index({ patientId: 1, eventDate: -1 });
TimelineEventSchema.index({ eventId: 1 }, { unique: true });
TimelineEventSchema.index({ hospitalId: 1, eventDate: -1 });
TimelineEventSchema.index({ eventType: 1 });
TimelineEventSchema.index({ priority: 1 });
TimelineEventSchema.index({ createdAt: -1 });
TimelineEventSchema.index({ 'metadata.visitId': 1 });
TimelineEventSchema.index({ 'metadata.documentId': 1 });
