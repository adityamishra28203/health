import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  async getSystemStats() {
    return {
      totalUsers: 1250,
      totalRecords: 5670,
      totalClaims: 890,
      systemHealth: 'Good',
    };
  }
}
