import { IsString, IsEnum, IsOptional, IsDateString, IsArray, IsNumber, IsBoolean } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { ClaimType } from '../../schemas/insurance-claim.schema';

export class CreateInsuranceClaimDto {
  @ApiProperty({ example: 'C001' })
  @IsString()
  claimNumber: string;

  @ApiProperty({ example: 'POL123456' })
  @IsString()
  policyNumber: string;

  @ApiProperty({ enum: ClaimType, example: ClaimType.MEDICAL })
  @IsEnum(ClaimType)
  type: ClaimType;

  @ApiProperty({ example: 25000 })
  @IsNumber()
  amount: number;

  @ApiProperty({ example: 'Cardiology Treatment' })
  @IsString()
  description: string;

  @ApiProperty({ example: '2024-01-15T10:30:00Z' })
  @IsDateString()
  incidentDate: string;

  @ApiProperty({ example: '2024-01-10T09:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  treatmentStartDate?: string;

  @ApiProperty({ example: '2024-01-20T17:00:00Z', required: false })
  @IsOptional()
  @IsDateString()
  treatmentEndDate?: string;

  @ApiProperty({ example: ['record1', 'record2'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supportingRecords?: string[];

  @ApiProperty({ example: ['hash1', 'hash2'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  documentHashes?: string[];

  @ApiProperty({ example: true, required: false })
  @IsOptional()
  @IsBoolean()
  isAutomated?: boolean;

  @ApiProperty({ example: ['urgent', 'cardiology'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}

export class UpdateInsuranceClaimDto {
  @ApiProperty({ example: 'Updated Cardiology Treatment', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 30000, required: false })
  @IsOptional()
  @IsNumber()
  amount?: number;

  @ApiProperty({ example: ['record1', 'record2', 'record3'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  supportingRecords?: string[];

  @ApiProperty({ example: ['tag1', 'tag2'], required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ example: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}
