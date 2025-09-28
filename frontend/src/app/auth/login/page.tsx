"use client";

import { useState, useEffect } from "react";

// Declare Google types
declare global {
  interface Window {
    google: any;
  }
}
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import { Heart, Mail, Lock, Eye, EyeOff, Shield, Smartphone, Loader2 } from "lucide-react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  // Load Google Identity Services
  useEffect(() => {
    const loadGoogleScript = () => {
      if (typeof window !== 'undefined' && !window.google) {
        const script = document.createElement('script');
        script.src = 'https://accounts.google.com/gsi/client';
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);
      }
    };

    loadGoogleScript();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");
    setSuccess("");
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock successful login
      const mockUser = {
        id: "login_user_" + Date.now(),
        name: "John Doe",
        email: email,
        role: "Patient",
        provider: "email",
        verified: true
      };
      
      localStorage.setItem("user", JSON.stringify(mockUser));
      localStorage.setItem("access_token", "mock_login_token_" + Date.now());
      localStorage.setItem("auth_provider", "email");
      
      setSuccess("Login successful! Redirecting...");
      // Redirect to dashboard
      setTimeout(() => {
        router.push("/dashboard");
      }, 1500);
    } catch (error) {
      setError("Login failed. Please check your credentials.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Use Google Identity Services for direct Google login
      if (typeof window !== 'undefined' && window.google) {
        const client = window.google.accounts.oauth2.initCodeClient({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          scope: 'email profile',
          callback: async (response: any) => {
            try {
              // Send the authorization code to your backend
              const backendResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/google-login`, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  code: response.code
                }),
              });

              if (backendResponse.ok) {
                const authData = await backendResponse.json();
                localStorage.setItem('user', JSON.stringify(authData.user));
                localStorage.setItem('access_token', authData.accessToken);
                localStorage.setItem('auth_provider', 'google');
                
                setSuccess('Google login successful! Redirecting...');
                setTimeout(() => {
                  router.push('/dashboard');
                }, 1500);
              } else {
                const errorData = await backendResponse.json();
                setError(errorData.message || 'Google login failed');
              }
            } catch (error) {
              setError('Google login failed. Please try again.');
            }
          }
        });

        client.requestCode();
      } else {
        setError('Google services not available. Please try again.');
      }
    } catch (error: unknown) {
      setError((error as Error).message || "Google sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMobileLogin = async () => {
    setIsLoading(true);
    setError("");
    setSuccess("");

    try {
      // Show mobile number input for OTP login
      const phoneNumber = prompt('Enter your phone number (e.g., +1234567890):');
      
      if (phoneNumber) {
        // Send OTP to the phone number
        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/send-otp`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            phone: phoneNumber,
            type: 'login'
          }),
        });

        if (response.ok) {
          setSuccess('OTP sent to your phone number. Please check your messages.');
          
          // Get OTP from user
          const otpCode = prompt('Enter the OTP sent to your phone:');
          
          if (otpCode) {
            // Verify OTP and login
            const verifyResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/verify-otp-login`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                phone: phoneNumber,
                otp: otpCode
              }),
            });

            if (verifyResponse.ok) {
              const authData = await verifyResponse.json();
              localStorage.setItem('user', JSON.stringify(authData.user));
              localStorage.setItem('access_token', authData.accessToken);
              localStorage.setItem('auth_provider', 'phone');
              
              setSuccess('Mobile login successful! Redirecting...');
              setTimeout(() => {
                router.push('/dashboard');
              }, 1500);
            } else {
              const errorData = await verifyResponse.json();
              setError(errorData.message || 'OTP verification failed');
            }
          } else {
            setError('OTP is required for mobile login');
          }
        } else {
          const errorData = await response.json();
          setError(errorData.message || 'Failed to send OTP');
        }
      } else {
        setError('Phone number is required for mobile login');
      }
    } catch (error: unknown) {
      setError((error as Error).message || "Mobile sign-in failed");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary/10 via-background to-secondary/10 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="w-full max-w-md"
      >
        <Card className="shadow-2xl">
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
                <Heart className="h-6 w-6 text-primary-foreground" />
              </div>
            </div>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>
              Sign in to your HealthWallet account
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6">
            {error && (
              <div className="p-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                {error}
              </div>
            )}
            {success && (
              <div className="p-4 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                {success}
              </div>
            )}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 pr-10"
                    required
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked === true)}
                  />
                  <Label htmlFor="remember" className="text-sm">
                    Remember me
                  </Label>
                </div>
                <Link
                  href="/auth/forgot-password"
                  className="text-sm text-primary hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
              
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading}
              >
                {isLoading ? "Signing in..." : "Sign In"}
              </Button>
            </form>
            
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator className="w-full" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or continue with
                </span>
              </div>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              <Button
                variant="outline"
                className="w-full"
                onClick={handleGoogleLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <div className="w-4 h-4 mr-2">
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
              
              <Button
                variant="outline"
                className="w-full"
                onClick={handleMobileLogin}
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    <Smartphone className="h-4 w-4 mr-2" />
                    Sign in with Mobile
                  </>
                )}
              </Button>
            </div>

            <Separator className="my-6" />
            
            <div className="space-y-3">
              <h3 className="text-sm font-medium text-center text-muted-foreground">
                Alternative Login Methods
              </h3>
              
            </div>
            
            <div className="text-center">
              <p className="text-sm text-muted-foreground">
                Don&apos;t have an account?{" "}
                <Link href="/auth/register" className="text-primary hover:underline">
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
        
      </motion.div>
    </div>
  );
}
