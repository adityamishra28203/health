'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { authService, User } from '@/lib/auth';
import { 
  useDeviceOptimization, 
  getOptimizedTransform, 
  getOptimizedStyle
} from '@/lib/animations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Lock, 
  FileText, 
  Users, 
  Heart, 
  CheckCircle, 
  ArrowRight,
  Star,
  Award,
  Zap,
  Menu,
  X,
  Brain,
  Database,
  Globe,
  Smartphone,
  User as UserIcon,
  LogOut,
  Settings,
  Eye,
  EyeOff
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export default function LandingPage() {
  const router = useRouter();
  const [isVisible, setIsVisible] = useState(false);
  const [scrollY, setScrollY] = useState(0);
  const [activeSection, setActiveSection] = useState('hero');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isPricingOpen, setIsPricingOpen] = useState(false);
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isSignupOpen, setIsSignupOpen] = useState(false);
  
  // Use device optimization hook
  const { deviceInfo, animationConfig } = useDeviceOptimization();

  // Scroll detection for navigation highlighting
  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      setScrollY(scrollPosition);

      // Section detection for navigation highlighting
      const sections = ['hero', 'stats', 'features', 'technology', 'testimonials'];
      const currentSection = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const rect = element.getBoundingClientRect();
          return rect.top <= 100 && rect.bottom >= 100;
        }
        return false;
      });
      
      if (currentSection) {
        setActiveSection(currentSection);
      }
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Initial call
    
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle logo click - redirect to dashboard if logged in, otherwise stay on landing page
  const handleLogoClick = (e: React.MouseEvent) => {
    if (authService.isAuthenticated()) {
      e.preventDefault();
      router.push('/dashboard');
    }
    // If not authenticated, let the default href="/" behavior work
  };

  // Handle logout
  const handleLogout = async () => {
    try {
      await authService.logout();
      setUser(null);
      setIsAuthenticated(false);
      // Force a clean reload to ensure proper state reset
      window.location.reload();
    } catch (error) {
      console.error('Logout error:', error);
      // Even if logout fails, clear the state and reload
      setUser(null);
      setIsAuthenticated(false);
      window.location.reload();
    }
  };

  // Pricing plans data
  const pricingPlans = [
    {
      name: "Basic",
      price: "Free",
      description: "Perfect for individuals getting started",
      features: [
        "Up to 5 health records",
        "Basic encryption",
        "Mobile app access",
        "Email support"
      ],
      buttonText: "Get Started",
      popular: false
    },
    {
      name: "Professional",
      price: "$9.99",
      period: "/month",
      description: "Ideal for healthcare professionals",
      features: [
        "Unlimited health records",
        "Advanced encryption",
        "Blockchain verification",
        "Priority support",
        "Multi-device sync",
        "Export capabilities"
      ],
      buttonText: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "$29.99",
      period: "/month",
      description: "For healthcare organizations",
      features: [
        "Everything in Professional",
        "Team collaboration",
        "Advanced analytics",
        "API access",
        "Custom integrations",
        "24/7 phone support",
        "Compliance reporting"
      ],
      buttonText: "Contact Sales",
      popular: false
    }
  ];
  
  // Refs for sections
  const heroRef = useRef<HTMLDivElement>(null);
  const featuresRef = useRef<HTMLDivElement>(null);
  const statsRef = useRef<HTMLDivElement>(null);
  const technologyRef = useRef<HTMLDivElement>(null);
  const testimonialsRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setIsVisible(true);
    
    // Add loaded class after initial render
    const timer = setTimeout(() => {
      const mainContainer = document.querySelector('.loading');
      if (mainContainer) {
        mainContainer.classList.remove('loading');
        mainContainer.classList.add('loaded');
      }
    }, 100);
    
    return () => clearTimeout(timer);
    
    // Check authentication status
    const checkAuthStatus = async () => {
      const authenticated = authService.isAuthenticated();
      setIsAuthenticated(authenticated);
      
      if (authenticated) {
        try {
          const userData = await authService.getProfile();
          setUser(userData);
        } catch (error) {
          console.error('Failed to get user profile:', error);
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    };
    
    checkAuthStatus();
    
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scroll = window.scrollY;
          setScrollY(scroll);
          
          // Determine active section
          const sections = [
            { ref: heroRef, id: 'hero' },
            { ref: statsRef, id: 'stats' },
            { ref: featuresRef, id: 'features' },
            { ref: technologyRef, id: 'technology' },
            { ref: testimonialsRef, id: 'testimonials' },
            { ref: ctaRef, id: 'cta' }
          ];
          
          for (const section of sections) {
            if (section.ref.current) {
              const rect = section.ref.current.getBoundingClientRect();
              if (rect.top <= 100 && rect.bottom >= 100) {
                setActiveSection(section.id);
                break;
              }
            }
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // Get optimized animation variants (for future use)
  // const optimizedVariants = getOptimizedVariants(deviceInfo, animationConfig);

  const handleGetStarted = () => {
    setIsSignupOpen(true);
  };

  const handleLogin = () => {
    setIsLoginOpen(true);
  };

  // Login form state
  const [loginData, setLoginData] = useState({
    email: '',
    password: ''
  });
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Signup form state
  const [signupData, setSignupData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    role: ''
  });
  const [signupLoading, setSignupLoading] = useState(false);
  const [signupError, setSignupError] = useState('');
  
  // Password visibility states
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [showSignupPassword, setShowSignupPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Auto-hide password functions with delay
  const handlePasswordToggle = (type: 'login' | 'signup' | 'confirm') => {
    if (type === 'login') {
      setShowLoginPassword(true);
      setTimeout(() => setShowLoginPassword(false), 1000); // Hide after 1 second
    } else if (type === 'signup') {
      setShowSignupPassword(true);
      setTimeout(() => setShowSignupPassword(false), 1000); // Hide after 1 second
    } else if (type === 'confirm') {
      setShowConfirmPassword(true);
      setTimeout(() => setShowConfirmPassword(false), 1000); // Hide after 1 second
    }
  };

  // Password encryption function
  const encryptPassword = async (password: string): Promise<string> => {
    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(password);
      const hashBuffer = await crypto.subtle.digest('SHA-256', data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      return hashHex;
    } catch (error) {
      console.error('Password encryption error:', error);
      return password; // Fallback to plain text if encryption fails
    }
  };

  // Login form validation
  const validateLoginForm = () => {
    if (!loginData.email || !loginData.password) {
      setLoginError('Email and password are required');
      return false;
    }

    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(loginData.email)) {
      setLoginError('Please provide a valid email address');
      return false;
    }

    // Password validation - same as signup
    if (loginData.password.length < 8) {
      setLoginError('Password must be at least 8 characters long');
      return false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/;
    if (!passwordRegex.test(loginData.password)) {
      setLoginError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      return false;
    }

    return true;
  };

  // Handle login form submission
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    if (!validateLoginForm()) {
      setLoginLoading(false);
      return;
    }

    try {
      const encryptedPassword = await encryptPassword(loginData.password);
      const response = await authService.login({
        email: loginData.email,
        password: encryptedPassword
      });
      if (response) {
        setUser(response.user);
        setIsAuthenticated(true);
        setIsLoginOpen(false);
        setLoginData({ email: '', password: '' });
        
        // Use window.location.href for immediate navigation without race conditions
        setTimeout(() => {
          window.location.href = '/dashboard';
        }, 100);
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Login failed. Please try again.';
      setLoginError(errorMessage);
    } finally {
      setLoginLoading(false);
    }
  };

  // Signup form validation
  const validateSignupForm = () => {
    // Email validation
    const emailRegex = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
    if (!emailRegex.test(signupData.email)) {
      setSignupError('Please provide a valid email address');
      return false;
    }

    // Name validation
    const nameRegex = /^[a-zA-Z\s]+$/;
    if (!nameRegex.test(signupData.firstName) || !nameRegex.test(signupData.lastName)) {
      setSignupError('Name can only contain letters and spaces');
      return false;
    }

    if (signupData.firstName.length < 2 || signupData.lastName.length < 2) {
      setSignupError('First and last name must be at least 2 characters long');
      return false;
    }

    // Phone validation (optional but if provided, should be valid)
    if (signupData.phone && signupData.phone.length > 0) {
      const phoneRegex = /^\+?[\d\s-()]+$/;
      if (!phoneRegex.test(signupData.phone) || signupData.phone.length < 10) {
        setSignupError('Please provide a valid phone number');
        return false;
      }
    }

    // Role validation
    if (!signupData.role) {
      setSignupError('Please select your role');
      return false;
    }

    // Password validation
    if (signupData.password.length < 8) {
      setSignupError('Password must be at least 8 characters long');
      return false;
    }

    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])/;
    if (!passwordRegex.test(signupData.password)) {
      setSignupError('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character');
      return false;
    }

    if (signupData.password !== signupData.confirmPassword) {
      setSignupError('Passwords do not match');
      return false;
    }

    return true;
  };

  // Handle signup form submission
  const handleSignupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSignupLoading(true);
    setSignupError('');

    if (!validateSignupForm()) {
      setSignupLoading(false);
      return;
    }

    try {
      const encryptedPassword = await encryptPassword(signupData.password);
      const response = await authService.register({
        firstName: signupData.firstName,
        lastName: signupData.lastName,
        email: signupData.email,
        password: encryptedPassword,
        phone: signupData.phone,
        role: signupData.role || 'patient'
      });
      if (response) {
        setUser(response.user);
        setIsAuthenticated(true);
        setIsSignupOpen(false);
        setSignupData({
          firstName: '',
          lastName: '',
          email: '',
          password: '',
          confirmPassword: '',
          phone: '',
          role: ''
        });
        router.push('/dashboard');
      }
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Signup failed. Please try again.';
      setSignupError(errorMessage);
    } finally {
      setSignupLoading(false);
    }
  };
  
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50/30 text-gray-900 overflow-hidden ${deviceInfo.isMobile ? 'scroll-smooth' : ''} loading`}>
      {/* Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        {animationConfig.enableParallax && (
          <>
            <div 
              className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full animate-pulse"
              style={getOptimizedStyle({
                transform: getOptimizedTransform(scrollY * 0.1, deviceInfo, animationConfig),
                willChange: 'transform',
              }, deviceInfo, animationConfig)}
            ></div>
            <div 
              className="absolute top-40 right-20 w-24 h-24 bg-cyan-500/10 rounded-full animate-pulse delay-1000"
              style={getOptimizedStyle({
                transform: getOptimizedTransform(scrollY * -0.05, deviceInfo, animationConfig),
                willChange: 'transform',
              }, deviceInfo, animationConfig)}
            ></div>
            <div 
              className="absolute bottom-20 left-1/3 w-40 h-40 bg-emerald-500/10 rounded-full animate-pulse delay-2000"
              style={getOptimizedStyle({
                transform: getOptimizedTransform(scrollY * 0.08, deviceInfo, animationConfig),
                willChange: 'transform',
              }, deviceInfo, animationConfig)}
            ></div>
          </>
        )}
        {/* Medical Grid Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}></div>
        </div>
        {/* Medical Cross Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%233b82f6' fill-opacity='0.1'%3E%3Cpath d='M30 0h30v30H30zM0 30h30v30H0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}></div>
        </div>
      </div>

      {/* Navigation */}
      <nav 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          scrollY > 50 ? 'bg-white/98 backdrop-blur-3xl shadow-lg border-b border-blue-100/50' : 'bg-white/98 backdrop-blur-3xl'
        }`}
        style={{
          transform: `translateY(${scrollY > 50 ? '0' : '0'})`,
          willChange: 'transform, background-color'
        }}
      >
        <div className="max-w-7xl mx-auto px-2 sm:px-4 md:px-6 py-3 sm:py-4 flex items-center justify-between gap-2 sm:gap-4">
          <Link 
            href="/" 
            onClick={handleLogoClick}
            className="flex items-center space-x-3 group cursor-pointer transition-all duration-300 hover:scale-105"
          >
            <div 
              className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 via-cyan-600 to-emerald-600 rounded-xl flex items-center justify-center transition-all duration-300 group-hover:rotate-12 group-hover:shadow-2xl"
              style={{
                boxShadow: `0 8px 32px rgba(59, 130, 246, 0.3)`,
                transform: `translateZ(0) perspective(1000px)`,
              }}
            >
              <Heart className="w-5 h-5 sm:w-7 sm:h-7 text-white transition-all duration-300 group-hover:scale-110" />
            </div>
            <div>
              <span 
                className={`text-2xl sm:text-3xl font-bold transition-all duration-300 group-hover:scale-105 ${
                  scrollY > 50 
                    ? 'text-gray-800' 
                    : 'bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 bg-clip-text text-transparent'
                }`}
                style={{
                  textShadow: scrollY > 50 ? 'none' : '0 2px 4px rgba(59, 130, 246, 0.1)',
                  transform: `translateZ(0) perspective(1000px)`,
                }}
              >
                SecureHealth
              </span>
              <div 
                className={`text-xs sm:text-sm font-medium transition-all duration-300 group-hover:text-cyan-700 ${
                  scrollY > 50 ? 'text-gray-800' : 'text-cyan-600'
                }`}
                style={{
                  textShadow: 'none',
                }}
              >
                Medical Excellence
              </div>
            </div>
          </Link>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a 
              href="#stats" 
              className={`transition-all duration-300 hover:text-cyan-600 ${
                activeSection === 'stats' ? 'text-cyan-600 font-semibold' : 'text-gray-700'
              }`}
            >
              About
            </a>
            <a 
              href="#features" 
              className={`transition-all duration-300 hover:text-cyan-600 ${
                activeSection === 'features' ? 'text-cyan-600 font-semibold' : 'text-gray-700'
              }`}
            >
              Features
            </a>
            <a 
              href="#technology" 
              className={`transition-all duration-300 hover:text-cyan-600 ${
                activeSection === 'technology' ? 'text-cyan-600 font-semibold' : 'text-gray-700'
              }`}
            >
              Technology
            </a>
            <a 
              href="#testimonials" 
              className={`transition-all duration-300 hover:text-cyan-600 ${
                activeSection === 'testimonials' ? 'text-cyan-600 font-semibold' : 'text-gray-700'
              }`}
            >
              Testimonials
            </a>
            <button
              onClick={() => setIsPricingOpen(true)}
              className="transition-all duration-300 hover:text-cyan-600 text-gray-700 cursor-pointer"
            >
              Plans
            </button>
          </div>

          <div className="flex items-center space-x-2 sm:space-x-4">
            {isAuthenticated && user ? (
              <>
                {/* User Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={user.avatar} alt={`${user.firstName} ${user.lastName}`} />
                        <AvatarFallback>
                          {`${user.firstName[0]}${user.lastName[0]}`}
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{`${user.firstName} ${user.lastName}`}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                <Badge variant="secondary" className="w-fit">
                          {user.role}
                </Badge>
              </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => router.push('/dashboard')}>
                      <Heart className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/profile')}>
                      <UserIcon className="mr-2 h-4 w-4" />
                      <span>Profile</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => router.push('/settings')}>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Settings</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Log out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                
                {/* Mobile Menu Button */}
                <button 
                  className="md:hidden p-2 ml-2 flex-shrink-0"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => isAuthenticated ? setIsPricingOpen(true) : handleLogin()}
                  className="border-blue-200 text-gray-700 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-700 transition-all duration-300 hover:scale-105 hover:shadow-lg bg-transparent text-xs sm:text-sm px-2 sm:px-4"
                >
                  {isAuthenticated ? 'View Plans' : 'Login'}
                </Button>
                <Button 
                  size="sm"
                  onClick={() => isAuthenticated ? router.push('/dashboard') : handleGetStarted()}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-blue-500/25 text-xs sm:text-sm px-2 sm:px-4"
                >
                  {isAuthenticated ? 'Dashboard' : 'Get Started'}
                  <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-1 sm:ml-2" />
                </Button>
                
                {/* Mobile Menu Button */}
                <button 
                  className="md:hidden p-2 ml-2 flex-shrink-0"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                >
                  {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </>
            )}
              </div>
        </div>
        
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden bg-white/98 backdrop-blur-3xl border-t border-blue-100/50">
            <div className="px-4 sm:px-6 py-3 sm:py-4 space-y-4">
              <Link href="#stats" className="block text-gray-700 hover:text-cyan-600 transition-colors">About</Link>
              <Link href="#features" className="block text-gray-700 hover:text-cyan-600 transition-colors">Features</Link>
              <Link href="#technology" className="block text-gray-700 hover:text-cyan-600 transition-colors">Technology</Link>
              <Link href="#testimonials" className="block text-gray-700 hover:text-cyan-600 transition-colors">Testimonials</Link>
              <button onClick={() => setIsPricingOpen(true)} className="block text-gray-700 hover:text-cyan-600 transition-colors text-left">Plans</button>
                    </div>
                      </div>
        )}
      </nav>

      {/* Hero Section */}
      <section 
        ref={heroRef}
        id="hero"
        className="relative pt-24 sm:pt-32 md:pt-40 pb-16 sm:pb-24 px-4 sm:px-6 overflow-hidden"
        style={{
          background: `linear-gradient(135deg, rgba(255,255,255,0.9) 0%, rgba(59, 130, 246, 0.05) 100%)`,
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
        }}
      >
        <div className="max-w-7xl mx-auto relative z-10 w-full">
          <div 
            className={`text-center space-y-6 sm:space-y-8 transition-all duration-1000 ${
              isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
            }`}
          >
            <div className="space-y-4 sm:space-y-6">
              
              <h1 
                className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight tracking-tight"
                style={{
                  background: 'linear-gradient(135deg, #1e40af 0%, #0891b2 50%, #059669 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: '0 4px 8px rgba(30, 64, 175, 0.1)',
                  transform: `translateY(${scrollY * 0.05}px)`,
                  transition: 'transform 0.1s ease-out',
                  lineHeight: '1.2',
                  paddingBottom: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <span className="block animate-bounce-in mb-2 sm:mb-3">
                  Secure Health
                </span>
                <span className="block text-cyan-600 animate-bounce-in delay-200">
                  Data Management
                </span>
              </h1>
                      </div>
            
            <p 
              className="text-base sm:text-lg md:text-xl lg:text-2xl text-gray-600 leading-relaxed max-w-5xl mx-auto font-light px-4"
              style={getOptimizedStyle({
                transform: getOptimizedTransform(scrollY * 0.1, deviceInfo, animationConfig),
                transition: 'transform 0.1s ease-out',
                willChange: 'transform',
              }, deviceInfo, animationConfig)}
            >
              Transform your healthcare experience with blockchain-powered, HIPAA-compliant health record management. 
              Secure, accessible, and completely under your control.
            </p>

            <div 
              className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center px-4"
              style={{
                transform: `translateY(${scrollY * 0.05}px)`,
                transition: 'transform 0.1s ease-out',
              }}
            >
              <Button 
                size="lg"
                onClick={() => isAuthenticated ? router.push('/dashboard') : handleGetStarted()}
                className="bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:from-blue-700 hover:via-cyan-700 hover:to-emerald-700 text-white px-8 sm:px-16 py-4 sm:py-6 text-lg sm:text-xl font-semibold rounded-2xl transition-all duration-300 hover:scale-105 shadow-2xl hover:shadow-blue-500/25 animate-bounce-in delay-300 w-full sm:w-auto"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Start Your Journey'}
                <ArrowRight className="w-6 h-6 ml-3 transition-transform duration-300 group-hover:translateX-1" />
                </Button>
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => isAuthenticated ? setIsPricingOpen(true) : handleLogin()}
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 sm:px-16 py-4 sm:py-6 text-lg sm:text-xl font-semibold rounded-2xl transition-all duration-300 hover:scale-105 animate-bounce-in delay-400 bg-white shadow-lg hover:shadow-xl w-full sm:w-auto"
              >
                {isAuthenticated ? 'View Plans' : 'Sign In'}
                </Button>
                    </div>

            <div 
              className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 pt-6 px-4"
              style={{
                transform: `translateY(${scrollY * 0.02}px)`,
                transition: 'transform 0.1s ease-out',
              }}
            >
              <div className="flex items-center space-x-3 group cursor-pointer transition-all duration-300 hover:scale-105">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <span className="text-sm sm:text-lg text-gray-600 font-medium transition-colors duration-300 group-hover:text-cyan-700">256-bit Encryption</span>
                      </div>
              <div className="flex items-center space-x-3 group cursor-pointer transition-all duration-300 hover:scale-105">
                <CheckCircle className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-600 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12" />
                <span className="text-sm sm:text-lg text-gray-600 font-medium transition-colors duration-300 group-hover:text-cyan-700">Blockchain Verified</span>
                      </div>
                    </div>

            {/* Floating Feature Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 mt-12 sm:mt-16 max-w-5xl mx-auto px-4">
              {[
                {
                  icon: Shield,
                  title: "Secure Storage",
                  description: "Military-grade encryption",
                  color: "from-blue-600 to-cyan-600",
                  delay: 500
                },
                {
                  icon: FileText,
                  title: "Health Records",
                  description: "Organized and accessible",
                  color: "from-cyan-600 to-emerald-600",
                  delay: 600
                },
                {
                  icon: Users,
                  title: "Share Securely",
                  description: "With healthcare providers",
                  color: "from-emerald-600 to-blue-600",
                  delay: 700
                }
              ].map((feature, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 80, scale: 0.8 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-50px" }}
                  transition={{ 
                    duration: 0.7, 
                    delay: index * 0.2,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    y: -15,
                    transition: { duration: 0.3 }
                  }}
                  className="group"
                >
                  <Card 
                    className="bg-white/80 backdrop-blur-sm border-2 border-blue-100/50 hover:shadow-2xl transition-all duration-500 rounded-3xl"
                    style={{
                      transform: `translateY(${scrollY * (0.02 + index * 0.01)}px)`,
                      boxShadow: `0 10px 30px rgba(59, 130, 246, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.1)`,
                    }}
                  >
                    <CardContent className="p-8 text-center">
                      <motion.div 
                        className={`w-20 h-20 bg-gradient-to-br ${feature.color} rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg`}
                        style={{
                          transform: `rotate(${scrollY * 0.02}deg)`,
                        }}
                        whileHover={{ 
                          rotate: 360,
                          scale: 1.2,
                          transition: { duration: 0.6 }
                        }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <feature.icon className="w-10 h-10 text-white" />
                        </motion.div>
                      </motion.div>
                      
                      <motion.h3 
                        className="text-2xl font-semibold text-gray-800 mb-3"
                        transition={{ duration: 0.2 }}
                      >
                        {feature.title}
                      </motion.h3>
                      
                      <motion.p 
                        className="text-gray-600 text-lg"
                        initial={{ opacity: 0.8 }}
                        whileHover={{ opacity: 1 }}
                        transition={{ duration: 0.2 }}
                      >
                        {feature.description}
                      </motion.p>
                  </CardContent>
                </Card>
                </motion.div>
              ))}
              </div>
          </div>
              </div>
      </section>

      {/* Stats Section */}
      <section 
        ref={statsRef}
        id="stats"
        className="py-16 sm:py-20 px-4 sm:px-6 bg-gradient-to-b from-white/50 to-blue-50/30 relative z-10"
      >
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8">
            {[
              { number: "10,000+", label: "Active Users", icon: Users },
              { number: "99.9%", label: "Uptime", icon: Zap },
              { number: "256-bit", label: "Encryption", icon: Lock },
              { number: "24/7", label: "Support", icon: Heart }
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60, scale: 0.8 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  duration: 0.7, 
                  delay: index * 0.15,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                whileHover={{ 
                  scale: 1.05,
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                className="group"
              >
                <Card 
                  className="text-center bg-white/80 backdrop-blur-sm border-blue-100/50 hover:shadow-2xl transition-all duration-500 rounded-3xl p-8"
                  style={{
                    transform: `translateY(${scrollY * (0.01 + index * 0.005)}px)`,
                    boxShadow: `0 10px 30px rgba(59, 130, 246, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.1)`,
                    minHeight: '280px',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'center',
                  }}
                >
                  <motion.div 
                    className="w-20 h-20 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                    whileHover={{ 
                      rotate: 360,
                      scale: 1.1,
                      transition: { duration: 0.6 }
                    }}
                  >
                    <motion.div
                      whileHover={{ scale: 1.1 }}
                      transition={{ duration: 0.2 }}
                    >
                      <stat.icon className="w-10 h-10 text-white" />
                    </motion.div>
              </motion.div>
              
              <motion.div
                    className="text-3xl md:text-4xl font-bold text-gray-800 mb-4"
                    initial={{ opacity: 0, scale: 0.5 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    style={{
                      background: 'linear-gradient(135deg, #1e40af 0%, #0891b2 100%)',
                      WebkitBackgroundClip: 'text',
                      WebkitTextFillColor: 'transparent',
                      textShadow: '0 2px 4px rgba(30, 64, 175, 0.1)',
                      lineHeight: '1.3',
                      paddingBottom: '0.5rem',
                      wordBreak: 'break-word',
                      overflowWrap: 'break-word',
                    }}
                    whileHover={{ 
                      background: 'linear-gradient(135deg, #0891b2 0%, #1e40af 100%)',
                      transition: { duration: 0.3 }
                    }}
                  >
                    {stat.number}
              </motion.div>
                  
                  <motion.div 
                    className="text-base md:text-lg text-gray-600 font-medium leading-relaxed"
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5 + index * 0.1 }}
                  >
                    {stat.label}
            </motion.div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section 
        ref={featuresRef}
        id="features" 
        className="py-20 sm:py-28 px-4 sm:px-6 bg-gradient-to-b from-blue-50/30 to-white/50 relative overflow-hidden z-10"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 2px 2px, #3b82f6 1px, transparent 0)`,
            backgroundSize: '40px 40px',
          }}></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <div 
            className="text-center space-y-6 mb-24"
            style={{
              transform: `translateY(${scrollY * 0.05}px)`,
            }}
          >
            <h2 className="text-6xl md:text-7xl font-bold text-gray-800 tracking-tight">
              <span 
                style={{
                  background: 'linear-gradient(135deg, #1e40af 0%, #0891b2 50%, #059669 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
              Why Choose SecureHealth?
              </span>
            </h2>
            <p className="text-2xl text-gray-600 max-w-5xl mx-auto font-light">
              Experience the future of healthcare data management with cutting-edge technology and uncompromising security.
            </p>
          </div>

          {/* Horizontal Scrolling Container */}
          <div className="relative">
            <div className="flex overflow-x-auto gap-6 sm:gap-8 pb-4 snap-x snap-mandatory px-4 sm:px-0" 
                 style={{ 
                   scrollbarWidth: 'none', 
                   msOverflowStyle: 'none',
                   WebkitScrollbar: 'none'
                 } as React.CSSProperties & { WebkitScrollbar?: string }}>
              {[
                {
                  icon: Lock,
                  title: "End-to-End Encryption",
                  description: "Your health data is protected with military-grade encryption, ensuring complete privacy and security.",
                  color: "from-blue-600 to-cyan-600",
                  delay: 0
                },
                {
                  icon: Zap,
                  title: "Blockchain Technology",
                  description: "Immutable blockchain records ensure data integrity and provide a complete audit trail.",
                  color: "from-cyan-600 to-emerald-600",
                  delay: 200
                },
                {
                  icon: Award,
                  title: "HIPAA Compliant",
                  description: "Fully compliant with healthcare regulations and industry standards for data protection.",
                  color: "from-emerald-600 to-blue-600",
                  delay: 400
                },
                {
                  icon: Smartphone,
                  title: "Mobile Access",
                  description: "Access your health records anywhere, anytime with our secure mobile application.",
                  color: "from-purple-600 to-pink-600",
                  delay: 600
                },
                {
                  icon: Globe,
                  title: "Global Standards",
                  description: "Built with international healthcare data standards for seamless interoperability.",
                  color: "from-orange-600 to-red-600",
                  delay: 800
                }
              ].map((feature, index) => (
              <motion.div
                  key={index}
                  initial={{ opacity: 0, x: 100, scale: 0.8 }}
                  whileInView={{ opacity: 1, x: 0, scale: 1 }}
                  viewport={{ once: true, margin: "-100px" }}
                  transition={{ 
                    duration: 0.8, 
                    delay: index * 0.15,
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  whileHover={{ 
                    scale: 1.05,
                    y: -10,
                    transition: { duration: 0.3 }
                  }}
                  className="group flex-shrink-0 w-64 sm:w-72 md:w-80 snap-center"
                >
                  <Card 
                    className="bg-white/80 backdrop-blur-sm border-2 border-blue-100/50 hover:shadow-2xl transition-all duration-500 rounded-3xl cursor-pointer h-full"
                    style={{
                      boxShadow: `0 10px 30px rgba(59, 130, 246, 0.1), 0 0 0 1px rgba(59, 130, 246, 0.1)`,
                    }}
                  >
                  <CardContent className="p-12 text-center">
                    <motion.div 
                      className={`w-24 h-24 bg-gradient-to-br ${feature.color} rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-lg`}
                      style={{
                        transform: `rotate(${scrollY * 0.02}deg)`,
                      }}
                      whileHover={{ 
                        rotate: 360,
                        scale: 1.2,
                        transition: { duration: 0.6 }
                      }}
                    >
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        transition={{ duration: 0.2 }}
                      >
                        <feature.icon className="w-12 h-12 text-white" />
                      </motion.div>
                    </motion.div>
                    
                    <motion.h3 
                      className="text-3xl font-semibold text-gray-800 mb-6"
                      transition={{ duration: 0.2 }}
                    >
                      {feature.title}
                    </motion.h3>
                    
                    <motion.p 
                      className="text-lg text-gray-600 leading-relaxed"
                      initial={{ opacity: 0.8 }}
                      whileHover={{ opacity: 1 }}
                      transition={{ duration: 0.2 }}
                    >
                      {feature.description}
                    </motion.p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
            </div>
            
            {/* Scroll Indicators */}
            <div className="flex justify-center mt-6 space-x-2">
              {[0, 1, 2, 3, 4].map((index) => (
                <div
                  key={index}
                  className="w-2 h-2 bg-gray-300 rounded-full transition-all duration-300 hover:bg-blue-500 cursor-pointer"
                  onClick={() => {
                    const container = document.querySelector('.overflow-x-auto');
                    if (container) {
                      const cardWidth = window.innerWidth < 640 ? 288 : 320; // w-72 = 288px, w-80 = 320px
                      const gap = 32; // gap-8 = 32px
                      container.scrollTo({
                        left: index * (cardWidth + gap),
                        behavior: 'smooth'
                      });
                    }
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section 
        ref={technologyRef}
        id="technology"
        className="py-28 px-6 bg-gradient-to-b from-white/50 to-blue-50/30 relative z-10"
      >
        <div className="max-w-7xl mx-auto">
          <div 
            className="text-center space-y-6 mb-20"
            style={getOptimizedStyle({
              transform: getOptimizedTransform(scrollY * 0.03, deviceInfo, animationConfig),
              willChange: 'transform',
            }, deviceInfo, animationConfig)}
          >
            <h2 className="text-6xl md:text-7xl font-bold text-gray-800 tracking-tight">
              <span 
                style={{
                  background: 'linear-gradient(135deg, #1e40af 0%, #0891b2 50%, #059669 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Powered by Advanced Technology
              </span>
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-light">
              Built on cutting-edge technologies to ensure the highest levels of security and performance.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { icon: Brain, title: "AI-Powered", description: "Smart health insights and recommendations" },
              { icon: Database, title: "Blockchain", description: "Immutable and tamper-proof records" },
              { icon: Globe, title: "Cloud-Native", description: "Scalable and always available" },
              { icon: Smartphone, title: "Mobile-First", description: "Access your data anywhere, anytime" }
            ].map((tech, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  duration: 0.6, 
                  delay: index * 0.1,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                whileHover={{ 
                  scale: 1.05,
                  y: -10,
                  transition: { duration: 0.3 }
                }}
                className="group"
              >
                <Card 
                  className="bg-white/80 backdrop-blur-sm border-blue-100/50 hover:shadow-xl transition-all duration-500 rounded-3xl p-8 text-center cursor-pointer"
                  style={getOptimizedStyle({
                    transform: getOptimizedTransform(scrollY * (0.01 + index * 0.005), deviceInfo, animationConfig),
                    willChange: 'transform',
                  }, deviceInfo, animationConfig)}
                >
                  <motion.div 
                    className="w-16 h-16 bg-gradient-to-br from-blue-600 to-cyan-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg"
                    whileHover={{ 
                      rotate: 360,
                      scale: 1.1,
                      transition: { duration: 0.5 }
                    }}
                  >
                    <tech.icon className="w-8 h-8 text-white group-hover:scale-110 transition-transform duration-300" />
          </motion.div>
                  <motion.h3 
                    className="text-xl font-semibold text-gray-800 mb-3"
                    transition={{ duration: 0.2 }}
                  >
                    {tech.title}
                  </motion.h3>
                  <motion.p 
                    className="text-gray-600"
                    initial={{ opacity: 0.8 }}
                    whileHover={{ opacity: 1 }}
                    transition={{ duration: 0.2 }}
                  >
                    {tech.description}
                  </motion.p>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section 
        ref={testimonialsRef}
        id="testimonials"
        className="py-28 px-6 bg-gradient-to-b from-blue-50/30 to-white/50 relative z-10"
      >
        <div className="max-w-7xl mx-auto">
          <div 
            className="text-center space-y-6 mb-20"
            style={getOptimizedStyle({
              transform: getOptimizedTransform(scrollY * 0.02, deviceInfo, animationConfig),
              willChange: 'transform',
            }, deviceInfo, animationConfig)}
          >
            <h2 className="text-6xl md:text-7xl font-bold text-gray-800 tracking-tight">
              <span 
                style={{
                  background: 'linear-gradient(135deg, #1e40af 0%, #0891b2 50%, #059669 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Trusted by Healthcare Professionals
              </span>
            </h2>
            <p className="text-2xl text-gray-600 max-w-4xl mx-auto font-light">
              See what medical professionals and patients are saying about SecureHealth.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 sm:gap-8">
            {[
              {
                name: "Dr. Sarah Johnson",
                role: "Chief Medical Officer",
                company: "Metro General Hospital",
                content: "SecureHealth has revolutionized how we manage patient data. The security and ease of access are unmatched.",
                rating: 5
              },
              {
                name: "Michael Chen",
                role: "IT Director",
                company: "Regional Health System",
                content: "The blockchain integration gives us complete confidence in data integrity. It's a game-changer for healthcare.",
                rating: 5
              },
              {
                name: "Dr. Emily Rodriguez",
                role: "Family Physician",
                company: "Community Health Clinic",
                content: "My patients love having instant access to their health records. It improves care coordination significantly.",
                rating: 5
              }
            ].map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 60, rotateY: -15 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ 
                  duration: 0.8, 
                  delay: index * 0.2,
                  ease: [0.25, 0.46, 0.45, 0.94]
                }}
                whileHover={{ 
                  scale: 1.03,
                  y: -8,
                  rotateY: 5,
                  transition: { duration: 0.3 }
                }}
                className="group perspective-1000"
              >
                <Card 
                  className="bg-white/80 backdrop-blur-sm border-blue-100/50 hover:shadow-xl transition-all duration-500 rounded-3xl p-8 cursor-pointer h-full"
                  style={getOptimizedStyle({
                    transform: getOptimizedTransform(scrollY * (0.01 + index * 0.005), deviceInfo, animationConfig),
                    willChange: 'transform',
                  }, deviceInfo, animationConfig)}
                >
                  <motion.div 
                    className="flex items-center space-x-1 mb-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                  >
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, scale: 0 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.5 + index * 0.1 + i * 0.1 }}
                      >
                        <Star className="w-5 h-5 text-yellow-400 fill-current" />
                      </motion.div>
                    ))}
                  </motion.div>
                  
                  <motion.p 
                    className="text-gray-700 text-lg leading-relaxed mb-6"
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    transition={{ delay: 0.4 + index * 0.1 }}
                  >
                    &ldquo;{testimonial.content}&rdquo;
                  </motion.p>
                  
                  <motion.div 
                    className="border-t border-blue-100 pt-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 + index * 0.1 }}
              >
                    <div className="font-semibold text-gray-800">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-600">{testimonial.role}</div>
                    <div className="text-gray-700 font-medium">{testimonial.company}</div>
                  </motion.div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section 
        ref={ctaRef}
        className="py-24 px-6 relative overflow-hidden"
        style={{
          background: `linear-gradient(135deg, #1e40af 0%, #0891b2 50%, #059669 100%)`,
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, #ffffff 1px, transparent 0)`,
            backgroundSize: '20px 20px',
          }}></div>
        </div>

        <div className="max-w-4xl mx-auto text-center text-white relative z-10">
          <motion.h2 
            className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold mb-6 sm:mb-8 tracking-tight leading-tight px-4"
            initial={{ opacity: 0, y: 50 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={getOptimizedStyle({
              transform: getOptimizedTransform(scrollY * 0.005, deviceInfo, animationConfig),
              paddingBottom: '0.5rem',
              willChange: 'transform',
            }, deviceInfo, animationConfig)}
          >
            <motion.span 
              style={{
                background: 'linear-gradient(135deg, #ffffff 0%, #e0f2fe 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
              whileHover={{ 
                background: 'linear-gradient(135deg, #e0f2fe 0%, #ffffff 100%)',
                transition: { duration: 0.3 }
              }}
            >
              Ready to Secure Your Health Data?
            </motion.span>
            </motion.h2>
            
          <motion.p 
            className="text-base sm:text-lg md:text-xl lg:text-2xl text-white/90 mb-8 sm:mb-12 max-w-3xl mx-auto font-light leading-relaxed px-4"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={getOptimizedStyle({
              transform: getOptimizedTransform(scrollY * 0.005, deviceInfo, animationConfig),
              paddingBottom: '0.25rem',
              willChange: 'transform',
            }, deviceInfo, animationConfig)}
          >
            Join thousands of users who trust SecureHealth with their most sensitive health information.
          </motion.p>
          
          <motion.div
            className="flex flex-col sm:flex-row gap-6 justify-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, delay: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
            style={getOptimizedStyle({
              transform: getOptimizedTransform(scrollY * 0.005, deviceInfo, animationConfig),
              willChange: 'transform',
            }, deviceInfo, animationConfig)}
          >
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                size="lg"
                onClick={() => isAuthenticated ? router.push('/dashboard') : handleGetStarted()}
                className="bg-gradient-to-r from-blue-600 via-cyan-600 to-emerald-600 hover:from-blue-700 hover:via-cyan-700 hover:to-emerald-700 text-white px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 text-lg sm:text-xl font-bold rounded-2xl transition-all duration-300 shadow-2xl hover:shadow-blue-500/25"
              >
                {isAuthenticated ? 'Go to Dashboard' : 'Get Started Free'}
                <motion.div
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                >
                  <ArrowRight className="w-6 h-6 ml-3" />
                </motion.div>
              </Button>
          </motion.div>

              <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.8 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Button 
                variant="outline" 
                size="lg"
                onClick={() => isAuthenticated ? setIsPricingOpen(true) : handleLogin()}
                className="border-blue-600 text-blue-600 hover:bg-blue-600 hover:text-white px-8 sm:px-12 md:px-16 py-4 sm:py-5 md:py-6 text-lg sm:text-xl font-bold rounded-2xl transition-all duration-300 bg-white"
              >
                {isAuthenticated ? 'View Plans' : 'Sign In'}
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 px-6 bg-gradient-to-br from-gray-900 via-blue-900 to-slate-900 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8 mb-12">
            <div className="space-y-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-600 via-cyan-600 to-emerald-600 rounded-xl flex items-center justify-center shadow-lg">
                  <Heart className="w-7 h-7 text-white" />
                      </div>
                      <div>
                  <span className="text-3xl font-bold text-white">SecureHealth</span>
                  <div className="text-cyan-400 font-medium">Medical Excellence</div>
                      </div>
                    </div>
              <p className="text-gray-300 text-lg leading-relaxed">
                Secure, blockchain-powered health data management for the modern world.
              </p>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-6 text-xl">Product</h4>
              <div className="space-y-4">
                <Link href="#features" className="block text-gray-300 hover:text-cyan-400 text-lg font-medium transition-colors">Features</Link>
                <Link href="#technology" className="block text-gray-300 hover:text-cyan-400 text-lg font-medium transition-colors">Security</Link>
                <button onClick={() => setIsPricingOpen(true)} className="block text-gray-300 hover:text-cyan-400 text-lg font-medium transition-colors text-left">Pricing</button>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-6 text-xl">Company</h4>
              <div className="space-y-4">
                <Link href="#stats" className="block text-gray-300 hover:text-cyan-400 text-lg font-medium transition-colors">About</Link>
                <Link href="#" className="block text-gray-300 hover:text-cyan-400 text-lg font-medium transition-colors">Blog</Link>
                <Link href="#" className="block text-gray-300 hover:text-cyan-400 text-lg font-medium transition-colors">Careers</Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-6 text-xl">Support</h4>
              <div className="space-y-4">
                <Link href="#" className="block text-gray-300 hover:text-cyan-400 text-lg font-medium transition-colors">Help Center</Link>
                <Link href="#" className="block text-gray-300 hover:text-cyan-400 text-lg font-medium transition-colors">Contact</Link>
                <Link href="#" className="block text-gray-300 hover:text-cyan-400 text-lg font-medium transition-colors">Privacy</Link>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 pt-8 flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-300 text-lg mb-4 md:mb-0">&copy; 2024 SecureHealth. All rights reserved.</p>
            <div className="flex items-center space-x-6">
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-400/30 px-3 py-1">HIPAA Compliant</Badge>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-400/30 px-3 py-1">SOC 2 Certified</Badge>
              <Badge className="bg-cyan-500/20 text-cyan-400 border-cyan-400/30 px-3 py-1">ISO 27001</Badge>
            </div>
          </div>
        </div>
      </footer>

      {/* Login Dialog */}
      <Dialog open={isLoginOpen} onOpenChange={setIsLoginOpen}>
        <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[500px] max-w-md bg-white rounded-3xl shadow-2xl border-0 overflow-hidden p-0">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-gradient-to-br from-blue-600 via-cyan-600 to-emerald-600 p-6 sm:p-8 text-white relative overflow-hidden"
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-10">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
                className="absolute -top-10 -right-10 w-32 h-32 border-4 border-white rounded-full"
              />
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-10 -left-10 w-24 h-24 border-4 border-white rounded-full"
              />
            </div>
            
            <DialogHeader className="text-center relative z-10">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <DialogTitle className="text-3xl font-bold mb-2">Welcome Back</DialogTitle>
                <DialogDescription className="text-gray-600 text-lg">
                  Sign in to your SecureHealth account
                </DialogDescription>
              </motion.div>
            </DialogHeader>
          </motion.div>
          
          {loginError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 mx-6 sm:mx-8">
              {loginError}
          </div>
          )}

          <motion.form 
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.4, delay: 0.3 }}
            onSubmit={handleLoginSubmit} 
            className="p-6 sm:p-8 space-y-4 sm:space-y-6"
          >
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="space-y-2"
            >
              <Label htmlFor="login-email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity }}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                />
                Email Address
              </Label>
              <Input
                id="login-email"
                type="email"
                placeholder="Enter your email"
                value={loginData.email}
                onChange={(e) => setLoginData({ ...loginData, email: e.target.value })}
                className="w-full px-3 sm:px-4 py-3 sm:py-3 sm:py-4 rounded-2xl border-2 border-gray-200 !bg-white !text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:!bg-white focus:!text-gray-900 transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:!bg-white hover:!text-gray-900 transform hover:scale-[1.02]"
                required
              />
            </motion.div>
            
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="space-y-2"
            >
              <Label htmlFor="login-password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                  className="w-2 h-2 bg-cyan-500 rounded-full"
                />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="login-password"
                  type={showLoginPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={loginData.password}
                  onChange={(e) => setLoginData({ ...loginData, password: e.target.value })}
                  className="w-full px-3 sm:px-4 py-3 sm:py-3 sm:py-4 pr-12 rounded-2xl border-2 border-gray-200 !bg-white !text-gray-900 placeholder:text-gray-500 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/20 focus:!bg-white focus:!text-gray-900 transition-all duration-300 hover:border-blue-300 hover:shadow-lg hover:!bg-white hover:!text-gray-900 transform hover:scale-[1.02]"
                  required
                />
                <button
                  type="button"
                  onClick={() => handlePasswordToggle('login')}
                  onMouseDown={(e) => e.preventDefault()}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1"
                >
                  {showLoginPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
        </div>
            </motion.div>

          <motion.div
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3, delay: 0.6 }}
              >
                <Button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3 sm:py-4 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-blue-500/30 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                    className="flex items-center justify-center gap-2"
                  >
                    {loginLoading ? 'Signing In...' : 'Sign In'}
                    <motion.div
                      animate={{ scale: [1, 1.2, 1] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
                      className="w-4 h-4 bg-white/20 rounded-full flex items-center justify-center"
                    >
                      <motion.div
                        animate={{ opacity: [0.5, 1, 0.5] }}
                        transition={{ duration: 1.5, repeat: Infinity }}
                        className="w-2 h-2 bg-white rounded-full"
                      />
                    </motion.div>
                  </motion.span>
                </Button>
              </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.7 }}
              className="text-center pt-4"
            >
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => {
                    setIsLoginOpen(false);
                    setIsSignupOpen(true);
                  }}
                  className="text-gray-700 hover:text-gray-900 font-semibold transition-colors duration-200 relative group"
                >
                  Sign up here
                  <motion.div
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-blue-600 group-hover:w-full transition-all duration-300"
                    initial={false}
                  />
                </motion.button>
              </p>
            </motion.div>
          </motion.form>
        </DialogContent>
      </Dialog>

      {/* Signup Dialog */}
      <Dialog open={isSignupOpen} onOpenChange={setIsSignupOpen}>
        <DialogContent className="w-[95vw] sm:w-[90vw] md:w-[500px] max-w-md bg-white rounded-3xl shadow-2xl border-0 overflow-hidden max-h-[85vh] p-0">
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            className="bg-gradient-to-br from-emerald-600 via-cyan-600 to-blue-600 p-6 sm:p-8 text-white relative overflow-hidden"
          >
            {/* Animated background elements */}
            <div className="absolute inset-0 opacity-10">
              <motion.div
                animate={{ rotate: -360 }}
                transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
                className="absolute -top-10 -right-10 w-32 h-32 border-4 border-white rounded-full"
              />
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
                className="absolute -bottom-10 -left-10 w-24 h-24 border-4 border-white rounded-full"
              />
              <motion.div
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-16 h-16 border-2 border-white rounded-full"
              />
            </div>
            
            <DialogHeader className="text-center relative z-10">
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <DialogTitle className="text-3xl font-bold mb-2">Join SecureHealth</DialogTitle>
                <DialogDescription className="text-emerald-100 text-lg">
                  Create your secure health records account
                </DialogDescription>
              </motion.div>
            </DialogHeader>
          </motion.div>
          
          {signupError && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 mx-6 sm:mx-8">
              {signupError}
            </div>
          )}

          <div className="max-h-[60vh] overflow-y-auto">
            <motion.form 
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.4, delay: 0.3 }}
              onSubmit={handleSignupSubmit} 
              className="p-6 sm:p-8 space-y-4 sm:space-y-6"
            >
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.4 }}
              className="grid grid-cols-2 gap-4"
            >
              <div className="space-y-2">
                <Label htmlFor="signup-firstName" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity }}
                    className="w-2 h-2 bg-emerald-500 rounded-full"
                  />
                  First Name
                </Label>
                <Input
                  id="signup-firstName"
                  type="text"
                  placeholder="First name"
                  value={signupData.firstName}
                  onChange={(e) => setSignupData({ ...signupData, firstName: e.target.value })}
                  className="w-full px-3 sm:px-4 py-3 sm:py-3 sm:py-4 rounded-2xl border-2 border-gray-200 !bg-white !text-gray-900 placeholder:text-gray-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 focus:!bg-white focus:!text-gray-900 transition-all duration-300 hover:border-emerald-300 hover:shadow-lg hover:!bg-white hover:!text-gray-900 transform hover:scale-[1.02]"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="signup-lastName" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <motion.span
                    animate={{ scale: [1, 1.1, 1] }}
                    transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
                    className="w-2 h-2 bg-cyan-500 rounded-full"
                  />
                  Last Name
                </Label>
                <Input
                  id="signup-lastName"
                  type="text"
                  placeholder="Last name"
                  value={signupData.lastName}
                  onChange={(e) => setSignupData({ ...signupData, lastName: e.target.value })}
                  className="w-full px-3 sm:px-4 py-3 sm:py-3 sm:py-4 rounded-2xl border-2 border-gray-200 !bg-white !text-gray-900 placeholder:text-gray-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 focus:!bg-white focus:!text-gray-900 transition-all duration-300 hover:border-emerald-300 hover:shadow-lg hover:!bg-white hover:!text-gray-900 transform hover:scale-[1.02]"
                  required
                />
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.5 }}
              className="space-y-2"
            >
              <Label htmlFor="signup-email" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.6 }}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                />
                Email Address
              </Label>
              <Input
                id="signup-email"
                type="email"
                placeholder="Enter your email"
                value={signupData.email}
                onChange={(e) => setSignupData({ ...signupData, email: e.target.value })}
                className="w-full px-3 sm:px-4 py-3 sm:py-3 sm:py-4 rounded-2xl border-2 border-gray-200 !bg-white !text-gray-900 placeholder:text-gray-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 focus:!bg-white focus:!text-gray-900 transition-all duration-300 hover:border-emerald-300 hover:shadow-lg hover:!bg-white hover:!text-gray-900 transform hover:scale-[1.02]"
                required
              />
            </motion.div>
            
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.6 }}
              className="space-y-2"
            >
              <Label htmlFor="signup-phone" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 0.9 }}
                  className="w-2 h-2 bg-cyan-500 rounded-full"
                />
                Phone Number
              </Label>
              <Input
                id="signup-phone"
                type="tel"
                placeholder="Enter your phone number"
                value={signupData.phone}
                onChange={(e) => setSignupData({ ...signupData, phone: e.target.value })}
                className="w-full px-3 sm:px-4 py-3 sm:py-3 sm:py-4 rounded-2xl border-2 border-gray-200 !bg-white !text-gray-900 placeholder:text-gray-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 focus:!bg-white focus:!text-gray-900 transition-all duration-300 hover:border-emerald-300 hover:shadow-lg hover:!bg-white hover:!text-gray-900 transform hover:scale-[1.02]"
              />
            </motion.div>
            
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.65 }}
              className="space-y-2"
            >
              <Label htmlFor="signup-role" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1.0 }}
                  className="w-2 h-2 bg-emerald-500 rounded-full"
                />
                I am a
              </Label>
              <Select value={signupData.role} onValueChange={(value) => setSignupData({ ...signupData, role: value })}>
                <SelectTrigger className="w-full px-3 sm:px-4 py-3 sm:py-4 rounded-2xl border-2 border-gray-200 !bg-white !text-gray-900 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 focus:!bg-white focus:!text-gray-900 transition-all duration-300 hover:border-emerald-300 hover:shadow-lg hover:!bg-white hover:!text-gray-900 transform hover:scale-[1.02]">
                  <SelectValue placeholder="Select your role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                  <SelectItem value="hospital_admin">Hospital Admin</SelectItem>
                  <SelectItem value="insurer">Insurer</SelectItem>
                  <SelectItem value="system_admin">System Admin</SelectItem>
                </SelectContent>
              </Select>
            </motion.div>
            
            <motion.div 
              initial={{ x: 20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.7 }}
              className="space-y-2"
            >
              <Label htmlFor="signup-password" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1.2 }}
                  className="w-2 h-2 bg-emerald-500 rounded-full"
                />
                Password
              </Label>
              <div className="relative">
                <Input
                  id="signup-password"
                  type={showSignupPassword ? "text" : "password"}
                  placeholder="Create a password"
                  value={signupData.password}
                  onChange={(e) => setSignupData({ ...signupData, password: e.target.value })}
                  className="w-full px-3 sm:px-4 py-3 sm:py-3 sm:py-4 pr-12 rounded-2xl border-2 border-gray-200 !bg-white !text-gray-900 placeholder:text-gray-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 focus:!bg-white focus:!text-gray-900 transition-all duration-300 hover:border-emerald-300 hover:shadow-lg hover:!bg-white hover:!text-gray-900 transform hover:scale-[1.02]"
                  required
                />
                <button
                  type="button"
                  onClick={() => handlePasswordToggle('signup')}
                  onMouseDown={(e) => e.preventDefault()}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1"
                >
                  {showSignupPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
              {signupData.password && (
                <div className="mt-2 text-xs space-y-1">
                  <div className={`flex items-center gap-2 ${/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?])(?=.{8,})/.test(signupData.password) ? 'text-green-600' : 'text-red-500'}`}>
                    <span className="w-1 h-1 rounded-full bg-current"></span>
                    At least 8 characters with uppercase, lowercase, number, and special character
                  </div>
                </div>
              )}
            </motion.div>
            
            <motion.div 
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.8 }}
              className="space-y-2"
            >
              <Label htmlFor="signup-confirmPassword" className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                <motion.span
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, delay: 1.5 }}
                  className="w-2 h-2 bg-blue-500 rounded-full"
                />
                Confirm Password
              </Label>
              <div className="relative">
                <Input
                  id="signup-confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirm your password"
                  value={signupData.confirmPassword}
                  onChange={(e) => setSignupData({ ...signupData, confirmPassword: e.target.value })}
                  className="w-full px-3 sm:px-4 py-3 sm:py-3 sm:py-4 pr-12 rounded-2xl border-2 border-gray-200 !bg-white !text-gray-900 placeholder:text-gray-500 focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/20 focus:!bg-white focus:!text-gray-900 transition-all duration-300 hover:border-emerald-300 hover:shadow-lg hover:!bg-white hover:!text-gray-900 transform hover:scale-[1.02]"
                  required
                />
                <button
                  type="button"
                  onClick={() => handlePasswordToggle('confirm')}
                  onMouseDown={(e) => e.preventDefault()}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors duration-200 p-1"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.85 }}
              className="flex items-start gap-3"
            >
              <input
                type="checkbox"
                className="mt-1 h-4 w-4 text-emerald-600 bg-white border-gray-300 rounded focus:ring-emerald-500 focus:ring-2"
                required
              />
              <label className="text-sm text-gray-600 leading-relaxed">
                I agree to the{' '}
                <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-emerald-600 hover:text-emerald-700 font-medium">
                  Privacy Policy
                </a>
              </label>
            </motion.div>
            
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.9 }}
            >
              <Button
                type="submit"
                disabled={signupLoading}
                className="w-full py-3 sm:py-4 bg-gradient-to-r from-emerald-600 to-cyan-600 hover:from-emerald-700 hover:to-cyan-700 text-white font-bold rounded-2xl transition-all duration-300 hover:scale-105 shadow-xl hover:shadow-emerald-500/30 transform hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <motion.span
                  animate={{ x: [0, 5, 0] }}
                  transition={{ duration: 1.5, repeat: Infinity }}
                  className="flex items-center justify-center gap-2"
                >
                  {signupLoading ? 'Creating Account...' : 'Create Account'}
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                    className="w-4 h-4"
                  >
                    ✨
                  </motion.div>
                </motion.span>
              </Button>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 1.0 }}
              className="text-center pt-4"
            >
              <p className="text-sm text-gray-600">
                Already have an account?{' '}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="button"
                  onClick={() => {
                    setIsSignupOpen(false);
                    setIsLoginOpen(true);
                  }}
                  className="text-emerald-600 hover:text-emerald-700 font-semibold transition-colors duration-200 relative group"
                >
                  Sign in here
                  <motion.div
                    className="absolute -bottom-1 left-0 w-0 h-0.5 bg-emerald-600 group-hover:w-full transition-all duration-300"
                    initial={false}
                  />
                </motion.button>
              </p>
            </motion.div>
          </motion.form>
          </div>
        </DialogContent>
      </Dialog>

      {/* Pricing Dialog */}
      <Dialog open={isPricingOpen} onOpenChange={setIsPricingOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center pb-6">
            <DialogTitle className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-cyan-600 bg-clip-text text-transparent">
              Choose Your Plan
            </DialogTitle>
            <DialogDescription className="text-xl text-gray-600 mt-4">
              Select the perfect plan for your healthcare needs
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid md:grid-cols-3 gap-8 p-6">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative bg-white rounded-2xl shadow-lg border-2 transition-all duration-300 hover:shadow-2xl hover:scale-105 ${
                  plan.popular ? 'border-blue-500 shadow-blue-500/20' : 'border-gray-200'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-1 text-sm font-semibold">
                      Most Popular
                    </Badge>
                  </div>
                )}
                
                <div className="p-8">
                  <div className="text-center mb-6">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                    <p className="text-gray-600 mb-4">{plan.description}</p>
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                      {plan.period && (
                        <span className="text-gray-600 ml-1">{plan.period}</span>
                      )}
                    </div>
                  </div>
                  
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((feature, featureIndex) => (
                      <motion.li
                        key={featureIndex}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.3, delay: (index * 0.1) + (featureIndex * 0.05) }}
                        className="flex items-center space-x-3"
                      >
                        <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-gray-700">{feature}</span>
                      </motion.li>
                    ))}
                  </ul>
                  
                  <Button
                    className={`w-full py-3 text-lg font-semibold rounded-xl transition-all duration-300 ${
                      plan.popular
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white shadow-lg hover:shadow-blue-500/25'
                        : 'bg-gray-100 hover:bg-gray-200 text-gray-900'
                    }`}
                    onClick={() => {
                      setIsPricingOpen(false);
                      if (plan.name === 'Basic') {
                        setIsSignupOpen(true);
                      } else if (plan.name === 'Professional') {
                        router.push('/dashboard');
                      } else {
                        // Contact sales - could open contact form or redirect
                        router.push('/dashboard');
                      }
                    }}
                  >
                    {plan.buttonText}
              </Button>
            </div>
          </motion.div>
            ))}
        </div>
          
          <div className="text-center mt-8 p-6 bg-gray-50 rounded-xl">
            <p className="text-gray-600 mb-4">
              All plans include 30-day money-back guarantee
            </p>
            <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center space-x-2">
                <Shield className="w-4 h-4" />
                <span>256-bit Encryption</span>
              </div>
              <div className="flex items-center space-x-2">
                <CheckCircle className="w-4 h-4" />
                <span>HIPAA Compliant</span>
              </div>
              <div className="flex items-center space-x-2">
                <Database className="w-4 h-4" />
                <span>Blockchain Verified</span>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}// Force redeploy Mon Sep 29 22:59:47 IST 2025
