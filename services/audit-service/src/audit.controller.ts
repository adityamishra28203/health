import { Controller, Get, Post, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuditService } from './audit.service';

@ApiTags('audit')
@Controller('api/v1/audit')
export class AuditController {
  constructor(private readonly auditService: AuditService) {}

  @Post('log')
  @ApiOperation({ summary: 'Create audit log entry' })
  @ApiResponse({ status: 201, description: 'Audit log created successfully' })
  async createLog(@Body() logData: any) {
    return this.auditService.createAuditLog(logData);
  }

  @Get('logs')
  @ApiOperation({ summary: 'Get audit logs with filters' })
  @ApiResponse({ status: 200, description: 'Audit logs retrieved successfully' })
  async getLogs(@Query() query: any) {
    return this.auditService.getAuditLogs(query);
  }

  @Get('compliance-report')
  @ApiOperation({ summary: 'Generate compliance report' })
  @ApiResponse({ status: 200, description: 'Compliance report generated successfully' })
  async getComplianceReport(@Query() query: any) {
    return this.auditService.generateComplianceReport(query);
  }

  @Post('export')
  @ApiOperation({ summary: 'Export audit logs' })
  @ApiResponse({ status: 200, description: 'Audit logs exported successfully' })
  async exportLogs(@Body() exportData: any) {
    return this.auditService.exportAuditLogs(exportData);
  }

  @Get('stats')
  @ApiOperation({ summary: 'Get audit statistics' })
  @ApiResponse({ status: 200, description: 'Audit statistics retrieved successfully' })
  async getStats(@Query() query: any) {
    return this.auditService.getAuditStats(query);
  }

  @Get('user/:userId/activity')
  @ApiOperation({ summary: 'Get user activity logs' })
  @ApiResponse({ status: 200, description: 'User activity logs retrieved successfully' })
  async getUserActivity(@Param('userId') userId: string, @Query() query: any) {
    return this.auditService.getUserActivity(userId, query);
  }

  @Get('security/events')
  @ApiOperation({ summary: 'Get security events' })
  @ApiResponse({ status: 200, description: 'Security events retrieved successfully' })
  async getSecurityEvents(@Query() query: any) {
    return this.auditService.getSecurityEvents(query);
  }
}


