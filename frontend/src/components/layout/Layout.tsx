"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./Header";
import Footer from "./Footer";
import { Toaster } from "@/components/ui/sonner";
import ErrorBoundary from "@/components/ErrorBoundary";
import { authService, User } from "@/lib/auth";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [darkMode, setDarkMode] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const pathname = usePathname();

  // Check if current page is landing page
  const isLandingPage = pathname === "/";

  useEffect(() => {
    const initializeLayout = async () => {
      try {
        // Load theme preference
        const savedTheme = localStorage.getItem("theme");
        if (savedTheme) {
          setDarkMode(savedTheme === "dark");
        } else {
          // Check system preference
          setDarkMode(window.matchMedia("(prefers-color-scheme: dark)").matches);
        }

        // Load user data from auth service
        if (authService.isAuthenticated()) {
          try {
            const userData = await authService.getProfile();
            setUser(userData);
          } catch (error) {
            console.error('Failed to get user profile:', error);
            // If profile fetch fails, clear user data
            setUser(null);
            authService.logout();
          }
        } else {
          // Load user data from localStorage as fallback
          const savedUser = localStorage.getItem("user");
          if (savedUser) {
            setUser(JSON.parse(savedUser));
          }
        }
      } catch (error) {
        console.error('Error loading user preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    initializeLayout();
  }, []);

  // Listen for auth state changes
  useEffect(() => {
    const handleAuthStateChange = () => {
      if (authService.isAuthenticated()) {
        // Get fresh user data
        authService.getProfile()
          .then(userData => setUser(userData))
          .catch(() => setUser(null));
      } else {
        setUser(null);
      }
    };

    const handleAuthLogout = () => {
      setUser(null);
    };

    const handleAuthStateChanged = () => {
      // Re-check auth state when auth service notifies of changes
      handleAuthStateChange();
      
      // Also refresh user data from localStorage in case it was updated
      const savedUser = localStorage.getItem("user");
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser);
          setUser(userData);
        } catch (error) {
          console.error('Error parsing user data from localStorage:', error);
        }
      }
    };

    // Listen for storage changes (logout from another tab)
    window.addEventListener('storage', handleAuthStateChange);
    
    // Listen for custom logout events
    window.addEventListener('auth-logout', handleAuthLogout);
    
    // Listen for general auth state changes
    window.addEventListener('auth-state-changed', handleAuthStateChanged);
    
    return () => {
      window.removeEventListener('storage', handleAuthStateChange);
      window.removeEventListener('auth-logout', handleAuthLogout);
      window.removeEventListener('auth-state-changed', handleAuthStateChanged);
    };
  }, []);

  useEffect(() => {
    // Apply theme to document
    if (darkMode) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    // Also save to localStorage
    localStorage.setItem("user", JSON.stringify(updatedUser));
    
    // Dispatch event to notify other components about the update
    window.dispatchEvent(new CustomEvent('auth-state-changed'));
  };

  // Show loading spinner while initializing
  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <ErrorBoundary>
      <div className={isLandingPage ? "" : "min-h-screen bg-background"}>
        <AnimatePresence mode="wait">
          <motion.div
            key={pathname}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
          >
            {!isLandingPage && (
              <Header
                user={user || undefined}
                darkMode={darkMode}
                onToggleDarkMode={toggleDarkMode}
                onUserUpdate={handleUserUpdate}
              />
            )}
            
            <main className={isLandingPage ? "" : "flex-1"}>
              {children}
            </main>
            
            {!isLandingPage && <Footer />}
          </motion.div>
        </AnimatePresence>
        
        <Toaster />
      </div>
    </ErrorBoundary>
  );
}
