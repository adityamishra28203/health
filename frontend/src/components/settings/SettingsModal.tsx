'use client';

import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Settings, 
  User, 
  Shield, 
  Bell, 
  Eye, 
  Palette,
  Globe,
  HelpCircle,
} from 'lucide-react';
import { User as UserType } from '@/lib/auth';
import SecuritySettings from './SecuritySettings';
import NotificationSettings from './NotificationSettings';
import PrivacySettings from './PrivacySettings';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: UserType;
  onUpdate: (updatedUser: UserType) => void;
}

export default function SettingsModal({ isOpen, onClose, user, onUpdate }: SettingsModalProps) {
  const [activeTab, setActiveTab] = useState('account');

  const settingsTabs = [
    {
      id: 'account',
      label: 'Account',
      icon: <User className="h-4 w-4" />,
      description: 'Manage your account information'
    },
    {
      id: 'security',
      label: 'Security',
      icon: <Shield className="h-4 w-4" />,
      description: 'Password, 2FA, and security settings'
    },
    {
      id: 'notifications',
      label: 'Notifications',
      icon: <Bell className="h-4 w-4" />,
      description: 'Email, push, and SMS preferences'
    },
    {
      id: 'privacy',
      label: 'Privacy',
      icon: <Eye className="h-4 w-4" />,
      description: 'Data sharing and privacy controls'
    },
    {
      id: 'appearance',
      label: 'Appearance',
      icon: <Palette className="h-4 w-4" />,
      description: 'Theme and display preferences'
    },
    {
      id: 'language',
      label: 'Language',
      icon: <Globe className="h-4 w-4" />,
      description: 'Language and region settings'
    }
  ];

  const AccountSettings = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Profile Information</h3>
          <div className="space-y-3">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Full Name</label>
              <p className="text-sm">{user.firstName} {user.lastName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email</label>
              <p className="text-sm">{user.email}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Role</label>
              <Badge variant="secondary">{user.role}</Badge>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Account Status</label>
              <Badge variant={user.status === 'active' ? 'default' : 'secondary'}>
                {user.status}
              </Badge>
            </div>
          </div>
        </div>
        
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Account Actions</h3>
          <div className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                onClose();
                window.location.href = '/profile';
              }}
            >
              <User className="h-4 w-4 mr-2" />
              Edit Profile
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setActiveTab('security')}
            >
              <Shield className="h-4 w-4 mr-2" />
              Change Password
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => {
                window.open('mailto:support@healthwallet.com', '_blank');
              }}
            >
              <HelpCircle className="h-4 w-4 mr-2" />
              Help & Support
            </Button>
          </div>
        </div>
      </div>

      <div className="border-t pt-6">
        <h3 className="text-lg font-semibold mb-4">Account Statistics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 border rounded-lg">
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground">Health Records</p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground">Insurance Claims</p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground">Hospitals</p>
          </div>
          <div className="text-center p-4 border rounded-lg">
            <p className="text-2xl font-bold text-primary">0</p>
            <p className="text-sm text-muted-foreground">Doctors</p>
          </div>
        </div>
      </div>
    </div>
  );

  const AppearanceSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Theme Preferences</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Dark Mode</p>
              <p className="text-sm text-muted-foreground">Switch between light and dark themes</p>
            </div>
            <Button variant="outline" size="sm">
              Toggle Theme
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Compact Mode</p>
              <p className="text-sm text-muted-foreground">Reduce spacing for a more compact interface</p>
            </div>
            <Button variant="outline" size="sm">
              Toggle Compact
            </Button>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Display Settings</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Font Size</p>
              <p className="text-sm text-muted-foreground">Adjust the text size for better readability</p>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">Small</Button>
              <Button variant="default" size="sm">Medium</Button>
              <Button variant="outline" size="sm">Large</Button>
            </div>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Sidebar Position</p>
              <p className="text-sm text-muted-foreground">Choose where the sidebar appears</p>
            </div>
            <div className="flex gap-2">
              <Button variant="default" size="sm">Left</Button>
              <Button variant="outline" size="sm">Right</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const LanguageSettings = () => (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Language & Region</h3>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Language</p>
              <p className="text-sm text-muted-foreground">Choose your preferred language</p>
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-md">
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Region</p>
              <p className="text-sm text-muted-foreground">Select your region for localized content</p>
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-md">
              <option value="US">United States</option>
              <option value="CA">Canada</option>
              <option value="GB">United Kingdom</option>
              <option value="AU">Australia</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Date Format</p>
              <p className="text-sm text-muted-foreground">How dates are displayed</p>
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-md">
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Time Format</p>
              <p className="text-sm text-muted-foreground">12-hour or 24-hour time format</p>
            </div>
            <select className="px-3 py-2 border border-gray-300 rounded-md">
              <option value="12">12-hour (AM/PM)</option>
              <option value="24">24-hour</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Settings
          </DialogTitle>
          <DialogDescription>
            Manage your account settings and preferences
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3 md:grid-cols-6 mb-6">
            {settingsTabs.map((tab) => (
              <TabsTrigger key={tab.id} value={tab.id} className="flex items-center gap-2">
                {tab.icon}
                <span className="hidden sm:inline">{tab.label}</span>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="overflow-y-auto max-h-[60vh]">
            <TabsContent value="account" className="mt-0">
              <AccountSettings />
            </TabsContent>
            
            <TabsContent value="security" className="mt-0">
              <SecuritySettings user={user} onUpdate={onUpdate} />
            </TabsContent>
            
            <TabsContent value="notifications" className="mt-0">
              <NotificationSettings user={user} onUpdate={onUpdate} />
            </TabsContent>
            
            <TabsContent value="privacy" className="mt-0">
              <PrivacySettings user={user} onUpdate={onUpdate} />
            </TabsContent>
            
            <TabsContent value="appearance" className="mt-0">
              <AppearanceSettings />
            </TabsContent>
            
            <TabsContent value="language" className="mt-0">
              <LanguageSettings />
            </TabsContent>
          </div>
        </Tabs>

        <div className="flex justify-end gap-3 pt-4 border-t">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
          <Button onClick={onClose}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
