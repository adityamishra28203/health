import {
  Controller,
  Post,
  Get,
  Delete,
  Param,
  UseInterceptors,
  UploadedFile,
  UseGuards,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiConsumes } from '@nestjs/swagger';
import { Multer } from 'multer';

import { FileStorageService } from './file-storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('File Storage')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FileStorageController {
  constructor(private readonly fileStorageService: FileStorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file'))
  @ApiOperation({ summary: 'Upload file to IPFS' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiConsumes('multipart/form-data')
  async uploadFile(@UploadedFile() file: Multer.File) {
    return this.fileStorageService.uploadFile(file);
  }

  @Get('download/:ipfsHash')
  @ApiOperation({ summary: 'Download file from IPFS' })
  @ApiResponse({ status: 200, description: 'File downloaded successfully' })
  async downloadFile(@Param('ipfsHash') ipfsHash: string) {
    const fileBuffer = await this.fileStorageService.downloadFile(ipfsHash);
    return {
      data: fileBuffer.toString('base64'),
      ipfsHash,
    };
  }

  @Get('metadata/:ipfsHash')
  @ApiOperation({ summary: 'Get file metadata' })
  @ApiResponse({ status: 200, description: 'Metadata retrieved successfully' })
  async getFileMetadata(@Param('ipfsHash') ipfsHash: string) {
    return this.fileStorageService.getFileMetadata(ipfsHash);
  }

  @Delete(':ipfsHash')
  @ApiOperation({ summary: 'Delete file from IPFS' })
  @ApiResponse({ status: 200, description: 'File deleted successfully' })
  async deleteFile(@Param('ipfsHash') ipfsHash: string) {
    const success = await this.fileStorageService.deleteFile(ipfsHash);
    return { success };
  }
}
