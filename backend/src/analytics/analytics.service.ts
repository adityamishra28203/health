import { Injectable } from '@nestjs/common';

@Injectable()
export class AnalyticsService {
  async getHealthAnalytics(userId: string) {
    return {
      healthScore: 85,
      trends: [
        { month: 'Jan', score: 80 },
        { month: 'Feb', score: 82 },
        { month: 'Mar', score: 85 },
      ],
      recordsCount: 24,
      claimsCount: 3,
    };
  }
}
