'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Save, 
  X, 
  Mail, 
  Phone, 
  Calendar,
  Shield,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { authService, User as UserType } from '@/lib/auth';
import { toast } from 'sonner';

interface AccountSettingsProps {
  user: UserType;
  onUpdate: (updatedUser: UserType) => void;
}

export default function AccountSettings({ user, onUpdate }: AccountSettingsProps) {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    bio: user.bio || '',
    role: user.role || 'patient',
    status: user.status || 'active',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Sync form data when user prop changes
  useEffect(() => {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.bio || '',
      role: user.role || 'patient',
      status: user.status || 'active',
    });
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };


  const handleSave = async () => {
    setIsLoading(true);

    // Prepare update data - only send fields that have values or have been changed
    const updateData: Record<string, unknown> = {};

    if (formData.firstName !== (user.firstName || '')) {
      updateData.firstName = formData.firstName;
    }
    if (formData.lastName !== (user.lastName || '')) {
      updateData.lastName = formData.lastName;
    }
    if (formData.email !== (user.email || '')) {
      updateData.email = formData.email;
    }
    if (formData.phone !== (user.phone || '')) {
      updateData.phone = formData.phone;
    }
    if (formData.bio !== (user.bio || '')) {
      updateData.bio = formData.bio;
    }

    try {
      const updatedUser = await authService.updateProfile(updateData);
      onUpdate(updatedUser);
      setIsEditing(false);
      toast.success('Account settings updated successfully');
    } catch (error: unknown) {
      console.error('Error updating account settings:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update account settings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.bio || '',
      role: user.role || 'patient',
      status: user.status || 'active',
    });
    setIsEditing(false);
  };

  const getRoleDisplayName = (role: string) => {
    const roleMap: { [key: string]: string } = {
      'patient': 'Patient',
      'doctor': 'Doctor',
      'hospital_admin': 'Hospital Admin',
      'insurer': 'Insurer',
      'system_admin': 'System Admin'
    };
    return roleMap[role] || role;
  };

  const getStatusColor = (status: string) => {
    const statusMap: { [key: string]: string } = {
      'active': 'default',
      'inactive': 'secondary',
      'suspended': 'destructive',
      'pending_verification': 'secondary'
    };
    return statusMap[status] || 'secondary';
  };

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Basic Information
          </CardTitle>
          <CardDescription>
            Update your personal details and account information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="firstName">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your first name"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your last name"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Enter your email address"
            />
            <div className="flex items-center gap-2 text-sm">
              {user.emailVerified ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Unverified
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone" className="flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Phone Number
            </Label>
            <Input
              id="phone"
              name="phone"
              type="tel"
              value={formData.phone}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Enter your phone number"
            />
            <div className="flex items-center gap-2 text-sm">
              {user.phoneVerified ? (
                <Badge variant="default" className="flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified
                </Badge>
              ) : (
                <Badge variant="secondary" className="flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Unverified
                </Badge>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Tell us about yourself..."
              rows={4}
              maxLength={500}
            />
            <p className="text-xs text-muted-foreground">
              {formData.bio.length}/500 characters
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            {!isEditing ? (
              <Button onClick={() => setIsEditing(true)} className="flex-1">
                Edit Account Information
              </Button>
            ) : (
              <>
                <Button
                  onClick={handleSave}
                  disabled={isLoading}
                  className="flex-1"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                >
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Account Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Account Status
          </CardTitle>
          <CardDescription>
            View your current account status and role information
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <User className="h-5 w-5 text-blue-500" />
              <div>
                <p className="font-medium">Account Role</p>
                <p className="text-sm text-gray-500">Your current role in the system</p>
              </div>
            </div>
            <Badge variant="default">
              {getRoleDisplayName(user.role)}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Shield className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">Account Status</p>
                <p className="text-sm text-gray-500">Current status of your account</p>
              </div>
            </div>
            <Badge variant={getStatusColor(user.status) as "default" | "secondary" | "destructive" | "outline"}>
              {user.status}
            </Badge>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-purple-500" />
              <div>
                <p className="font-medium">Member Since</p>
                <p className="text-sm text-gray-500">When you joined the platform</p>
              </div>
            </div>
            <span className="text-sm text-gray-600">
              {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
            </span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

