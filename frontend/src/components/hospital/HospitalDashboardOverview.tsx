'use client';

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Building2, 
  Users, 
  FileText, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  TrendingUp,
  Activity,
  Eye,
  Plus,
  Search
} from 'lucide-react';

interface DashboardStats {
  totalPatients: number;
  activeConsents: number;
  pendingConsents: number;
  totalDocuments: number;
  verifiedDocuments: number;
  pendingVerifications: number;
  recentActivity: number;
  hospitalRating: number;
}

interface RecentActivity {
  id: string;
  type: 'document_upload' | 'consent_granted' | 'patient_visit' | 'verification';
  title: string;
  description: string;
  timestamp: Date;
  patientName: string;
  status: 'success' | 'warning' | 'info';
}

interface HospitalDashboardOverviewProps {
  stats: DashboardStats;
  recentActivities: RecentActivity[];
  onViewPatients: () => void;
  onUploadDocument: () => void;
  onViewConsents: () => void;
}

export default function HospitalDashboardOverview({
  stats,
  recentActivities,
  onViewPatients,
  onUploadDocument,
  onViewConsents,
}: HospitalDashboardOverviewProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'document_upload':
        return <FileText className="h-4 w-4" />;
      case 'consent_granted':
        return <CheckCircle className="h-4 w-4" />;
      case 'patient_visit':
        return <Users className="h-4 w-4" />;
      case 'verification':
        return <Activity className="h-4 w-4" />;
      default:
        return <Activity className="h-4 w-4" />;
    }
  };

  const getActivityStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'warning':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'info':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="space-y-6">
      {/* Quick Actions */}
      <div className="flex flex-wrap gap-4">
        <Button onClick={onViewPatients} className="flex items-center space-x-2">
          <Search className="h-4 w-4" />
          <span>Search Patients</span>
        </Button>
        <Button onClick={onUploadDocument} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Upload Document</span>
        </Button>
        <Button onClick={onViewConsents} variant="outline" className="flex items-center space-x-2">
          <Eye className="h-4 w-4" />
          <span>View Consents</span>
        </Button>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Total Patients */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Total Patients
            </CardTitle>
            <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalPatients}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Linked patients with active consents
            </p>
          </CardContent>
        </Card>

        {/* Active Consents */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Active Consents
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.activeConsents}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {stats.pendingConsents} pending approval
            </p>
          </CardContent>
        </Card>

        {/* Documents */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Documents
            </CardTitle>
            <FileText className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.totalDocuments}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              {stats.verifiedDocuments} verified, {stats.pendingVerifications} pending
            </p>
          </CardContent>
        </Card>

        {/* Hospital Rating */}
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Hospital Rating
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-orange-600 dark:text-orange-400" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900 dark:text-white">
              {stats.hospitalRating.toFixed(1)}
            </div>
            <p className="text-xs text-gray-600 dark:text-gray-400">
              Based on patient feedback
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <Card className="dark:bg-gray-800 dark:border-gray-700">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Activity className="h-5 w-5" />
            <span>Recent Activity</span>
          </CardTitle>
          <CardDescription>
            Latest interactions and updates in your hospital
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {recentActivities.length === 0 ? (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No recent activity</p>
                <p className="text-sm">Activity will appear here as you interact with patients</p>
              </div>
            ) : (
              recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start space-x-4 p-4 rounded-lg bg-gray-50 dark:bg-gray-700">
                  <div className="flex-shrink-0 p-2 rounded-full bg-white dark:bg-gray-600">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-medium text-gray-900 dark:text-white">
                        {activity.title}
                      </h4>
                      <Badge className={getActivityStatusColor(activity.status)}>
                        {activity.status}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {activity.description}
                    </p>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Patient: {activity.patientName}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {new Date(activity.timestamp).toLocaleDateString()} at{' '}
                        {new Date(activity.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              This Week
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">New Patients</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">12</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Documents Uploaded</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">45</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Consents Granted</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">38</span>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              This Month
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Total Visits</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">156</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Documents Verified</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">234</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Emergency Cases</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">8</span>
            </div>
          </CardContent>
        </Card>

        <Card className="dark:bg-gray-800 dark:border-gray-700">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-600 dark:text-gray-400">
              Performance
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Avg. Response Time</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">2.3 min</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">Patient Satisfaction</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">94%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm text-gray-600 dark:text-gray-400">System Uptime</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">99.9%</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
