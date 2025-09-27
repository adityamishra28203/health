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
import { FileText, Plus, Search, Filter, Upload, CheckCircle, Clock, XCircle, Eye } from 'lucide-react';

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
  const [claims] = useState<Claim[]>(mockClaims);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isNewClaimOpen, setIsNewClaimOpen] = useState(false);

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Insurance Claims</h1>
        <p className="text-muted-foreground">Manage and track your insurance claims</p>
      </div>

      {/* Search and Filters */}
      <div className="mb-8 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <Label htmlFor="search">Search Claims</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                id="search"
                placeholder="Search by claim number, type, or description..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="md:w-48">
            <Label htmlFor="status">Filter by Status</Label>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
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
          <div className="flex items-end">
            <Dialog open={isNewClaimOpen} onOpenChange={setIsNewClaimOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
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
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="policy">Policy Number</Label>
                      <Select>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Policy" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="HG-2024-001">HG-2024-001 - HealthGuard Premium</SelectItem>
                          <SelectItem value="MC-2024-002">MC-2024-002 - MediCare Plus</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="type">Claim Type</Label>
                      <Select>
                        <SelectTrigger>
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
                  <div>
                    <Label htmlFor="amount">Claim Amount</Label>
                    <Input id="amount" type="number" placeholder="Enter amount" />
                  </div>
                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Describe the medical treatment or procedure..."
                      rows={3}
                    />
                  </div>
                  <div>
                    <Label htmlFor="documents">Upload Documents</Label>
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                      <p className="text-sm text-gray-600">Drag and drop files here, or click to browse</p>
                      <p className="text-xs text-gray-500 mt-1">PDF, JPG, PNG up to 10MB</p>
                    </div>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsNewClaimOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={() => setIsNewClaimOpen(false)}>
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
      <div className="space-y-4">
        {filteredClaims.map((claim) => (
          <Card key={claim.id} className="hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold">Claim #{claim.claimNumber}</h3>
                  <p className="text-muted-foreground">Policy: {claim.policyNumber}</p>
                </div>
                <Badge className={getStatusColor(claim.status)}>
                  {getStatusIcon(claim.status)}
                  <span className="ml-1 capitalize">{claim.status.replace('_', ' ')}</span>
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                <div>
                  <Label className="text-muted-foreground">Type</Label>
                  <p className="font-semibold">{claim.type}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Amount</Label>
                  <p className="font-semibold">₹{claim.amount.toLocaleString()}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Submitted</Label>
                  <p className="font-semibold">{new Date(claim.submittedDate).toLocaleDateString()}</p>
                </div>
              </div>

              <div className="mb-4">
                <Label className="text-muted-foreground">Description</Label>
                <p className="text-sm">{claim.description}</p>
              </div>

              {claim.reviewNotes && (
                <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                  <Label className="text-muted-foreground">Review Notes</Label>
                  <p className="text-sm">{claim.reviewNotes}</p>
                </div>
              )}

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Label className="text-muted-foreground">Documents:</Label>
                  <div className="flex space-x-1">
                    {claim.documents.map((doc, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {doc}
                      </Badge>
                    ))}
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-1" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    Download
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredClaims.length === 0 && (
        <div className="text-center py-12">
          <div className="text-muted-foreground">
            <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-semibold mb-2">No claims found</h3>
            <p>Try adjusting your search criteria or submit a new claim</p>
          </div>
        </div>
      )}
    </div>
  );
}
