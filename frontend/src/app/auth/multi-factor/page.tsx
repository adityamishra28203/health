'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Smartphone, 
  Mail, 
  Shield, 
  CheckCircle, 
  Clock, 
  ArrowLeft,
  Loader2
} from 'lucide-react';
import Link from 'next/link';

export default function MultiFactorAuthPage() {
  const [activeTab, setActiveTab] = useState('phone');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSendOtp = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const identifier = activeTab === 'phone' ? phone : email;
      const type = activeTab === 'phone' ? 'phone' : 'email';

      // Simulate OTP sending (mock implementation)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setOtpSent(true);
      setSuccess(`OTP sent to your ${activeTab}. Use 123456 as OTP for demo.`);
      setCountdown(60);
      startCountdown();
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      const identifier = activeTab === 'phone' ? phone : email;
      const type = activeTab === 'phone' ? 'phone' : 'email';

      // Simulate OTP verification (mock implementation)
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      if (otpCode === '123456') {
        const mockUser = {
          id: "otp_user_" + Date.now(),
          name: "OTP User",
          email: identifier.includes('@') ? identifier : identifier + '@example.com',
          phone: identifier.includes('@') ? '+919876543210' : identifier,
          role: "Patient",
          provider: "otp",
          verified: true
        };
        
        localStorage.setItem('access_token', 'mock_otp_token_' + Date.now());
        localStorage.setItem('user', JSON.stringify(mockUser));
        localStorage.setItem('auth_provider', 'otp');
        
        setSuccess('OTP verified! Login successful! Redirecting...');
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 1500);
      } else {
        setError('Invalid OTP. Please enter 123456 for demo.');
      }
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const startCountdown = () => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  const handleResendOtp = () => {
    setOtpSent(false);
    setOtpCode('');
    handleSendOtp();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6">
          <Link href="/auth/login" className="inline-flex items-center text-sm text-gray-600 hover:text-gray-900 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Login
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Multi-Factor Authentication</h1>
          <p className="text-gray-600 mt-2">Choose your preferred verification method</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Shield className="h-5 w-5 mr-2 text-blue-600" />
              Secure Login
            </CardTitle>
            <CardDescription>
              Verify your identity using your phone number or email address
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="phone" className="flex items-center">
                  <Smartphone className="h-4 w-4 mr-2" />
                  Phone
                </TabsTrigger>
                <TabsTrigger value="email" className="flex items-center">
                  <Mail className="h-4 w-4 mr-2" />
                  Email
                </TabsTrigger>
              </TabsList>

              <TabsContent value="phone" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="+1 (555) 123-4567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    disabled={otpSent}
                  />
                </div>
              </TabsContent>

              <TabsContent value="email" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={otpSent}
                  />
                </div>
              </TabsContent>
            </Tabs>

            {!otpSent ? (
              <Button
                onClick={handleSendOtp}
                disabled={isLoading || (activeTab === 'phone' ? !phone : !email)}
                className="w-full mt-6"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Sending OTP...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Send OTP
                  </>
                )}
              </Button>
            ) : (
              <div className="space-y-4 mt-6">
                <div className="space-y-2">
                  <Label htmlFor="otp">Enter OTP Code</Label>
                  <Input
                    id="otp"
                    type="text"
                    placeholder="Enter 6-digit code"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                    className="text-center text-lg tracking-widest"
                  />
                  <div className="flex items-center justify-between text-sm text-gray-600">
                    <span>Code expires in:</span>
                    <Badge variant={countdown > 10 ? 'default' : 'destructive'}>
                      <Clock className="h-3 w-3 mr-1" />
                      {countdown}s
                    </Badge>
                  </div>
                </div>

                <Button
                  onClick={handleVerifyOtp}
                  disabled={isLoading || otpCode.length !== 6}
                  className="w-full"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Verifying...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Verify OTP
                    </>
                  )}
                </Button>

                <div className="text-center">
                  <Button
                    variant="ghost"
                    onClick={handleResendOtp}
                    disabled={countdown > 0}
                    className="text-sm"
                  >
                    Resend OTP {countdown > 0 && `(${countdown}s)`}
                  </Button>
                </div>
              </div>
            )}

            {error && (
              <Alert className="mt-4" variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {success && (
              <Alert className="mt-4">
                <CheckCircle className="h-4 w-4" />
                <AlertDescription>{success}</AlertDescription>
              </Alert>
            )}
          </CardContent>
        </Card>

        <div className="mt-6 text-center text-sm text-gray-600">
          <p>
            Having trouble?{' '}
            <Link href="/auth/help" className="text-blue-600 hover:text-blue-800">
              Get help
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
