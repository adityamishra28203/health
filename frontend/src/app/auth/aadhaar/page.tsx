'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  CreditCard,
  Shield,
  Smartphone
} from 'lucide-react';
import Link from 'next/link';

export default function AadhaarAuthPage() {
  const [aadhaarNumber, setAadhaarNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate Aadhaar OTP API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setOtpSent(true);
      setSuccess('OTP sent to your registered mobile number. Use 123456 as OTP for demo.');
    } catch {
      setError('Failed to send OTP. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Simulate OTP verification
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (otp === '123456') {
        // Mock successful Aadhaar verification
        const mockUser = {
          id: "aadhaar_user_" + Date.now(),
          name: "Aadhaar User",
          email: "user@aadhaar.com",
          aadhaarNumber: aadhaarNumber,
          role: "Patient",
          provider: "aadhaar",
          aadhaarVerified: true,
          verified: true
        };
        
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('access_token', 'mock_aadhaar_token_' + Date.now());
        localStorage.setItem('auth_provider', 'aadhaar');
        
        setSuccess('Aadhaar verification successful! Redirecting...');
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      } else {
        setError('Invalid OTP. Please enter 123456 for demo.');
      }
    } catch {
      setError('Invalid OTP. Please try again.');
    } finally {
      setIsLoading(false);
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
            <CardTitle className="text-3xl font-bold">Aadhaar eKYC</CardTitle>
            <CardDescription>
              Verify your identity using Aadhaar for secure authentication.
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

            {!otpSent ? (
              <form onSubmit={handleSendOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="aadhaar">Aadhaar Number</Label>
                  <div className="relative">
                    <CreditCard className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="aadhaar"
                      type="text"
                      placeholder="1234 5678 9012"
                      value={aadhaarNumber}
                      onChange={(e) => setAadhaarNumber(e.target.value)}
                      className="pl-10"
                      maxLength={14}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Enter your 12-digit Aadhaar number
                  </p>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Shield className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Secure Verification</h4>
                      <p className="text-sm text-blue-700 mt-1">
                        Your Aadhaar data is encrypted and processed securely. We only verify your identity, not store your Aadhaar number.
                      </p>
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending OTP...
                    </>
                  ) : (
                    'Send OTP to Registered Mobile'
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleVerifyOtp} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP</Label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter 6-digit OTP"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      className="pl-10"
                      maxLength={6}
                      required
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    OTP sent to mobile number linked with Aadhaar
                  </p>
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    'Verify OTP'
                  )}
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full"
                  onClick={() => {
                    setOtpSent(false);
                    setOtp('');
                    setError('');
                    setSuccess('');
                  }}
                >
                  Change Aadhaar Number
                </Button>
              </form>
            )}

            <div className="mt-6 text-center text-sm text-muted-foreground">
              <p>
                This is a mock Aadhaar eKYC integration for demonstration purposes. 
                In production, this would integrate with UIDAI's eKYC services.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
