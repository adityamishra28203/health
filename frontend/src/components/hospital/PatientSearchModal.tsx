'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { 
  Search, 
  User, 
  Phone, 
  Mail, 
  Calendar, 
  MapPin, 
  Heart, 
  Link as LinkIcon,
  X,
  CheckCircle,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { toast } from 'sonner';
import { hospitalService } from '@/lib/hospital-service';

interface PatientSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  hospitalId: string;
  onPatientLinked: () => void;
}

interface Patient {
  patientId: string;
  abhaId: string;
  name: string;
  mobile?: string;
  email?: string;
  dob?: string;
  gender?: string;
  address?: {
    city: string;
    state: string;
    pincode: string;
  };
  linkedHospitals?: string[];
}

const SEARCH_TYPES = [
  { value: 'abha_id', label: 'ABHA ID' },
  { value: 'mobile', label: 'Mobile Number' },
  { value: 'email', label: 'Email Address' },
  { value: 'name', label: 'Name' },
  { value: 'dob', label: 'Date of Birth' },
];

const LINK_TYPES = [
  { value: 'treatment', label: 'Treatment' },
  { value: 'consultation', label: 'Consultation' },
  { value: 'emergency', label: 'Emergency' },
  { value: 'follow_up', label: 'Follow-up' },
  { value: 'routine_checkup', label: 'Routine Checkup' },
];

export default function PatientSearchModal({ isOpen, onClose, hospitalId, onPatientLinked }: PatientSearchModalProps) {
  const [searchType, setSearchType] = useState('abha_id');
  const [searchValue, setSearchValue] = useState('');
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [linkType, setLinkType] = useState('treatment');
  const [loading, setLoading] = useState(false);
  const [linking, setLinking] = useState(false);

  const handleSearch = async () => {
    if (!searchValue.trim()) {
      toast.error('Please enter a search value');
      return;
    }

    try {
      setLoading(true);
      const searchCriteria = {
        searchType,
        searchValue: searchValue.trim(),
      };

      // Mock search results - in real implementation, this would call the patient service
      const mockPatients: Patient[] = [
        {
          patientId: 'PAT_001',
          abhaId: searchValue.trim(),
          name: 'John Doe',
          mobile: '+91-9876543210',
          email: 'john.doe@example.com',
          dob: '1990-01-01',
          gender: 'Male',
          address: {
            city: 'Mumbai',
            state: 'Maharashtra',
            pincode: '400001'
          },
          linkedHospitals: ['HOSP_123']
        }
      ];

      setPatients(mockPatients);
      
      if (mockPatients.length === 0) {
        toast.info('No patients found with the given criteria');
      }
    } catch (error) {
      console.error('Error searching patients:', error);
      toast.error('Failed to search patients');
    } finally {
      setLoading(false);
    }
  };

  const handleLinkPatient = async (patient: Patient) => {
    try {
      setLinking(true);
      const linkData = {
        abhaId: patient.abhaId,
        patientInfo: {
          name: patient.name,
          mobile: patient.mobile,
          email: patient.email,
          dob: patient.dob,
          gender: patient.gender,
          address: patient.address
        },
        linkType
      };

      await hospitalService.linkPatient(hospitalId, patient.patientId, linkData);
      
      toast.success('Patient linked successfully!');
      setSelectedPatient(null);
      setPatients([]);
      setSearchValue('');
      onPatientLinked();
    } catch (error) {
      console.error('Error linking patient:', error);
      toast.error('Failed to link patient');
    } finally {
      setLinking(false);
    }
  };

  const resetModal = () => {
    setSearchType('abha_id');
    setSearchValue('');
    setPatients([]);
    setSelectedPatient(null);
    setLinkType('treatment');
    setLoading(false);
    setLinking(false);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto"
      >
        <div className="p-6 border-b">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Search and Link Patient</h2>
              <p className="text-gray-600">Find patients and link them to your hospital</p>
            </div>
            <Button variant="outline" size="icon" onClick={handleClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Search Form */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Search Patient</CardTitle>
              <CardDescription>Enter patient details to search in the system</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="search-type">Search By</Label>
                  <Select value={searchType} onValueChange={setSearchType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select search type" />
                    </SelectTrigger>
                    <SelectContent>
                      {SEARCH_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="search-value">Search Value</Label>
                  <Input
                    id="search-value"
                    placeholder={`Enter ${SEARCH_TYPES.find(t => t.value === searchType)?.label.toLowerCase()}...`}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  />
                </div>
              </div>
              <Button onClick={handleSearch} disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Searching...
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4 mr-2" />
                    Search Patients
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {/* Search Results */}
          {patients.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Search Results</CardTitle>
                <CardDescription>Found {patients.length} patient(s)</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {patients.map((patient) => (
                    <div
                      key={patient.patientId}
                      className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                        selectedPatient?.patientId === patient.patientId
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPatient(patient)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-green-100 rounded-full">
                            <User className="h-4 w-4 text-green-600" />
                          </div>
                          <div>
                            <h3 className="font-medium">{patient.name}</h3>
                            <p className="text-sm text-gray-600">Patient ID: {patient.patientId}</p>
                            <p className="text-sm text-gray-600">ABHA ID: {patient.abhaId}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {patient.linkedHospitals && patient.linkedHospitals.length > 0 ? (
                            <Badge variant="secondary">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Already Linked
                            </Badge>
                          ) : (
                            <Badge className="bg-green-100 text-green-800">
                              Available
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                        {patient.mobile && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-3 w-3" />
                            <span>{patient.mobile}</span>
                          </div>
                        )}
                        {patient.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="h-3 w-3" />
                            <span>{patient.email}</span>
                          </div>
                        )}
                        {patient.dob && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-3 w-3" />
                            <span>{new Date(patient.dob).toLocaleDateString()}</span>
                          </div>
                        )}
                        {patient.address && (
                          <div className="flex items-center space-x-2">
                            <MapPin className="h-3 w-3" />
                            <span>{patient.address.city}, {patient.address.state}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Link Patient Form */}
          {selectedPatient && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Link Patient</CardTitle>
                <CardDescription>
                  Link {selectedPatient.name} to your hospital
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="link-type">Link Type</Label>
                  <Select value={linkType} onValueChange={setLinkType}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select link type" />
                    </SelectTrigger>
                    <SelectContent>
                      {LINK_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="p-4 bg-gray-50 rounded-lg">
                  <h4 className="font-medium mb-2">Patient Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    <div><strong>Name:</strong> {selectedPatient.name}</div>
                    <div><strong>Patient ID:</strong> {selectedPatient.patientId}</div>
                    <div><strong>ABHA ID:</strong> {selectedPatient.abhaId}</div>
                    {selectedPatient.mobile && <div><strong>Mobile:</strong> {selectedPatient.mobile}</div>}
                    {selectedPatient.email && <div><strong>Email:</strong> {selectedPatient.email}</div>}
                    {selectedPatient.dob && <div><strong>DOB:</strong> {new Date(selectedPatient.dob).toLocaleDateString()}</div>}
                  </div>
                </div>

                <div className="flex justify-end space-x-4">
                  <Button
                    variant="outline"
                    onClick={() => setSelectedPatient(null)}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={() => handleLinkPatient(selectedPatient)}
                    disabled={linking}
                  >
                    {linking ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Linking...
                      </>
                    ) : (
                      <>
                        <LinkIcon className="h-4 w-4 mr-2" />
                        Link Patient
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </motion.div>
    </div>
  );
}
