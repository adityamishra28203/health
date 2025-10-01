import { Controller, Get, Post, Put, Body, Param, Query, UseGuards, Request, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBearerAuth } from '@nestjs/swagger';
import { HospitalSimpleService } from './hospital-simple.service';
import { RBACService } from './rbac/rbac.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RBACGuard } from './guards/rbac.guard';
import { HospitalRegistrationRequest, HospitalUserCreationRequest, PatientSearchRequest } from './dto/hospital.dto';

@ApiTags('hospitals')
@ApiBearerAuth()
@Controller('hospitals')
@UseGuards(JwtAuthGuard)
export class HospitalController {
  constructor(
    private readonly hospitalService: HospitalSimpleService,
    private readonly rbacService: RBACService,
  ) {}

  @Get('health')
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  async healthCheck() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      service: 'hospital-service',
      version: '1.0.0'
    };
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register new hospital' })
  @ApiResponse({ status: 201, description: 'Hospital registered successfully' })
  @ApiResponse({ status: 409, description: 'Hospital already exists' })
  async registerHospital(@Body() request: HospitalRegistrationRequest) {
    return this.hospitalService.registerHospital(request);
  }

  @Get()
  @ApiOperation({ summary: 'Get hospitals by tenant (admin only)' })
  @ApiResponse({ status: 200, description: 'List of hospitals' })
  @UseGuards(RBACGuard)
  async getHospitals(@Request() req: any, @Query('page') page?: number, @Query('limit') limit?: number) {
    return this.hospitalService.getHospitals(req.user.tenantId, page || 1, limit || 20);
  }

  @Get(':hospitalId')
  @ApiOperation({ summary: 'Get hospital details' })
  @ApiResponse({ status: 200, description: 'Hospital details' })
  @ApiResponse({ status: 404, description: 'Hospital not found' })
  @ApiParam({ name: 'hospitalId', description: 'Hospital ID' })
  @UseGuards(RBACGuard)
  async getHospital(@Param('hospitalId') hospitalId: string, @Request() req: any) {
    return this.hospitalService.getHospital(hospitalId);
  }

  @Put(':hospitalId/verify')
  @ApiOperation({ summary: 'Verify hospital' })
  @ApiResponse({ status: 200, description: 'Hospital verified successfully' })
  @ApiParam({ name: 'hospitalId', description: 'Hospital ID' })
  @UseGuards(RBACGuard)
  async verifyHospital(
    @Param('hospitalId') hospitalId: string,
    @Body() body: { certificateId?: string },
    @Request() req: any,
  ) {
    return this.hospitalService.verifyHospital(hospitalId, body.certificateId);
  }

  @Put(':hospitalId/suspend')
  @ApiOperation({ summary: 'Suspend hospital' })
  @ApiResponse({ status: 200, description: 'Hospital suspended successfully' })
  @ApiParam({ name: 'hospitalId', description: 'Hospital ID' })
  @UseGuards(RBACGuard)
  async suspendHospital(
    @Param('hospitalId') hospitalId: string,
    @Body() body: { reason: string },
    @Request() req: any,
  ) {
    return this.hospitalService.suspendHospital(hospitalId, body.reason, req.user.userId);
  }

  @Get(':hospitalId/users')
  @ApiOperation({ summary: 'Get hospital users' })
  @ApiResponse({ status: 200, description: 'List of hospital users' })
  @ApiParam({ name: 'hospitalId', description: 'Hospital ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'role', required: false })
  @ApiQuery({ name: 'status', required: false })
  @UseGuards(RBACGuard)
  async getHospitalUsers(
    @Param('hospitalId') hospitalId: string,
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('role') role?: string,
    @Query('status') status?: string,
  ) {
    await this.rbacService.authorize(req.user.userId, hospitalId, 'users', 'read');
    return this.hospitalService.getHospitalUsers(hospitalId, page || 1, limit || 20, role as any, status as any);
  }

  @Post(':hospitalId/users')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create hospital user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  @ApiParam({ name: 'hospitalId', description: 'Hospital ID' })
  @UseGuards(RBACGuard)
  async createHospitalUser(
    @Param('hospitalId') hospitalId: string,
    @Body() request: HospitalUserCreationRequest,
    @Request() req: any,
  ) {
    await this.rbacService.authorize(req.user.userId, hospitalId, 'users', 'write');
    return this.hospitalService.createHospitalUser(hospitalId, request, req.user.userId);
  }

  @Post(':hospitalId/patients/search')
  @ApiOperation({ summary: 'Search patients' })
  @ApiResponse({ status: 200, description: 'Patient search results' })
  @ApiParam({ name: 'hospitalId', description: 'Hospital ID' })
  @UseGuards(RBACGuard)
  async searchPatients(
    @Param('hospitalId') hospitalId: string,
    @Body() searchRequest: PatientSearchRequest,
    @Request() req: any,
  ) {
    await this.rbacService.authorize(req.user.userId, hospitalId, 'patients', 'read');
    return this.hospitalService.searchPatients(hospitalId, searchRequest);
  }

  @Post(':hospitalId/patients/:patientId/link')
  @ApiOperation({ summary: 'Link patient to hospital' })
  @ApiResponse({ status: 200, description: 'Patient linked successfully' })
  @ApiParam({ name: 'hospitalId', description: 'Hospital ID' })
  @ApiParam({ name: 'patientId', description: 'Patient ID' })
  @UseGuards(RBACGuard)
  async linkPatient(
    @Param('hospitalId') hospitalId: string,
    @Param('patientId') patientId: string,
    @Body() body: { abhaId: string; patientInfo: any; linkType?: string },
    @Request() req: any,
  ) {
    await this.rbacService.authorize(req.user.userId, hospitalId, 'patients', 'link');
    return this.hospitalService.linkPatient(hospitalId, patientId, body.abhaId, body.patientInfo, body.linkType, req.user.userId);
  }

  @Get(':hospitalId/stats')
  @ApiOperation({ summary: 'Get hospital statistics' })
  @ApiResponse({ status: 200, description: 'Hospital statistics' })
  @ApiParam({ name: 'hospitalId', description: 'Hospital ID' })
  @UseGuards(RBACGuard)
  async getHospitalStats(@Param('hospitalId') hospitalId: string, @Request() req: any) {
    await this.rbacService.authorize(req.user.userId, hospitalId, 'hospital', 'read');
    return this.hospitalService.getHospitalStats(hospitalId);
  }

  @Put(':hospitalId/settings')
  @ApiOperation({ summary: 'Update hospital settings' })
  @ApiResponse({ status: 200, description: 'Settings updated successfully' })
  @ApiParam({ name: 'hospitalId', description: 'Hospital ID' })
  @UseGuards(RBACGuard)
  async updateHospitalSettings(
    @Param('hospitalId') hospitalId: string,
    @Body() settings: any,
    @Request() req: any,
  ) {
    await this.rbacService.authorize(req.user.userId, hospitalId, 'settings', 'write');
    return this.hospitalService.updateHospitalSettings(hospitalId, settings, req.user.userId);
  }

  @Get(':hospitalId/patients')
  @ApiOperation({ summary: 'Get linked patients' })
  @ApiResponse({ status: 200, description: 'List of linked patients' })
  @ApiParam({ name: 'hospitalId', description: 'Hospital ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'status', required: false })
  @UseGuards(RBACGuard)
  async getLinkedPatients(
    @Param('hospitalId') hospitalId: string,
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('status') status?: string,
  ) {
    await this.rbacService.authorize(req.user.userId, hospitalId, 'patients', 'read');
    return this.hospitalService.getLinkedPatients(hospitalId, page || 1, limit || 20, status as any);
  }

  @Get(':hospitalId/documents')
  @ApiOperation({ summary: 'Get hospital documents' })
  @ApiResponse({ status: 200, description: 'List of documents' })
  @ApiParam({ name: 'hospitalId', description: 'Hospital ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'documentType', required: false })
  @ApiQuery({ name: 'status', required: false })
  @UseGuards(RBACGuard)
  async getHospitalDocuments(
    @Param('hospitalId') hospitalId: string,
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('documentType') documentType?: string,
    @Query('status') status?: string,
  ) {
    await this.rbacService.authorize(req.user.userId, hospitalId, 'documents', 'read');
    return this.hospitalService.getHospitalDocuments(hospitalId, page || 1, limit || 20, documentType, status as any);
  }

  @Post(':hospitalId/documents')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Upload document' })
  @ApiResponse({ status: 201, description: 'Document uploaded successfully' })
  @ApiParam({ name: 'hospitalId', description: 'Hospital ID' })
  @UseGuards(RBACGuard)
  async uploadDocument(
    @Param('hospitalId') hospitalId: string,
    @Body() body: { patientId: string; documentType: string; metadata?: any },
    @Request() req: any,
  ) {
    await this.rbacService.authorize(req.user.userId, hospitalId, 'documents', 'write');
    return this.hospitalService.uploadDocument(hospitalId, body.patientId, body.documentType, body.metadata);
  }

  @Get(':hospitalId/audit')
  @ApiOperation({ summary: 'Get audit logs' })
  @ApiResponse({ status: 200, description: 'Audit logs' })
  @ApiParam({ name: 'hospitalId', description: 'Hospital ID' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @ApiQuery({ name: 'action', required: false })
  @UseGuards(RBACGuard)
  async getAuditLogs(
    @Param('hospitalId') hospitalId: string,
    @Request() req: any,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('action') action?: string,
  ) {
    await this.rbacService.authorize(req.user.userId, hospitalId, 'audit', 'read');
    return this.hospitalService.getAuditLogs(hospitalId, page || 1, limit || 20, startDate, endDate, action);
  }

  @Get(':hospitalId/reports')
  @ApiOperation({ summary: 'Get hospital reports' })
  @ApiResponse({ status: 200, description: 'Hospital reports' })
  @ApiParam({ name: 'hospitalId', description: 'Hospital ID' })
  @ApiQuery({ name: 'type', required: false })
  @ApiQuery({ name: 'period', required: false })
  @ApiQuery({ name: 'startDate', required: false })
  @ApiQuery({ name: 'endDate', required: false })
  @UseGuards(RBACGuard)
  async getHospitalReports(
    @Param('hospitalId') hospitalId: string,
    @Request() req: any,
    @Query('type') type?: string,
    @Query('period') period?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    await this.rbacService.authorize(req.user.userId, hospitalId, 'reports', 'read');
    return this.hospitalService.getHospitalReports(hospitalId, type, period, startDate, endDate);
  }
}