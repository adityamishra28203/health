'use client';

import React, { Component, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  isChunkLoadError: boolean;
}

export class ChunkLoadErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, isChunkLoadError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    // Check if this is a chunk loading error
    const isChunkLoadError = error.message.includes('ChunkLoadError') || 
                            error.message.includes('Loading chunk') ||
                            error.message.includes('Loading CSS chunk');
    
    return {
      hasError: true,
      error,
      isChunkLoadError
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ChunkLoadErrorBoundary caught an error:', error, errorInfo);
  }

  handleRetry = () => {
    if (this.state.isChunkLoadError) {
      // For chunk load errors, force a hard refresh to get new chunks
      window.location.reload();
    } else {
      // For other errors, reset the error boundary
      this.setState({ hasError: false, error: undefined, isChunkLoadError: false });
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription className="space-y-4">
                <div>
                  <h2 className="font-semibold text-lg mb-2">
                    {this.state.isChunkLoadError ? 'Loading Error' : 'Something went wrong!'}
                  </h2>
                  <p className="text-sm">
                    {this.state.isChunkLoadError 
                      ? 'There was a problem loading the application. This usually happens after a deployment update.'
                      : 'An unexpected error occurred. Please try again.'
                    }
                  </p>
                </div>
                
                <div className="flex gap-2">
                  <Button onClick={this.handleRetry} size="sm">
                    <RefreshCw className="w-4 h-4 mr-2" />
                    {this.state.isChunkLoadError ? 'Reload Page' : 'Try Again'}
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

    return this.props.children;
  }
}
