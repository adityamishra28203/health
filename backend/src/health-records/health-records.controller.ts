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

import { HealthRecordsService } from './health-records.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateHealthRecordDto, UpdateHealthRecordDto } from './dto/health-record.dto';

@ApiTags('Health Records')
@Controller('health-records')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HealthRecordsController {
  constructor(private readonly healthRecordsService: HealthRecordsService) {}

  @Post()
  @ApiOperation({ summary: 'Create health record' })
  @ApiResponse({ status: 201, description: 'Health record created successfully' })
  async create(@Body() createHealthRecordDto: CreateHealthRecordDto, @Request() req) {
    return this.healthRecordsService.create({
      ...createHealthRecordDto,
      patientId: req.user.sub,
    });
  }

  @Get()
  @ApiOperation({ summary: 'Get all health records for patient' })
  @ApiResponse({ status: 200, description: 'Health records retrieved successfully' })
  async findAll(
    @Request() req,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.healthRecordsService.findAll(req.user.sub, page, limit);
  }

  @Get('search')
  @ApiOperation({ summary: 'Search health records' })
  @ApiResponse({ status: 200, description: 'Search results' })
  async searchRecords(
    @Request() req,
    @Query('q') searchTerm: string,
  ) {
    return this.healthRecordsService.searchRecords(req.user.sub, searchTerm);
  }

  @Get('by-type/:type')
  @ApiOperation({ summary: 'Get records by type' })
  @ApiResponse({ status: 200, description: 'Records retrieved successfully' })
  async getRecordsByType(
    @Request() req,
    @Param('type') type: string,
  ) {
    return this.healthRecordsService.getRecordsByType(req.user.sub, type as any);
  }

  @Get('by-status/:status')
  @ApiOperation({ summary: 'Get records by status' })
  @ApiResponse({ status: 200, description: 'Records retrieved successfully' })
  async getRecordsByStatus(
    @Request() req,
    @Param('status') status: string,
  ) {
    return this.healthRecordsService.getRecordsByStatus(req.user.sub, status as any);
  }

  @Get('statistics')
  @ApiOperation({ summary: 'Get health records statistics' })
  @ApiResponse({ status: 200, description: 'Statistics retrieved successfully' })
  async getStatistics(@Request() req) {
    return this.healthRecordsService.getStatistics(req.user.sub);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get health record by ID' })
  @ApiResponse({ status: 200, description: 'Health record retrieved successfully' })
  @ApiResponse({ status: 404, description: 'Health record not found' })
  async findOne(@Param('id') id: string) {
    return this.healthRecordsService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update health record' })
  @ApiResponse({ status: 200, description: 'Health record updated successfully' })
  @ApiResponse({ status: 404, description: 'Health record not found' })
  async update(
    @Param('id') id: string,
    @Body() updateHealthRecordDto: UpdateHealthRecordDto,
  ) {
    return this.healthRecordsService.update(id, updateHealthRecordDto);
  }

  @Post(':id/verify')
  @ApiOperation({ summary: 'Verify health record' })
  @ApiResponse({ status: 200, description: 'Health record verified successfully' })
  @ApiResponse({ status: 404, description: 'Health record not found' })
  async verifyRecord(
    @Param('id') id: string,
    @Body() body: { signature: string },
    @Request() req,
  ) {
    return this.healthRecordsService.verifyRecord(id, req.user.sub, body.signature);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete health record' })
  @ApiResponse({ status: 200, description: 'Health record deleted successfully' })
  @ApiResponse({ status: 404, description: 'Health record not found' })
  async remove(@Param('id') id: string) {
    await this.healthRecordsService.remove(id);
    return { message: 'Health record deleted successfully' };
  }
}
