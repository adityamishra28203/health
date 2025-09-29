'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Camera, User as UserIcon, Mail, Phone, FileText, Save, X, Edit3 } from 'lucide-react';
import { authService, User as UserType } from '@/lib/auth';
import { toast } from 'sonner';

interface ProfileFormProps {
  user: UserType;
  onUpdate: (updatedUser: UserType) => void;
}

export default function ProfileForm({ user, onUpdate }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    email: user.email || '',
    phone: user.phone || '',
    bio: user.bio || '',
  });
  
  const [avatar, setAvatar] = useState(user.avatar || '');
  const [isLoading, setIsLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync avatar state with user prop changes
  useEffect(() => {
    setAvatar(user.avatar || '');
  }, [user.avatar]);

  // Image compression function
  const compressImage = (file: File, quality: number = 0.8, maxWidth: number = 800): Promise<File> => {
    return new Promise((resolve, reject) => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();

      img.onload = () => {
        // Calculate new dimensions
        let { width, height } = img;
        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;

        // Draw and compress
        ctx?.drawImage(img, 0, 0, width, height);
        
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const compressedFile = new File([blob], file.name, {
                type: file.type,
                lastModified: Date.now(),
              });
              resolve(compressedFile);
            } else {
              reject(new Error('Failed to compress image'));
            }
          },
          file.type,
          quality
        );
      };

      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = URL.createObjectURL(file);
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Please select an image file');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      setIsLoading(true);
      
      // Compress image before upload to reduce base64 size
      const compressedFile = await compressImage(file, 0.7, 600); // 70% quality, max 600px width for smaller files
      
      // Upload file to backend
      const uploadResult = await authService.uploadAvatar(compressedFile);
      
      // Update local avatar state immediately
      setAvatar(uploadResult.url);
      
      // Don't immediately update profile - let user save manually
      toast.success('Avatar uploaded successfully. Click Save to update your profile.');
    } catch (error: unknown) {
      console.error('Error uploading avatar:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update avatar');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Only send fields that have values or have been changed
      const updateData: Record<string, unknown> = {};
      
      if (formData.firstName !== undefined && formData.firstName !== user.firstName) {
        updateData.firstName = formData.firstName;
      }
      if (formData.lastName !== undefined && formData.lastName !== user.lastName) {
        updateData.lastName = formData.lastName;
      }
      // Email is not editable for security reasons - removed from update data
      if (formData.phone !== undefined && formData.phone !== user.phone) {
        updateData.phone = formData.phone; // Allow empty string to clear phone
      }
      if (formData.bio !== undefined && formData.bio !== user.bio) {
        updateData.bio = formData.bio;
      }
      if (avatar && avatar !== user.avatar) {
        updateData.avatar = avatar;
      }
      
      console.log('📤 Sending profile update data:', updateData);
      
      const updatedUser = await authService.updateProfile(updateData);
      
      onUpdate(updatedUser);
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error: unknown) {
      console.error('Error updating profile:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to update profile');
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
    });
    setAvatar(user.avatar || '');
    setIsEditing(false);
  };

  const getInitials = () => {
    return `${formData.firstName.charAt(0)}${formData.lastName.charAt(0)}`.toUpperCase();
  };

  return (
    <Card className="w-full max-w-3xl mx-auto card-enhanced animate-slide-in-bottom">
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-3 text-xl">
              <UserIcon className="h-6 w-6" />
              Profile Information
            </CardTitle>
            <CardDescription className="text-base">
              Update your personal information and profile picture
            </CardDescription>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsEditing(true)}
              className="flex items-center gap-2 hover:bg-primary hover:text-primary-foreground transition-colors"
            >
              <Edit3 className="h-4 w-4" />
              Edit
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="form-container">
        {/* Avatar Section */}
        <div className="form-section">
          <div className="flex flex-col items-center space-y-6">
            <div className="relative group">
              <Avatar className="h-32 w-32 transition-all-smooth group-hover:scale-105">
                <AvatarImage src={avatar} alt={`${formData.firstName} ${formData.lastName}`} />
                <AvatarFallback className="text-2xl">{getInitials()}</AvatarFallback>
              </Avatar>
              {isEditing && (
                <div 
                  className="absolute -bottom-2 -right-2 bg-primary text-primary-foreground rounded-full p-3 cursor-pointer hover:bg-primary/90 transition-all-smooth shadow-lg hover:shadow-xl"
                  onClick={handleAvatarClick}
                >
                  <Camera className="h-5 w-5" />
                </div>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <div className="text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Click on the camera icon to upload a new profile picture
              </p>
              <p className="text-xs text-muted-foreground">
                Supported formats: JPG, PNG, GIF (Max 1MB)
              </p>
            </div>
          </div>
        </div>

        {/* Form Fields */}
        <div className="form-section">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="form-field-enhanced">
              <Label htmlFor="firstName" className="text-sm font-semibold">First Name</Label>
              <Input
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your first name"
                className="mt-1"
              />
            </div>
            
            <div className="form-field-enhanced">
              <Label htmlFor="lastName" className="text-sm font-semibold">Last Name</Label>
              <Input
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                disabled={!isEditing}
                placeholder="Enter your last name"
                className="mt-1"
              />
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="form-field-enhanced">
            <Label htmlFor="email" className="flex items-center gap-2 text-sm font-semibold">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            <Input
              id="email"
              name="email"
              type="email"
              value={formData.email}
              disabled={true} // Always disabled for security
              placeholder="Email cannot be changed"
              className="mt-1 bg-gray-50 cursor-not-allowed"
            />
            <p className="text-xs text-gray-500 mt-1">
              Email address cannot be changed for security reasons
            </p>
          </div>
        </div>

        <div className="form-section">
          <div className="form-field-enhanced">
            <Label htmlFor="phone" className="flex items-center gap-2 text-sm font-semibold">
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
              className="mt-1"
            />
          </div>
        </div>

        <div className="form-section">
          <div className="form-field-enhanced">
            <Label htmlFor="bio" className="flex items-center gap-2 text-sm font-semibold">
              <FileText className="h-4 w-4" />
              Bio
            </Label>
            <Textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              disabled={!isEditing}
              placeholder="Tell us about yourself..."
              rows={5}
              maxLength={500}
              className="mt-1"
            />
            <div className="flex justify-between items-center mt-2">
              <p className="text-xs text-muted-foreground">
                {formData.bio.length}/500 characters
              </p>
              <p className="text-xs text-muted-foreground">
                Optional
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="form-section pt-6 border-t border-border">
          {!isEditing ? (
            <Button 
              onClick={() => setIsEditing(true)} 
              className="w-full btn-enhanced"
              size="lg"
            >
              Edit Profile
            </Button>
          ) : (
            <div className="flex flex-col sm:flex-row gap-4">
              <Button 
                onClick={handleSave} 
                disabled={isLoading}
                className="flex-1 btn-enhanced"
                size="lg"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                disabled={isLoading}
                className="flex-1 sm:flex-none btn-enhanced"
                size="lg"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
