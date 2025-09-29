'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  AlertCircle
} from 'lucide-react';
import { User } from '@/lib/auth';
import ProfileForm from '@/components/profile/ProfileForm';
import MedicalForm from '@/components/profile/MedicalForm';
import ProfessionalForm from '@/components/profile/ProfessionalForm';
import SecurityForm from '@/components/profile/SecurityForm';

export default function ProfilePage() {
  const [user, setUser] = useState<User | null>(null);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('personal');
  const router = useRouter();

  const loadUserProfile = useCallback(async () => {
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        const userData = JSON.parse(savedUser);
        setUser(userData);
      } else {
        router.push('/');
      }
    } catch (error) {
      console.error('Error loading user profile:', error);
      setError('Failed to load profile');
    }
  }, [router]);

  useEffect(() => {
    loadUserProfile();
  }, [loadUserProfile]);

  const handleUserUpdate = (updatedUser: User) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
    
    // Dispatch event to update other components
    window.dispatchEvent(new CustomEvent('auth-state-changed'));
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="max-w-4xl mx-auto"
        >
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Profile</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>

          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}


          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as string)} className="space-y-6">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="medical">Medical</TabsTrigger>
              <TabsTrigger value="professional">Professional</TabsTrigger>
              <TabsTrigger value="security">Security</TabsTrigger>
            </TabsList>

            {/* Personal Information */}
            <TabsContent value="personal" className="space-y-6">
              <ProfileForm user={user} onUpdate={handleUserUpdate} />
            </TabsContent>

            {/* Medical Information */}
            <TabsContent value="medical" className="space-y-6">
              <MedicalForm user={user} onUpdate={handleUserUpdate} />
            </TabsContent>

            {/* Professional Information */}
            <TabsContent value="professional" className="space-y-6">
              <ProfessionalForm user={user} onUpdate={handleUserUpdate} />
            </TabsContent>

            {/* Security */}
            <TabsContent value="security" className="space-y-6">
              <SecurityForm user={user} onUpdate={handleUserUpdate} />
            </TabsContent>
          </Tabs>

        </motion.div>
      </div>
    </div>
  );
}
