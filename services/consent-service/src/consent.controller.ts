import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { ConsentService } from './consent.service';

@ApiTags('consent')
@Controller('api/v1/consent')
export class ConsentController {
  constructor(private readonly consentService: ConsentService) {}

  @Post('request')
  @ApiOperation({ summary: 'Request consent from patient' })
  @ApiResponse({ status: 201, description: 'Consent request created successfully' })
  async requestConsent(@Body() requestConsentDto: any) {
    return this.consentService.requestConsent(requestConsentDto);
  }

  @Put(':id/respond')
  @ApiOperation({ summary: 'Respond to consent request' })
  @ApiResponse({ status: 200, description: 'Consent response recorded successfully' })
  async respondToConsent(@Param('id') id: string, @Body() responseDto: any) {
    return this.consentService.respondToConsent(id, responseDto);
  }

  @Get(':patientId/history')
  @ApiOperation({ summary: 'Get consent history for patient' })
  @ApiResponse({ status: 200, description: 'Consent history retrieved successfully' })
  async getConsentHistory(@Param('patientId') patientId: string) {
    return this.consentService.getConsentHistory(patientId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get consent by ID' })
  @ApiResponse({ status: 200, description: 'Consent retrieved successfully' })
  async getConsent(@Param('id') id: string) {
    return this.consentService.getConsent(id);
  }

  @Put(':id/revoke')
  @ApiOperation({ summary: 'Revoke consent' })
  @ApiResponse({ status: 200, description: 'Consent revoked successfully' })
  async revokeConsent(@Param('id') id: string, @Body() revocationDto: any) {
    return this.consentService.revokeConsent(id, revocationDto);
  }
}


