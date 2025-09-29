'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Building2, Save, X, Badge, GraduationCap } from 'lucide-react';
import { authService, User } from '@/lib/auth';
import { toast } from 'sonner';

interface ProfessionalFormProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

export default function ProfessionalForm({ user, onUpdate }: ProfessionalFormProps) {
  const [formData, setFormData] = useState({
    organization: user.organization || '',
    licenseNumber: user.licenseNumber || '',
    specialization: user.specialization || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Sync form data when user prop changes
  useEffect(() => {
    setFormData({
      organization: user.organization || '',
      licenseNumber: user.licenseNumber || '',
      specialization: user.specialization || '',
    });
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
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

    if (formData.organization !== (user.organization || '')) {
      updateData.organization = formData.organization;
    }
    if (formData.licenseNumber !== (user.licenseNumber || '')) {
      updateData.licenseNumber = formData.licenseNumber;
    }
    if (formData.specialization !== (user.specialization || '')) {
      updateData.specialization = formData.specialization;
    }

    try {
      const updatedUser = await authService.updateProfile(updateData);
      onUpdate(updatedUser);
      setIsEditing(false);
      toast.success('Professional information updated successfully');
    } catch (error: unknown) {
      console.error('Error updating professional information:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update professional information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      organization: user.organization || '',
      licenseNumber: user.licenseNumber || '',
      specialization: user.specialization || '',
    });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Building2 className="h-5 w-5" />
          Professional Information
        </CardTitle>
        <CardDescription>
          Your professional details and credentials for healthcare services
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="organization" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" />
            Organization
          </Label>
          <Input
            id="organization"
            name="organization"
            value={formData.organization}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="Hospital, clinic, or organization name"
            maxLength={200}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="licenseNumber" className="flex items-center gap-2">
            <Badge className="h-4 w-4" />
            License Number
          </Label>
          <Input
            id="licenseNumber"
            name="licenseNumber"
            value={formData.licenseNumber}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="Professional license number"
            maxLength={50}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="specialization" className="flex items-center gap-2">
            <GraduationCap className="h-4 w-4" />
            Specialization
          </Label>
          <Input
            id="specialization"
            name="specialization"
            value={formData.specialization}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="Medical specialization or field"
            maxLength={100}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="flex-1">
              Edit Professional Information
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
  );
}

