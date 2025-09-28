'use client';

import { useState, useEffect } from 'react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Wifi, WifiOff } from 'lucide-react';

export function OfflineWarning() {
  const [isOffline, setIsOffline] = useState(false);
  const [showWarning, setShowWarning] = useState(false);

  useEffect(() => {
    // Check initial online status
    setIsOffline(!navigator.onLine);

    // Listen for online/offline events
    const handleOnline = () => {
      setIsOffline(false);
      setShowWarning(false);
    };

    const handleOffline = () => {
      setIsOffline(true);
      setShowWarning(true);
    };

    // Listen for custom offline auth event
    const handleOfflineAuth = () => {
      setShowWarning(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('offline-auth', handleOfflineAuth as EventListener);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('offline-auth', handleOfflineAuth as EventListener);
    };
  }, []);

  if (!showWarning) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm">
      <Alert className={isOffline ? 'border-orange-200 bg-orange-50' : 'border-green-200 bg-green-50'}>
        {isOffline ? (
          <>
            <WifiOff className="h-4 w-4 text-orange-600" />
            <AlertDescription className="text-orange-800">
              <strong>You&apos;re offline</strong>
              <br />
              Some features may be limited. Your data will sync when you&apos;re back online.
            </AlertDescription>
          </>
        ) : (
          <>
            <Wifi className="h-4 w-4 text-green-600" />
            <AlertDescription className="text-green-800">
              <strong>You&apos;re back online!</strong>
              <br />
              All features are now available.
            </AlertDescription>
          </>
        )}
      </Alert>
    </div>
  );
}
