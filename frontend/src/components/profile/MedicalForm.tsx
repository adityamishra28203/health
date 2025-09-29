'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Heart, Save, X, Phone } from 'lucide-react';
import { authService, User } from '@/lib/auth';
import { toast } from 'sonner';

interface MedicalFormProps {
  user: User;
  onUpdate: (updatedUser: User) => void;
}

export default function MedicalForm({ user, onUpdate }: MedicalFormProps) {
  const [formData, setFormData] = useState({
    emergencyContact: user.emergencyContact || '',
    bloodType: user.bloodType || '',
    allergies: user.allergies?.join(', ') || '',
    medications: user.medications?.join(', ') || '',
    medicalConditions: user.medicalConditions?.join(', ') || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  // Sync form data when user prop changes
  useEffect(() => {
    setFormData({
      emergencyContact: user.emergencyContact || '',
      bloodType: user.bloodType || '',
      allergies: user.allergies?.join(', ') || '',
      medications: user.medications?.join(', ') || '',
      medicalConditions: user.medicalConditions?.join(', ') || '',
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

    if (formData.emergencyContact !== (user.emergencyContact || '')) {
      updateData.emergencyContact = formData.emergencyContact;
    }
    if (formData.bloodType !== (user.bloodType || '')) {
      updateData.bloodType = formData.bloodType;
    }
    if (formData.allergies !== (user.allergies?.join(', ') || '')) {
      updateData.allergies = formData.allergies;
    }
    if (formData.medications !== (user.medications?.join(', ') || '')) {
      updateData.medications = formData.medications;
    }
    if (formData.medicalConditions !== (user.medicalConditions?.join(', ') || '')) {
      updateData.medicalConditions = formData.medicalConditions;
    }

    try {
      const updatedUser = await authService.updateProfile(updateData);
      onUpdate(updatedUser);
      setIsEditing(false);
      toast.success('Medical information updated successfully');
    } catch (error: unknown) {
      console.error('Error updating medical information:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update medical information');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      emergencyContact: user.emergencyContact || '',
      bloodType: user.bloodType || '',
      allergies: user.allergies?.join(', ') || '',
      medications: user.medications?.join(', ') || '',
      medicalConditions: user.medicalConditions?.join(', ') || '',
    });
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Heart className="h-5 w-5" />
          Medical Information
        </CardTitle>
        <CardDescription>
          Keep your medical information up to date for better healthcare services
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="emergencyContact" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Emergency Contact
          </Label>
          <Input
            id="emergencyContact"
            name="emergencyContact"
            value={formData.emergencyContact}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="Emergency contact phone number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="bloodType">Blood Type</Label>
          <Input
            id="bloodType"
            name="bloodType"
            value={formData.bloodType}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="e.g., O+, A-, B+, AB-"
            maxLength={10}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="allergies">Allergies</Label>
          <Textarea
            id="allergies"
            name="allergies"
            value={formData.allergies}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="List any allergies (comma separated)"
            rows={3}
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground">
            {formData.allergies.length}/1000 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="medications">Current Medications</Label>
          <Textarea
            id="medications"
            name="medications"
            value={formData.medications}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="List current medications (comma separated)"
            rows={3}
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground">
            {formData.medications.length}/1000 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="medicalConditions">Medical Conditions</Label>
          <Textarea
            id="medicalConditions"
            name="medicalConditions"
            value={formData.medicalConditions}
            onChange={handleInputChange}
            disabled={!isEditing}
            placeholder="List any medical conditions (comma separated)"
            rows={3}
            maxLength={1000}
          />
          <p className="text-xs text-muted-foreground">
            {formData.medicalConditions.length}/1000 characters
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pt-4">
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="flex-1">
              Edit Medical Information
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

