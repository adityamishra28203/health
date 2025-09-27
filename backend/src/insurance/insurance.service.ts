import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { InsuranceClaim, InsuranceClaimDocument, ClaimStatus, ClaimType } from '../schemas/insurance-claim.schema';

@Injectable()
export class InsuranceService {
  constructor(
    @InjectModel(InsuranceClaim.name) private insuranceClaimModel: Model<InsuranceClaimDocument>,
  ) {}

  async create(createClaimDto: any): Promise<InsuranceClaim> {
    const claim = new this.insuranceClaimModel(createClaimDto);
    return claim.save();
  }

  async findAll(patientId: string, page: number = 1, limit: number = 10): Promise<{ claims: InsuranceClaim[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const [claims, total] = await Promise.all([
      this.insuranceClaimModel.find({ patientId }).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.insuranceClaimModel.countDocuments({ patientId }),
    ]);

    return { claims, total };
  }

  async findOne(id: string): Promise<InsuranceClaim> {
    const claim = await this.insuranceClaimModel.findById(id);
    if (!claim) {
      throw new NotFoundException('Insurance claim not found');
    }
    return claim;
  }

  async update(id: string, updateData: any): Promise<InsuranceClaim> {
    const claim = await this.insuranceClaimModel.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true },
    );
    if (!claim) {
      throw new NotFoundException('Insurance claim not found');
    }
    return claim;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.insuranceClaimModel.findByIdAndDelete(id);
    return !!result;
  }

  async submitClaim(claimId: string): Promise<InsuranceClaim> {
    const claim = await this.insuranceClaimModel.findById(claimId);
    if (!claim) {
      throw new NotFoundException('Insurance claim not found');
    }

    if (claim.status !== ClaimStatus.DRAFT) {
      throw new BadRequestException('Claim can only be submitted from draft status');
    }

    claim.status = ClaimStatus.SUBMITTED;
    return claim.save();
  }

  async approveClaim(claimId: string, approvedAmount: number): Promise<InsuranceClaim> {
    const claim = await this.insuranceClaimModel.findById(claimId);
    if (!claim) {
      throw new NotFoundException('Insurance claim not found');
    }

    claim.status = ClaimStatus.APPROVED;
    claim.approvedAmount = approvedAmount;
    claim.approvalDate = new Date();

    return claim.save();
  }

  async rejectClaim(claimId: string, rejectionReason: string): Promise<InsuranceClaim> {
    const claim = await this.insuranceClaimModel.findById(claimId);
    if (!claim) {
      throw new NotFoundException('Insurance claim not found');
    }

    claim.status = ClaimStatus.REJECTED;
    claim.rejectionReason = rejectionReason;

    return claim.save();
  }

  async getClaimsByStatus(patientId: string, status: ClaimStatus): Promise<InsuranceClaim[]> {
    return this.insuranceClaimModel.find({ patientId, status }).sort({ createdAt: -1 });
  }

  async getClaimsByType(patientId: string, type: ClaimType): Promise<InsuranceClaim[]> {
    return this.insuranceClaimModel.find({ patientId, type }).sort({ createdAt: -1 });
  }

  async getStatistics(patientId: string): Promise<{
    totalClaims: number;
    approvedClaims: number;
    pendingClaims: number;
    rejectedClaims: number;
    totalAmount: number;
    approvedAmount: number;
  }> {
    const [totalClaims, approvedClaims, pendingClaims, rejectedClaims, amountStats] = await Promise.all([
      this.insuranceClaimModel.countDocuments({ patientId }),
      this.insuranceClaimModel.countDocuments({ patientId, status: ClaimStatus.APPROVED }),
      this.insuranceClaimModel.countDocuments({ patientId, status: ClaimStatus.UNDER_REVIEW }),
      this.insuranceClaimModel.countDocuments({ patientId, status: ClaimStatus.REJECTED }),
      this.insuranceClaimModel.aggregate([
        { $match: { patientId } },
        {
          $group: {
            _id: null,
            totalAmount: { $sum: '$amount' },
            approvedAmount: {
              $sum: {
                $cond: [{ $eq: ['$status', ClaimStatus.APPROVED] }, '$approvedAmount', 0]
              }
            }
          }
        }
      ]),
    ]);

    const stats = amountStats[0] || { totalAmount: 0, approvedAmount: 0 };

    return {
      totalClaims,
      approvedClaims,
      pendingClaims,
      rejectedClaims,
      totalAmount: stats.totalAmount,
      approvedAmount: stats.approvedAmount,
    };
  }
}
