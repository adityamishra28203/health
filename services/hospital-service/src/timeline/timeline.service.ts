import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { TimelineEvent, TimelineEventDocument, EventType, EventPriority } from '../schemas/timeline.schema';
import { ConsentService } from '../consent/consent.service';
import { ConsentType } from '../schemas/consent.schema';
import { v4 as uuidv4 } from 'uuid';

export interface TimelineEventDto {
  patientId: string;
  eventType: EventType;
  title: string;
  description?: string;
  priority?: EventPriority;
  eventDate?: Date;
  metadata?: any;
  location?: any;
  participants?: any;
  clinicalData?: any;
}

export interface TimelineEventResponseDto {
  eventId: string;
  patientId: string;
  hospitalId: string;
  createdBy: string;
  eventType: EventType;
  title: string;
  description?: string;
  priority: EventPriority;
  eventDate?: Date;
  location?: any;
  participants?: any;
  clinicalData?: any;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface PatientTimelineResponse {
  patientId: string;
  events: TimelineEventResponseDto[];
  total: number;
  hasMore: boolean;
}

@Injectable()
export class TimelineService {
  constructor(
    @InjectModel(TimelineEvent.name) private timelineModel: Model<TimelineEventDocument>,
    private consentService: ConsentService,
  ) {}

  async createEvent(
    hospitalId: string,
    createdBy: string,
    eventData: TimelineEventDto
  ): Promise<TimelineEventResponseDto> {
    // Check if hospital has consent to create timeline events for this patient
    const consentCheck = await this.consentService.checkConsent(
      eventData.patientId,
      hospitalId,
      ConsentType.UPLOAD_RECORDS
    );

    if (!consentCheck.hasConsent) {
      throw new BadRequestException('No consent to create timeline events for this patient');
    }

    const eventId = uuidv4();

    const event = new this.timelineModel({
      eventId,
      patientId: eventData.patientId,
      hospitalId,
      createdBy,
      eventType: eventData.eventType,
      title: eventData.title,
      description: eventData.description,
      priority: eventData.priority || EventPriority.MEDIUM,
      eventDate: eventData.eventDate || new Date(),
      location: eventData.location,
      participants: eventData.participants,
      clinicalData: eventData.clinicalData,
      metadata: eventData.metadata,
    });

    const savedEvent = await event.save();

    // TODO: Emit timeline.event.created event

    return this.mapToResponseDto(savedEvent);
  }

  async getPatientTimeline(
    patientId: string,
    hospitalId: string,
    requestedBy: string,
    eventType?: EventType,
    priority?: EventPriority,
    startDate?: Date,
    endDate?: Date,
    limit: number = 50,
    offset: number = 0
  ): Promise<PatientTimelineResponse> {
    // Check if hospital has consent to view patient timeline
    const consentCheck = await this.consentService.checkConsent(
      patientId,
      hospitalId,
      ConsentType.VIEW_RECORDS
    );

    if (!consentCheck.hasConsent) {
      throw new BadRequestException('No consent to view patient timeline');
    }

    const query: any = { 
      patientId, 
      hospitalId, 
      isActive: true 
    };

    if (eventType) {
      query.eventType = eventType;
    }

    if (priority) {
      query.priority = priority;
    }

    if (startDate || endDate) {
      query.eventDate = {};
      if (startDate) {
        query.eventDate.$gte = startDate;
      }
      if (endDate) {
        query.eventDate.$lte = endDate;
      }
    }

    const [events, total] = await Promise.all([
      this.timelineModel
        .find(query)
        .sort({ eventDate: -1, createdAt: -1 })
        .limit(limit)
        .skip(offset),
      this.timelineModel.countDocuments(query),
    ]);

    return {
      patientId,
      events: events.map(event => this.mapToResponseDto(event)),
      total,
      hasMore: offset + events.length < total,
    };
  }

  async getEvent(
    eventId: string,
    requestedBy: string,
    hospitalId?: string
  ): Promise<TimelineEventResponseDto> {
    const query: any = { eventId, isActive: true };
    if (hospitalId) {
      query.hospitalId = hospitalId;
    }

    const event = await this.timelineModel.findOne(query);

    if (!event) {
      throw new NotFoundException('Timeline event not found');
    }

    // Check consent for viewing
    const consentCheck = await this.consentService.checkConsent(
      event.patientId,
      event.hospitalId,
      ConsentType.VIEW_RECORDS
    );

    if (!consentCheck.hasConsent) {
      throw new BadRequestException('No consent to view this timeline event');
    }

    return this.mapToResponseDto(event);
  }

  async updateEvent(
    eventId: string,
    updatedBy: string,
    updateData: Partial<TimelineEventDto>,
    hospitalId?: string
  ): Promise<TimelineEventResponseDto> {
    const query: any = { eventId, isActive: true };
    if (hospitalId) {
      query.hospitalId = hospitalId;
    }

    const event = await this.timelineModel.findOne(query);

    if (!event) {
      throw new NotFoundException('Timeline event not found');
    }

    // Check consent for updating
    const consentCheck = await this.consentService.checkConsent(
      event.patientId,
      event.hospitalId,
      ConsentType.UPLOAD_RECORDS
    );

    if (!consentCheck.hasConsent) {
      throw new BadRequestException('No consent to update timeline events for this patient');
    }

    // Update allowed fields
    if (updateData.title) event.title = updateData.title;
    if (updateData.description !== undefined) event.description = updateData.description;
    if (updateData.priority) event.priority = updateData.priority;
    if (updateData.eventDate) event.eventDate = updateData.eventDate;
    if (updateData.metadata) event.metadata = { ...event.metadata, ...updateData.metadata };
    if (updateData.location) event.location = updateData.location;
    if (updateData.participants) event.participants = updateData.participants;
    if (updateData.clinicalData) event.clinicalData = updateData.clinicalData;

    const updatedEvent = await event.save();

    // TODO: Emit timeline.event.updated event

    return this.mapToResponseDto(updatedEvent);
  }

  async deleteEvent(
    eventId: string,
    deletedBy: string,
    reason?: string,
    hospitalId?: string
  ): Promise<void> {
    const query: any = { eventId, isActive: true };
    if (hospitalId) {
      query.hospitalId = hospitalId;
    }

    const event = await this.timelineModel.findOne(query);

    if (!event) {
      throw new NotFoundException('Timeline event not found');
    }

    // Check consent for deleting
    const consentCheck = await this.consentService.checkConsent(
      event.patientId,
      event.hospitalId,
      ConsentType.UPLOAD_RECORDS
    );

    if (!consentCheck.hasConsent) {
      throw new BadRequestException('No consent to delete timeline events for this patient');
    }

    event.isActive = false;
    event.archivedAt = new Date();
    event.archivedBy = deletedBy;
    event.archiveReason = reason;

    await event.save();

    // TODO: Emit timeline.event.deleted event
  }

  async getHospitalTimeline(
    hospitalId: string,
    eventType?: EventType,
    priority?: EventPriority,
    startDate?: Date,
    endDate?: Date,
    limit: number = 50,
    offset: number = 0
  ): Promise<{ events: TimelineEventResponseDto[]; total: number }> {
    const query: any = { hospitalId, isActive: true };

    if (eventType) {
      query.eventType = eventType;
    }

    if (priority) {
      query.priority = priority;
    }

    if (startDate || endDate) {
      query.eventDate = {};
      if (startDate) {
        query.eventDate.$gte = startDate;
      }
      if (endDate) {
        query.eventDate.$lte = endDate;
      }
    }

    const [events, total] = await Promise.all([
      this.timelineModel
        .find(query)
        .sort({ eventDate: -1, createdAt: -1 })
        .limit(limit)
        .skip(offset),
      this.timelineModel.countDocuments(query),
    ]);

    return {
      events: events.map(event => this.mapToResponseDto(event)),
      total,
    };
  }

  async getEventStats(
    hospitalId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any> {
    const query: any = { hospitalId, isActive: true };

    if (startDate || endDate) {
      query.eventDate = {};
      if (startDate) {
        query.eventDate.$gte = startDate;
      }
      if (endDate) {
        query.eventDate.$lte = endDate;
      }
    }

    const stats = await this.timelineModel.aggregate([
      { $match: query },
      {
        $group: {
          _id: '$eventType',
          count: { $sum: 1 },
          avgPriority: { $avg: { $cond: [{ $eq: ['$priority', 'high'] }, 3, { $cond: [{ $eq: ['$priority', 'medium'] }, 2, 1] }] } }
        }
      },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: '$count' },
          eventTypes: { $push: { type: '$_id', count: '$count', avgPriority: '$avgPriority' } }
        }
      }
    ]);

    return stats[0] || { totalEvents: 0, eventTypes: [] };
  }

  async createVisitEvent(
    hospitalId: string,
    createdBy: string,
    patientId: string,
    visitData: {
      visitId: string;
      doctorName: string;
      department: string;
      diagnosis?: string;
      treatment?: string;
      vitalSigns?: any;
      medications?: any[];
      followUpDate?: Date;
    }
  ): Promise<TimelineEventResponseDto> {
    return this.createEvent(hospitalId, createdBy, {
      patientId,
      eventType: EventType.VISIT,
      title: `Visit - ${visitData.doctorName}`,
      description: `Consultation with ${visitData.doctorName} in ${visitData.department}`,
      priority: EventPriority.MEDIUM,
      metadata: {
        visitId: visitData.visitId,
        doctorName: visitData.doctorName,
        department: visitData.department,
        diagnosis: visitData.diagnosis,
        treatment: visitData.treatment,
        followUpDate: visitData.followUpDate,
      },
      clinicalData: {
        vitalSigns: visitData.vitalSigns,
        medications: visitData.medications,
      },
    });
  }

  private mapToResponseDto(event: TimelineEventDocument): TimelineEventResponseDto {
    return {
      eventId: event.eventId,
      patientId: event.patientId,
      hospitalId: event.hospitalId,
      createdBy: event.createdBy,
      eventType: event.eventType,
      title: event.title,
      description: event.description,
      priority: event.priority,
      eventDate: event.eventDate,
      location: event.location,
      participants: event.participants,
      clinicalData: event.clinicalData,
      metadata: event.metadata,
      createdAt: event.createdAt,
      updatedAt: event.updatedAt,
    };
  }
}
