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
import { diskStorage } from 'multer';

import { FileStorageService } from './file-storage.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('File Storage')
@Controller('files')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class FileStorageController {
  constructor(private readonly fileStorageService: FileStorageService) {}

  @Post('upload')
  @UseInterceptors(FileInterceptor('file', {
    limits: {
      fileSize: 5 * 1024 * 1024, // 5MB limit for health records
      files: 1, // Only one file at a time
      fieldSize: 1024, // 1KB for field names
    },
    fileFilter: (req, file, cb) => {
      // Define allowed MIME types for health records
      const allowedMimeTypes = [
        'application/pdf',
        'image/jpeg',
        'image/jpg', 
        'image/png',
        'image/gif',
        'text/plain',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
      ];

      // Check MIME type
      if (allowedMimeTypes.includes(file.mimetype)) {
        // Additional security: Check file extension matches MIME type
        const allowedExtensions = {
          'application/pdf': ['.pdf'],
          'image/jpeg': ['.jpg', '.jpeg'],
          'image/jpg': ['.jpg', '.jpeg'],
          'image/png': ['.png'],
          'image/gif': ['.gif'],
          'text/plain': ['.txt'],
          'application/msword': ['.doc'],
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
          'application/vnd.ms-excel': ['.xls'],
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx']
        };

        const fileExtension = file.originalname.toLowerCase().substring(file.originalname.lastIndexOf('.'));
        const validExtensions = allowedExtensions[file.mimetype] || [];
        
        if (validExtensions.includes(fileExtension)) {
          cb(null, true);
        } else {
          cb(new Error(`File extension ${fileExtension} does not match MIME type ${file.mimetype}`), false);
        }
      } else {
        cb(new Error(`File type ${file.mimetype} is not allowed. Allowed types: PDF, JPEG, PNG, GIF, TXT, DOC, DOCX, XLS, XLSX`), false);
      }
    },
  }))
  @ApiOperation({ summary: 'Upload file to IPFS' })
  @ApiResponse({ status: 201, description: 'File uploaded successfully' })
  @ApiResponse({ status: 413, description: 'File too large. Maximum size is 1MB.' })
  @ApiConsumes('multipart/form-data')
  async uploadFile(@UploadedFile() file: Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }
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
