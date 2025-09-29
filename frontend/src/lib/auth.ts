import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_USE_MOCK_DATA === 'true' ? 'mock' : (process.env.NEXT_PUBLIC_API_URL || (typeof window !== 'undefined' ? window.location.origin + '/api' : 'http://localhost:3003')).replace(/\/$/, '');


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
      console.log('AuthService: Initialized with token:', !!this.token);
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
      this.clearAllAuthData();
      
      if (typeof window !== 'undefined') {
        // Dispatch custom event to notify components
        window.dispatchEvent(new CustomEvent('auth-state-changed'));
        window.dispatchEvent(new CustomEvent('auth-logout'));
        
        console.log('✅ Logout completed - all auth data cleared');
      }
    }
  }

  async getProfile(): Promise<User> {
    try {
      const response = await axios.get(`${API_BASE_URL}/auth/profile`, {
        headers: this.getAuthHeaders()
      });
      return response.data;
    } catch (error: unknown) {
      throw new Error(getErrorMessage(error, 'Failed to get profile'));
    }
  }

  async updateProfile(userData: Partial<User>): Promise<User> {
    try {
      console.log('🔄 Updating profile with data:', userData);
      console.log('🔄 API URL:', `${API_BASE_URL}/auth/profile`);
      console.log('🔄 Auth headers:', this.getAuthHeaders());
      
      const response = await axios.put(`${API_BASE_URL}/auth/profile`, userData, {
        headers: this.getAuthHeaders()
      });
      
      console.log('✅ Profile update response:', response.data);
      return response.data.user;
    } catch (error: unknown) {
      console.error('❌ Profile update error:', error);
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number; data?: unknown } };
        console.error('❌ Response status:', axiosError.response?.status);
        console.error('❌ Response data:', axiosError.response?.data);
      }
      throw new Error(getErrorMessage(error, 'Failed to update profile'));
    }
  }

  async uploadAvatar(file: File): Promise<{ url: string; ipfsHash: string }> {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      
      const response = await axios.post(`${API_BASE_URL}/files/upload-avatar`, formData, {
        headers: {
          ...this.getAuthHeaders(),
          'Content-Type': 'multipart/form-data',
        },
      });

      return {
        url: response.data.avatar.avatarUrl,
        ipfsHash: response.data.avatar.id
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
    const hasToken = !!this.token;
    console.log('AuthService: isAuthenticated check - hasToken:', hasToken);
    return hasToken;
  }

  // Comprehensive logout function that clears everything
  clearAllAuthData(): void {
    if (typeof window !== 'undefined') {
      // Clear all possible authentication-related localStorage data
      const authKeys = [
        'accessToken', 'user', 'authToken', 'authUser', 
        'userData', 'session', 'token', 'auth', 'login'
      ];
      
      authKeys.forEach(key => {
        localStorage.removeItem(key);
        localStorage.removeItem(key.toLowerCase());
        localStorage.removeItem(key.toUpperCase());
      });
      
      // Clear sessionStorage completely
      sessionStorage.clear();
      
      // Clear any cookies that might contain auth data
      document.cookie.split(";").forEach(cookie => {
        const eqPos = cookie.indexOf("=");
        const name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
        if (name.trim().toLowerCase().includes('auth') || 
            name.trim().toLowerCase().includes('token') ||
            name.trim().toLowerCase().includes('session')) {
          document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
          document.cookie = `${name.trim()}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        }
      });
      
      // Reset token
      this.token = null;
      
      console.log('🧹 All authentication data cleared from localStorage, sessionStorage, and cookies');
    }
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
