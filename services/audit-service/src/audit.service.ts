import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AuditLog, AuditLogDocument, AuditEventType, AuditSeverity, AuditCategory } from './schemas/audit-log.schema';

@Injectable()
export class AuditService {
  private readonly logger = new Logger(AuditService.name);

  constructor(
    @InjectModel(AuditLog.name) private auditLogModel: Model<AuditLogDocument>,
    private eventEmitter: EventEmitter2,
  ) {}

  async createAuditLog(logData: any): Promise<AuditLog> {
    const auditLog = new this.auditLogModel({
      logId: this.generateLogId(),
      eventType: logData.eventType || AuditEventType.SYSTEM_ERROR,
      category: logData.category || AuditCategory.SYSTEM_ADMINISTRATION,
      severity: logData.severity || AuditSeverity.MEDIUM,
      timestamp: new Date(),
      userId: logData.userId || 'system',
      userType: logData.userType || 'system',
      userName: logData.userName,
      userEmail: logData.userEmail,
      sessionId: logData.sessionId,
      action: logData.action,
      resource: logData.resource,
      resourceId: logData.resourceId,
      resourceType: logData.resourceType,
      ipAddress: logData.ipAddress || 'unknown',
      userAgent: logData.userAgent,
      deviceInfo: logData.deviceInfo,
      location: logData.location,
      requestData: logData.requestData || {},
      responseData: logData.responseData || {},
      statusCode: logData.statusCode,
      errorMessage: logData.errorMessage,
      errorStack: logData.errorStack,
      metadata: logData.metadata || {},
      hospitalId: logData.hospitalId,
      patientId: logData.patientId,
      documentId: logData.documentId,
      consentId: logData.consentId,
      claimId: logData.claimId,
      isSensitive: logData.isSensitive || false,
      isComplianceRelevant: logData.isComplianceRelevant || false,
      complianceStandard: logData.complianceStandard || 'HIPAA',
      retentionPeriod: logData.retentionPeriod || 2555, // 7 years in days
      hash: this.generateHash(logData),
      isEncrypted: logData.isEncrypted || false,
      encryptionKey: logData.encryptionKey,
      isAnonymized: logData.isAnonymized || false,
      tags: logData.tags || [],
      correlationId: logData.correlationId,
      parentLogId: logData.parentLogId,
      isReplicated: logData.isReplicated || false,
      source: logData.source || 'audit-service',
      version: logData.version || '1.0',
      size: JSON.stringify(logData).length,
    });

    const saved = await auditLog.save();

    // Emit event for other services
    this.eventEmitter.emit('audit.log.created', {
      logId: saved.logId,
      eventType: saved.eventType,
      userId: saved.userId,
      severity: saved.severity,
    });

    this.logger.log(`Audit log created: ${saved.logId} - ${saved.eventType}`);
    return saved;
  }

  async getAuditLogs(query: any): Promise<{ logs: AuditLog[]; total: number }> {
    const { page = 1, limit = 20, userId, eventType, category, severity, startDate, endDate } = query;
    
    const filter: any = {};
    if (userId) filter.userId = userId;
    if (eventType) filter.eventType = eventType;
    if (category) filter.category = category;
    if (severity) filter.severity = severity;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const logs = await this.auditLogModel
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec();

    const total = await this.auditLogModel.countDocuments(filter);

    return { logs, total };
  }

  async generateComplianceReport(query: any): Promise<any> {
    const { standard = 'HIPAA', startDate, endDate, hospitalId } = query;
    
    const filter: any = {
      complianceStandard: standard,
      isComplianceRelevant: true,
    };
    
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    
    if (hospitalId) filter.hospitalId = hospitalId;

    const logs = await this.auditLogModel.find(filter).sort({ timestamp: -1 }).exec();

    // Generate compliance statistics
    const stats = {
      totalEvents: logs.length,
      byCategory: {},
      bySeverity: {},
      byEventType: {},
      timeRange: {
        start: startDate || logs[logs.length - 1]?.timestamp,
        end: endDate || logs[0]?.timestamp,
      },
      complianceScore: this.calculateComplianceScore(logs),
    };

    // Count by category
    logs.forEach(log => {
      stats.byCategory[log.category] = (stats.byCategory[log.category] || 0) + 1;
      stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;
      stats.byEventType[log.eventType] = (stats.byEventType[log.eventType] || 0) + 1;
    });

    return {
      standard,
      generatedAt: new Date(),
      stats,
      logs: logs.slice(0, 100), // Return first 100 logs for detail
    };
  }

  async exportAuditLogs(exportData: any): Promise<any> {
    const { format = 'json', startDate, endDate, filters = {} } = exportData;
    
    const filter: any = { ...filters };
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    const logs = await this.auditLogModel.find(filter).sort({ timestamp: -1 }).exec();

    if (format === 'csv') {
      return this.convertToCSV(logs);
    } else if (format === 'json') {
      return logs;
    } else {
      throw new Error(`Unsupported export format: ${format}`);
    }
  }

  async getAuditStats(query: any): Promise<any> {
    const { startDate, endDate, hospitalId } = query;
    
    const filter: any = {};
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }
    if (hospitalId) filter.hospitalId = hospitalId;

    const stats = await this.auditLogModel.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalEvents: { $sum: 1 },
          uniqueUsers: { $addToSet: '$userId' },
          byCategory: { $push: '$category' },
          bySeverity: { $push: '$severity' },
          byEventType: { $push: '$eventType' },
          avgResponseTime: { $avg: '$responseData.responseTime' },
        },
      },
    ]);

    const result = stats[0] || { totalEvents: 0, uniqueUsers: [], byCategory: [], bySeverity: [], byEventType: [], avgResponseTime: 0 };

    return {
      totalEvents: result.totalEvents,
      uniqueUsers: result.uniqueUsers.length,
      categoryDistribution: this.countOccurrences(result.byCategory),
      severityDistribution: this.countOccurrences(result.bySeverity),
      eventTypeDistribution: this.countOccurrences(result.byEventType),
      avgResponseTime: result.avgResponseTime,
      generatedAt: new Date(),
    };
  }

  async getUserActivity(userId: string, query: any): Promise<AuditLog[]> {
    const { startDate, endDate, limit = 50 } = query;
    
    const filter: any = { userId };
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    return this.auditLogModel
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(limit)
      .exec();
  }

  async getSecurityEvents(query: any): Promise<AuditLog[]> {
    const { startDate, endDate, severity } = query;
    
    const filter: any = {
      category: AuditCategory.SECURITY,
    };
    
    if (severity) filter.severity = severity;
    if (startDate || endDate) {
      filter.timestamp = {};
      if (startDate) filter.timestamp.$gte = new Date(startDate);
      if (endDate) filter.timestamp.$lte = new Date(endDate);
    }

    return this.auditLogModel
      .find(filter)
      .sort({ timestamp: -1 })
      .limit(100)
      .exec();
  }

  private generateLogId(): string {
    return `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateHash(data: any): string {
    // Simple hash generation - in production, use proper cryptographic hash
    const crypto = require('crypto');
    return crypto.createHash('sha256').update(JSON.stringify(data)).digest('hex');
  }

  private calculateComplianceScore(logs: AuditLog[]): number {
    if (logs.length === 0) return 100;
    
    const errorCount = logs.filter(log => log.severity === AuditSeverity.HIGH || log.severity === AuditSeverity.CRITICAL).length;
    const totalCount = logs.length;
    
    return Math.max(0, Math.round(((totalCount - errorCount) / totalCount) * 100));
  }

  private countOccurrences(array: string[]): Record<string, number> {
    return array.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});
  }

  private convertToCSV(logs: AuditLog[]): string {
    if (logs.length === 0) return '';
    
    const headers = Object.keys(logs[0] as any);
    const csvContent = [
      headers.join(','),
      ...logs.map(log => 
        headers.map(header => {
          const value = (log as any)[header];
          return typeof value === 'object' ? JSON.stringify(value) : value;
        }).join(',')
      )
    ].join('\n');
    
    return csvContent;
  }
}
