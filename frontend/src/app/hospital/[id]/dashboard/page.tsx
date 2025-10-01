'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Building2, 
  Users, 
  FileText, 
  Search, 
  Plus, 
  Shield, 
  Activity,
  TrendingUp,
  Clock,
  CheckCircle,
  AlertCircle,
  User as UserIcon,
  Phone,
  Mail,
  MapPin,
  Globe,
  Settings,
  BarChart3,
  Upload,
  Link as LinkIcon,
  Eye,
  Edit,
  Trash2,
  Calendar,
  Filter,
  Download,
  Bell,
  Heart,
  Stethoscope,
  ClipboardList,
  Database,
  Lock,
  ArrowLeft,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { hospitalService, Hospital, HospitalStats, HospitalUser, PatientLink } from '@/lib/hospital-service';
import PatientSearchModal from '@/components/hospital/PatientSearchModal';
import PortalNavigation from '@/components/common/PortalNavigation';

export default function HospitalDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const hospitalId = params.id as string;

  const [hospital, setHospital] = useState<Hospital | null>(null);
  const [stats, setStats] = useState<HospitalStats | null>(null);
  const [users, setUsers] = useState<HospitalUser[]>([]);
  const [linkedPatients, setLinkedPatients] = useState<PatientLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [searchTerm, setSearchTerm] = useState('');
  const [showPatientSearch, setShowPatientSearch] = useState(false);

  useEffect(() => {
    if (hospitalId) {
      loadHospitalData();
    }
  }, [hospitalId]);

  const loadHospitalData = async () => {
    try {
      setLoading(true);
      const [hospitalData, statsData, usersData, patientsData] = await Promise.all([
        hospitalService.getHospital(hospitalId),
        hospitalService.getHospitalStats(hospitalId),
        hospitalService.getHospitalUsers(hospitalId),
        hospitalService.getLinkedPatients(hospitalId)
      ]);

      setHospital(hospitalData);
      setStats(statsData);
      setUsers(usersData.users);
      setLinkedPatients(patientsData.links);
    } catch (error) {
      console.error('Error loading hospital data:', error);
      toast.error('Failed to load hospital data');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800"><AlertCircle className="w-3 h-3 mr-1" />Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getRoleBadge = (role: string) => {
    const roleColors = {
      admin: 'bg-red-100 text-red-800',
      doctor: 'bg-blue-100 text-blue-800',
      nurse: 'bg-green-100 text-green-800',
      billing_clerk: 'bg-purple-100 text-purple-800',
      lab_technician: 'bg-orange-100 text-orange-800',
      radiologist: 'bg-cyan-100 text-cyan-800',
      pharmacist: 'bg-pink-100 text-pink-800',
      receptionist: 'bg-gray-100 text-gray-800',
      viewer: 'bg-slate-100 text-slate-800'
    };
    
    return (
      <Badge className={roleColors[role as keyof typeof roleColors] || 'bg-gray-100 text-gray-800'}>
        {role.replace('_', ' ')}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading hospital dashboard...</p>
        </div>
      </div>
    );
  }

  if (!hospital) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Hospital Not Found</h2>
          <p className="text-gray-600 mb-4">The hospital you're looking for doesn't exist.</p>
          <Button onClick={() => router.push('/hospital')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Hospitals
          </Button>
        </div>
      </div>
    );
  }

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredPatients = linkedPatients.filter(patient => 
    patient.patientId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.abhaId.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.linkType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Portal Navigation */}
      <PortalNavigation currentPortal="hospital" showBackButton={true} showHomeButton={true} />
      
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                size="icon"
                onClick={() => router.push('/hospital')}
                className="mr-2"
              >
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div className="p-2 bg-blue-100 rounded-lg">
                <Building2 className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{hospital.name}</h1>
                <p className="text-gray-600">Hospital Dashboard</p>
              </div>
              {getStatusBadge(hospital.status)}
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="outline"
                onClick={loadHospitalData}
                className="flex items-center space-x-2"
              >
                <RefreshCw className="h-4 w-4" />
                <span>Refresh</span>
              </Button>
              <Button
                onClick={() => router.push('/')}
                variant="outline"
                className="flex items-center space-x-2"
              >
                <UserIcon className="h-4 w-4" />
                <span>Patient Portal</span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Users</p>
                  <p className="text-2xl font-bold text-gray-900">{stats?.totalUsers || 0}</p>
                </div>
                <Users className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Linked Patients</p>
                  <p className="text-2xl font-bold text-green-600">{stats?.totalPatients || 0}</p>
                </div>
                <Heart className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Documents</p>
                  <p className="text-2xl font-bold text-purple-600">{stats?.totalDocuments || 0}</p>
                </div>
                <FileText className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Active Users</p>
                  <p className="text-2xl font-bold text-orange-600">{stats?.activeUsers || 0}</p>
                </div>
                <Activity className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="patients">Patients</TabsTrigger>
            <TabsTrigger value="documents">Documents</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Hospital Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Building2 className="h-5 w-5" />
                    <span>Hospital Information</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">
                      {hospital.address.street}, {hospital.address.city}, {hospital.address.state}
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{hospital.contactInfo.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <Mail className="h-4 w-4 text-gray-500" />
                    <span className="text-sm">{hospital.contactInfo.email}</span>
                  </div>
                  {hospital.contactInfo.website && (
                    <div className="flex items-center space-x-3">
                      <Globe className="h-4 w-4 text-gray-500" />
                      <a 
                        href={hospital.contactInfo.website} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline text-sm"
                      >
                        {hospital.contactInfo.website}
                      </a>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Specialties */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Stethoscope className="h-5 w-5" />
                    <span>Specialties</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {hospital.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>Recent Activity</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-green-100 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Hospital registered</p>
                      <p className="text-xs text-gray-500">
                        {new Date(hospital.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-blue-100 rounded-full">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{users.length} users added</p>
                      <p className="text-xs text-gray-500">Staff management</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-3 bg-gray-50 rounded-lg">
                    <div className="p-2 bg-purple-100 rounded-full">
                      <Heart className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">{linkedPatients.length} patients linked</p>
                      <p className="text-xs text-gray-500">Patient management</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Users Tab */}
          <TabsContent value="users" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex-1 max-w-md">
                <Label htmlFor="user-search">Search Users</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="user-search"
                    placeholder="Search by name, email, or role..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredUsers.map((user) => (
                <Card key={user.userId}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-100 rounded-full">
                          <UserIcon className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-sm text-gray-600">{user.email}</p>
                        </div>
                      </div>
                      {getStatusBadge(user.status)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Role:</span>
                        {getRoleBadge(user.role)}
                      </div>
                      {user.department && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Department:</span>
                          <span className="text-sm font-medium">{user.department}</span>
                        </div>
                      )}
                      {user.phone && (
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Phone:</span>
                          <span className="text-sm font-medium">{user.phone}</span>
                        </div>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View
                      </Button>
                      <Button variant="outline" size="sm">
                        <Edit className="h-3 w-3 mr-1" />
                        Edit
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Patients Tab */}
          <TabsContent value="patients" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex-1 max-w-md">
                <Label htmlFor="patient-search">Search Patients</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="patient-search"
                    placeholder="Search by patient ID, ABHA ID, or type..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button onClick={() => setShowPatientSearch(true)}>
                <LinkIcon className="h-4 w-4 mr-2" />
                Link Patient
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPatients.map((patient) => (
                <Card key={patient.linkId}>
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-green-100 rounded-full">
                          <Heart className="h-4 w-4 text-green-600" />
                        </div>
                        <div>
                          <p className="font-medium">Patient {patient.patientId}</p>
                          <p className="text-sm text-gray-600">ABHA: {patient.abhaId}</p>
                        </div>
                      </div>
                      {getStatusBadge(patient.status)}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Link Type:</span>
                        <span className="text-sm font-medium">{patient.linkType}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm text-gray-600">Linked:</span>
                        <span className="text-sm font-medium">
                          {new Date(patient.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <div className="flex justify-end space-x-2 mt-4">
                      <Button variant="outline" size="sm">
                        <Eye className="h-3 w-3 mr-1" />
                        View Records
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

          {/* Documents Tab */}
          <TabsContent value="documents" className="space-y-6">
            <div className="flex justify-between items-center">
              <div className="flex space-x-4">
                <div className="flex-1 max-w-md">
                  <Label htmlFor="doc-search">Search Documents</Label>
                  <div className="relative mt-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="doc-search"
                      placeholder="Search documents..."
                      className="pl-10"
                    />
                  </div>
                </div>
                <div className="w-32">
                  <Label htmlFor="doc-type">Type</Label>
                  <Select>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="All Types" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Types</SelectItem>
                      <SelectItem value="prescription">Prescription</SelectItem>
                      <SelectItem value="lab_report">Lab Report</SelectItem>
                      <SelectItem value="imaging">Imaging</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <Button>
                <Upload className="h-4 w-4 mr-2" />
                Upload Document
              </Button>
            </div>

            <Card>
              <CardContent className="p-6">
                <div className="text-center py-12">
                  <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No documents yet</h3>
                  <p className="text-gray-600 mb-4">Start by uploading your first document</p>
                  <Button>
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Document
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Patient Search Modal */}
        <PatientSearchModal
          isOpen={showPatientSearch}
          onClose={() => setShowPatientSearch(false)}
          hospitalId={hospitalId}
          onPatientLinked={() => {
            loadHospitalData();
            setActiveTab('patients');
          }}
        />
      </div>
    </div>
  );
}
