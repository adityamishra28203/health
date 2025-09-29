import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { HealthRecord, HealthRecordDocument, RecordType, RecordStatus } from '../schemas/health-record.schema';

@Injectable()
export class HealthRecordsService {
  constructor(
    @InjectModel('HealthRecord') private healthRecordModel: Model<HealthRecordDocument>,
  ) {}

  async create(createHealthRecordDto: any): Promise<HealthRecord> {
    const healthRecord = new this.healthRecordModel(createHealthRecordDto);
    return healthRecord.save();
  }

  async findAll(patientId: string, page: number = 1, limit: number = 10): Promise<{ records: HealthRecord[]; total: number }> {
    const skip = (page - 1) * limit;
    
    const [records, total] = await Promise.all([
      this.healthRecordModel.find({ patientId }).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.healthRecordModel.countDocuments({ patientId }),
    ]);

    return { records, total };
  }

  async findOne(id: string): Promise<HealthRecord> {
    const record = await this.healthRecordModel.findById(id);
    if (!record) {
      throw new NotFoundException('Health record not found');
    }
    return record;
  }

  async update(id: string, updateData: any): Promise<HealthRecord> {
    const record = await this.healthRecordModel.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true },
    );
    if (!record) {
      throw new NotFoundException('Health record not found');
    }
    return record;
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.healthRecordModel.findByIdAndDelete(id);
    return !!result;
  }

  async verifyRecord(id: string, doctorId: string, signature: string): Promise<HealthRecord> {
    const record = await this.healthRecordModel.findById(id);
    if (!record) {
      throw new NotFoundException('Health record not found');
    }

    record.status = RecordStatus.VERIFIED;
    record.doctorSignature = signature;
    record.digitalSignature = signature;

    return record.save();
  }

  async getRecordsByType(patientId: string, type: RecordType): Promise<HealthRecord[]> {
    return this.healthRecordModel.find({ patientId, type }).sort({ createdAt: -1 });
  }

  async getRecordsByStatus(patientId: string, status: RecordStatus): Promise<HealthRecord[]> {
    return this.healthRecordModel.find({ patientId, status }).sort({ createdAt: -1 });
  }

  async searchRecords(patientId: string, searchTerm: string): Promise<HealthRecord[]> {
    return this.healthRecordModel.find({
      patientId,
      $or: [
        { title: { $regex: searchTerm, $options: 'i' } },
        { description: { $regex: searchTerm, $options: 'i' } },
        { tags: { $in: [new RegExp(searchTerm, 'i')] } },
      ],
    }).sort({ createdAt: -1 });
  }

  async getStatistics(patientId: string): Promise<{
    totalRecords: number;
    verifiedRecords: number;
    pendingRecords: number;
    recordsByType: Record<string, number>;
  }> {
    const [totalRecords, verifiedRecords, pendingRecords, recordsByType] = await Promise.all([
      this.healthRecordModel.countDocuments({ patientId }),
      this.healthRecordModel.countDocuments({ patientId, status: RecordStatus.VERIFIED }),
      this.healthRecordModel.countDocuments({ patientId, status: RecordStatus.PENDING }),
      this.healthRecordModel.aggregate([
        { $match: { patientId } },
        { $group: { _id: '$type', count: { $sum: 1 } } },
      ]),
    ]);

    const typeStats = recordsByType.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return {
      totalRecords,
      verifiedRecords,
      pendingRecords,
      recordsByType: typeStats,
    };
  }
}
