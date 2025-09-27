'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Shield, FileText, CheckCircle, Clock, XCircle } from 'lucide-react';

interface InsurancePolicy {
  id: string;
  name: string;
  provider: string;
  type: string;
  premium: number;
  coverage: number;
  status: 'active' | 'expired' | 'pending';
  expiryDate: string;
  policyNumber: string;
}

interface InsuranceClaim {
  id: string;
  claimNumber: string;
  policyNumber: string;
  type: string;
  amount: number;
  status: 'approved' | 'pending' | 'rejected';
  submittedDate: string;
  approvedDate?: string;
  rejectionReason?: string;
}

const mockPolicies: InsurancePolicy[] = [
  {
    id: '1',
    name: 'HealthGuard Premium',
    provider: 'HealthGuard Insurance',
    type: 'Health Insurance',
    premium: 2500,
    coverage: 500000,
    status: 'active',
    expiryDate: '2024-12-31',
    policyNumber: 'HG-2024-001'
  },
  {
    id: '2',
    name: 'MediCare Plus',
    provider: 'MediCare Corp',
    type: 'Health Insurance',
    premium: 1800,
    coverage: 300000,
    status: 'active',
    expiryDate: '2024-11-15',
    policyNumber: 'MC-2024-002'
  },
  {
    id: '3',
    name: 'LifeSecure',
    provider: 'LifeSecure Ltd',
    type: 'Life Insurance',
    premium: 3200,
    coverage: 1000000,
    status: 'expired',
    expiryDate: '2024-08-20',
    policyNumber: 'LS-2024-003'
  }
];

const mockClaims: InsuranceClaim[] = [
  {
    id: '1',
    claimNumber: 'C001',
    policyNumber: 'HG-2024-001',
    type: 'Medical',
    amount: 25000,
    status: 'approved',
    submittedDate: '2024-01-15',
    approvedDate: '2024-01-20'
  },
  {
    id: '2',
    claimNumber: 'C002',
    policyNumber: 'HG-2024-001',
    type: 'Surgery',
    amount: 150000,
    status: 'pending',
    submittedDate: '2024-01-18'
  },
  {
    id: '3',
    claimNumber: 'C003',
    policyNumber: 'MC-2024-002',
    type: 'Medical',
    amount: 5000,
    status: 'rejected',
    submittedDate: '2024-01-10',
    rejectionReason: 'Insufficient documentation'
  }
];

export default function InsurancePage() {
  const [policies] = useState<InsurancePolicy[]>(mockPolicies);
  const [claims] = useState<InsuranceClaim[]>(mockClaims);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'expired':
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
      case 'approved':
        return <CheckCircle className="h-4 w-4" />;
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'expired':
      case 'rejected':
        return <XCircle className="h-4 w-4" />;
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Insurance Management</h1>
        <p className="text-muted-foreground">Manage your insurance policies and claims</p>
      </div>

      <Tabs defaultValue="policies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="policies">My Policies</TabsTrigger>
          <TabsTrigger value="claims">Claims</TabsTrigger>
        </TabsList>

        {/* Policies Tab */}
        <TabsContent value="policies" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Insurance Policies</h2>
            <Button>
              <Shield className="h-4 w-4 mr-2" />
              Add New Policy
            </Button>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {policies.map((policy) => (
              <Card key={policy.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-xl">{policy.name}</CardTitle>
                      <CardDescription>{policy.provider}</CardDescription>
                    </div>
                    <Badge className={getStatusColor(policy.status)}>
                      {getStatusIcon(policy.status)}
                      <span className="ml-1 capitalize">{policy.status}</span>
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <Label className="text-muted-foreground">Premium</Label>
                        <p className="font-semibold">₹{policy.premium.toLocaleString()}/month</p>
                      </div>
                      <div>
                        <Label className="text-muted-foreground">Coverage</Label>
                        <p className="font-semibold">₹{policy.coverage.toLocaleString()}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Policy Number:</span>
                        <span className="font-mono">{policy.policyNumber}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-muted-foreground">Expiry Date:</span>
                        <span>{new Date(policy.expiryDate).toLocaleDateString()}</span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-4">
                      <Button variant="outline" className="flex-1">
                        View Details
                      </Button>
                      <Button variant="outline">
                        <FileText className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* Claims Tab */}
        <TabsContent value="claims" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Insurance Claims</h2>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Submit New Claim
            </Button>
          </div>

          <div className="space-y-4">
            {claims.map((claim) => (
              <Card key={claim.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="text-lg font-semibold">Claim #{claim.claimNumber}</h3>
                      <p className="text-muted-foreground">Policy: {claim.policyNumber}</p>
                    </div>
                    <Badge className={getStatusColor(claim.status)}>
                      {getStatusIcon(claim.status)}
                      <span className="ml-1 capitalize">{claim.status}</span>
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

                  {claim.approvedDate && (
                    <div className="mb-4">
                      <Label className="text-muted-foreground">Approved Date</Label>
                      <p className="font-semibold">{new Date(claim.approvedDate).toLocaleDateString()}</p>
                    </div>
                  )}

                  {claim.rejectionReason && (
                    <div className="mb-4">
                      <Label className="text-muted-foreground">Rejection Reason</Label>
                      <p className="text-red-600">{claim.rejectionReason}</p>
                    </div>
                  )}

                  <div className="flex gap-2">
                    <Button variant="outline" className="flex-1">
                      View Details
                    </Button>
                    {claim.status === 'pending' && (
                      <Button variant="outline">
                        Track Status
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
