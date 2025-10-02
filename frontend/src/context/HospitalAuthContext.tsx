'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface HospitalUser {
  userId: string;
  hospitalId: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  permissions: string[];
  hospital: {
    hospitalId: string;
    name: string;
    type: string;
    status: string;
  };
}

interface HospitalAuthContextType {
  user: HospitalUser | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  register: (userData: any) => Promise<boolean>;
}

const HospitalAuthContext = createContext<HospitalAuthContextType | undefined>(undefined);

interface HospitalAuthProviderProps {
  children: ReactNode;
}

export function HospitalAuthProvider({ children }: HospitalAuthProviderProps) {
  const [user, setUser] = useState<HospitalUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize auth state
  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      try {
        const token = localStorage.getItem('hospital_token');
        if (token) {
          // Verify token and get user data
          const response = await fetch(`${process.env.NEXT_PUBLIC_HOSPITAL_API_URL}/api/v1/hospitals/me`, {
            headers: {
              'Authorization': `Bearer ${token}`,
            },
          });
          
          if (response.ok && isMounted) {
            const userData = await response.json();
            setUser(userData);
            setIsAuthenticated(true);
          } else if (isMounted) {
            localStorage.removeItem('hospital_token');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (isMounted) {
          localStorage.removeItem('hospital_token');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    initAuth();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_HOSPITAL_API_URL}/api/v1/hospitals/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('hospital_token', data.accessToken);
        
        // Get user profile
        const profileResponse = await fetch(`${process.env.NEXT_PUBLIC_HOSPITAL_API_URL}/api/v1/hospitals/me`, {
          headers: {
            'Authorization': `Bearer ${data.accessToken}`,
          },
        });

        if (profileResponse.ok) {
          const userData = await profileResponse.json();
          setUser(userData);
          setIsAuthenticated(true);
          return true;
        }
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (userData: any): Promise<boolean> => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_HOSPITAL_API_URL}/api/v1/hospitals/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      if (response.ok) {
        const data = await response.json();
        // Auto-login after successful registration
        return await login(userData.email, userData.password);
      }
      return false;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = () => {
    localStorage.removeItem('hospital_token');
    setUser(null);
    setIsAuthenticated(false);
  };

  const value: HospitalAuthContextType = {
    user,
    isAuthenticated,
    loading,
    login,
    logout,
    register,
  };

  return (
    <HospitalAuthContext.Provider value={value}>
      {children}
    </HospitalAuthContext.Provider>
  );
}

export function useHospitalAuth() {
  const context = useContext(HospitalAuthContext);
  if (context === undefined) {
    throw new Error('useHospitalAuth must be used within a HospitalAuthProvider');
  }
  return context;
}
