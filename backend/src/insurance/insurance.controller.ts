import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

import { InsuranceService } from './insurance.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateInsuranceClaimDto, UpdateInsuranceClaimDto } from './dto/insurance.dto';

@ApiTags('Insurance')
@Controller('insurance')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class InsuranceController {
  constructor(private readonly insuranceService: InsuranceService) {}

  @Post('claims')
  @ApiOperation({ summary: 'Create insurance claim' })
  @ApiResponse({ status: 201, description: 'Insurance claim created successfully' })
  async create(@Body() createClaimDto: CreateInsuranceClaimDto, @Request() req) {
    return this.insuranceService.create({
      ...createClaimDto,
      patientId: req.user.sub,
    });
  }

  @Get('claims')
  @ApiOperation({ summary: 'Get all insurance claims for patient' })
  @ApiResponse({ status: 200, description: 'Insurance claims retrieved successfully' })
  async findAll(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.insuranceService.findAll(req.user.sub, page, limit);
  }

  @Get('claims/statistics')
  @ApiOperation({ summary: 'Get insurance claims statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStatistics(@Request() req) {
    return this.insuranceService.getStatistics(req.user.sub);
  }

  @Get('claims/by-status/:status')
  @ApiOperation({ summary: 'Get claims by status' })
  @ApiResponse({ status: 200, description: 'Claims retrieved successfully' })
  async getClaimsByStatus(
    @Request() req,
    @Param('status') status: string,
  ) {
    return this.insuranceService.getClaimsByStatus(req.user.sub, status as any);
  }

  @Get('claims/by-type/:type')
  @ApiOperation({ summary: 'Get claims by type' })
  @ApiResponse({ status: 200, description: 'Claims retrieved successfully' })
  async getClaimsByType(
    @Request() req,
    @Param('type') type: string,
  ) {
    return this.insuranceService.getClaimsByType(req.user.sub, type as any);
  }

  @Get('claims/:id')
  @ApiOperation({ summary: 'Get insurance claim by ID' })
  @ApiResponse({ status: 200, description: 'Insurance claim retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Insurance claim not found' })
  async findOne(@Param('id') id: string) {
    return this.insuranceService.findOne(id);
  }

  @Patch('claims/:id')
  @ApiOperation({ summary: 'Update insurance claim' })
  @ApiResponse({ status: 200, description: 'Insurance claim updated successfully' })
  @ApiResponse({ status: 404, description: 'Insurance claim not found' })
  async update(
    @Param('id') id: string,
    @Body() updateClaimDto: UpdateInsuranceClaimDto,
  ) {
    return this.insuranceService.update(id, updateClaimDto);
  }

  @Post('claims/:id/submit')
  @ApiOperation({ summary: 'Submit insurance claim' })
  @ApiResponse({ status: 200, description: 'Insurance claim submitted successfully' })
  @ApiResponse({ status: 404, description: 'Insurance claim not found' })
  async submitClaim(@Param('id') id: string) {
    return this.insuranceService.submitClaim(id);
  }

  @Post('claims/:id/approve')
  @ApiOperation({ summary: 'Approve insurance claim' })
  @ApiResponse({ status: 200, description: 'Insurance claim approved successfully' })
  @ApiResponse({ status: 404, description: 'Insurance claim not found' })
  async approveClaim(
    @Param('id') id: string,
    @Body() body: { approvedAmount: number },
  ) {
    return this.insuranceService.approveClaim(id, body.approvedAmount);
  }

  @Post('claims/:id/reject')
  @ApiOperation({ summary: 'Reject insurance claim' })
  @ApiResponse({ status: 200, description: 'Insurance claim rejected successfully' })
  @ApiResponse({ status: 404, description: 'Insurance claim not found' })
  async rejectClaim(
    @Param('id') id: string,
    @Body() body: { rejectionReason: string },
  ) {
    return this.insuranceService.rejectClaim(id, body.rejectionReason);
  }

  @Delete('claims/:id')
  @ApiOperation({ summary: 'Delete insurance claim' })
  @ApiResponse({ status: 200, description: 'Insurance claim deleted successfully' })
  @ApiResponse({ status: 404, description: 'Insurance claim not found' })
  async remove(@Param('id') id: string) {
    await this.insuranceService.remove(id);
    return { message: 'Insurance claim deleted successfully' };
  }
}
