import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { BlockchainService } from './blockchain.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Blockchain')
@Controller('blockchain')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class BlockchainController {
  constructor(private readonly blockchainService: BlockchainService) {}

  @Get('stats')
  @ApiOperation({ summary: 'Get blockchain statistics' })
  @ApiResponse({ status: 200, description: 'Blockchain stats retrieved successfully' })
  async getBlockchainStats() {
    return this.blockchainService.getBlockchainStats();
  }

  @Post('generate-wallet')
  @ApiOperation({ summary: 'Generate new blockchain wallet' })
  @ApiResponse({ status: 201, description: 'Wallet generated successfully' })
  async generateWallet() {
    return this.blockchainService.generateWallet();
  }

  @Get('balance/:address')
  @ApiOperation({ summary: 'Get wallet balance' })
  @ApiResponse({ status: 200, description: 'Balance retrieved successfully' })
  async getBalance(@Body('address') address: string) {
    return this.blockchainService.getBalance(address);
  }

  @Post('store-health-record')
  @ApiOperation({ summary: 'Store health record hash on blockchain' })
  @ApiResponse({ status: 201, description: 'Health record hash stored successfully' })
  async storeHealthRecordHash(@Body() data: {
    patientId: string;
    recordHash: string;
    doctorId: string;
    hospitalId: string;
  }) {
    return this.blockchainService.storeHealthRecordHash(
      data.patientId,
      data.recordHash,
      data.doctorId,
      data.hospitalId,
    );
  }

  @Post('verify-health-record')
  @ApiOperation({ summary: 'Verify health record on blockchain' })
  @ApiResponse({ status: 200, description: 'Health record verification result' })
  async verifyHealthRecord(@Body('recordHash') recordHash: string) {
    const isValid = await this.blockchainService.verifyHealthRecord(recordHash);
    return { isValid };
  }

  @Post('store-consent')
  @ApiOperation({ summary: 'Store consent hash on blockchain' })
  @ApiResponse({ status: 201, description: 'Consent hash stored successfully' })
  async storeConsentHash(@Body() data: {
    patientId: string;
    grantedToId: string;
    consentHash: string;
    permissions: string[];
    expiryDate: number;
  }) {
    return this.blockchainService.storeConsentHash(
      data.patientId,
      data.grantedToId,
      data.consentHash,
      data.permissions,
      data.expiryDate,
    );
  }

  @Post('verify-consent')
  @ApiOperation({ summary: 'Verify consent on blockchain' })
  @ApiResponse({ status: 200, description: 'Consent verification result' })
  async verifyConsent(@Body('consentHash') consentHash: string) {
    const isValid = await this.blockchainService.verifyConsent(consentHash);
    return { isValid };
  }

  @Post('store-insurance-claim')
  @ApiOperation({ summary: 'Store insurance claim hash on blockchain' })
  @ApiResponse({ status: 201, description: 'Insurance claim hash stored successfully' })
  async storeInsuranceClaimHash(@Body() data: {
    claimId: string;
    claimHash: string;
    patientId: string;
    insurerId: string;
    amount: number;
  }) {
    return this.blockchainService.storeInsuranceClaimHash(
      data.claimId,
      data.claimHash,
      data.patientId,
      data.insurerId,
      data.amount,
    );
  }

  @Post('verify-insurance-claim')
  @ApiOperation({ summary: 'Verify insurance claim on blockchain' })
  @ApiResponse({ status: 200, description: 'Insurance claim verification result' })
  async verifyInsuranceClaim(@Body('claimHash') claimHash: string) {
    const isValid = await this.blockchainService.verifyInsuranceClaim(claimHash);
    return { isValid };
  }
}
