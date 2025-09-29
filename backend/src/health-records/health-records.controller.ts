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
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Multer } from 'multer';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';

import { HealthRecordsService } from './health-records.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CreateHealthRecordDto, UpdateHealthRecordDto } from './dto/health-record.dto';
import { FileStorageService } from '../file-storage/file-storage.service';

@ApiTags('Health Records')
@Controller('health-records')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class HealthRecordsController {
  constructor(
    private readonly healthRecordsService: HealthRecordsService,
    private readonly fileStorageService: FileStorageService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create health record' })
  @ApiResponse({ status: 201, description: 'Health record created successfully' })
  async create(@Body() createHealthRecordDto: CreateHealthRecordDto, @Request() req) {
    return this.healthRecordsService.create({
      ...createHealthRecordDto,
      patientId: req.user.sub,
    });
  }

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB limit for health documents
    },
    fileFilter: (req, file, cb) => {
      // Allow common health document formats
      const allowedMimes = [
        'application/pdf',
        'image/jpeg',
        'image/png',
        'image/tiff',
        'application/dicom',
        'text/plain'
      ];
      
      if (allowedMimes.includes(file.mimetype)) {
        cb(null, true);
      } else {
        cb(new BadRequestException('File type not allowed. Only PDF, images, DICOM, and text files are accepted.'), false);
      }
    },
  }))
  @ApiOperation({ summary: 'Upload health record with file' })
  @ApiConsumes('multipart/form-data')
  @ApiResponse({ status: 201, description: 'Health record uploaded successfully' })
  async uploadRecord(
    @UploadedFile() file: Multer.File,
    @Body() createHealthRecordDto: CreateHealthRecordDto,
    @Request() req
  ) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    try {
      // Upload file to storage
      const uploadResult = await this.fileStorageService.uploadFile(file);
      
      // Create health record with file information
      const record = await this.healthRecordsService.create({
        ...createHealthRecordDto,
        patientId: req.user.sub,
        fileHash: uploadResult.fileHash,
        ipfsHash: uploadResult.ipfsHash,
        fileName: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        fileUrl: uploadResult.url,
      });

      return {
        message: 'Health record uploaded successfully',
        record,
        file: {
          originalName: file.originalname,
          size: file.size,
          mimeType: file.mimetype,
          url: uploadResult.url,
        },
      };
    } catch (error) {
      throw new BadRequestException(`Failed to upload health record: ${error.message}`);
    }
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
