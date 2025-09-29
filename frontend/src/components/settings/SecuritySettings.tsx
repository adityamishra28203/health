'use client';

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { 
  Shield, 
  Lock, 
  Eye, 
  EyeOff, 
  Key, 
  AlertCircle,
  LogOut,
  Trash2
} from 'lucide-react';
import { authService, User as UserType } from '@/lib/auth';
import { toast } from 'sonner';

interface SecuritySettingsProps {
  user: UserType;
  onUpdate: (updatedUser: UserType) => void;
}

export default function SecuritySettings({ }: SecuritySettingsProps) {
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: false,
    sessionTimeout: '24',
    loginNotifications: true,
    suspiciousActivityAlerts: true,
  });

  const [isLoading, setIsLoading] = useState(false);

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const togglePasswordVisibility = (field: 'current' | 'new' | 'confirm') => {
    setShowPasswords(prev => ({
      ...prev,
      [field]: !prev[field]
    }));
  };

  const handleSecuritySettingChange = (setting: string, value: boolean | string) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: value
    }));
  };

  const validatePassword = (password: string): string[] => {
    const errors: string[] = [];
    
    if (password.length < 8) {
      errors.push('Password must be at least 8 characters long');
    }
    
    if (!/(?=.*[a-z])/.test(password)) {
      errors.push('Password must contain at least one lowercase letter');
    }
    
    if (!/(?=.*[A-Z])/.test(password)) {
      errors.push('Password must contain at least one uppercase letter');
    }
    
    if (!/(?=.*\d)/.test(password)) {
      errors.push('Password must contain at least one number');
    }
    
    if (!/(?=.*[@$!%*?&])/.test(password)) {
      errors.push('Password must contain at least one special character (@$!%*?&)');
    }
    
    return errors;
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate new password
    const passwordErrors = validatePassword(passwordData.newPassword);
    if (passwordErrors.length > 0) {
      toast.error(passwordErrors[0]);
      return;
    }

    // Check if passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    // Check if current password is provided
    if (!passwordData.currentPassword) {
      toast.error('Please enter your current password');
      return;
    }

    setIsLoading(true);

    try {
      await authService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      
      // Clear form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      toast.success('Password changed successfully');
    } catch (error: unknown) {
      console.error('Error changing password:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to change password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogoutAllDevices = async () => {
    if (!confirm('Are you sure you want to logout from all devices? This will invalidate all active sessions.')) {
      return;
    }

    try {
      await authService.logout();
      toast.success('Successfully logged out from all devices');
      window.location.replace('/');
    } catch (error: unknown) {
      console.error('Error logging out devices:', error);
      toast.error('Failed to logout from all devices');
    }
  };

  const handleDeleteAccount = async () => {
    if (!confirm('Are you sure you want to delete your account? This action cannot be undone.')) {
      return;
    }

    if (!confirm('This will permanently delete all your data including health records, insurance claims, and all personal information. Are you absolutely sure?')) {
      return;
    }

    setIsLoading(true);
    try {
      await authService.deleteAccount();
      toast.success('Your account has been permanently deleted');
      window.location.replace('/');
    } catch (error: unknown) {
      console.error('Error deleting account:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to delete account');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Password Change */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Change Password
          </CardTitle>
          <CardDescription>
            Update your password to keep your account secure
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">Current Password</Label>
              <div className="relative">
                <Input
                  id="currentPassword"
                  name="currentPassword"
                  type={showPasswords.current ? "text" : "password"}
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your current password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility('current')}
                >
                  {showPasswords.current ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="newPassword">New Password</Label>
              <div className="relative">
                <Input
                  id="newPassword"
                  name="newPassword"
                  type={showPasswords.new ? "text" : "password"}
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  placeholder="Enter your new password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility('new')}
                >
                  {showPasswords.new ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm New Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showPasswords.confirm ? "text" : "password"}
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  placeholder="Confirm your new password"
                  required
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showPasswords.confirm ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            {/* Password Requirements */}
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Password must be at least 8 characters long and contain at least one uppercase letter, 
                one lowercase letter, one number, and one special character (@$!%*?&).
              </AlertDescription>
            </Alert>

            <Button type="submit" disabled={isLoading} className="w-full">
              {isLoading ? 'Changing Password...' : 'Change Password'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Security Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Preferences
          </CardTitle>
          <CardDescription>
            Configure your security settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor">Two-Factor Authentication</Label>
              <p className="text-sm text-muted-foreground">
                Add an extra layer of security to your account
              </p>
            </div>
            <Switch
              id="two-factor"
              checked={securitySettings.twoFactorEnabled}
              onCheckedChange={(checked) => handleSecuritySettingChange('twoFactorEnabled', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="login-notifications">Login Notifications</Label>
              <p className="text-sm text-muted-foreground">
                Get notified when someone logs into your account
              </p>
            </div>
            <Switch
              id="login-notifications"
              checked={securitySettings.loginNotifications}
              onCheckedChange={(checked) => handleSecuritySettingChange('loginNotifications', checked)}
            />
          </div>

          <Separator />

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="suspicious-activity">Suspicious Activity Alerts</Label>
              <p className="text-sm text-muted-foreground">
                Get alerted about unusual activity on your account
              </p>
            </div>
            <Switch
              id="suspicious-activity"
              checked={securitySettings.suspiciousActivityAlerts}
              onCheckedChange={(checked) => handleSecuritySettingChange('suspiciousActivityAlerts', checked)}
            />
          </div>

          <Separator />

          <div className="space-y-2">
            <Label htmlFor="session-timeout">Session Timeout</Label>
            <select
              id="session-timeout"
              value={securitySettings.sessionTimeout}
              onChange={(e) => handleSecuritySettingChange('sessionTimeout', e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="1">1 hour</option>
              <option value="8">8 hours</option>
              <option value="24">24 hours</option>
              <option value="168">7 days</option>
              <option value="720">30 days</option>
            </select>
            <p className="text-sm text-muted-foreground">
              How long to keep you logged in before requiring re-authentication
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Account Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-5 w-5" />
            Account Actions
          </CardTitle>
          <CardDescription>
            Manage your account sessions and data
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <LogOut className="h-5 w-5 text-orange-500" />
              <div>
                <p className="font-medium">Logout All Devices</p>
                <p className="text-sm text-gray-500">Sign out from all devices and browsers</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleLogoutAllDevices}
              className="text-orange-600 border-orange-200 hover:bg-orange-50"
            >
              Logout All
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg border-red-200">
            <div className="flex items-center gap-3">
              <Trash2 className="h-5 w-5 text-red-500" />
              <div>
                <p className="font-medium text-red-700">Delete Account</p>
                <p className="text-sm text-red-500">Permanently delete your account and all data</p>
              </div>
            </div>
            <Button
              variant="outline"
              onClick={handleDeleteAccount}
              className="text-red-600 border-red-200 hover:bg-red-50"
            >
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
