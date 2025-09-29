'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  HelpCircle, 
  Search, 
  MessageCircle, 
  Mail, 
  Phone, 
  Clock,
  ChevronDown,
  ChevronUp,
  FileText,
  Shield,
  User,
  Settings
} from 'lucide-react';

const faqs = [
  {
    category: "Getting Started",
    questions: [
      {
        question: "How do I create an account?",
        answer: "Click the 'Sign Up' button on our homepage, fill in your details, and verify your email address. You'll receive a confirmation email to complete the registration process."
      },
      {
        question: "Is my data secure?",
        answer: "Yes, we use military-grade encryption and blockchain technology to protect your health data. Your information is encrypted both in transit and at rest."
      },
      {
        question: "How do I upload my health records?",
        answer: "Navigate to the 'Health Records' section in your dashboard, click 'Upload Record', select your file, and fill in the required information. Your record will be securely encrypted and stored."
      }
    ]
  },
  {
    category: "Account Management",
    questions: [
      {
        question: "How do I change my password?",
        answer: "Go to Settings > Security, click 'Change Password', enter your current password and new password. Make sure your new password meets our security requirements."
      },
      {
        question: "Can I delete my account?",
        answer: "Yes, you can delete your account from Settings > Account. This will permanently remove all your data from our systems. Please note this action cannot be undone."
      },
      {
        question: "How do I update my profile information?",
        answer: "Visit the Profile section in your dashboard, click 'Edit Profile', make your changes, and save. Your updates will be reflected immediately."
      }
    ]
  },
  {
    category: "Health Records",
    questions: [
      {
        question: "What file formats are supported?",
        answer: "We support PDF, JPEG, PNG, and other common medical file formats. Files can be up to 10MB in size."
      },
      {
        question: "How do I share my records with a doctor?",
        answer: "In the Health Records section, select the record you want to share, click 'Share', enter the doctor's email, and set permissions. They'll receive a secure link."
      },
      {
        question: "Can I download my records?",
        answer: "Yes, you can download any of your health records at any time. Click on a record and select 'Download' to save it to your device."
      }
    ]
  },
  {
    category: "Privacy & Security",
    questions: [
      {
        question: "Who can access my data?",
        answer: "Only you can access your data by default. You control who can view your records through our sharing permissions system."
      },
      {
        question: "Is my data encrypted?",
        answer: "Yes, all data is encrypted using AES-256 encryption. Your data is also protected with blockchain technology for additional security."
      },
      {
        question: "How do I revoke access to my records?",
        answer: "Go to the sharing settings for any record and click 'Revoke Access' next to the person you want to remove access for."
      }
    ]
  }
];

const supportChannels = [
  {
    icon: <MessageCircle className="h-6 w-6" />,
    title: "Live Chat",
    description: "Get instant help from our support team",
    availability: "24/7",
    action: "Start Chat"
  },
  {
    icon: <Mail className="h-6 w-6" />,
    title: "Email Support",
    description: "Send us your questions via email",
    availability: "24/7",
    action: "Send Email"
  },
  {
    icon: <Phone className="h-6 w-6" />,
    title: "Phone Support",
    description: "Speak directly with our support team",
    availability: "Mon-Fri 9AM-6PM EST",
    action: "Call Us"
  }
];

export default function HelpPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedFAQ, setExpandedFAQ] = useState<{ [key: string]: boolean }>({});

  const toggleFAQ = (category: string, index: number) => {
    const key = `${category}-${index}`;
    setExpandedFAQ(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const filteredFAQs = faqs.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => category.questions.length > 0);

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
              <HelpCircle className="h-3 w-3 mr-1" />
              Help & Support
            </Badge>
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
              How Can We
              <span className="text-primary"> Help You?</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8 leading-relaxed">
              Find answers to common questions, get support, and learn how to make the most of SecureHealth.
            </p>
            
            {/* Search */}
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search for help..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-12 h-12 text-lg"
              />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Support Channels */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Get Support
            </h2>
            <p className="text-xl text-muted-foreground">
              Choose the support channel that works best for you.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {supportChannels.map((channel, index) => (
              <motion.div
                key={channel.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Card className="card-enhanced text-center h-full">
                  <CardHeader>
                    <div className="p-3 bg-primary/10 rounded-lg text-primary w-fit mx-auto mb-4">
                      {channel.icon}
                    </div>
                    <CardTitle className="text-lg">{channel.title}</CardTitle>
                    <p className="text-muted-foreground">{channel.description}</p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-center gap-2 mb-4">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">{channel.availability}</span>
                    </div>
                    <Button className="w-full">
                      {channel.action}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 sm:py-20 bg-secondary/20">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground">
              Quick answers to the most common questions about SecureHealth.
            </p>
          </motion.div>

          <div className="max-w-4xl mx-auto space-y-8">
            {filteredFAQs.map((category, categoryIndex) => (
              <motion.div
                key={category.category}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: categoryIndex * 0.1 }}
              >
                <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                  {category.category === "Getting Started" && <User className="h-6 w-6 text-primary" />}
                  {category.category === "Account Management" && <Settings className="h-6 w-6 text-primary" />}
                  {category.category === "Health Records" && <FileText className="h-6 w-6 text-primary" />}
                  {category.category === "Privacy & Security" && <Shield className="h-6 w-6 text-primary" />}
                  {category.category}
                </h3>
                
                <div className="space-y-4">
                  {category.questions.map((faq, index) => {
                    const key = `${category.category}-${index}`;
                    const isExpanded = expandedFAQ[key];
                    
                    return (
                      <Card key={index} className="card-enhanced">
                        <CardHeader 
                          className="cursor-pointer"
                          onClick={() => toggleFAQ(category.category, index)}
                        >
                          <div className="flex items-center justify-between">
                            <CardTitle className="text-lg">{faq.question}</CardTitle>
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5 text-muted-foreground" />
                            ) : (
                              <ChevronDown className="h-5 w-5 text-muted-foreground" />
                            )}
                          </div>
                        </CardHeader>
                        {isExpanded && (
                          <CardContent>
                            <p className="text-muted-foreground leading-relaxed">
                              {faq.answer}
                            </p>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="container mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <h2 className="text-3xl lg:text-4xl font-bold mb-6">
              Still Need Help?
            </h2>
            <p className="text-xl text-muted-foreground mb-8">
              Can&apos;t find what you&apos;re looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" asChild>
                <a href="mailto:support@securehealth.com">
                  <Mail className="mr-2 h-4 w-4" />
                  Email Support
                </a>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="tel:+1-800-SECURE-1">
                  <Phone className="mr-2 h-4 w-4" />
                  Call Support
                </a>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
