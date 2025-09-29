'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { FileText, Plus, Search, Upload, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';
import { authService } from '@/lib/auth';
import { useRouter } from 'next/navigation';

interface Claim {
  id: string;
  claimNumber: string;
  policyNumber: string;
  type: string;
  amount: number;
  status: 'submitted' | 'under_review' | 'approved' | 'rejected';
  submittedDate: string;
  description: string;
  documents: string[];
  reviewNotes?: string;
}

const mockClaims: Claim[] = [
  {
    id: '1',
    claimNumber: 'C001',
    policyNumber: 'HG-2024-001',
    type: 'Medical Treatment',
    amount: 25000,
    status: 'approved',
    submittedDate: '2024-01-15',
    description: 'Emergency room visit for chest pain',
    documents: ['medical_report.pdf', 'prescription.pdf', 'bill.pdf'],
    reviewNotes: 'Approved after verification of medical records'
  },
  {
    id: '2',
    claimNumber: 'C002',
    policyNumber: 'HG-2024-001',
    type: 'Surgery',
    amount: 150000,
    status: 'under_review',
    submittedDate: '2024-01-18',
    description: 'Knee replacement surgery',
    documents: ['surgery_report.pdf', 'doctor_notes.pdf', 'hospital_bill.pdf']
  },
  {
    id: '3',
    claimNumber: 'C003',
    policyNumber: 'MC-2024-002',
    type: 'Medication',
    amount: 5000,
    status: 'rejected',
    submittedDate: '2024-01-10',
    description: 'Prescription medication claim',
    documents: ['prescription.pdf', 'pharmacy_receipt.pdf'],
    reviewNotes: 'Rejected: Medication not covered under policy'
  },
  {
    id: '4',
    claimNumber: 'C004',
    policyNumber: 'HG-2024-001',
    type: 'Diagnostic Test',
    amount: 8000,
    status: 'submitted',
    submittedDate: '2024-01-20',
    description: 'MRI scan for back pain',
    documents: ['mri_report.pdf', 'doctor_referral.pdf']
  }
];

export default function ClaimsPage() {
  const router = useRouter();
  const [claims] = useState<Claim[]>(mockClaims);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isNewClaimOpen, setIsNewClaimOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check authentication on component mount
    const checkAuth = async () => {
      try {
        if (!authService.isAuthenticated()) {
          router.push('/');
          return;
        }
        
        // If authenticated, load claims data
        // TODO: Replace with actual API call
        setLoading(false);
      } catch (error) {
        console.error('Auth check failed:', error);
        router.push('/');
      }
    };

    checkAuth();
  }, [router]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'under_review':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'submitted':
        return 'bg-blue-100 text-blue-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'under_review':
        return <Clock className="h-4 w-4" />;
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      case 'submitted':
        return <FileText className="h-4 w-4" />;
      default:
        return null;
    }
  };

  const filteredClaims = claims.filter(claim => {
    const matchesSearch = claim.claimNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         claim.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || claim.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading claims...</p>
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
              <FileText className="h-10 w-10 text-primary" />
              Insurance Claims
            </h1>
            <p className="text-lg text-gray-600">Manage and track your insurance claims</p>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="section-spacing">
          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1 flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <div className="form-field-enhanced">
                  <Label htmlFor="search" className="text-sm font-semibold">Search Claims</Label>
                  <div className="relative mt-2">
                    <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="search"
                      placeholder="Search by claim number, type, or description..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-12 h-12"
                    />
                  </div>
                </div>
              </div>
              
              <div className="w-full sm:w-48">
                <div className="form-field-enhanced">
                  <Label htmlFor="status" className="text-sm font-semibold">Filter by Status</Label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="mt-2 h-12">
                      <SelectValue placeholder="All Status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Status</SelectItem>
                      <SelectItem value="submitted">Submitted</SelectItem>
                      <SelectItem value="under_review">Under Review</SelectItem>
                      <SelectItem value="approved">Approved</SelectItem>
                      <SelectItem value="rejected">Rejected</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            <div className="flex items-end">
              <Dialog open={isNewClaimOpen} onOpenChange={setIsNewClaimOpen}>
                <DialogTrigger asChild>
                  <Button className="btn-enhanced h-12 px-6">
                    <Plus className="h-5 w-5 mr-2" />
                    New Claim
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Submit New Insurance Claim</DialogTitle>
                    <DialogDescription>
                      Fill out the form below to submit a new insurance claim
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-6">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="form-field-enhanced">
                        <Label htmlFor="policy">Policy Number</Label>
                        <Select>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select Policy" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="HG-2024-001">HG-2024-001 - HealthGuard Premium</SelectItem>
                            <SelectItem value="MC-2024-002">MC-2024-002 - MediCare Plus</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="form-field-enhanced">
                        <Label htmlFor="type">Claim Type</Label>
                        <Select>
                          <SelectTrigger className="mt-2">
                            <SelectValue placeholder="Select Type" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="medical">Medical Treatment</SelectItem>
                            <SelectItem value="surgery">Surgery</SelectItem>
                            <SelectItem value="medication">Medication</SelectItem>
                            <SelectItem value="diagnostic">Diagnostic Test</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    <div className="form-field-enhanced">
                      <Label htmlFor="amount">Claim Amount</Label>
                      <Input id="amount" type="number" placeholder="Enter amount" className="mt-2" />
                    </div>
                    <div className="form-field-enhanced">
                      <Label htmlFor="description">Description</Label>
                      <Textarea 
                        id="description" 
                        placeholder="Describe the medical treatment or procedure..."
                        rows={4}
                        className="mt-2"
                      />
                    </div>
                    <div className="form-field-enhanced">
                      <Label htmlFor="documents">Upload Documents</Label>
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center mt-2">
                        <Upload className="h-10 w-10 mx-auto mb-3 text-gray-400" />
                        <p className="text-sm text-gray-600 mb-2">Drag and drop files here, or click to browse</p>
                        <p className="text-xs text-gray-500">PDF, JPG, PNG up to 10MB</p>
                      </div>
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                      <Button variant="outline" onClick={() => setIsNewClaimOpen(false)} className="btn-enhanced">
                        Cancel
                      </Button>
                      <Button onClick={() => setIsNewClaimOpen(false)} className="btn-enhanced">
                        Submit Claim
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>

        {/* Claims List */}
        <div className="section-spacing">
          {filteredClaims.length === 0 ? (
            <Card className="card-enhanced animate-fade-in">
              <CardContent className="p-16 text-center">
                <FileText className="h-16 w-16 text-gray-400 mx-auto mb-6" />
                <h3 className="text-xl font-semibold text-gray-900 mb-3">No claims found</h3>
                <p className="text-gray-600 text-lg">Try adjusting your search criteria or submit a new claim</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-6">
              {filteredClaims.map((claim, index) => (
                <div 
                  key={claim.id}
                  className="animate-slide-in-bottom"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <Card className="card-enhanced hover:shadow-lg transition-all-smooth">
                    <CardContent className="card-spacing">
                      <div className="flex items-start justify-between mb-6">
                        <div>
                          <h3 className="text-xl font-semibold">Claim #{claim.claimNumber}</h3>
                          <p className="text-muted-foreground">Policy: {claim.policyNumber}</p>
                        </div>
                        <Badge className={getStatusColor(claim.status)}>
                          {getStatusIcon(claim.status)}
                          <span className="ml-1 capitalize">{claim.status.replace('_', ' ')}</span>
                        </Badge>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                          <Label className="text-muted-foreground font-medium">Type</Label>
                          <p className="font-semibold text-base mt-1">{claim.type}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground font-medium">Amount</Label>
                          <p className="font-semibold text-base mt-1">₹{claim.amount.toLocaleString()}</p>
                        </div>
                        <div>
                          <Label className="text-muted-foreground font-medium">Submitted</Label>
                          <p className="font-semibold text-base mt-1">{new Date(claim.submittedDate).toLocaleDateString()}</p>
                        </div>
                      </div>

                      <div className="mb-6">
                        <Label className="text-muted-foreground font-medium">Description</Label>
                        <p className="text-sm mt-2 leading-relaxed">{claim.description}</p>
                      </div>

                      {claim.reviewNotes && (
                        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                          <Label className="text-muted-foreground font-medium">Review Notes</Label>
                          <p className="text-sm mt-2">{claim.reviewNotes}</p>
                        </div>
                      )}

                      <div className="flex items-center justify-between pt-4 border-t border-border">
                        <div className="flex items-center space-x-3">
                          <Label className="text-muted-foreground font-medium">Documents:</Label>
                          <div className="flex space-x-2">
                            {claim.documents.map((doc, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {doc}
                              </Badge>
                            ))}
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" size="sm" className="btn-enhanced">
                            <Eye className="h-4 w-4 mr-2" />
                            View
                          </Button>
                          <Button variant="outline" size="sm" className="btn-enhanced">
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
