'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Shield, 
  Lock, 
  Eye,
  Database,
  Key,
  CheckCircle,
  Globe,
  Smartphone,
  Server
} from 'lucide-react';

const securityFeatures = [
  {
    icon: <Lock className="h-6 w-6" />,
    title: "End-to-End Encryption",
    description: "AES-256 encryption ensures your health data is protected at rest and in transit."
  },
  {
    icon: <Key className="h-6 w-6" />,
    title: "Zero-Knowledge Architecture",
    description: "We cannot access your encrypted health records - only you have the keys."
  },
  {
    icon: <Database className="h-6 w-6" />,
    title: "Blockchain Verification",
    description: "All records are cryptographically verified on blockchain for tamper-proof integrity."
  },
  {
    icon: <Shield className="h-6 w-6" />,
    title: "Multi-Factor Authentication",
    description: "Enhanced security with SMS, email, and authenticator app support."
  },
  {
    icon: <Server className="h-6 w-6" />,
    title: "SOC 2 Certified Infrastructure",
    description: "Enterprise-grade security controls and regular third-party audits."
  },
  {
    icon: <Globe className="h-6 w-6" />,
    title: "Global Compliance",
    description: "HIPAA, GDPR, and DISHA compliant with regular compliance audits."
  }
];

const complianceStandards = [
  {
    name: "HIPAA",
    description: "Health Insurance Portability and Accountability Act compliance for US healthcare data.",
    status: "Compliant"
  },
  {
    name: "GDPR",
    description: "General Data Protection Regulation compliance for EU data protection.",
    status: "Compliant"
  },
  {
    name: "DISHA",
    description: "Digital Information Security in Healthcare Act compliance for Indian healthcare data.",
    status: "Compliant"
  },
  {
    name: "SOC 2 Type II",
    description: "Service Organization Control 2 Type II certification for security controls.",
    status: "Certified"
  }
];

export default function SecurityPage() {
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
              Security & Compliance
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
              Military-Grade
              <span className="text-primary"> Security</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Your health data is protected with industry-leading security measures, 
              zero-knowledge architecture, and blockchain technology.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Security Features */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Security Features
            </h2>
            <p className="text-xl text-muted-foreground">
              Multiple layers of protection for your health data.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {securityFeatures.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="card-enhanced h-full text-center">
                  <CardHeader>
                    <div className="p-3 bg-primary/10 rounded-lg text-primary w-fit mx-auto mb-4">
                      {feature.icon}
                    </div>
                    <CardTitle className="text-lg">{feature.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Compliance Standards */}
      <section className="py-16 sm:py-20 bg-secondary/20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Compliance & Certifications
            </h2>
            <p className="text-xl text-muted-foreground">
              Meeting the highest industry standards for healthcare data protection.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {complianceStandards.map((standard, index) => (
              <motion.div
                key={standard.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="card-enhanced">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">{standard.name}</CardTitle>
                      <Badge variant="secondary" className="text-green-600 bg-green-100">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        {standard.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {standard.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security Architecture */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-8 text-center">
              Security Architecture
            </h2>
            
            <div className="space-y-8">
              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Eye className="h-6 w-6 text-primary" />
                    Data Encryption Flow
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">1</div>
                      <div>
                        <h4 className="font-semibold">Client-Side Encryption</h4>
                        <p className="text-sm text-muted-foreground">Data is encrypted on your device before transmission</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">2</div>
                      <div>
                        <h4 className="font-semibold">Secure Transmission</h4>
                        <p className="text-sm text-muted-foreground">TLS 1.3 encryption during data transmission</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">3</div>
                      <div>
                        <h4 className="font-semibold">Blockchain Verification</h4>
                        <p className="text-sm text-muted-foreground">Data integrity verified on distributed ledger</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                      <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white font-bold">4</div>
                      <div>
                        <h4 className="font-semibold">Zero-Knowledge Storage</h4>
                        <p className="text-sm text-muted-foreground">Encrypted data stored with no server-side access</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="card-enhanced">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3">
                    <Shield className="h-6 w-6 text-primary" />
                    Access Control
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-3">Authentication</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Multi-factor authentication (MFA)</li>
                        <li>• Biometric authentication support</li>
                        <li>• Hardware security key support</li>
                        <li>• Session management with auto-logout</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-3">Authorization</h4>
                      <ul className="space-y-2 text-sm">
                        <li>• Role-based access controls (RBAC)</li>
                        <li>• Principle of least privilege</li>
                        <li>• Granular permission system</li>
                        <li>• Regular access reviews</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security Best Practices */}
      <section className="py-16 sm:py-20 bg-secondary/20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-8 text-center">
              Security Best Practices
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="card-enhanced border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-green-800">
                    <CheckCircle className="h-6 w-6" />
                    What We Do
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-green-700">
                    <li>• Regular security audits and penetration testing</li>
                    <li>• Automated vulnerability scanning</li>
                    <li>• 24/7 security monitoring</li>
                    <li>• Incident response procedures</li>
                    <li>• Employee security training</li>
                    <li>• Secure development lifecycle</li>
                  </ul>
                </CardContent>
              </Card>

              <Card className="card-enhanced border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-blue-800">
                    <Smartphone className="h-6 w-6" />
                    What You Should Do
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2 text-blue-700">
                    <li>• Enable multi-factor authentication</li>
                    <li>• Use strong, unique passwords</li>
                    <li>• Keep your devices updated</li>
                    <li>• Be cautious with sharing permissions</li>
                    <li>• Regularly review your account activity</li>
                    <li>• Report suspicious activity immediately</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Security Contact */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Security Questions or Concerns?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Our security team is available 24/7 to address any security-related questions or concerns.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="card-enhanced text-center">
                <CardHeader>
                  <CardTitle>Security Team</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="text-lg p-4">
                    security@securehealth.com
                  </Badge>
                </CardContent>
              </Card>
              <Card className="card-enhanced text-center">
                <CardHeader>
                  <CardTitle>Report Vulnerability</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="text-lg p-4">
                    security@securehealth.com
                  </Badge>
                </CardContent>
              </Card>
              <Card className="card-enhanced text-center">
                <CardHeader>
                  <CardTitle>Emergency Contact</CardTitle>
                </CardHeader>
                <CardContent>
                  <Badge variant="outline" className="text-lg p-4">
                    +1 (800) SECURE-1
                  </Badge>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
