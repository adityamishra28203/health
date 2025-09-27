import { IsOptional, IsString, IsPhoneNumber, IsObject } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateProfileDto {
  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;

  @ApiProperty({ example: '+919876543210', required: false })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({ example: 'Apollo Hospital', required: false })
  @IsOptional()
  @IsString()
  organization?: string;

  @ApiProperty({ example: 'Cardiology', required: false })
  @IsOptional()
  @IsString()
  specialization?: string;

  @ApiProperty({ example: 'DOC123456', required: false })
  @IsOptional()
  @IsString()
  licenseNumber?: string;
}

export class UpdatePreferencesDto {
  @ApiProperty({ example: { theme: 'dark', language: 'en' } })
  @IsObject()
  preferences: Record<string, any>;
}
