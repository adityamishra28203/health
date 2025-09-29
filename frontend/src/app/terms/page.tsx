'use client';

import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  FileText, 
  Scale,
  CheckCircle,
  AlertTriangle,
  Shield
} from 'lucide-react';

export default function TermsPage() {
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
              <Scale className="h-3 w-3 mr-1" />
              Terms of Service
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
              Terms of
              <span className="text-primary"> Service</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Please read these terms carefully before using SecureHealth. By using our service, you agree to these terms.
            </p>
            <p className="text-sm text-muted-foreground">
              Last updated: {new Date().toLocaleDateString()}
            </p>
          </motion.div>
        </div>
      </section>

      {/* Terms Content */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <div className="max-w-4xl mx-auto space-y-8">
            {[
              {
                title: "1. Acceptance of Terms",
                content: "By accessing and using SecureHealth, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service."
              },
              {
                title: "2. Use License",
                content: "Permission is granted to temporarily download one copy of SecureHealth for personal, non-commercial transitory viewing only. This is the grant of a license, not a transfer of title, and under this license you may not: modify or copy the materials; use the materials for any commercial purpose or for any public display; attempt to reverse engineer any software contained on the website; or remove any copyright or other proprietary notations from the materials."
              },
              {
                title: "3. User Accounts",
                content: "You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account or password. You must notify us immediately of any unauthorized use of your account."
              },
              {
                title: "4. Health Data Privacy",
                content: "Your health data is encrypted and protected with industry-standard security measures. We use zero-knowledge architecture, meaning we cannot access your encrypted health records. You retain full ownership and control of your health data."
              },
              {
                title: "5. Prohibited Uses",
                content: "You may not use our service for any unlawful purpose or to solicit others to perform unlawful acts. You may not violate any international, federal, provincial, or state regulations, rules, laws, or local ordinances. You may not transmit any worms, viruses, or any code of a destructive nature."
              },
              {
                title: "6. Content Accuracy",
                content: "The materials on SecureHealth are provided on an 'as is' basis. SecureHealth makes no warranties, expressed or implied, and hereby disclaims and negates all other warranties including without limitation, implied warranties or conditions of merchantability, fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights."
              },
              {
                title: "7. Limitations",
                content: "In no event shall SecureHealth or its suppliers be liable for any damages (including, without limitation, damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on SecureHealth, even if SecureHealth or an authorized representative has been notified orally or in writing of the possibility of such damage."
              },
              {
                title: "8. Accuracy of Materials",
                content: "The materials appearing on SecureHealth could include technical, typographical, or photographic errors. SecureHealth does not warrant that any of the materials on its website are accurate, complete, or current. SecureHealth may make changes to the materials contained on its website at any time without notice."
              },
              {
                title: "9. Links",
                content: "SecureHealth has not reviewed all of the sites linked to our website and is not responsible for the contents of any such linked site. The inclusion of any link does not imply endorsement by SecureHealth of the site. Use of any such linked website is at the user's own risk."
              },
              {
                title: "10. Modifications",
                content: "SecureHealth may revise these terms of service for its website at any time without notice. By using this website, you are agreeing to be bound by the then current version of these terms of service."
              },
              {
                title: "11. Governing Law",
                content: "These terms and conditions are governed by and construed in accordance with the laws of California, United States, and you irrevocably submit to the exclusive jurisdiction of the courts in that state or location."
              },
              {
                title: "12. Contact Information",
                content: "If you have any questions about these Terms of Service, please contact us at legal@securehealth.com or call us at +1 (800) SECURE-1."
              }
            ].map((section, index) => (
              <motion.div
                key={section.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="card-enhanced">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-primary" />
                      {section.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {section.content}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Important Notes */}
      <section className="py-16 sm:py-20 bg-secondary/20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-8 text-center">
              Important Notes
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Card className="card-enhanced border-yellow-200 bg-yellow-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-yellow-800">
                    <AlertTriangle className="h-6 w-6" />
                    Medical Disclaimer
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-yellow-700 leading-relaxed">
                    SecureHealth is not a medical service provider. We do not provide medical advice, 
                    diagnosis, or treatment. Always consult with qualified healthcare professionals 
                    for medical concerns.
                  </p>
                </CardContent>
              </Card>

              <Card className="card-enhanced border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-3 text-blue-800">
                    <Shield className="h-6 w-6" />
                    Data Security
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-blue-700 leading-relaxed">
                    While we implement industry-standard security measures, no system is 100% secure. 
                    We recommend keeping backup copies of important health records.
                  </p>
                </CardContent>
              </Card>
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
              Questions About These Terms?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Contact our legal team for clarification on any terms or conditions.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Badge variant="outline" className="text-lg p-4">
                legal@securehealth.com
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
