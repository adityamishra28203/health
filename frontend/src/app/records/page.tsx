'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus, Search, Upload, CheckCircle, Clock, Eye, Download, Share } from 'lucide-react';

interface HealthRecord {
  id: string;
  title: string;
  type: string;
  date: string;
  doctor: string;
  hospital: string;
  status: 'verified' | 'pending' | 'rejected';
  description: string;
  files: string[];
  blockchainHash?: string;
}

const mockRecords: HealthRecord[] = [
  {
    id: '1',
    title: 'Blood Test Report',
    type: 'LAB_REPORT',
    date: '2024-01-15',
    doctor: 'Dr. Smith',
    hospital: 'Apollo Hospital',
    status: 'verified',
    description: 'Complete blood count and lipid profile',
    files: ['blood_test_report.pdf', 'lab_results.pdf'],
    blockchainHash: '0x1234567890abcdef...'
  },
  {
    id: '2',
    title: 'X-Ray Chest',
    type: 'RADIOLOGY',
    date: '2024-01-10',
    doctor: 'Dr. Johnson',
    hospital: 'Fortis Healthcare',
    status: 'verified',
    description: 'Chest X-ray for respiratory symptoms',
    files: ['xray_image.jpg', 'radiologist_report.pdf'],
    blockchainHash: '0xabcdef1234567890...'
  },
  {
    id: '3',
    title: 'ECG Report',
    type: 'DIAGNOSTIC',
    date: '2024-01-05',
    doctor: 'Dr. Brown',
    hospital: 'Max Hospital',
    status: 'pending',
    description: 'Electrocardiogram for heart rhythm analysis',
    files: ['ecg_trace.pdf', 'cardiologist_notes.pdf']
  },
  {
    id: '4',
    title: 'MRI Brain',
    type: 'RADIOLOGY',
    date: '2024-01-20',
    doctor: 'Dr. Wilson',
    hospital: 'Apollo Hospital',
    status: 'rejected',
    description: 'Brain MRI for headache evaluation',
    files: ['mri_images.dcm', 'neurologist_report.pdf']
  }
];

export default function RecordsPage() {
  const [records, setRecords] = useState<HealthRecord[]>(mockRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);

  const [newRecord, setNewRecord] = useState({
    title: '',
    type: '',
    doctor: '',
    hospital: '',
    description: '',
    files: [] as string[]
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'verified':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <FileText className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.doctor.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.hospital.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || record.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleAddRecord = () => {
    const record: HealthRecord = {
      id: Date.now().toString(),
      title: newRecord.title,
      type: newRecord.type,
      date: new Date().toISOString().split('T')[0],
      doctor: newRecord.doctor,
      hospital: newRecord.hospital,
      status: 'pending',
      description: newRecord.description,
      files: newRecord.files
    };
    
    setRecords([record, ...records]);
    setNewRecord({
      title: '',
      type: '',
      doctor: '',
      hospital: '',
      description: '',
      files: []
    });
    setIsAddRecordOpen(false);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Health Records</h1>
        <p className="text-muted-foreground">Manage your medical records and documents</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Search Records</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="search"
                placeholder="Search by title, doctor, or hospital..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="md:w-48">
            <Label htmlFor="type">Filter by Type</Label>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Types" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="LAB_REPORT">Lab Report</SelectItem>
                <SelectItem value="RADIOLOGY">Radiology</SelectItem>
                <SelectItem value="DIAGNOSTIC">Diagnostic</SelectItem>
                <SelectItem value="PRESCRIPTION">Prescription</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:w-48">
            <Label htmlFor="status">Filter by Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="All Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="verified">Verified</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-end">
            <Dialog open={isAddRecordOpen} onOpenChange={setIsAddRecordOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Record
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Add New Health Record</DialogTitle>
                  <DialogDescription>
                    Upload and add a new medical record to your health profile
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Record Title</Label>
                      <Input 
                        id="title" 
                        placeholder="e.g., Blood Test Report"
                        value={newRecord.title}
                        onChange={(e) => setNewRecord({...newRecord, title: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="type">Record Type</Label>
                      <Select value={newRecord.type} onValueChange={(value) => setNewRecord({...newRecord, type: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LAB_REPORT">Lab Report</SelectItem>
                          <SelectItem value="RADIOLOGY">Radiology</SelectItem>
                          <SelectItem value="DIAGNOSTIC">Diagnostic</SelectItem>
                          <SelectItem value="PRESCRIPTION">Prescription</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="doctor">Doctor Name</Label>
                      <Input 
                        id="doctor" 
                        placeholder="Dr. Smith"
                        value={newRecord.doctor}
                        onChange={(e) => setNewRecord({...newRecord, doctor: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="hospital">Hospital/Clinic</Label>
                      <Input 
                        id="hospital" 
                        placeholder="Apollo Hospital"
                        value={newRecord.hospital}
                        onChange={(e) => setNewRecord({...newRecord, hospital: e.target.value})}
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Describe the medical procedure or test..."
                      rows={3}
                      value={newRecord.description}
                      onChange={(e) => setNewRecord({...newRecord, description: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="files">Upload Documents</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">Drag and drop files here, or click to browse</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG, DICOM up to 10MB</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsAddRecordOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleAddRecord}>
                      Add Record
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Records List */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredRecords.map((record) => (
          <Card key={record.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{record.title}</CardTitle>
                  <CardDescription className="flex items-center mt-1">
                    <span>{record.doctor} • {record.hospital}</span>
                  </CardDescription>
                </div>
                <Badge className={getStatusColor(record.status)}>
                  {getStatusIcon(record.status)}
                  <span className="ml-1 capitalize">{record.status}</span>
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Date:</span>
                    <span>{new Date(record.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Type:</span>
                    <span className="capitalize">{record.type.replace('_', ' ')}</span>
                  </div>
                  {record.blockchainHash && (
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Blockchain:</span>
                      <span className="font-mono text-xs">{record.blockchainHash.slice(0, 10)}...</span>
                    </div>
                  )}
                </div>

                <div>
                  <Label className="text-muted-foreground">Description</Label>
                  <p className="text-sm">{record.description}</p>
                </div>

                <div>
                  <Label className="text-muted-foreground">Files ({record.files.length})</Label>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {record.files.map((file, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {file}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="flex gap-2 pt-4">
                  <Button variant="outline" className="flex-1">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button variant="outline">
                    <Share className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredRecords.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No records found</h3>
            <p>Try adjusting your search criteria or add a new record</p>
          </div>
        </div>
      )}
    </div>
  );
}
