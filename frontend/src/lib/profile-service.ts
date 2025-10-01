import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export interface PatientProfile {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  bio?: string;
  emergencyContact?: string;
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  medicalConditions?: string[];
  organization?: string;
  licenseNumber?: string;
  specialization?: string;
  preferences: {
    notifications: boolean;
    dataSharing: boolean;
    language: string;
    timezone: string;
  };
  familyMembers: Array<{
    _id?: string;
    name: string;
    relationship: string;
    phone?: string;
    email?: string;
    isEmergencyContact: boolean;
  }>;
  createdAt: string;
  updatedAt: string;
}

class ProfileService {
  private getAuthHeaders() {
    const token = localStorage.getItem('accessToken');
    return {
      'Authorization': token ? `Bearer ${token}` : '',
      'Content-Type': 'application/json',
    };
  }

  async getProfile(userId: string): Promise<PatientProfile> {
    try {
      const response = await axios.get(`${API_BASE_URL}/api/v1/patients/${userId}`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Get profile error:', error);
      throw new Error('Failed to get profile');
    }
  }

  async updateProfile(userId: string, profileData: Partial<PatientProfile>): Promise<PatientProfile> {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/v1/patients/${userId}`, profileData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Update profile error:', error);
      throw new Error('Failed to update profile');
    }
  }

  async uploadAvatar(userId: string, file: File): Promise<{ avatar: string }> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);

      const response = await axios.post(`${API_BASE_URL}/api/v1/patients/${userId}/avatar`, formData, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        }
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Upload avatar error:', error);
      throw new Error('Failed to upload avatar');
    }
  }

  async addFamilyMember(userId: string, memberData: {
    name: string;
    relationship: string;
    phone?: string;
    email?: string;
    isEmergencyContact?: boolean;
  }): Promise<any> {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/v1/patients/${userId}/family`, memberData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Add family member error:', error);
      throw new Error('Failed to add family member');
    }
  }

  async updateFamilyMember(userId: string, memberId: string, memberData: any): Promise<any> {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/v1/patients/${userId}/family/${memberId}`, memberData, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Update family member error:', error);
      throw new Error('Failed to update family member');
    }
  }

  async deleteFamilyMember(userId: string, memberId: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/api/v1/patients/${userId}/family/${memberId}`, {
        headers: this.getAuthHeaders()
      });
    } catch (error: unknown) {
      console.error('Delete family member error:', error);
      throw new Error('Failed to delete family member');
    }
  }

  async updatePreferences(userId: string, preferences: {
    notifications?: boolean;
    dataSharing?: boolean;
    language?: string;
    timezone?: string;
  }): Promise<any> {
    try {
      const response = await axios.put(`${API_BASE_URL}/api/v1/patients/${userId}/preferences`, preferences, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      console.error('Update preferences error:', error);
      throw new Error('Failed to update preferences');
    }
  }
}

export const profileService = new ProfileService();
