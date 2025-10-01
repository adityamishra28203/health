'use client';

import { useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  User, 
  Building2, 
  Heart, 
  ArrowLeft,
  Home,
  Activity
} from 'lucide-react';

interface PortalNavigationProps {
  currentPortal?: 'patient' | 'hospital' | 'portal';
  showBackButton?: boolean;
  showHomeButton?: boolean;
}

export default function PortalNavigation({ 
  currentPortal, 
  showBackButton = false, 
  showHomeButton = true 
}: PortalNavigationProps) {
  const router = useRouter();
  const pathname = usePathname();

  const portals = [
    {
      id: 'patient',
      name: 'Patient Portal',
      icon: <User className="h-4 w-4" />,
      href: '/',
      color: 'hover:bg-blue-50 hover:text-blue-600',
      activeColor: 'bg-blue-100 text-blue-700'
    },
    {
      id: 'hospital',
      name: 'Hospital Portal',
      icon: <Building2 className="h-4 w-4" />,
      href: '/hospital',
      color: 'hover:bg-green-50 hover:text-green-600',
      activeColor: 'bg-green-100 text-green-700'
    },
    {
      id: 'portal',
      name: 'Main Portal',
      icon: <Heart className="h-4 w-4" />,
      href: '/portal',
      color: 'hover:bg-purple-50 hover:text-purple-600',
      activeColor: 'bg-purple-100 text-purple-700'
    }
  ];

  const getCurrentPortal = () => {
    if (currentPortal) return currentPortal;
    
    if (pathname === '/portal') return 'portal';
    if (pathname.startsWith('/hospital')) return 'hospital';
    return 'patient';
  };

  const current = getCurrentPortal();

  const handleBack = () => {
    router.back();
  };

  const handleHome = () => {
    router.push('/portal');
  };

  return (
    <div className="flex items-center justify-between bg-white border-b px-4 py-3">
      <div className="flex items-center space-x-4">
        {showBackButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleBack}
            className="flex items-center space-x-2"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back</span>
          </Button>
        )}
        
        {showHomeButton && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleHome}
            className="flex items-center space-x-2"
          >
            <Home className="h-4 w-4" />
            <span>Home</span>
          </Button>
        )}

        <div className="flex items-center space-x-1">
          {portals.map((portal) => (
            <Button
              key={portal.id}
              variant={current === portal.id ? "default" : "ghost"}
              size="sm"
              onClick={() => router.push(portal.href)}
              className={`flex items-center space-x-2 ${
                current === portal.id 
                  ? portal.activeColor 
                  : `text-gray-600 ${portal.color}`
              }`}
            >
              {portal.icon}
              <span>{portal.name}</span>
              {portal.id === 'hospital' && (
                <Badge variant="secondary" className="ml-1 text-xs">
                  New
                </Badge>
              )}
            </Button>
          ))}
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Activity className="h-4 w-4" />
          <span>All Systems Operational</span>
        </div>
      </div>
    </div>
  );
}
