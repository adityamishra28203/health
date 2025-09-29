import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ? 'mock' : (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3003');

// Type for API error response
interface ApiErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

// Helper function to extract error messages
function getErrorMessage(error: unknown, defaultMessage: string): string {
  if (error instanceof Error && 'response' in error) {
    const apiError = error as ApiErrorResponse;
    return apiError.response?.data?.message || defaultMessage;
  }
  return defaultMessage;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role: string;
  status: string;
  emailVerified: boolean;
  phoneVerified?: boolean;
  avatar?: string;
  bio?: string;
  createdAt?: string;
  // Medical Information
  emergencyContact?: string;
  bloodType?: string;
  allergies?: string[];
  medications?: string[];
  medicalConditions?: string[];
  // Professional Information
  organization?: string;
  licenseNumber?: string;
  specialization?: string;
}

export interface AuthResponse {
  message: string;
  user: User;
  accessToken: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  phone?: string;
  role?: string;
}

class AuthService {
  private token: string | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('accessToken');
    }
  }

  getAuthHeaders() {
    return {
      'Authorization': this.token ? `Bearer ${this.token}` : '',
      'Content-Type': 'application/json',
    };
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/login`, credentials);
      const { accessToken, user } = response.data;
      
      this.token = accessToken;
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Dispatch custom event to notify components
        window.dispatchEvent(new CustomEvent('auth-state-changed'));
      }
      
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Login failed'));
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await axios.post(`${API_BASE_URL}/auth/register`, userData);
      const { accessToken, user } = response.data;
      
      this.token = accessToken;
      if (typeof window !== 'undefined') {
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('user', JSON.stringify(user));
        
        // Dispatch custom event to notify components
        window.dispatchEvent(new CustomEvent('auth-state-changed'));
      }
      
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Registration failed'));
    }
  }

  async logout(): Promise<void> {
    try {
      if (this.token) {
        await axios.post(`${API_BASE_URL}/auth/logout`, {}, {
          headers: this.getAuthHeaders()
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Always clear local state, even if server logout fails
      this.token = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        
        // Dispatch custom event to notify components
        window.dispatchEvent(new CustomEvent('auth-state-changed'));
      }
    }
  }

  async getProfile(): Promise<User> {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: this.getAuthHeaders()
      });
      return response.data.user;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to get profile'));
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      const response = await axios.put(`${API_BASE_URL}/auth/profile`, userData, {
        headers: this.getAuthHeaders()
      });
      return response.data.user;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to update profile'));
    }
  }

  async uploadAvatar(file: File): Promise<{ url: string; ipfsHash: string }> {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await axios.post(`${API_BASE_URL}/files/upload`, formData, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        url: response.data.url,
        ipfsHash: response.data.ipfsHash
      };
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to upload avatar'));
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    try {
      await axios.put(`${API_BASE_URL}/auth/change-password`, {
        currentPassword,
        newPassword
      }, {
        headers: this.getAuthHeaders()
      });
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to change password'));
    }
  }

  async deleteAccount(): Promise<void> {
    try {
      await axios.post(`${API_BASE_URL}/auth/delete-account`, {}, {
        headers: this.getAuthHeaders()
      });
      
      // Clear local storage and logout after successful deletion
      this.logout();
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to delete account'));
    }
  }

  isAuthenticated(): boolean {
    return !!this.token;
  }

  getCurrentUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      return userStr ? JSON.parse(userStr) : null;
    }
    return null;
  }

  getToken(): string | null {
    return this.token;
  }

  // Initialize auth state from localStorage
  initializeAuth(): void {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('accessToken');
      const user = localStorage.getItem('user');
      
      if (token && user) {
        this.token = token;
      } else {
        this.logout();
      }
    }
  }
}

export const authService = new AuthService();
