import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Consent, ConsentDocument, ConsentStatus } from './schemas/consent.schema';

@Injectable()
export class ConsentService {
  private readonly logger = new Logger(ConsentService.name);

  constructor(
    @InjectModel(Consent.name) private consentModel: Model<ConsentDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async requestConsent(requestData: any): Promise<Consent> {
    const consent = new this.consentModel({
      consentId: this.generateConsentId(),
      patientId: requestData.patientId,
      hospitalId: requestData.hospitalId,
      requesterId: requestData.requesterId,
      type: requestData.type,
      scope: requestData.scope,
      title: requestData.title,
      description: requestData.description,
      documentIds: requestData.documentIds || [],
      documentTypes: requestData.documentTypes || [],
      timePeriodStart: requestData.timePeriodStart,
      timePeriodEnd: requestData.timePeriodEnd,
      requestedAt: new Date(),
      status: ConsentStatus.PENDING,
      hospitalRequest: requestData.hospitalRequest || {},
      isRevocable: requestData.isRevocable !== false,
      requiresSignature: requestData.requiresSignature || false,
      complianceStandard: requestData.complianceStandard || 'HIPAA',
    });

    const saved = await consent.save();
    
    // Emit event for notification service
    this.eventEmitter.emit('consent.requested', {
      consentId: saved.consentId,
      patientId: saved.patientId,
      hospitalId: saved.hospitalId,
      type: saved.type,
      scope: saved.scope,
    });

    this.logger.log(`Consent request created: ${saved.consentId}`);
    return saved;
  }

  async respondToConsent(consentId: string, responseData: any): Promise<Consent> {
    const consent = await this.consentModel.findOne({ consentId });
    if (!consent) {
      throw new Error('Consent not found');
    }

    consent.patientResponse = {
      decision: responseData.decision,
      timestamp: new Date(),
      ipAddress: responseData.ipAddress || 'unknown',
      userAgent: responseData.userAgent || 'unknown',
      signature: responseData.signature,
      notes: responseData.notes,
    };

    consent.status = responseData.decision === 'granted' ? ConsentStatus.GRANTED : ConsentStatus.DENIED;
    consent.respondedAt = new Date();

    const updated = await consent.save();

    // Emit event based on decision
    if (responseData.decision === 'granted') {
      this.eventEmitter.emit('consent.granted', {
        consentId: updated.consentId,
        patientId: updated.patientId,
        hospitalId: updated.hospitalId,
        documentIds: updated.documentIds,
      });
    } else {
      this.eventEmitter.emit('consent.denied', {
        consentId: updated.consentId,
        patientId: updated.patientId,
        hospitalId: updated.hospitalId,
      });
    }

    this.logger.log(`Consent response recorded: ${updated.consentId} - ${responseData.decision}`);
    return updated;
  }

  async getConsentHistory(patientId: string): Promise<Consent[]> {
    return this.consentModel.find({ patientId }).sort({ requestedAt: -1 }).exec();
  }

  async getConsent(consentId: string): Promise<Consent> {
    return this.consentModel.findOne({ consentId }).exec();
  }

  async revokeConsent(consentId: string, revocationData: any): Promise<Consent> {
    const consent = await this.consentModel.findOne({ consentId });
    if (!consent) {
      throw new Error('Consent not found');
    }

    consent.status = ConsentStatus.REVOKED;
    consent.revokedAt = new Date();
    consent.revocationReason = revocationData.reason;

    const updated = await consent.save();

    // Emit revocation event
    this.eventEmitter.emit('consent.revoked', {
      consentId: updated.consentId,
      patientId: updated.patientId,
      hospitalId: updated.hospitalId,
      reason: revocationData.reason,
    });

    this.logger.log(`Consent revoked: ${updated.consentId}`);
    return updated;
  }

  async getActiveConsents(patientId: string, hospitalId?: string): Promise<Consent[]> {
    const filter: any = {
      patientId,
      status: ConsentStatus.GRANTED,
      isActive: true,
    };

    if (hospitalId) {
      filter.hospitalId = hospitalId;
    }

    return this.consentModel.find(filter).exec();
  }

  async checkConsent(patientId: string, hospitalId: string, documentId?: string): Promise<boolean> {
    const consents = await this.getActiveConsents(patientId, hospitalId);
    
    for (const consent of consents) {
      if (consent.scope === 'all_documents') {
        return true;
      }
      
      if (consent.scope === 'single_document' && documentId && consent.documentIds.includes(documentId)) {
        return true;
      }
      
      if (consent.scope === 'document_type' && documentId) {
        // This would need to check document type - simplified for now
        return true;
      }
    }
    
    return false;
  }

  private generateConsentId(): string {
    return `consent_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}


