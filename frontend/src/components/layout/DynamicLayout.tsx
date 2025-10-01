"use client";

import dynamic from 'next/dynamic';
import { ReactNode } from 'react';

// Dynamically import the Layout component to reduce initial bundle size
const Layout = dynamic(() => import('./Layout'), {
  ssr: false, // Disable SSR for client-heavy layout
  loading: () => (
    <div className="min-h-screen bg-background">
      <div className="animate-pulse">
        <div className="h-16 bg-gray-200"></div>
        <div className="flex-1 bg-gray-100"></div>
      </div>
    </div>
  ),
});

interface DynamicLayoutProps {
  children: ReactNode;
}

export default function DynamicLayout({ children }: DynamicLayoutProps) {
  return <Layout>{children}</Layout>;
}



