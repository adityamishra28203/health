'use client';

import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Search, 
  User, 
  Phone, 
  Mail, 
  Calendar,
  MapPin,
  Eye,
  FileText,
  CheckCircle,
  Clock,
  AlertCircle,
  Filter,
  Download
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Patient {
  patientId: string;
  abhaId: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: 'male' | 'female' | 'other';
  address: {
    city: string;
    state: string;
    country: string;
  };
  consentStatus: 'active' | 'pending' | 'revoked' | 'expired';
  lastVisit?: Date;
  documentCount: number;
  profilePicture?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relation: string;
  };
}

interface PatientSearchProps {
  onPatientSelect: (patient: Patient) => void;
  onRequestConsent: (patient: Patient) => void;
}

export default function PatientSearch({ onPatientSelect, onRequestConsent }: PatientSearchProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);

  // Mock data - replace with actual API call
  const mockPatients: Patient[] = [
    {
      patientId: 'pat_001',
      abhaId: 'ABHA123456789',
      firstName: 'Rajesh',
      lastName: 'Kumar',
      email: 'rajesh.kumar@email.com',
      phone: '+91-9876543210',
      dateOfBirth: '1985-03-15',
      gender: 'male',
      address: {
        city: 'Mumbai',
        state: 'Maharashtra',
        country: 'India',
      },
      consentStatus: 'active',
      lastVisit: new Date('2024-01-15'),
      documentCount: 12,
      emergencyContact: {
        name: 'Priya Kumar',
        phone: '+91-9876543211',
        relation: 'Wife',
      },
    },
    {
      patientId: 'pat_002',
      abhaId: 'ABHA987654321',
      firstName: 'Priya',
      lastName: 'Sharma',
      email: 'priya.sharma@email.com',
      phone: '+91-9876543212',
      dateOfBirth: '1990-07-22',
      gender: 'female',
      address: {
        city: 'Delhi',
        state: 'Delhi',
        country: 'India',
      },
      consentStatus: 'pending',
      lastVisit: new Date('2024-01-10'),
      documentCount: 8,
      emergencyContact: {
        name: 'Amit Sharma',
        phone: '+91-9876543213',
        relation: 'Brother',
      },
    },
    {
      patientId: 'pat_003',
      abhaId: 'ABHA456789123',
      firstName: 'Vikram',
      lastName: 'Singh',
      email: 'vikram.singh@email.com',
      phone: '+91-9876543214',
      dateOfBirth: '1978-11-08',
      gender: 'male',
      address: {
        city: 'Bangalore',
        state: 'Karnataka',
        country: 'India',
      },
      consentStatus: 'revoked',
      lastVisit: new Date('2024-01-05'),
      documentCount: 15,
      emergencyContact: {
        name: 'Sunita Singh',
        phone: '+91-9876543215',
        relation: 'Wife',
      },
    },
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setPatients(mockPatients);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.phone.includes(searchTerm) ||
      patient.abhaId.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterStatus === 'all' || patient.consentStatus === filterStatus;
    
    return matchesSearch && matchesFilter;
  });

  const getConsentStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"><CheckCircle className="w-3 h-3 mr-1" />Active</Badge>;
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
      case 'revoked':
        return <Badge className="bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"><AlertCircle className="w-3 h-3 mr-1" />Revoked</Badge>;
      case 'expired':
        return <Badge className="bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200"><Clock className="w-3 h-3 mr-1" />Expired</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="space-y-6">
      {/* Search and Filter */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Search className="h-5 w-5" />
            <span>Search Patients</span>
          </CardTitle>
          <CardDescription>
            Search for patients by name, email, phone, or ABHA ID
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search by name, email, phone, or ABHA ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              />
            </div>
            <div className="sm:w-48">
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="dark:bg-gray-700 dark:border-gray-600 dark:text-white">
                  <SelectValue placeholder="Filter by consent status" />
                </SelectTrigger>
                <SelectContent className="dark:bg-gray-700 dark:border-gray-600">
                  <SelectItem value="all">All Patients</SelectItem>
                  <SelectItem value="active">Active Consent</SelectItem>
                  <SelectItem value="pending">Pending Consent</SelectItem>
                  <SelectItem value="revoked">Revoked Consent</SelectItem>
                  <SelectItem value="expired">Expired Consent</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Search Results */}
      {loading ? (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-12 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Searching for patients...</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredPatients.map((patient) => (
            <Card 
              key={patient.patientId} 
              className={`cursor-pointer transition-all hover:shadow-lg dark:bg-gray-800 dark:border-gray-700 ${
                selectedPatient?.patientId === patient.patientId ? 'ring-2 ring-blue-500' : ''
              }`}
              onClick={() => setSelectedPatient(patient)}
            >
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4">
                    <Avatar className="h-12 w-12">
                      <AvatarImage src={patient.profilePicture} />
                      <AvatarFallback className="bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400">
                        {getInitials(patient.firstName, patient.lastName)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <CardTitle className="text-lg dark:text-white">
                        {patient.firstName} {patient.lastName}
                      </CardTitle>
                      <CardDescription className="dark:text-gray-400">
                        {patient.abhaId} • Age {calculateAge(patient.dateOfBirth)}
                      </CardDescription>
                    </div>
                  </div>
                  {getConsentStatusBadge(patient.consentStatus)}
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                    <Mail className="h-4 w-4" />
                    <span>{patient.email}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                    <Phone className="h-4 w-4" />
                    <span>{patient.phone}</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                    <MapPin className="h-4 w-4" />
                    <span>{patient.address.city}, {patient.address.state}</span>
                  </div>
                  {patient.lastVisit && (
                    <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                      <Calendar className="h-4 w-4" />
                      <span>Last visit: {patient.lastVisit.toLocaleDateString()}</span>
                    </div>
                  )}
                  <div className="flex items-center space-x-3 text-sm text-gray-600 dark:text-gray-400">
                    <FileText className="h-4 w-4" />
                    <span>{patient.documentCount} documents</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex space-x-2 mt-4 pt-4 border-t dark:border-gray-700">
                  <Button
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onPatientSelect(patient);
                    }}
                    className="flex-1"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    View Profile
                  </Button>
                  {patient.consentStatus !== 'active' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRequestConsent(patient);
                      }}
                    >
                      Request Consent
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* No Results */}
      {!loading && filteredPatients.length === 0 && (
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardContent className="p-12 text-center">
            <User className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              No patients found
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              {searchTerm 
                ? 'Try adjusting your search criteria or check the spelling.'
                : 'No patients match the selected filter criteria.'
              }
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
