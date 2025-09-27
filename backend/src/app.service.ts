import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'HealthWallet API is running!';
  }

  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      service: 'HealthWallet API',
      version: '1.0.0',
    };
  }

  getSampleHealthRecords() {
    return {
      records: [
        {
          id: '1',
          title: 'Blood Test Report',
          type: 'LAB_REPORT',
          date: '2024-01-15',
          status: 'VERIFIED',
          doctor: 'Dr. Smith',
          hospital: 'Apollo Hospital',
        },
        {
          id: '2',
          title: 'X-Ray Chest',
          type: 'RADIOLOGY',
          date: '2024-01-10',
          status: 'VERIFIED',
          doctor: 'Dr. Johnson',
          hospital: 'Fortis Healthcare',
        },
        {
          id: '3',
          title: 'ECG Report',
          type: 'DIAGNOSTIC',
          date: '2024-01-05',
          status: 'PENDING',
          doctor: 'Dr. Brown',
          hospital: 'Max Hospital',
        },
      ],
      total: 3,
    };
  }

  getSampleInsuranceClaims() {
    return {
      claims: [
        {
          id: '1',
          claimNumber: 'C001',
          policyNumber: 'POL123456',
          type: 'MEDICAL',
          amount: 25000,
          status: 'APPROVED',
          submittedDate: '2024-01-15',
          approvedDate: '2024-01-20',
          approvedAmount: 25000,
        },
        {
          id: '2',
          claimNumber: 'C002',
          policyNumber: 'POL123456',
          type: 'SURGERY',
          amount: 150000,
          status: 'PENDING',
          submittedDate: '2024-01-18',
        },
        {
          id: '3',
          claimNumber: 'C003',
          policyNumber: 'POL123456',
          type: 'MEDICAL',
          amount: 5000,
          status: 'REJECTED',
          submittedDate: '2024-01-10',
          rejectionReason: 'Insufficient documentation',
        },
      ],
      total: 3,
    };
  }

  getSampleAnalytics() {
    return {
      healthScore: 85,
      totalRecords: 24,
      verifiedRecords: 20,
      pendingRecords: 4,
      totalClaims: 3,
      approvedClaims: 1,
      pendingClaims: 1,
      rejectedClaims: 1,
      totalClaimAmount: 180000,
      approvedAmount: 25000,
      trends: [
        { month: 'Jan', score: 80 },
        { month: 'Feb', score: 82 },
        { month: 'Mar', score: 85 },
      ],
    };
  }

  login(loginData: any) {
    // Simulate login
    return {
      success: true,
      token: 'jwt_token_' + Date.now(),
      user: {
        id: '1',
        email: loginData.email,
        name: 'John Doe',
        role: 'PATIENT',
      },
    };
  }

  register(registerData: any) {
    // Simulate registration
    return {
      success: true,
      message: 'User registered successfully',
      user: {
        id: '2',
        email: registerData.email,
        name: registerData.name,
        role: 'PATIENT',
      },
    };
  }
}