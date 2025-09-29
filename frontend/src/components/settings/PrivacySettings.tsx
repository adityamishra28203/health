'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Shield, 
  Eye, 
  Database, 
  Users, 
  FileText,
  Download,
  Trash2,
  Save,
  AlertTriangle,
  CheckCircle,
  Info
} from 'lucide-react';
import { User as UserType } from '@/lib/auth';
import { toast } from 'sonner';

interface PrivacySettingsProps {
  user: UserType;
  onUpdate: (updatedUser: UserType) => void;
}

interface PrivacyPreferences {
  dataSharing: {
    allowAnalytics: boolean;
    allowMarketing: boolean;
    allowResearch: boolean;
    allowInsurance: boolean;
  };
  visibility: {
    profilePublic: boolean;
    healthRecordsVisible: boolean;
    contactInfoVisible: boolean;
  };
  dataRetention: {
    autoDelete: boolean;
    retentionPeriod: '1year' | '2years' | '5years' | 'never';
  };
  privacy: {
    twoFactorRequired: boolean;
    sessionTimeout: '15min' | '1hour' | '4hours' | '24hours';
    logAccess: boolean;
  };
}

export default function PrivacySettings({ }: PrivacySettingsProps) {
  const [preferences, setPreferences] = useState<PrivacyPreferences>({
    dataSharing: {
      allowAnalytics: false,
      allowMarketing: false,
      allowResearch: false,
      allowInsurance: true,
    },
    visibility: {
      profilePublic: false,
      healthRecordsVisible: false,
      contactInfoVisible: false,
    },
    dataRetention: {
      autoDelete: false,
      retentionPeriod: 'never',
    },
    privacy: {
      twoFactorRequired: false,
      sessionTimeout: '4hours',
      logAccess: true,
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handlePreferenceChange = (category: keyof PrivacyPreferences, setting: string, value: boolean | string) => {
    setPreferences(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [setting]: value
      }
    }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // In a real application, this would save to the backend
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasChanges(false);
      toast.success('Privacy preferences updated successfully');
    } catch (error: unknown) {
      console.error('Error updating privacy preferences:', error);
      toast.error('Failed to update privacy preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDataExport = async () => {
    setIsLoading(true);
    try {
      // Simulate data export
      await new Promise(resolve => setTimeout(resolve, 2000));
      toast.success('Data export completed. Check your email for download link.');
    } catch (error: unknown) {
      console.error('Export error:', error);
      toast.error('Failed to export data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccountDeletion = async () => {
    if (window.confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      setIsLoading(true);
      try {
        // In a real application, this would initiate account deletion
        await new Promise(resolve => setTimeout(resolve, 2000));
        toast.success('Account deletion initiated. You will receive an email confirmation.');
      } catch (error: unknown) {
        console.error('Account deletion error:', error);
        toast.error('Failed to initiate account deletion');
      } finally {
        setIsLoading(false);
      }
    }
  };

  const PrivacyToggle = ({ 
    icon, 
    title, 
    description, 
    category, 
    setting, 
    enabled,
    warning
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    category: keyof PrivacyPreferences;
    setting: string;
    enabled: boolean;
    warning?: string;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between p-4 border rounded-lg">
        <div className="flex items-center gap-3">
          {icon}
          <div>
            <p className="font-medium">{title}</p>
            <p className="text-sm text-gray-500">{description}</p>
            {warning && (
              <p className="text-sm text-orange-600 mt-1">{warning}</p>
            )}
          </div>
        </div>
        <Switch
          checked={enabled}
          onCheckedChange={(checked) => handlePreferenceChange(category, setting, checked)}
        />
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Data Sharing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Data Sharing
          </CardTitle>
          <CardDescription>
            Control how your data is shared with third parties
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PrivacyToggle
            icon={<Database className="h-5 w-5 text-blue-500" />}
            title="Analytics & Usage Data"
            description="Allow anonymous usage data to improve our services"
            category="dataSharing"
            setting="allowAnalytics"
            enabled={preferences.dataSharing.allowAnalytics}
          />
          
          <PrivacyToggle
            icon={<FileText className="h-5 w-5 text-blue-500" />}
            title="Marketing Communications"
            description="Receive promotional emails and updates about new features"
            category="dataSharing"
            setting="allowMarketing"
            enabled={preferences.dataSharing.allowMarketing}
          />
          
          <PrivacyToggle
            icon={<Shield className="h-5 w-5 text-blue-500" />}
            title="Medical Research"
            description="Allow anonymized data to be used for medical research"
            category="dataSharing"
            setting="allowResearch"
            enabled={preferences.dataSharing.allowResearch}
            warning="This helps advance medical research but shares anonymized data"
          />
          
          <PrivacyToggle
            icon={<CheckCircle className="h-5 w-5 text-blue-500" />}
            title="Insurance Providers"
            description="Share necessary data with your insurance providers"
            category="dataSharing"
            setting="allowInsurance"
            enabled={preferences.dataSharing.allowInsurance}
            warning="Required for insurance claim processing"
          />
        </CardContent>
      </Card>

      {/* Profile Visibility */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Profile Visibility
          </CardTitle>
          <CardDescription>
            Control who can see your profile information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PrivacyToggle
            icon={<Users className="h-5 w-5 text-blue-500" />}
            title="Public Profile"
            description="Allow others to view your basic profile information"
            category="visibility"
            setting="profilePublic"
            enabled={preferences.visibility.profilePublic}
          />
          
          <PrivacyToggle
            icon={<FileText className="h-5 w-5 text-blue-500" />}
            title="Health Records Visibility"
            description="Allow healthcare providers to view your health records"
            category="visibility"
            setting="healthRecordsVisible"
            enabled={preferences.visibility.healthRecordsVisible}
            warning="Required for healthcare providers to access your records"
          />
          
          <PrivacyToggle
            icon={<Eye className="h-5 w-5 text-blue-500" />}
            title="Contact Information"
            description="Show contact information to other users"
            category="visibility"
            setting="contactInfoVisible"
            enabled={preferences.visibility.contactInfoVisible}
          />
        </CardContent>
      </Card>

      {/* Data Retention */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5" />
            Data Retention
          </CardTitle>
          <CardDescription>
            Control how long your data is stored
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-delete">Automatic Data Deletion</Label>
              <p className="text-sm text-muted-foreground">
                Automatically delete old data after a specified period
              </p>
            </div>
            <Switch
              id="auto-delete"
              checked={preferences.dataRetention.autoDelete}
              onCheckedChange={(checked) => handlePreferenceChange('dataRetention', 'autoDelete', checked)}
            />
          </div>

          {preferences.dataRetention.autoDelete && (
            <>
              <Separator />
              <div className="space-y-2">
                <Label htmlFor="retention-period">Data Retention Period</Label>
                <select
                  id="retention-period"
                  value={preferences.dataRetention.retentionPeriod}
                  onChange={(e) => handlePreferenceChange('dataRetention', 'retentionPeriod', e.target.value)}
                  className="w-full p-2 border rounded-md"
                >
                  <option value="1year">1 Year</option>
                  <option value="2years">2 Years</option>
                  <option value="5years">5 Years</option>
                  <option value="never">Never</option>
                </select>
                <p className="text-sm text-muted-foreground">
                  Data older than this period will be automatically deleted
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Privacy Controls */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Privacy Controls
          </CardTitle>
          <CardDescription>
            Additional privacy and security settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <PrivacyToggle
            icon={<Shield className="h-5 w-5 text-blue-500" />}
            title="Require Two-Factor Authentication"
            description="Add an extra layer of security to your account"
            category="privacy"
            setting="twoFactorRequired"
            enabled={preferences.privacy.twoFactorRequired}
          />
          
          <div className="space-y-2">
            <Label htmlFor="session-timeout">Session Timeout</Label>
            <select
              id="session-timeout"
              value={preferences.privacy.sessionTimeout}
              onChange={(e) => handlePreferenceChange('privacy', 'sessionTimeout', e.target.value)}
              className="w-full p-2 border rounded-md"
            >
              <option value="15min">15 Minutes</option>
              <option value="1hour">1 Hour</option>
              <option value="4hours">4 Hours</option>
              <option value="24hours">24 Hours</option>
            </select>
            <p className="text-sm text-muted-foreground">
              Automatically log out after this period of inactivity
            </p>
          </div>
          
          <PrivacyToggle
            icon={<FileText className="h-5 w-5 text-blue-500" />}
            title="Access Logging"
            description="Log all access to your account and data"
            category="privacy"
            setting="logAccess"
            enabled={preferences.privacy.logAccess}
          />
        </CardContent>
      </Card>

      {/* Data Management */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Data Management
          </CardTitle>
          <CardDescription>
            Export or delete your data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertDescription>
              You have the right to access, modify, or delete your personal data at any time.
            </AlertDescription>
          </Alert>

          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={handleDataExport}
              disabled={isLoading}
              className="flex-1"
            >
              <Download className="h-4 w-4 mr-2" />
              Export My Data
            </Button>
            
            <Button 
              variant="destructive" 
              onClick={handleAccountDeletion}
              disabled={isLoading}
              className="flex-1"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Save Button */}
      {hasChanges && (
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-orange-600">
                <AlertTriangle className="h-4 w-4" />
                <span className="text-sm font-medium">You have unsaved changes</span>
              </div>
              <Button onClick={handleSave} disabled={isLoading}>
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

