'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { authService, User } from '@/lib/auth';
import { PageLoader } from '@/components/LoadingSpinner';
import { 
  Shield, 
  FileText, 
  ArrowRight,
  ShieldCheck,
  User as UserIcon,
  Activity,
  TrendingUp,
  Clock,
  Plus
} from 'lucide-react';

const features = [
  {
    title: "Health Records",
    description: "View and manage your medical records",
    href: "/records",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Security Center",
    description: "Monitor your account security",
    href: "/security",
    icon: <Shield className="h-5 w-5" />,
  },
  {
    title: "Profile Settings",
    description: "Update your profile information",
    href: "/profile",
    icon: <UserIcon className="h-5 w-5" />,
  },
  {
    title: "Analytics",
    description: "View your health analytics",
    href: "/analytics",
    icon: <TrendingUp className="h-5 w-5" />,
  },
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [forceRender, setForceRender] = useState(0);
  const pathname = usePathname();

  useEffect(() => {
    const initializeAuth = async () => {
      // Check if user is authenticated
      const isAuth = authService.isAuthenticated();
      console.log('Dashboard: isAuthenticated =', isAuth);
      
      if (!isAuth) {
        console.log('Dashboard: Not authenticated, redirecting to home');
        window.location.href = '/';
        return;
      }

      try {
        console.log('Dashboard: Fetching user profile...');
        const userData = await authService.getProfile();
        console.log('Dashboard: User data received:', userData);
        console.log('Dashboard: Setting user state...');
        setUser(userData);
        console.log('Dashboard: User state set, setting loading to false');
        setLoading(false);
        setForceRender(prev => prev + 1);
        console.log('Dashboard: Loading set to false, component should re-render');
      } catch (error) {
        console.error('Dashboard: Failed to get profile:', error);
        console.log('Dashboard: Profile fetch failed, redirecting to home');
        window.location.href = '/';
        return;
      }
    };

    // Reset state when component mounts or route changes
    setLoading(true);
    setUser(null);
    initializeAuth();
  }, [pathname]);

  // Add loaded class after initial render
  useEffect(() => {
    const timer = setTimeout(() => {
      const mainContainer = document.querySelector('.loading');
      if (mainContainer) {
        mainContainer.classList.remove('loading');
        mainContainer.classList.add('loaded');
      }
    }, 100);
    
    return () => clearTimeout(timer);
  }, []);

  // Debug current state
  console.log('Dashboard render - loading:', loading, 'user:', user, 'forceRender:', forceRender);

  // Monitor state changes
  useEffect(() => {
    console.log('Dashboard: State changed - loading:', loading, 'user:', user);
  }, [loading, user]);

  if (loading) {
    return <PageLoader />;
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-6">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Loading your dashboard...</h2>
          <p className="text-muted-foreground mb-4">Please wait while we load your health data.</p>
          <Button
            onClick={() => window.location.href = '/'}
            variant="outline"
            className="mt-4"
          >
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen loading">
      {/* Welcome Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-cyan-50">
        <div className="container mx-auto px-4 sm:px-6 py-16 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 sm:gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  Welcome back, {user.firstName}!
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                  Your Health Data,
                  <span className="text-blue-600"> Your Control</span>
                </h1>
                <p className="text-xl text-gray-600 max-w-2xl">
                  Manage your medical records with complete privacy and control. 
                  Access your health data anytime, anywhere.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/records">
                    View Records
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/profile">Update Profile</Link>
                </Button>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <div className="grid grid-cols-2 gap-4">
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-blue-100/50 shadow-lg"
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Records</h3>
                    <p className="text-sm text-gray-600">12 files</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-green-100/50 shadow-lg"
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-4">
                      <Shield className="h-6 w-6 text-green-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Security</h3>
                    <p className="text-sm text-gray-600">Protected</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.6 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-purple-100/50 shadow-lg"
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-4">
                      <Activity className="h-6 w-6 text-purple-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Activity</h3>
                    <p className="text-sm text-gray-600">Active</p>
                  </motion.div>

                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: 0.7 }}
                    className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 border border-orange-100/50 shadow-lg"
                  >
                    <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl mb-4">
                      <TrendingUp className="h-6 w-6 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 mb-2">Analytics</h3>
                    <p className="text-sm text-gray-600">Growing</p>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Quick Actions</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Access your most important health management tools
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="h-full"
              >
                <Card className="h-full hover:shadow-lg transition-all duration-300 hover:scale-105 cursor-pointer group flex flex-col">
                  <CardHeader className="pb-4 flex-grow">
                    <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-xl mb-4 group-hover:bg-blue-200 transition-colors">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                    <CardDescription className="flex-grow">{feature.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto">
                    <Button variant="ghost" size="sm" asChild className="w-full">
                      <Link href={feature.href}>
                        Access
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Recent Activity Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Recent Activity</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Your latest health data updates and activities
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="h-full"
            >
              <Card className="h-full flex flex-col">
                <CardHeader className="flex-grow">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">New Record Added</CardTitle>
                      <CardDescription>Blood test results</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    2 hours ago
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="h-full"
            >
              <Card className="h-full flex flex-col">
                <CardHeader className="flex-grow">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full">
                      <Shield className="h-5 w-5 text-green-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Security Update</CardTitle>
                      <CardDescription>Password changed</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    1 day ago
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="h-full"
            >
              <Card className="h-full flex flex-col">
                <CardHeader className="flex-grow">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center justify-center w-10 h-10 bg-purple-100 rounded-full">
                      <UserIcon className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base">Profile Updated</CardTitle>
                      <CardDescription>Contact information</CardDescription>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="mt-auto">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    3 days ago
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-blue-600 to-cyan-600">
        <div className="container mx-auto px-4 sm:px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-white"
          >
            <h2 className="text-3xl font-bold mb-4">Ready to Add New Records?</h2>
            <p className="text-xl text-blue-100 mb-8 max-w-2xl mx-auto">
              Upload your latest medical documents and keep your health data up to date
            </p>
            <Button size="lg" variant="secondary" asChild>
              <Link href="/records">
                <Plus className="mr-2 h-5 w-5" />
                Add New Record
              </Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}