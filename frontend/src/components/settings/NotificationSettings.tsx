'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, 
  Mail, 
  Smartphone, 
  Shield, 
  Heart, 
  CreditCard,
  Calendar,
  Save,
  AlertTriangle
} from 'lucide-react';
import { User as UserType } from '@/lib/auth';
import { toast } from 'sonner';

interface NotificationSettingsProps {
  user: UserType;
  onUpdate: (updatedUser: UserType) => void;
}

interface NotificationPreferences {
  email: {
    enabled: boolean;
    healthRecords: boolean;
    insuranceClaims: boolean;
    securityAlerts: boolean;
    appointmentReminders: boolean;
    systemUpdates: boolean;
  };
  push: {
    enabled: boolean;
    healthRecords: boolean;
    insuranceClaims: boolean;
    securityAlerts: boolean;
    appointmentReminders: boolean;
  };
  sms: {
    enabled: boolean;
    securityAlerts: boolean;
    appointmentReminders: boolean;
  };
  frequency: 'instant' | 'daily' | 'weekly' | 'never';
}

export default function NotificationSettings({ }: NotificationSettingsProps) {
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email: {
      enabled: true,
      healthRecords: true,
      insuranceClaims: true,
      securityAlerts: true,
      appointmentReminders: true,
      systemUpdates: false,
    },
    push: {
      enabled: true,
      healthRecords: true,
      insuranceClaims: true,
      securityAlerts: true,
      appointmentReminders: true,
    },
    sms: {
      enabled: false,
      securityAlerts: true,
      appointmentReminders: false,
    },
    frequency: 'instant'
  });

  const [isLoading, setIsLoading] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const handlePreferenceChange = (category: keyof NotificationPreferences, setting: string, value: boolean | string) => {
    setPreferences(prev => {
      if (category === 'frequency') {
        return {
          ...prev,
          frequency: value as 'instant' | 'daily' | 'weekly' | 'never'
        };
      }
      return {
        ...prev,
        [category]: {
          ...(prev[category] as Record<string, unknown> || {}),
          [setting]: value
        }
      };
    });
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsLoading(true);

    try {
      // In a real application, this would save to the backend
      // For now, we'll simulate the save operation
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setHasChanges(false);
      toast.success('Notification preferences updated successfully');
    } catch (error: unknown) {
      console.error('Error updating notification preferences:', error);
      toast.error('Failed to update notification preferences');
    } finally {
      setIsLoading(false);
    }
  };

  const NotificationToggle = ({ 
    icon, 
    title, 
    description, 
    category, 
    setting, 
    enabled 
  }: {
    icon: React.ReactNode;
    title: string;
    description: string;
    category: keyof NotificationPreferences;
    setting: string;
    enabled: boolean;
  }) => (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div className="flex items-center gap-3">
        {icon}
        <div>
          <p className="font-medium">{title}</p>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
      </div>
      <Switch
        checked={enabled}
        onCheckedChange={(checked) => handlePreferenceChange(category, setting, checked)}
      />
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Email Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Notifications
          </CardTitle>
          <CardDescription>
            Configure which email notifications you want to receive
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-enabled">Enable Email Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Master switch for all email notifications
              </p>
            </div>
            <Switch
              id="email-enabled"
              checked={preferences.email.enabled}
              onCheckedChange={(checked) => handlePreferenceChange('email', 'enabled', checked)}
            />
          </div>

          {preferences.email.enabled && (
            <>
              <Separator />
              <div className="space-y-4">
                <NotificationToggle
                  icon={<Heart className="h-5 w-5 text-blue-500" />}
                  title="Health Records"
                  description="Updates about your health records and medical data"
                  category="email"
                  setting="healthRecords"
                  enabled={preferences.email.healthRecords}
                />
                
                <NotificationToggle
                  icon={<CreditCard className="h-5 w-5 text-blue-500" />}
                  title="Insurance Claims"
                  description="Status updates on your insurance claims"
                  category="email"
                  setting="insuranceClaims"
                  enabled={preferences.email.insuranceClaims}
                />
                
                <NotificationToggle
                  icon={<Shield className="h-5 w-5 text-blue-500" />}
                  title="Security Alerts"
                  description="Important security notifications and alerts"
                  category="email"
                  setting="securityAlerts"
                  enabled={preferences.email.securityAlerts}
                />
                
                <NotificationToggle
                  icon={<Calendar className="h-5 w-5 text-blue-500" />}
                  title="Appointment Reminders"
                  description="Reminders for upcoming appointments"
                  category="email"
                  setting="appointmentReminders"
                  enabled={preferences.email.appointmentReminders}
                />
                
                <NotificationToggle
                  icon={<Bell className="h-5 w-5 text-blue-500" />}
                  title="System Updates"
                  description="Platform updates and new features"
                  category="email"
                  setting="systemUpdates"
                  enabled={preferences.email.systemUpdates}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Push Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Push Notifications
          </CardTitle>
          <CardDescription>
            Configure push notifications for your mobile device
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="push-enabled">Enable Push Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive notifications on your mobile device
              </p>
            </div>
            <Switch
              id="push-enabled"
              checked={preferences.push.enabled}
              onCheckedChange={(checked) => handlePreferenceChange('push', 'enabled', checked)}
            />
          </div>

          {preferences.push.enabled && (
            <>
              <Separator />
              <div className="space-y-4">
                <NotificationToggle
                  icon={<Heart className="h-5 w-5 text-blue-500" />}
                  title="Health Records"
                  description="Real-time updates about your health records"
                  category="push"
                  setting="healthRecords"
                  enabled={preferences.push.healthRecords}
                />
                
                <NotificationToggle
                  icon={<CreditCard className="h-5 w-5 text-blue-500" />}
                  title="Insurance Claims"
                  description="Instant notifications for claim updates"
                  category="push"
                  setting="insuranceClaims"
                  enabled={preferences.push.insuranceClaims}
                />
                
                <NotificationToggle
                  icon={<Shield className="h-5 w-5 text-blue-500" />}
                  title="Security Alerts"
                  description="Critical security notifications"
                  category="push"
                  setting="securityAlerts"
                  enabled={preferences.push.securityAlerts}
                />
                
                <NotificationToggle
                  icon={<Calendar className="h-5 w-5 text-blue-500" />}
                  title="Appointment Reminders"
                  description="Reminders for upcoming appointments"
                  category="push"
                  setting="appointmentReminders"
                  enabled={preferences.push.appointmentReminders}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* SMS Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            SMS Notifications
          </CardTitle>
          <CardDescription>
            Configure SMS notifications for critical updates
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="sms-enabled">Enable SMS Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Receive text messages for important updates
              </p>
            </div>
            <Switch
              id="sms-enabled"
              checked={preferences.sms.enabled}
              onCheckedChange={(checked) => handlePreferenceChange('sms', 'enabled', checked)}
            />
          </div>

          {preferences.sms.enabled && (
            <>
              <Separator />
              <div className="space-y-4">
                <NotificationToggle
                  icon={<Shield className="h-5 w-5 text-blue-500" />}
                  title="Security Alerts"
                  description="Critical security notifications via SMS"
                  category="sms"
                  setting="securityAlerts"
                  enabled={preferences.sms.securityAlerts}
                />
                
                <NotificationToggle
                  icon={<Calendar className="h-5 w-5 text-blue-500" />}
                  title="Appointment Reminders"
                  description="Important appointment reminders via SMS"
                  category="sms"
                  setting="appointmentReminders"
                  enabled={preferences.sms.appointmentReminders}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Notification Frequency */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Notification Frequency
          </CardTitle>
          <CardDescription>
            Choose how often you want to receive notifications
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="frequency">Notification Frequency</Label>
            <Select
              value={preferences.frequency}
              onValueChange={(value: 'instant' | 'daily' | 'weekly' | 'never') => 
                handlePreferenceChange('frequency', 'frequency', value)
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="instant">Instant</SelectItem>
                <SelectItem value="daily">Daily Digest</SelectItem>
                <SelectItem value="weekly">Weekly Summary</SelectItem>
                <SelectItem value="never">Never</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Choose how frequently you want to receive non-critical notifications
            </p>
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
