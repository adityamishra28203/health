"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
  ShieldCheck
} from "lucide-react";


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
  { label: "Active Users", value: "50K+" },
  { label: "Health Records", value: "1M+" },
  { label: "Insurance Claims", value: "25K+" },
  { label: "Hospitals Connected", value: "500+" },
];

const testimonials = [
  {
    name: "Dr. Priya Sharma",
    role: "Cardiologist, Apollo Hospital",
    content: "HealthWallet has revolutionized how we manage patient records. The blockchain verification ensures data integrity.",
    avatar: "PS",
  },
  {
    name: "Rajesh Kumar",
    role: "Patient",
    content: "I can now share my medical records securely with any doctor. The consent management is excellent.",
    avatar: "RK",
  },
  {
    name: "Sunita Patel",
    role: "Insurance Agent",
    content: "Claims processing has become 70% faster with automated verification through HealthWallet.",
    avatar: "SP",
  },
];

export default function HomePage() {
  
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary/10 via-background to-secondary/10">
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
              className="space-y-8"
            >
              <div className="space-y-4">
                <Badge variant="secondary" className="w-fit">
                  <ShieldCheck className="h-3 w-3 mr-1" />
                  HIPAA & DISHA Compliant
                </Badge>
                <h1 className="text-4xl lg:text-6xl font-bold tracking-tight">
                  Your Health Data,
                  <span className="text-primary"> Your Control</span>
                </h1>
                <p className="text-xl text-muted-foreground max-w-2xl">
                  Secure, blockchain-powered health records and insurance platform. 
                  Manage your medical data with complete privacy and control.
                </p>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href="/auth/register">
                    Get Started Free
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" asChild>
                  <Link href="/demo">Watch Demo</Link>
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 pt-8">
                {stats.map((stat, index) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    className="text-center"
                  >
                    <div className="text-2xl font-bold text-primary">{stat.value}</div>
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
                <Card className="p-6 shadow-2xl">
                  <CardHeader>
                    <div className="flex items-center space-x-2">
                      <Heart className="h-6 w-6 text-primary" />
                      <CardTitle>Health Dashboard</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-3 bg-primary/10 rounded-lg">
                        <div className="text-2xl font-bold">12</div>
                        <div className="text-sm text-muted-foreground">Records</div>
                      </div>
                      <div className="p-3 bg-green-500/10 rounded-lg">
                        <div className="text-2xl font-bold">3</div>
                        <div className="text-sm text-muted-foreground">Claims</div>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Health Score</span>
                        <span>85%</span>
                      </div>
                      <div className="w-full bg-secondary rounded-full h-2">
                        <div className="bg-primary h-2 rounded-full w-4/5"></div>
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

      {/* Features Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Why Choose HealthWallet?
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Built with cutting-edge blockchain technology and designed for maximum security and user control.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {feature.icon}
                      </div>
                      <CardTitle className="text-lg">{feature.title}</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <CardDescription className="text-base">
                      {feature.description}
                    </CardDescription>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-secondary/20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Simple, secure, and transparent process for managing your health data.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                title: "Upload Records",
                description: "Securely upload your medical records with digital signatures from verified healthcare providers.",
                icon: <FileText className="h-8 w-8" />,
              },
              {
                step: "02",
                title: "Blockchain Verification",
                description: "Your records are verified and stored on blockchain for tamper-proof authenticity.",
                icon: <Shield className="h-8 w-8" />,
              },
              {
                step: "03",
                title: "Share & Control",
                description: "Share your records with consent and track all access with complete transparency.",
                icon: <Users className="h-8 w-8" />,
              },
            ].map((step, index) => (
              <motion.div
                key={step.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="relative mb-6">
                  <div className="w-16 h-16 bg-primary text-primary-foreground rounded-full flex items-center justify-center mx-auto mb-4">
                    {step.icon}
                  </div>
                  <div className="absolute -top-2 -right-2 w-8 h-8 bg-secondary rounded-full flex items-center justify-center text-sm font-bold">
                    {step.step}
                  </div>
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              What Our Users Say
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Trusted by healthcare providers, patients, and insurance companies across India.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={testimonial.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="h-full">
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-3 mb-4">
                      <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                        <span className="text-sm font-semibold">{testimonial.avatar}</span>
                      </div>
                      <div>
                        <div className="font-semibold">{testimonial.name}</div>
                        <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                      </div>
                    </div>
                    <p className="text-muted-foreground italic">&ldquo;{testimonial.content}&rdquo;</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-primary text-primary-foreground">
        <div className="container mx-auto px-4 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-3xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Ready to Take Control of Your Health Data?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Join thousands of users who trust HealthWallet for their medical records.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" variant="secondary" asChild>
                <Link href="/auth/register">
                  Start Free Trial
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" className="bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground hover:text-primary" asChild>
                <Link href="/contact">Contact Sales</Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}