'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  // Check if this is a chunk loading error
  const isChunkLoadError = error.message.includes('ChunkLoadError') || 
                          error.message.includes('Loading chunk') ||
                          error.message.includes('Loading CSS chunk');

  const handleRetry = () => {
    if (isChunkLoadError) {
      // For chunk load errors, force a hard refresh
      window.location.reload();
    } else {
      // For other errors, try to reset
      reset();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="space-y-4">
            <div>
              <h2 className="font-semibold text-lg mb-2">
                {isChunkLoadError ? 'Loading Error' : 'Something went wrong!'}
              </h2>
              <p className="text-sm">
                {isChunkLoadError 
                  ? 'There was a problem loading the application. This usually happens after a deployment update.'
                  : 'An unexpected error occurred. Please try again.'
                }
              </p>
            </div>
            
            {process.env.NODE_ENV === 'development' && (
              <details className="text-xs">
                <summary className="cursor-pointer font-medium">Error details</summary>
                <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-auto">
                  {error.message}
                </pre>
              </details>
            )}
            
            <div className="flex gap-2">
              <Button onClick={handleRetry} size="sm">
                <RefreshCw className="w-4 h-4 mr-2" />
                {isChunkLoadError ? 'Reload Page' : 'Try Again'}
              </Button>
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => window.location.href = '/'}
              >
                Go Home
              </Button>
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
