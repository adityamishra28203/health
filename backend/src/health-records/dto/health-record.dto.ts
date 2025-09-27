import { IsString, IsEnum, IsOptional, IsDateString, IsArray, IsBoolean, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { RecordType } from '../../schemas/health-record.schema';

export class CreateHealthRecordDto {
  @ApiProperty({ example: 'Blood Test Report' })
  @IsString()
  title: string;

  @ApiProperty({ example: 'Complete blood count test results', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ enum: RecordType, example: RecordType.LAB_REPORT })
  @IsEnum(RecordType)
  type: RecordType;

  @ApiProperty({ example: '0x1234...5678' })
  @IsString()
  fileHash: string;

  @ApiProperty({ example: 'QmHash...' })
  @IsString()
  ipfsHash: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  @IsDateString()
  recordDate: string;

  @ApiProperty({ example: '2024-12-31T23:59:59Z', required: false })
  @IsOptional()
  @IsDateString()
  expiryDate?: string;

  @ApiProperty({ example: ['blood-test', 'lab-report'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: { bloodPressure: '120/80' }, required: false })
  @IsOptional()
  medicalData?: Record<string, any>;

  @ApiProperty({ example: true })
  @IsBoolean()
  consentGiven: boolean;

  @ApiProperty({ example: '2024-12-31T23:59:59Z', required: false })
  @IsOptional()
  @IsDateString()
  consentExpiry?: string;

  @ApiProperty({ example: true })
  @IsBoolean()
  isEncrypted: boolean;
}

export class UpdateHealthRecordDto {
  @ApiProperty({ example: 'Updated Blood Test Report', required: false })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ example: 'Updated description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: ['updated-tag'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: { bloodPressure: '110/70' }, required: false })
  @IsOptional()
  medicalData?: Record<string, any>;

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  consentGiven?: boolean;

  @ApiProperty({ example: '2024-12-31T23:59:59Z', required: false })
  @IsOptional()
  @IsDateString()
  consentExpiry?: string;
}
