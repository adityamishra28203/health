'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function HospitalPortalPage() {
  const router = useRouter();
  
  // Redirect to dashboard or auth
  useEffect(() => {
    // Check if user is authenticated
    const token = localStorage.getItem('hospital_token');
    if (token) {
      router.push('/hospital/dashboard');
    } else {
      router.push('/hospital/auth/login');
    }
  }, [router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 dark:text-gray-400">Redirecting...</p>
      </div>
    </div>
  );
}
