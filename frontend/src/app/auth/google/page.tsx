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

declare global {
  interface Window {
    google: unknown;
  }
}

export default function GoogleAuthPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [googleUrl, setGoogleUrl] = useState('');

  useEffect(() => {
    // Get Google OAuth URL from backend
    fetchGoogleAuthUrl();
  }, []);

  const fetchGoogleAuthUrl = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google/url`);
      if (response.ok) {
        const data = await response.json();
        setGoogleUrl(data.url);
      }
    } catch (error) {
      console.error('Failed to get Google auth URL:', error);
    }
  };

  const handleGoogleAuth = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // For demo purposes, we'll simulate Google OAuth
      // In production, you would integrate with Google OAuth properly
      const mockGoogleToken = 'mock_google_token_' + Date.now();
      
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          googleToken: mockGoogleToken,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        localStorage.setItem('user', JSON.stringify(data.user));
        setSuccess('Google authentication successful! Redirecting...');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 2000);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Google authentication failed');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedirectToGoogle = () => {
    if (googleUrl) {
      window.open(googleUrl, '_blank');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/auth/login" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Google Authentication</h1>
          <p className="text-gray-600 mt-2">Sign in with your Google account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center mr-3 shadow-sm">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </div>
              Continue with Google
            </CardTitle>
            <CardDescription>
              Use your Google account to sign in to HealthWallet
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button
                onClick={handleGoogleAuth}
                disabled={isLoading}
                className="w-full h-12 text-base"
                variant="outline"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    Authenticating...
                  </>
                ) : (
                  <>
                    <div className="w-5 h-5 mr-3">
                      <svg viewBox="0 0 24 24" className="w-full h-full">
                        <path
                          fill="#4285F4"
                          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        />
                        <path
                          fill="#34A853"
                          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        />
                        <path
                          fill="#FBBC05"
                          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        />
                        <path
                          fill="#EA4335"
                          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        />
                      </svg>
                    </div>
                    Sign in with Google
                  </>
                )}
              </Button>

              {googleUrl && (
                <Button
                  onClick={handleRedirectToGoogle}
                  variant="ghost"
                  className="w-full"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Open Google OAuth in New Tab
                </Button>
              )}
            </div>

            <div className="text-center text-sm text-gray-600">
              <p>
                By continuing, you agree to our{' '}
                <Link href="/terms" className="text-blue-600 hover:text-blue-800">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link href="/privacy" className="text-blue-600 hover:text-blue-800">
                  Privacy Policy
                </Link>
              </p>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert>
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Don&apos;t have a Google account?{' '}
            <Link href="/auth/register" className="text-blue-600 hover:text-blue-800">
              Create one
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
