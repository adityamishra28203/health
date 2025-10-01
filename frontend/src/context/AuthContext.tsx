"use client";

import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { authService, User } from "@/lib/auth";

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth state with async safety
  useEffect(() => {
    let isMounted = true;
    
    const initAuth = async () => {
      try {
        if (isMounted) setLoading(true);
        
        if (authService.isAuthenticated()) {
          const profile = await authService.getProfile();
          if (isMounted) setUser(profile);
        } else {
          if (isMounted) setUser(null);
        }
      } catch (err) {
        console.error("Auth initialization failed:", err);
        if (isMounted) setUser(null);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    initAuth();

    // Listen for auth changes with async safety
    const handleAuthStateChange = async () => {
      if (authService.isAuthenticated()) {
        try {
          const profile = await authService.getProfile();
          if (isMounted) setUser(profile);
        } catch {
          if (isMounted) setUser(null);
        }
      } else {
        if (isMounted) setUser(null);
      }
    };

    window.addEventListener("auth-state-changed", handleAuthStateChange);
    
    return () => {
      isMounted = false;
      window.removeEventListener("auth-state-changed", handleAuthStateChange);
    };
  }, []);

  const login = async (email: string, password: string) => {
    try {
      setLoading(true);
      const response = await authService.login({ email, password });
      if (response?.user) {
        setUser(response.user);
        // Dispatch auth state change event
        window.dispatchEvent(new CustomEvent('auth-state-changed'));
      }
    } catch (error) {
      throw error; // Re-throw to let components handle errors
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await authService.logout();
      setUser(null);
      // Dispatch auth state change event
      window.dispatchEvent(new CustomEvent('auth-state-changed'));
    } catch (error) {
      console.error("Logout failed:", error);
      // Even if logout fails, clear local state
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  const refreshProfile = async () => {
    try {
      if (authService.isAuthenticated()) {
        const profile = await authService.getProfile();
        setUser(profile);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Profile refresh failed:", error);
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        isAuthenticated: !!user,
        login,
        logout,
        refreshProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
