// Fallback authentication service for offline scenarios
export interface FallbackUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  avatar?: string;
  emailVerified: boolean;
  phoneVerified: boolean;
}

export class AuthFallbackService {
  private static instance: AuthFallbackService;
  
  static getInstance(): AuthFallbackService {
    if (!AuthFallbackService.instance) {
      AuthFallbackService.instance = new AuthFallbackService();
    }
    return AuthFallbackService.instance;
  }

  // Create a fallback user when Firebase is offline
  createFallbackUser(userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    avatar?: string;
  }): FallbackUser {
    const fallbackUser: FallbackUser = {
      id: `fallback_${Date.now()}`,
      email: userData.email,
      firstName: userData.firstName,
      lastName: userData.lastName,
      role: userData.role,
      avatar: userData.avatar,
      emailVerified: false,
      phoneVerified: false,
    };

    // Store in localStorage for offline use
    localStorage.setItem('fallback_user', JSON.stringify(fallbackUser));
    localStorage.setItem('auth_provider', 'fallback');
    
    return fallbackUser;
  }

  // Get fallback user from localStorage
  getFallbackUser(): FallbackUser | null {
    try {
      const userData = localStorage.getItem('fallback_user');
      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Error getting fallback user:', error);
      return null;
    }
  }

  // Check if we're in offline mode
  isOfflineMode(): boolean {
    return !navigator.onLine || localStorage.getItem('auth_provider') === 'fallback';
  }

  // Clear fallback user data
  clearFallbackUser(): void {
    localStorage.removeItem('fallback_user');
    localStorage.removeItem('auth_provider');
  }

  // Handle offline authentication
  async handleOfflineAuth(userData: {
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    avatar?: string;
  }): Promise<FallbackUser> {
    console.warn('Firebase is offline, using fallback authentication');
    
    const fallbackUser = this.createFallbackUser(userData);
    
    // Show offline warning to user
    if (typeof window !== 'undefined') {
      const event = new CustomEvent('offline-auth', {
        detail: {
          message: 'You are currently offline. Some features may be limited.',
          user: fallbackUser
        }
      });
      window.dispatchEvent(event);
    }
    
    return fallbackUser;
  }
}

export const authFallbackService = AuthFallbackService.getInstance();
