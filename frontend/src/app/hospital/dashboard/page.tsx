'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { hospitalService } from '@/lib/hospital-service';
import HospitalLayout from '@/components/hospital/HospitalLayout';
import { useHospitalAuth } from '@/context/HospitalAuthContext';

interface Hospital {
  hospitalId: string;
  name: string;
  registrationNumber: string;
  type: string;
  address: {
    street: string;
    city: string;
    state: string;
    postalCode: string;
    country: string;
  };
  contactInfo: {
    phone: string;
    email: string;
    website?: string;
  };
  specialties: string[];
  status: string;
  ownerEmail: string;
  ownerName: string;
  createdAt: string;
}

const HOSPITAL_TYPES = [
  { value: 'general', label: 'General Hospital' },
  { value: 'specialty', label: 'Specialty Hospital' },
  { value: 'clinic', label: 'Clinic' },
  { value: 'diagnostic_center', label: 'Diagnostic Center' },
  { value: 'pharmacy', label: 'Pharmacy' },
];

const SPECIALTIES = [
  'Cardiology', 'Neurology', 'Orthopedics', 'Pediatrics', 'Gynecology',
  'Dermatology', 'Ophthalmology', 'ENT', 'Psychiatry', 'Oncology',
  'Emergency Medicine', 'Internal Medicine', 'Surgery', 'Radiology'
];

export default function HospitalDashboardPage() {
  const { isAuthenticated, loading: authLoading } = useHospitalAuth();
  const router = useRouter();
  
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [loading, setLoading] = useState(true);
  const [showRegistrationForm, setShowRegistrationForm] = useState(false);
  const [selectedHospital, setSelectedHospital] = useState<Hospital | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    registrationNumber: '',
    type: '',
    street: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'India',
    phone: '',
    email: '',
    website: '',
    specialties: [] as string[],
    ownerEmail: '',
    ownerName: ''
  });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push('/hospital/auth/login');
      return;
    }
    
    if (isAuthenticated) {
      loadHospitals();
    }
  }, [isAuthenticated, authLoading, router]);

  const loadHospitals = async () => {
    try {
      setLoading(true);
      const response = await hospitalService.getHospitals();
      setHospitals(response.hospitals || []);
    } catch (error) {
      console.error('Error loading hospitals:', error);
      toast.error('Failed to load hospitals');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const hospitalData = {
        name: formData.name,
        registrationNumber: formData.registrationNumber,
        type: formData.type,
        address: {
          street: formData.street,
          city: formData.city,
          state: formData.state,
          postalCode: formData.postalCode,
          country: formData.country,
        },
        contactInfo: {
          phone: formData.phone,
          email: formData.email,
          website: formData.website,
        },
        specialties: formData.specialties,
        ownerEmail: formData.ownerEmail,
        ownerName: formData.ownerName,
      };

      const response = await hospitalService.registerHospital(hospitalData);
      toast.success('Hospital registered successfully!');
      setShowRegistrationForm(false);
      resetForm();
      loadHospitals();
    } catch (error) {
      console.error('Error registering hospital:', error);
      toast.error('Failed to register hospital');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      registrationNumber: '',
      type: '',
      street: '',
      city: '',
      state: '',
      postalCode: '',
      country: 'India',
      phone: '',
      email: '',
      website: '',
      specialties: [],
      ownerEmail: '',
      ownerName: ''
    });
  };

  const filteredHospitals = hospitals.filter(hospital => {
    const matchesSearch = hospital.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.registrationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         hospital.contactInfo.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || hospital.type === filterType;
    return matchesSearch && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'suspended':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><AlertCircle className="w-3 h-3 mr-1" />Suspended</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeLabel = (type: string) => {
    return HOSPITAL_TYPES.find(t => t.value === type)?.label || type;
  };

  if (authLoading || loading) {
    return (
      <HospitalLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading hospitals...</p>
          </div>
        </div>
      </HospitalLayout>
    );
  }

  return (
    <HospitalLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Hospital Management</h1>
              <p className="text-gray-600 dark:text-gray-400">Manage hospitals and healthcare organizations</p>
            </div>
            <Button
              onClick={() => setShowRegistrationForm(true)}
              className="flex items-center space-x-2"
            >
              <Plus className="h-4 w-4" />
              <span>Register Hospital</span>
            </Button>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Hospitals</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">{hospitals.length}</p>
                </div>
                <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Hospitals</p>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    {hospitals.filter(h => h.status === 'active').length}
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Approval</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                    {hospitals.filter(h => h.status === 'pending').length}
                  </p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Suspended</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    {hospitals.filter(h => h.status === 'suspended').length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Search and Filter */}
        <Card className="mb-8 dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <Label htmlFor="search" className="text-gray-700 dark:text-gray-300">Search Hospitals</Label>
                <div className="relative mt-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="search"
                    placeholder="Search by name, registration number, or email..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>
              <div className="sm:w-48">
                <Label htmlFor="type-filter" className="text-gray-700 dark:text-gray-300">Filter by Type</Label>
                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="mt-1 dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                    <SelectItem value="all">All Types</SelectItem>
                    {HOSPITAL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Hospitals List */}
        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredHospitals.map((hospital) => (
            <motion.div
              key={hospital.hospitalId}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="hover:shadow-lg transition-shadow cursor-pointer dark:bg-gray-800 dark:border-gray-700 dark:hover:shadow-gray-700/20"
                    onClick={() => setSelectedHospital(hospital)}>
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                        <Building2 className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg dark:text-white">{hospital.name}</CardTitle>
                        <CardDescription className="text-sm dark:text-gray-400">
                          {getTypeLabel(hospital.type)}
                        </CardDescription>
                      </div>
                    </div>
                    {getStatusBadge(hospital.status)}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <MapPin className="h-4 w-4" />
                      <span>{hospital.address.city}, {hospital.address.state}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Phone className="h-4 w-4" />
                      <span>{hospital.contactInfo.phone}</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                      <Mail className="h-4 w-4" />
                      <span>{hospital.contactInfo.email}</span>
                    </div>
                    {hospital.specialties.length > 0 && (
                      <div className="pt-2">
                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Specialties:</p>
                        <div className="flex flex-wrap gap-1">
                          {hospital.specialties.slice(0, 3).map((specialty) => (
                            <Badge key={specialty} variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                              {specialty}
                            </Badge>
                          ))}
                          {hospital.specialties.length > 3 && (
                            <Badge variant="secondary" className="text-xs dark:bg-gray-700 dark:text-gray-300">
                              +{hospital.specialties.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {filteredHospitals.length === 0 && (
          <Card className="dark:bg-gray-800 dark:border-gray-700">
            <CardContent className="p-12 text-center">
              <Building2 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No hospitals found</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                {searchTerm || filterType !== 'all' 
                  ? 'Try adjusting your search or filter criteria.'
                  : 'Get started by registering your first hospital.'
                }
              </p>
              {!searchTerm && filterType === 'all' && (
                <Button onClick={() => setShowRegistrationForm(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Register Hospital
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      {/* Registration Modal */}
      {showRegistrationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b dark:border-gray-700">
              <h2 className="text-xl font-semibold dark:text-white">Register New Hospital</h2>
              <p className="text-gray-600 dark:text-gray-400">Fill in the details to register a new hospital</p>
            </div>
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name" className="text-gray-700 dark:text-gray-300">Hospital Name *</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="registrationNumber" className="text-gray-700 dark:text-gray-300">Registration Number *</Label>
                  <Input
                    id="registrationNumber"
                    value={formData.registrationNumber}
                    onChange={(e) => setFormData({...formData, registrationNumber: e.target.value})}
                    required
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="type" className="text-gray-700 dark:text-gray-300">Hospital Type *</Label>
                <Select value={formData.type} onValueChange={(value) => setFormData({...formData, type: value})}>
                  <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                    <SelectValue placeholder="Select hospital type" />
                  </SelectTrigger>
                  <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                    {HOSPITAL_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="street" className="text-gray-700 dark:text-gray-300">Street Address *</Label>
                  <Input
                    id="street"
                    value={formData.street}
                    onChange={(e) => setFormData({...formData, street: e.target.value})}
                    required
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="city" className="text-gray-700 dark:text-gray-300">City *</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                    required
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="state" className="text-gray-700 dark:text-gray-300">State *</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => setFormData({...formData, state: e.target.value})}
                    required
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="postalCode" className="text-gray-700 dark:text-gray-300">Postal Code *</Label>
                  <Input
                    id="postalCode"
                    value={formData.postalCode}
                    onChange={(e) => setFormData({...formData, postalCode: e.target.value})}
                    required
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="country" className="text-gray-700 dark:text-gray-300">Country *</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({...formData, country: e.target.value})}
                    required
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="phone" className="text-gray-700 dark:text-gray-300">Phone Number *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    required
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email Address *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    required
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="website" className="text-gray-700 dark:text-gray-300">Website</Label>
                <Input
                  id="website"
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({...formData, website: e.target.value})}
                  className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>

              <div>
                <Label className="text-gray-700 dark:text-gray-300">Specialties</Label>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-2">
                  {SPECIALTIES.map((specialty) => (
                    <label key={specialty} className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={formData.specialties.includes(specialty)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData({...formData, specialties: [...formData.specialties, specialty]});
                          } else {
                            setFormData({...formData, specialties: formData.specialties.filter(s => s !== specialty)});
                          }
                        }}
                        className="rounded border-gray-300 dark:border-gray-600 dark:bg-gray-700"
                      />
                      <span className="text-sm dark:text-gray-300">{specialty}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="ownerName" className="text-gray-700 dark:text-gray-300">Owner Name *</Label>
                  <Input
                    id="ownerName"
                    value={formData.ownerName}
                    onChange={(e) => setFormData({...formData, ownerName: e.target.value})}
                    required
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="ownerEmail" className="text-gray-700 dark:text-gray-300">Owner Email *</Label>
                  <Input
                    id="ownerEmail"
                    type="email"
                    value={formData.ownerEmail}
                    onChange={(e) => setFormData({...formData, ownerEmail: e.target.value})}
                    required
                    className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-4 pt-6 border-t dark:border-gray-700">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowRegistrationForm(false);
                    resetForm();
                  }}
                >
                  Cancel
                </Button>
                <Button type="submit">
                  Register Hospital
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}

      {/* Hospital Details Modal */}
      {selectedHospital && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
          >
            <div className="p-6 border-b dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
                    <Building2 className="h-8 w-8 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold dark:text-white">{selectedHospital.name}</h2>
                    <p className="text-gray-600 dark:text-gray-400">{getTypeLabel(selectedHospital.type)}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusBadge(selectedHospital.status)}
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => setSelectedHospital(null)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="dark:bg-gray-700 dark:border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-lg dark:text-white">Contact Information</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <span className="dark:text-gray-300">{selectedHospital.contactInfo.phone}</span>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Mail className="h-4 w-4 text-gray-500" />
                      <span className="dark:text-gray-300">{selectedHospital.contactInfo.email}</span>
                    </div>
                    {selectedHospital.contactInfo.website && (
                      <div className="flex items-center space-x-3">
                        <Globe className="h-4 w-4 text-gray-500" />
                        <a 
                          href={selectedHospital.contactInfo.website} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline dark:text-blue-400"
                        >
                          {selectedHospital.contactInfo.website}
                        </a>
                      </div>
                    )}
                  </CardContent>
                </Card>

                <Card className="dark:bg-gray-700 dark:border-gray-600">
                  <CardHeader>
                    <CardTitle className="text-lg dark:text-white">Address</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                      <div className="dark:text-gray-300">
                        <p>{selectedHospital.address.street}</p>
                        <p>{selectedHospital.address.city}, {selectedHospital.address.state}</p>
                        <p>{selectedHospital.address.postalCode}, {selectedHospital.address.country}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card className="dark:bg-gray-700 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="text-lg dark:text-white">Specialties</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {selectedHospital.specialties.map((specialty) => (
                      <Badge key={specialty} variant="secondary" className="dark:bg-gray-600 dark:text-gray-300">
                        {specialty}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="dark:bg-gray-700 dark:border-gray-600">
                <CardHeader>
                  <CardTitle className="text-lg dark:text-white">Hospital Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Registration Number:</span>
                    <span className="font-medium dark:text-white">{selectedHospital.registrationNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Owner:</span>
                    <span className="font-medium dark:text-white">{selectedHospital.ownerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Owner Email:</span>
                    <span className="font-medium dark:text-white">{selectedHospital.ownerEmail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600 dark:text-gray-400">Registered:</span>
                    <span className="font-medium dark:text-white">
                      {new Date(selectedHospital.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </CardContent>
              </Card>

              <div className="flex justify-end space-x-4 pt-6 border-t dark:border-gray-700">
                <Button
                  variant="outline"
                  onClick={() => setSelectedHospital(null)}
                >
                  Close
                </Button>
                <Button className="flex items-center space-x-2">
                  <LinkIcon className="h-4 w-4" />
                  <span>Access Hospital Dashboard</span>
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </HospitalLayout>
  );
}
