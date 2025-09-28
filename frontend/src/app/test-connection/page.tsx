'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { CheckCircle, XCircle, Loader2, RefreshCw } from 'lucide-react';

interface ConnectionStatus {
  status: string;
  backend?: any;
  error?: string;
  backend_url?: string;
  frontend?: any;
}

export default function TestConnectionPage() {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const testConnection = async () => {
    setIsLoading(true);
    setConnectionStatus(null);

    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setConnectionStatus(data);
    } catch (error) {
      setConnectionStatus({
        status: 'frontend_error',
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    testConnection();
  }, []);

  const getStatusIcon = () => {
    if (isLoading) return <Loader2 className="h-5 w-5 animate-spin" />;
    if (connectionStatus?.status === 'connected') return <CheckCircle className="h-5 w-5 text-green-500" />;
    return <XCircle className="h-5 w-5 text-red-500" />;
  };

  const getStatusColor = () => {
    if (connectionStatus?.status === 'connected') return 'text-green-600';
    if (connectionStatus?.status === 'backend_error') return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Backend Connection Test</CardTitle>
            <CardDescription>
              Testing the connection between your frontend and backend
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {getStatusIcon()}
                <span className={`font-medium ${getStatusColor()}`}>
                  {isLoading ? 'Testing...' : connectionStatus?.status || 'Not tested'}
                </span>
              </div>
              <Button onClick={testConnection} disabled={isLoading} variant="outline" size="sm">
                <RefreshCw className="h-4 w-4 mr-2" />
                Test Again
              </Button>
            </div>

            {connectionStatus && (
              <div className="space-y-4">
                {connectionStatus.status === 'connected' && (
                  <Alert>
                    <CheckCircle className="h-4 w-4" />
                    <AlertDescription>
                      ✅ Frontend is successfully connected to backend!
                    </AlertDescription>
                  </Alert>
                )}

                {connectionStatus.status === 'backend_error' && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      ⚠️ Backend is responding but with errors. Status: {connectionStatus.error}
                    </AlertDescription>
                  </Alert>
                )}

                {connectionStatus.status === 'connection_failed' && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription>
                      ❌ Cannot connect to backend. Error: {connectionStatus.error}
                    </AlertDescription>
                  </Alert>
                )}

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h3 className="font-semibold mb-2">Connection Details:</h3>
                  <pre className="text-sm overflow-auto">
                    {JSON.stringify(connectionStatus, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
