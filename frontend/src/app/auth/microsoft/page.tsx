'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  ExternalLink
} from 'lucide-react';
import Link from 'next/link';

export default function MicrosoftAuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [microsoftUrl, setMicrosoftUrl] = useState('');

  useEffect(() => {
    // Get Microsoft OAuth URL from backend
    fetchMicrosoftAuthUrl();
  }, []);

  const fetchMicrosoftAuthUrl = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/microsoft/url`);
      if (response.ok) {
        const data = await response.json();
        setMicrosoftUrl(data.url);
      }
    } catch {
      // Handle error silently or log
    }
  };

  const handleMicrosoftAuth = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // For demo purposes, we'll simulate Microsoft OAuth
      // In production, you would integrate with Microsoft OAuth properly
      const mockMicrosoftToken = 'mock_microsoft_token_' + Date.now();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/microsoft`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          microsoftToken: mockMicrosoftToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setSuccess('Microsoft authentication successful! Redirecting...');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Microsoft authentication failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedirectToMicrosoft = () => {
    if (microsoftUrl) {
      window.open(microsoftUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/auth/login" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to login options
          </Link>
        </div>
        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold">Microsoft Authentication</CardTitle>
            <CardDescription>
              Sign in or register using your Microsoft account.
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            {success && (
              <Alert className="mb-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <Button onClick={handleMicrosoftAuth} className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Authenticating with Microsoft...
                  </>
                ) : (
                  'Continue with Microsoft (Mock)'
                )}
              </Button>
              {microsoftUrl && (
                <Button onClick={handleRedirectToMicrosoft} className="w-full" variant="outline">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Microsoft Login in New Tab
                </Button>
              )}
            </div>

            <div className="mt-6 text-center text-sm text-muted-foreground">
              This is a mock integration for demonstration. In a real application, you would be redirected to Microsoft's OAuth consent screen.
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
