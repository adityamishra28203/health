'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Plus, Search, Upload, CheckCircle, Clock, TrendingUp, Filter } from 'lucide-react';
import { healthRecordsService, HealthRecord, HealthRecordStatistics } from '@/lib/health-records';
import HealthRecordCard from '@/components/health-records/HealthRecordCard';
import HealthRecordUploadForm from '@/components/health-records/HealthRecordUploadForm';
import { toast } from 'sonner';
import { authService } from '@/lib/auth';
import { useRouter } from 'next/navigation';

const RECORD_TYPES = [
  { value: 'all', label: 'All Types' },
  { value: 'prescription', label: 'Prescription' },
  { value: 'lab_report', label: 'Lab Report' },
  { value: 'discharge_summary', label: 'Discharge Summary' },
  { value: 'imaging', label: 'Imaging' },
  { value: 'vaccination', label: 'Vaccination' },
  { value: 'medical_certificate', label: 'Medical Certificate' },
  { value: 'other', label: 'Other' },
];

const STATUS_FILTERS = [
  { value: 'all', label: 'All Status' },
  { value: 'verified', label: 'Verified' },
  { value: 'pending', label: 'Pending' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'expired', label: 'Expired' },
];

export default function RecordsPage() {
  const router = useRouter();
  const [records, setRecords] = useState<HealthRecord[]>([]);
  const [statistics, setStatistics] = useState<HealthRecordStatistics | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddRecordOpen, setIsAddRecordOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadRecords = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!authService.isAuthenticated()) {
        router.push('/');
        return;
      }
      
      const response = await healthRecordsService.getHealthRecords(1, 100);
      setRecords(response.records);
      
      const stats = await healthRecordsService.getHealthRecordStatistics();
      setStatistics(stats);
    } catch (error: unknown) {
      console.error('Error loading records:', error);
      
      // If unauthorized, redirect to login
      if (error instanceof Error && (error.message?.includes('Unauthorized') || error.message?.includes('Failed to fetch health records'))) {
        router.push('/');
        return;
      }
      
      toast.error('Failed to load health records');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecords();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const filteredRecords = records.filter(record => {
    const matchesSearch = record.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         record.tags?.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesType = typeFilter === 'all' || record.type === typeFilter;
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    return matchesSearch && matchesType && matchesStatus;
  });

  const handleViewRecord = (record: HealthRecord) => {
    // TODO: Implement record view modal or page
    toast.info(`Viewing record: ${record.title}`);
  };

  const handleDownloadRecord = async (record: HealthRecord) => {
    if (!record.fileUrl) {
      toast.error('No file available for download');
      return;
    }

    try {
      // Create a temporary link to download the file
      const link = document.createElement('a');
      link.href = record.fileUrl;
      link.download = record.fileName || 'health-record';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      toast.success('File downloaded successfully');
    } catch (error: unknown) {
      console.error('Download error:', error);
      toast.error('Failed to download file');
    }
  };

  const handleShareRecord = (record: HealthRecord) => {
    // TODO: Implement record sharing functionality
    toast.info(`Sharing record: ${record.title}`);
  };

  const handleUploadSuccess = () => {
    setIsAddRecordOpen(false);
    loadRecords(); // Reload records after successful upload
    toast.success('Health record uploaded successfully!');
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center animate-fade-in">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
          <p className="text-lg text-muted-foreground">Loading health records...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-6 sm:py-8">
      <div className="page-container">
        {/* Header */}
        <div className="section-spacing">
          <div className="animate-slide-in-top">
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 flex items-center gap-3">
              <FileText className="h-8 w-8 sm:h-10 sm:w-10 text-primary" />
              Health Records
            </h1>
            <p className="text-lg text-gray-600">Manage and access your health records securely</p>
          </div>
        </div>


        {/* Statistics Cards */}
        {statistics && (
          <div className="section-spacing">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <Card className="card-enhanced animate-slide-in-bottom delay-100">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Total Records</p>
                      <p className="text-3xl font-bold text-gray-900">{statistics.totalRecords}</p>
                    </div>
                    <FileText className="h-10 w-10 text-blue-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-enhanced animate-slide-in-bottom delay-200">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Verified</p>
                      <p className="text-3xl font-bold text-green-600">{statistics.verifiedRecords}</p>
                    </div>
                    <CheckCircle className="h-10 w-10 text-green-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-enhanced animate-slide-in-bottom delay-300">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Pending</p>
                      <p className="text-3xl font-bold text-yellow-600">{statistics.pendingRecords}</p>
                    </div>
                    <Clock className="h-10 w-10 text-yellow-500" />
                  </div>
                </CardContent>
              </Card>

              <Card className="card-enhanced animate-slide-in-bottom delay-400">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-600">Types</p>
                      <p className="text-3xl font-bold text-purple-600">{Object.keys(statistics.recordsByType).length}</p>
                    </div>
                    <TrendingUp className="h-10 w-10 text-purple-500" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Filters and Actions */}
        <div className="section-spacing">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-12 h-12"
                  />
                </div>
              </div>
              
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger className="w-full sm:w-48 h-12">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by Type" />
                </SelectTrigger>
                <SelectContent>
                  {RECORD_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 h-12">
                  <SelectValue placeholder="Filter by Status" />
                </SelectTrigger>
              <SelectContent>
                {STATUS_FILTERS.map(status => (
                  <SelectItem key={status.value} value={status.value}>
                    {status.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

            <Dialog open={isAddRecordOpen} onOpenChange={setIsAddRecordOpen}>
              <Button onClick={() => setIsAddRecordOpen(true)} className="btn-enhanced" size="lg">
                <Plus className="h-5 w-5 mr-2" />
                Upload Record
              </Button>
              <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Upload Health Record</DialogTitle>
                  <DialogDescription>
                    Upload a new health record with secure encryption and blockchain verification
                  </DialogDescription>
                </DialogHeader>
                <HealthRecordUploadForm
                  onSuccess={handleUploadSuccess}
                  onCancel={() => setIsAddRecordOpen(false)}
                />
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Records Grid */}
        <div className="section-spacing">
          {filteredRecords.length === 0 ? (
            <Card className="card-enhanced animate-fade-in">
              <CardContent className="p-16 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {records.length === 0 ? 'No health records yet' : 'No records match your filters'}
                </h3>
                <p className="text-gray-600 mb-8 text-lg">
                  {records.length === 0 
                    ? 'Upload your first health record to get started'
                    : 'Try adjusting your search terms or filters'
                  }
                </p>
                {records.length === 0 && (
                  <Button onClick={() => setIsAddRecordOpen(true)} className="btn-enhanced" size="lg">
                    <Upload className="h-5 w-5 mr-2" />
                    Upload Your First Record
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredRecords.map((record, index) => (
                <div 
                  key={record.id}
                  className="animate-slide-in-bottom"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <HealthRecordCard
                    record={record}
                    onView={handleViewRecord}
                    onDownload={handleDownloadRecord}
                    onShare={handleShareRecord}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Records by Type */}
        {statistics && Object.keys(statistics.recordsByType).length > 0 && (
          <div className="section-spacing">
            <Card className="card-enhanced animate-slide-in-bottom">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <TrendingUp className="h-6 w-6" />
                  Records by Type
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  {Object.entries(statistics.recordsByType).map(([type, count]) => (
                    <div key={type} className="text-center p-6 bg-muted/50 rounded-lg transition-all-smooth hover:bg-muted/70">
                      <p className="text-3xl font-bold text-gray-900">{count}</p>
                      <p className="text-sm text-gray-600 capitalize font-medium">
                        {healthRecordsService.getTypeDisplayName(type)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}