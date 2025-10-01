'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Building2, 
  Shield, 
  Heart, 
  FileText, 
  Users, 
  Activity,
  TrendingUp,
  ArrowRight,
  CheckCircle,
  Globe,
  Lock,
  Database,
  Smartphone,
  Zap
} from 'lucide-react';
import ServiceStatus from '@/components/common/ServiceStatus';
import PortalIntegration from '@/components/integration/PortalIntegration';

export default function PortalPage() {
  const router = useRouter();

  const portals = [
    {
      id: 'patient',
      title: 'Patient Portal',
      description: 'Access your health records, manage documents, and track your medical history',
      icon: <User className="h-8 w-8" />,
      color: 'from-blue-500 to-cyan-500',
      bgColor: 'bg-blue-50',
      iconColor: 'text-blue-600',
      features: [
        'View Health Records',
        'Upload Documents',
        'Track Medical History',
        'Manage Privacy Settings',
        'Access Insurance Claims'
      ],
      href: '/',
      badge: 'Primary'
    },
    {
      id: 'hospital',
      title: 'Hospital Portal',
      description: 'Manage patients, upload documents, and coordinate healthcare services',
      icon: <Building2 className="h-8 w-8" />,
      color: 'from-green-500 to-emerald-500',
      bgColor: 'bg-green-50',
      iconColor: 'text-green-600',
      features: [
        'Patient Management',
        'Document Upload',
        'User Management',
        'Hospital Dashboard',
        'Analytics & Reports'
      ],
      href: '/hospital',
      badge: 'New'
    }
  ];

  const services = [
    {
      name: 'Health Records Service',
      description: 'Secure storage and management of patient health records',
      status: 'Active',
      icon: <FileText className="h-5 w-5" />
    },
    {
      name: 'Document Service',
      description: 'Encrypted document upload and sharing capabilities',
      status: 'Active',
      icon: <Database className="h-5 w-5" />
    },
    {
      name: 'Authentication Service',
      description: 'Secure authentication and authorization',
      status: 'Active',
      icon: <Shield className="h-5 w-5" />
    },
    {
      name: 'Blockchain Service',
      description: 'Immutable record verification and audit trails',
      status: 'Active',
      icon: <Lock className="h-5 w-5" />
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl">
                <Heart className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">SecureHealth Platform</h1>
                <p className="text-gray-600">Unified Healthcare Management System</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-100 text-green-800">
                <CheckCircle className="w-3 h-3 mr-1" />
                All Services Online
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Choose Your Portal
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access the healthcare platform designed for patients and healthcare providers. 
              Built with microservices architecture for scalability and security.
            </p>
          </motion.div>
        </div>

        {/* Portal Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {portals.map((portal, index) => (
            <motion.div
              key={portal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.2 }}
            >
              <Card className={`${portal.bgColor} hover:shadow-xl transition-all duration-300 cursor-pointer group`}
                    onClick={() => router.push(portal.href)}>
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`p-3 rounded-xl ${portal.bgColor} ${portal.iconColor} group-hover:scale-110 transition-transform duration-300`}>
                        {portal.icon}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-2xl">{portal.title}</CardTitle>
                          <Badge variant="secondary">{portal.badge}</Badge>
                        </div>
                        <CardDescription className="text-base mt-2">
                          {portal.description}
                        </CardDescription>
                      </div>
                    </div>
                    <ArrowRight className="h-6 w-6 text-gray-400 group-hover:text-gray-600 group-hover:translate-x-1 transition-all duration-300" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {portal.features.map((feature, featureIndex) => (
                      <div key={featureIndex} className="flex items-center space-x-2">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-gray-700">{feature}</span>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6">
                    <Button 
                      className={`w-full bg-gradient-to-r ${portal.color} hover:opacity-90 transition-opacity`}
                      size="lg"
                    >
                      Access {portal.title}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Service Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <ServiceStatus />
        </motion.div>

        {/* Portal Integration */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
          className="mt-12"
        >
          <PortalIntegration />
        </motion.div>

        {/* Features Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center space-x-2">
                <Zap className="h-6 w-6 text-yellow-500" />
                <span>Platform Features</span>
              </CardTitle>
              <CardDescription>
                Comprehensive healthcare management with cutting-edge technology
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <Shield className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">End-to-End Encryption</h4>
                    <p className="text-sm text-gray-600">All data is encrypted using industry-standard AES-256 encryption</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-green-100 rounded-lg">
                    <Database className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Blockchain Verification</h4>
                    <p className="text-sm text-gray-600">Immutable audit trails and document verification</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-purple-100 rounded-lg">
                    <Users className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Multi-Tenant Architecture</h4>
                    <p className="text-sm text-gray-600">Secure isolation between different healthcare organizations</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-orange-100 rounded-lg">
                    <Activity className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Real-time Updates</h4>
                    <p className="text-sm text-gray-600">Live synchronization across all connected devices</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-cyan-100 rounded-lg">
                    <Smartphone className="h-5 w-5 text-cyan-600" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">Mobile Responsive</h4>
                    <p className="text-sm text-gray-600">Optimized for all devices and screen sizes</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="p-2 bg-red-100 rounded-lg">
                    <Globe className="h-5 w-5 text-red-600" />
                  </div>
                  <div>
                    <h4 className="font-medium mb-1">API-First Design</h4>
                    <p className="text-sm text-gray-600">RESTful APIs for easy integration with existing systems</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* Quick Actions */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="mt-12 text-center"
        >
          <div className="bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
            <p className="text-blue-100 mb-6 max-w-2xl mx-auto">
              Choose your portal to access the healthcare platform. Whether you're a patient managing your health records 
              or a healthcare provider coordinating care, we've got you covered.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                onClick={() => router.push('/')}
                className="bg-white text-blue-600 hover:bg-blue-50"
              >
                <User className="h-5 w-5 mr-2" />
                Access Patient Portal
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={() => router.push('/hospital')}
                className="border-white text-white hover:bg-white hover:text-blue-600"
              >
                <Building2 className="h-5 w-5 mr-2" />
                Access Hospital Portal
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
