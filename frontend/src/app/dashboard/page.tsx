'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { authService, User } from '@/lib/auth';
import { 
  Heart, 
  Shield, 
  FileText, 
  Lock, 
  Smartphone, 
  Globe, 
  CheckCircle, 
  ArrowRight,
  Users,
  ShieldCheck,
  User as UserIcon,
  Activity,
  TrendingUp
} from 'lucide-react';

const features = [
  {
    icon: <Lock className="h-6 w-6" />,
    title: "End-to-End Encryption",
    description: "Your health data is encrypted using military-grade security protocols.",
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Blockchain Verification",
    description: "All records are verified on blockchain for tamper-proof authenticity.",
  },
  {
    icon: <FileText className="h-6 w-6" />,
    title: "Digital Signatures",
    description: "Medical records are digitally signed by verified healthcare providers.",
  },
  {
    icon: <Smartphone className="h-6 w-6" />,
    title: "Mobile Access",
    description: "Access your health records anytime, anywhere on your mobile device.",
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Multi-language Support",
    description: "Available in English and Hindi for better accessibility.",
  },
  {
    icon: <CheckCircle className="h-6 w-6" />,
    title: "HIPAA & DISHA Compliant",
    description: "Fully compliant with international and Indian health data regulations.",
  },
];

const stats = [
  { label: "Health Records", value: "12", icon: <FileText className="h-4 w-4" /> },
  { label: "Insurance Claims", value: "3", icon: <Shield className="h-4 w-4" /> },
  { label: "Doctors Connected", value: "5", icon: <Users className="h-4 w-4" /> },
  { label: "Health Score", value: "85%", icon: <Activity className="h-4 w-4" /> },
];

const quickActions = [
  {
    title: "View Health Records",
    description: "Access your medical records",
    href: "/records",
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: "Insurance Claims",
    description: "Manage your insurance claims",
    href: "/claims",
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
  const router = useRouter();

  useEffect(() => {
    const initializeAuth = async () => {
      if (!authService.isAuthenticated()) {
        router.push('/');
        return;
      }

      try {
        const userData = await authService.getProfile();
        setUser(userData);
      } catch (error) {
        console.error('Failed to get profile:', error);
        authService.logout();
        router.push('/');
      } finally {
        setLoading(false);
      }
    };

    initializeAuth();
  }, [router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="min-h-screen">
      {/* Welcome Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
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
                  <span className="text-primary"> Your Control</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
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

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="text-center p-4 bg-background/50 rounded-lg border border-border/50 hover:border-primary/20 transition-all-smooth"
                  >
                    <div className="text-2xl font-bold text-primary flex items-center justify-center gap-2 mb-1">
                      {stat.icon}
                      {stat.value}
                    </div>
                    <div className="text-sm text-muted-foreground">{stat.label}</div>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative"
            >
              <div className="relative z-10">
                <Card className="card-enhanced p-6 shadow-2xl">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <Heart className="h-6 w-6 text-primary" />
                      <CardTitle className="text-xl font-semibold">Your Health Dashboard</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="card-spacing">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-4 bg-primary/10 rounded-lg transition-all-smooth hover:bg-primary/20">
                        <div className="text-2xl font-bold">12</div>
                        <div className="text-sm text-muted-foreground">Records</div>
                      </div>
                      <div className="p-4 bg-green-500/10 rounded-lg transition-all-smooth hover:bg-green-500/20">
                        <div className="text-2xl font-bold">3</div>
                        <div className="text-sm text-muted-foreground">Claims</div>
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm font-medium">
                        <span>Health Score</span>
                        <span>85%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-3">
                        <div className="bg-primary h-3 rounded-full w-4/5 transition-all-smooth"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
              
              {/* Floating elements */}
              <motion.div
                animate={{ y: [0, -10, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="absolute -top-4 -right-4 bg-primary text-primary-foreground p-3 rounded-full shadow-lg"
              >
                <Shield className="h-5 w-5" />
              </motion.div>
              
              <motion.div
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 4, repeat: Infinity }}
                className="absolute -bottom-4 -left-4 bg-green-500 text-white p-3 rounded-full shadow-lg"
              >
                <CheckCircle className="h-5 w-5" />
              </motion.div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Quick Actions
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Access your most important features and manage your health data efficiently.
            </p>
          </motion.div>

          <div className="grid-responsive-cards grid-equal-height max-w-7xl mx-auto">
            {quickActions.map((action, index) => (
              <motion.div
                key={action.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="animate-slide-in-bottom"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="card-enhanced h-full cursor-pointer group hover:shadow-lg transition-all-smooth flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-primary/10 rounded-lg text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-all-smooth">
                        {action.icon}
                      </div>
                      <CardTitle className="text-lg font-semibold">{action.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="card-spacing flex flex-col flex-grow">
                    <CardDescription className="text-base mb-6 leading-relaxed flex-grow">
                      {action.description}
                    </CardDescription>
                    <Button asChild variant="outline" className="w-full btn-enhanced mt-auto">
                      <Link href={action.href}>
                        Go to {action.title}
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

      {/* Features Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why Choose SecureHealth?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Built with cutting-edge blockchain technology and designed for maximum security and user control.
            </p>
          </motion.div>

          <div className="grid-responsive-cards-sm grid-equal-height max-w-7xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                className="animate-slide-in-bottom"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <Card className="card-enhanced h-full hover:shadow-lg transition-all-smooth flex flex-col">
                  <CardHeader className="pb-4">
                    <div className="flex items-center space-x-3">
                      <div className="p-3 bg-primary/10 rounded-lg text-primary">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-lg font-semibold">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="card-spacing flex flex-col flex-grow">
                    <CardDescription className="text-base leading-relaxed flex-grow">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}