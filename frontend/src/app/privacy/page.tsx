'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Lock, 
  Eye, 
  User,
  Database,
  Globe,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge variant="secondary" className="mb-6">
              <Shield className="h-3 w-3 mr-1" />
              Privacy Policy
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
              Your Privacy is Our
              <span className="text-primary"> Priority</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Learn how we protect your health data and respect your privacy with industry-leading security measures.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Privacy Principles */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Our Privacy Principles
            </h2>
            <p className="text-xl text-muted-foreground">
              Fundamental principles that guide how we handle your data.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                icon: <User className="h-6 w-6" />,
                title: "Data Ownership",
                description: "You own your health data. We never claim ownership of your medical information."
              },
              {
                icon: <Lock className="h-6 w-6" />,
                title: "Zero-Knowledge",
                description: "We use zero-knowledge architecture so we cannot access your encrypted health data."
              },
              {
                icon: <Eye className="h-6 w-6" />,
                title: "Transparency",
                description: "Complete transparency about how your data is processed and stored."
              },
              {
                icon: <Database className="h-6 w-6" />,
                title: "Minimal Data",
                description: "We collect only the minimum data necessary to provide our services."
              }
            ].map((principle, index) => (
              <motion.div
                key={principle.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="card-enhanced h-full text-center">
                  <CardHeader>
                    <div className="p-3 bg-primary/10 rounded-lg text-primary w-fit mx-auto mb-4">
                      {principle.icon}
                    </div>
                    <CardTitle className="text-lg">{principle.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {principle.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Data Collection */}
      <section className="py-16 sm:py-20 bg-secondary/20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-8 text-center">
              What Data We Collect
            </h2>
            
            <div className="space-y-8">
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <CheckCircle className="h-6 w-6 text-green-500" />
                    Account Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>• Name and email address for account creation</li>
                    <li>• Phone number (optional) for two-factor authentication</li>
                    <li>• Profile preferences and settings</li>
                    <li>• Usage analytics (anonymized)</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Lock className="h-6 w-6 text-blue-500" />
                    Health Data (Encrypted)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>• Medical records and documents you upload</li>
                    <li>• Health data you manually enter</li>
                    <li>• Metadata about your records (dates, types, etc.)</li>
                    <li>• Sharing permissions and consent records</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <AlertTriangle className="h-6 w-6 text-yellow-500" />
                    What We DON'T Collect
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>• Your actual medical record content (it's encrypted)</li>
                    <li>• Location data unless you explicitly share it</li>
                    <li>• Browsing history from other websites</li>
                    <li>• Personal data for marketing purposes</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Data Protection */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-8 text-center">
              How We Protect Your Data
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-primary" />
                    Encryption
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>• AES-256 encryption for data at rest</li>
                    <li>• TLS 1.3 encryption for data in transit</li>
                    <li>• End-to-end encryption for health records</li>
                    <li>• Zero-knowledge architecture</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Database className="h-6 w-6 text-primary" />
                    Infrastructure
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>• SOC 2 Type II certified data centers</li>
                    <li>• Regular security audits and penetration testing</li>
                    <li>• Automated backups with version control</li>
                    <li>• 99.9% uptime SLA guarantee</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Globe className="h-6 w-6 text-primary" />
                    Compliance
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>• HIPAA compliant infrastructure</li>
                    <li>• GDPR compliant data processing</li>
                    <li>• DISHA (India) compliance</li>
                    <li>• Regular compliance audits</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Lock className="h-6 w-6 text-primary" />
                    Access Control
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>• Multi-factor authentication required</li>
                    <li>• Role-based access controls</li>
                    <li>• Regular access reviews and audits</li>
                    <li>• Principle of least privilege</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Your Rights */}
      <section className="py-16 sm:py-20 bg-secondary/20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-8">
              Your Privacy Rights
            </h2>
            <p className="text-xl text-muted-foreground mb-12">
              You have complete control over your data and privacy.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[
                "Access your data anytime",
                "Download all your records",
                "Delete your account and data",
                "Control data sharing permissions",
                "Request data portability",
                "Object to data processing"
              ].map((right, index) => (
                <motion.div
                  key={right}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  className="flex items-center gap-3 p-4 bg-background rounded-lg"
                >
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <span className="font-medium">{right}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Contact */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Privacy Questions?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Contact our privacy team for any questions about your data and privacy.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Badge variant="outline" className="text-lg p-4">
                privacy@securehealth.com
              </Badge>
              <Badge variant="outline" className="text-lg p-4">
                +1 (800) SECURE-1
              </Badge>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
