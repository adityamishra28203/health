import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';

import { User, UserDocument, IUser } from '../schemas/user.schema';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name) private userModel: Model<UserDocument>,
  ) {}

  async findById(id: string): Promise<IUser> {
    const user = await this.userModel.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async findByEmail(email: string): Promise<IUser> {
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updateProfile(id: string, updateData: Partial<IUser>): Promise<IUser> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { ...updateData, updatedAt: new Date() },
      { new: true },
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async updatePreferences(id: string, preferences: Record<string, any>): Promise<IUser> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { preferences, updatedAt: new Date() },
      { new: true },
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async getAllUsers(page: number = 1, limit: number = 10, role?: string): Promise<{ users: IUser[]; total: number }> {
    const query = role ? { role } : {};
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      this.userModel.find(query).skip(skip).limit(limit).sort({ createdAt: -1 }),
      this.userModel.countDocuments(query),
    ]);

    return { users, total };
  }

  async searchUsers(searchTerm: string, role?: string): Promise<IUser[]> {
    const query: any = {
      $or: [
        { firstName: { $regex: searchTerm, $options: 'i' } },
        { lastName: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { organization: { $regex: searchTerm, $options: 'i' } },
      ],
    };

    if (role) {
      query.role = role;
    }

    return this.userModel.find(query).limit(20);
  }

  async getUsersByRole(role: string): Promise<IUser[]> {
    return this.userModel.find({ role }).sort({ createdAt: -1 });
  }

  async updateUserStatus(id: string, status: string): Promise<IUser> {
    const user = await this.userModel.findByIdAndUpdate(
      id,
      { status, updatedAt: new Date() },
      { new: true },
    );
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }

  async deleteUser(id: string): Promise<boolean> {
    const result = await this.userModel.findByIdAndDelete(id);
    return !!result;
  }

  async getStatistics(): Promise<{
    totalUsers: number;
    activeUsers: number;
    usersByRole: Record<string, number>;
    newUsersThisMonth: number;
  }> {
    const [
      totalUsers,
      activeUsers,
      usersByRole,
      newUsersThisMonth,
    ] = await Promise.all([
      this.userModel.countDocuments(),
      this.userModel.countDocuments({ status: 'active' }),
      this.userModel.aggregate([
        { $group: { _id: '$role', count: { $sum: 1 } } },
      ]),
      this.userModel.countDocuments({
        createdAt: { $gte: new Date(new Date().getFullYear(), new Date().getMonth(), 1) },
      }),
    ]);

    const roleStats = usersByRole.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {});

    return {
      totalUsers,
      activeUsers,
      usersByRole: roleStats,
      newUsersThisMonth,
    };
  }
}
