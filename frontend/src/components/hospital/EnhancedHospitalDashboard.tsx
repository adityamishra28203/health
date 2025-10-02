'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Search, 
  Filter, 
  Calendar, 
  Download, 
  Upload, 
  Eye, 
  Shield, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  TrendingUp,
  Users,
  FileText,
  Heart,
  Activity,
  Bell,
  Settings,
  BarChart3,
  Database,
  Lock,
  Globe,
  Smartphone,
  Mail,
  Phone,
  MapPin,
  Building2,
  User,
  Link as LinkIcon,
  Plus,
  RefreshCw,
  ExternalLink,
  Verified,
  AlertTriangle,
  Info
} from 'lucide-react';
import { toast } from 'sonner';
import { hospitalService } from '@/lib/hospital-service';

interface EnhancedHospitalDashboardProps {
  hospitalId: string;
}

interface PatientRecord {
  id: string;
  name: string;
  abhaId: string;
  lastVisit: string;
  documentCount: number;
  status: 'active' | 'pending' | 'inactive';
  consentStatus: 'granted' | 'pending' | 'denied';
  verificationStatus: 'verified' | 'pending' | 'failed';
}

interface DocumentRecord {
  id: string;
  name: string;
  type: string;
  uploadDate: string;
  patientName: string;
  status: 'verified' | 'pending' | 'failed';
  hash: string;
  blockchainTx: string;
  size: number;
}

interface TimelineEvent {
  id: string;
  type: 'document_upload' | 'consent_granted' | 'consent_denied' | 'verification' | 'access';
  timestamp: string;
  description: string;
  patientName: string;
  documentName?: string;
  status: 'success' | 'pending' | 'failed';
}

export default function EnhancedHospitalDashboard({ hospitalId }: EnhancedHospitalDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [patients, setPatients] = useState<PatientRecord[]>([]);
  const [documents, setDocuments] = useState<DocumentRecord[]>([]);
  const [timeline, setTimeline] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDocuments: 0,
    verifiedDocuments: 0,
    pendingConsents: 0,
    activeUsers: 0,
    recentActivity: 0
  });

  useEffect(() => {
    loadDashboardData();
  }, [hospitalId]);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      // Mock data - replace with actual API calls
      const mockPatients: PatientRecord[] = [
        {
          id: 'PAT_001',
          name: 'John Doe',
          abhaId: 'ABHA1234567890',
          lastVisit: '2025-10-01',
          documentCount: 15,
          status: 'active',
          consentStatus: 'granted',
          verificationStatus: 'verified'
        },
        {
          id: 'PAT_002',
          name: 'Jane Smith',
          abhaId: 'ABHA0987654321',
          lastVisit: '2025-09-28',
          documentCount: 8,
          status: 'active',
          consentStatus: 'pending',
          verificationStatus: 'pending'
        }
      ];

      const mockDocuments: DocumentRecord[] = [
        {
          id: 'DOC_001',
          name: 'Blood Test Report.pdf',
          type: 'Lab Report',
          uploadDate: '2025-10-01',
          patientName: 'John Doe',
          status: 'verified',
          hash: 'sha256:abc123...',
          blockchainTx: '0x1234567890abcdef',
          size: 1024000
        },
        {
          id: 'DOC_002',
          name: 'X-Ray Chest.jpg',
          type: 'Imaging',
          uploadDate: '2025-09-30',
          patientName: 'Jane Smith',
          status: 'pending',
          hash: 'sha256:def456...',
          blockchainTx: '',
          size: 2048000
        }
      ];

      const mockTimeline: TimelineEvent[] = [
        {
          id: 'EVT_001',
          type: 'document_upload',
          timestamp: '2025-10-01T10:30:00Z',
          description: 'Blood test report uploaded',
          patientName: 'John Doe',
          documentName: 'Blood Test Report.pdf',
          status: 'success'
        },
        {
          id: 'EVT_002',
          type: 'consent_granted',
          timestamp: '2025-10-01T09:15:00Z',
          description: 'Patient granted access to medical records',
          patientName: 'John Doe',
          status: 'success'
        }
      ];

      setPatients(mockPatients);
      setDocuments(mockDocuments);
      setTimeline(mockTimeline);
      setStats({
        totalPatients: mockPatients.length,
        totalDocuments: mockDocuments.length,
        verifiedDocuments: mockDocuments.filter(d => d.status === 'verified').length,
        pendingConsents: mockPatients.filter(p => p.consentStatus === 'pending').length,
        activeUsers: 12,
        recentActivity: mockTimeline.length
      });
    } catch (error) {
      console.error('Error loading dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'verified':
      case 'active':
      case 'granted':
      case 'success':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />{status}</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'failed':
      case 'denied':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />{status}</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'document_upload':
        return <FileText className="h-4 w-4 text-blue-600" />;
      case 'consent_granted':
        return <Shield className="h-4 w-4 text-green-600" />;
      case 'consent_denied':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'verification':
        return <Verified className="h-4 w-4 text-purple-600" />;
      case 'access':
        return <Eye className="h-4 w-4 text-orange-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         patient.abhaId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || patient.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.patientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || doc.type.toLowerCase() === typeFilter.toLowerCase();
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading enhanced dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Enhanced Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Patients</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalPatients}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Documents</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalDocuments}</p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Verified</p>
                <p className="text-2xl font-bold text-purple-600">{stats.verifiedDocuments}</p>
              </div>
              <Verified className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Consents</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pendingConsents}</p>
              </div>
              <Shield className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Active Users</p>
                <p className="text-2xl font-bold text-orange-600">{stats.activeUsers}</p>
              </div>
              <Activity className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Recent Activity</p>
                <p className="text-2xl font-bold text-indigo-600">{stats.recentActivity}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-indigo-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Enhanced Search and Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search</Label>
              <div className="relative mt-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Search patients, documents..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div>
              <Label htmlFor="date-filter">Date Range</Label>
              <Select value={dateFilter} onValueChange={setDateFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All time" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All time</SelectItem>
                  <SelectItem value="today">Today</SelectItem>
                  <SelectItem value="week">This week</SelectItem>
                  <SelectItem value="month">This month</SelectItem>
                  <SelectItem value="year">This year</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="verified">Verified</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="type-filter">Document Type</Label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="All types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All types</SelectItem>
                  <SelectItem value="lab report">Lab Report</SelectItem>
                  <SelectItem value="imaging">Imaging</SelectItem>
                  <SelectItem value="prescription">Prescription</SelectItem>
                  <SelectItem value="discharge summary">Discharge Summary</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Enhanced Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="patients">Patients</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
        </TabsList>

        {/* Enhanced Overview Tab */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Recent Patients */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5" />
                  <span>Recent Patients</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {patients.slice(0, 5).map((patient) => (
                    <div key={patient.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{patient.name}</p>
                          <p className="text-sm text-gray-600">{patient.abhaId}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(patient.consentStatus)}
                        <Button variant="outline" size="sm">
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Document Verification Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Shield className="h-5 w-5" />
                  <span>Document Verification</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {documents.slice(0, 5).map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <FileText className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">{doc.name}</p>
                          <p className="text-sm text-gray-600">{doc.patientName}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getStatusBadge(doc.status)}
                        {doc.blockchainTx && (
                          <Button variant="outline" size="sm">
                            <ExternalLink className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Enhanced Patients Tab */}
        <TabsContent value="patients" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Patient Management</h3>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button>
                <LinkIcon className="h-4 w-4 mr-2" />
                Link Patient
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredPatients.map((patient) => (
              <Card key={patient.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-full">
                        <User className="h-4 w-4 text-blue-600" />
                      </div>
                      <div>
                        <p className="font-medium">{patient.name}</p>
                        <p className="text-sm text-gray-600">{patient.abhaId}</p>
                      </div>
                    </div>
                    {getStatusBadge(patient.status)}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Last Visit:</span>
                      <span>{new Date(patient.lastVisit).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Documents:</span>
                      <span>{patient.documentCount}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Consent:</span>
                      {getStatusBadge(patient.consentStatus)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Verification:</span>
                      {getStatusBadge(patient.verificationStatus)}
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Upload className="h-3 w-3 mr-1" />
                      Upload
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Enhanced Documents Tab */}
        <TabsContent value="documents" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Document Management</h3>
            <div className="flex space-x-2">
              <Button variant="outline">
                <Download className="h-4 w-4 mr-2" />
                Export
              </Button>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocuments.map((doc) => (
              <Card key={doc.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-green-100 rounded-full">
                        <FileText className="h-4 w-4 text-green-600" />
                      </div>
                      <div>
                        <p className="font-medium truncate">{doc.name}</p>
                        <p className="text-sm text-gray-600">{doc.patientName}</p>
                      </div>
                    </div>
                    {getStatusBadge(doc.status)}
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span>{doc.type}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span>{(doc.size / 1024 / 1024).toFixed(2)} MB</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uploaded:</span>
                      <span>{new Date(doc.uploadDate).toLocaleDateString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Hash:</span>
                      <span className="font-mono text-xs">{doc.hash.substring(0, 16)}...</span>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-2 mt-4">
                    <Button variant="outline" size="sm">
                      <Eye className="h-3 w-3 mr-1" />
                      View
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="h-3 w-3 mr-1" />
                      Download
                    </Button>
                    {doc.blockchainTx && (
                      <Button variant="outline" size="sm">
                        <Verified className="h-3 w-3 mr-1" />
                        Verify
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Enhanced Timeline Tab */}
        <TabsContent value="timeline" className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Activity Timeline</h3>
            <Button variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>

          <div className="space-y-4">
            {timeline.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-gray-50"
              >
                <div className="flex items-center justify-center w-10 h-10 bg-gray-100 rounded-full">
                  {getEventIcon(event.type)}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{event.description}</h4>
                    <div className="flex items-center space-x-2">
                      {getStatusBadge(event.status)}
                      <span className="text-sm text-gray-500">
                        {new Date(event.timestamp).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-600 mt-1">
                    Patient: {event.patientName}
                    {event.documentName && ` • Document: ${event.documentName}`}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}


