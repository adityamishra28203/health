import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AnalyticsService } from './analytics.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('Analytics')
@Controller('analytics')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('health')
  @ApiOperation({ summary: 'Get health analytics' })
  @ApiResponse({ status: 200, description: 'Analytics retrieved successfully' })
  async getHealthAnalytics(@Request() req) {
    return this.analyticsService.getHealthAnalytics(req.user.sub);
  }
}
