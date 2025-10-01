'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight,
  ArrowLeft,
  CheckCircle,
  Clock,
  User,
  Building2,
  FileText,
  Shield,
  Heart,
  Database,
  Lock,
  Bell,
  Eye,
  Upload,
  Link as LinkIcon,
  Activity,
  TrendingUp
} from 'lucide-react';

interface WorkflowStep {
  id: string;
  title: string;
  description: string;
  portal: 'patient' | 'hospital' | 'system';
  icon: React.ReactNode;
  status: 'completed' | 'pending' | 'active';
  details: string[];
}

const WORKFLOW_STEPS: WorkflowStep[] = [
  {
    id: '1',
    title: 'Patient Registration',
    description: 'Patient creates account and uploads initial documents',
    portal: 'patient',
    icon: <User className="h-5 w-5" />,
    status: 'completed',
    details: [
      'Patient registers on SecureHealth platform',
      'Uploads identity documents',
      'Creates ABHA ID for health records',
      'Sets privacy preferences'
    ]
  },
  {
    id: '2',
    title: 'Hospital Onboarding',
    description: 'Hospital registers and gets verified',
    portal: 'hospital',
    icon: <Building2 className="h-5 w-5" />,
    status: 'completed',
    details: [
      'Hospital registers with credentials',
      'Uploads registration documents',
      'Admin verification process',
      'Staff user accounts created'
    ]
  },
  {
    id: '3',
    title: 'Patient Search & Link',
    description: 'Hospital searches and links patient records',
    portal: 'hospital',
    icon: <LinkIcon className="h-5 w-5" />,
    status: 'active',
    details: [
      'Hospital searches patient by ABHA ID',
      'Patient consent verification',
      'Link established between hospital and patient',
      'Audit trail created'
    ]
  },
  {
    id: '4',
    title: 'Document Upload',
    description: 'Hospital uploads medical documents',
    portal: 'hospital',
    icon: <Upload className="h-5 w-5" />,
    status: 'pending',
    details: [
      'Hospital uploads medical reports',
      'Documents encrypted and stored',
      'Hash generated for blockchain',
      'Patient notification sent'
    ]
  },
  {
    id: '5',
    title: 'Patient Consent',
    description: 'Patient reviews and grants access',
    portal: 'patient',
    icon: <Shield className="h-5 w-5" />,
    status: 'pending',
    details: [
      'Patient receives notification',
      'Reviews uploaded documents',
      'Grants or denies access',
      'Consent recorded on blockchain'
    ]
  },
  {
    id: '6',
    title: 'Document Access',
    description: 'Patient can access approved documents',
    portal: 'patient',
    icon: <Eye className="h-5 w-5" />,
    status: 'pending',
    details: [
      'Patient views approved documents',
      'Downloads or shares as needed',
      'Audit trail maintained',
      'Blockchain verification available'
    ]
  }
];

export default function PortalIntegration() {
  const [currentStep, setCurrentStep] = useState(2);
  const [activePortal, setActivePortal] = useState<'patient' | 'hospital'>('hospital');

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'active':
        return <Activity className="h-5 w-5 text-blue-500" />;
      case 'pending':
        return <Clock className="h-5 w-5 text-gray-400" />;
      default:
        return <Clock className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-100 text-green-800">Completed</Badge>;
      case 'active':
        return <Badge className="bg-blue-100 text-blue-800">Active</Badge>;
      case 'pending':
        return <Badge variant="secondary">Pending</Badge>;
      default:
        return <Badge variant="secondary">Pending</Badge>;
    }
  };

  const getPortalColor = (portal: string) => {
    switch (portal) {
      case 'patient':
        return 'border-blue-200 bg-blue-50';
      case 'hospital':
        return 'border-green-200 bg-green-50';
      case 'system':
        return 'border-purple-200 bg-purple-50';
      default:
        return 'border-gray-200 bg-gray-50';
    }
  };

  const getPortalIcon = (portal: string) => {
    switch (portal) {
      case 'patient':
        return <User className="h-4 w-4 text-blue-600" />;
      case 'hospital':
        return <Building2 className="h-4 w-4 text-green-600" />;
      case 'system':
        return <Database className="h-4 w-4 text-purple-600" />;
      default:
        return <Database className="h-4 w-4 text-gray-600" />;
    }
  };

  return (
    <div className="space-y-8">
      {/* Integration Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="h-6 w-6 text-red-500" />
            <span>Patient-Hospital Integration Workflow</span>
          </CardTitle>
          <CardDescription>
            How the patient and hospital portals work together in the SecureHealth ecosystem
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Patient Portal Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <User className="h-5 w-5 text-blue-600" />
                <span>Patient Portal</span>
              </h3>
              <div className="space-y-2">
                {[
                  'View and manage health records',
                  'Grant/revoke hospital access',
                  'Track document access history',
                  'Set privacy preferences',
                  'Receive notifications',
                  'Download medical documents'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Hospital Portal Features */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold flex items-center space-x-2">
                <Building2 className="h-5 w-5 text-green-600" />
                <span>Hospital Portal</span>
              </h3>
              <div className="space-y-2">
                {[
                  'Search and link patients',
                  'Upload medical documents',
                  'Manage hospital staff',
                  'View patient statistics',
                  'Generate audit reports',
                  'Coordinate care teams'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Workflow Steps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <TrendingUp className="h-6 w-6 text-purple-600" />
            <span>Integration Workflow</span>
          </CardTitle>
          <CardDescription>
            Step-by-step process showing how patient and hospital portals interact
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {WORKFLOW_STEPS.map((step, index) => (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                className={`p-4 border rounded-lg ${getPortalColor(step.portal)} ${
                  step.status === 'active' ? 'ring-2 ring-blue-500' : ''
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 bg-white rounded-full border-2 border-gray-300">
                      {getStatusIcon(step.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold">{step.title}</h4>
                        <div className="flex items-center space-x-1">
                          {getPortalIcon(step.portal)}
                          <span className="text-sm text-gray-600 capitalize">{step.portal}</span>
                        </div>
                      </div>
                      <p className="text-sm text-gray-600 mb-3">{step.description}</p>
                      <div className="space-y-1">
                        {step.details.map((detail, detailIndex) => (
                          <div key={detailIndex} className="flex items-center space-x-2">
                            <div className="w-1 h-1 bg-gray-400 rounded-full"></div>
                            <span className="text-xs text-gray-600">{detail}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getStatusBadge(step.status)}
                  </div>
                </div>
                
                {index < WORKFLOW_STEPS.length - 1 && (
                  <div className="flex justify-center mt-4">
                    <ArrowRight className="h-5 w-5 text-gray-400" />
                  </div>
                )}
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Architecture Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Shield className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="font-semibold">Secure Integration</h3>
            </div>
            <p className="text-sm text-gray-600">
              End-to-end encryption ensures patient data remains secure during all interactions between portals.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-green-100 rounded-lg">
                <Lock className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="font-semibold">Blockchain Audit</h3>
            </div>
            <p className="text-sm text-gray-600">
              All interactions are recorded on blockchain for immutable audit trails and compliance.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center space-x-3 mb-4">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Bell className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="font-semibold">Real-time Notifications</h3>
            </div>
            <p className="text-sm text-gray-600">
              Instant notifications keep patients and healthcare providers informed of all activities.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
