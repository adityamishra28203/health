import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from "@/components/layout/Layout";
import { OfflineWarning } from "@/components/offline-warning";
import { Toaster } from "sonner";
import { ChunkLoadErrorBoundary } from "@/components/ChunkLoadErrorBoundary";
import "@/lib/chunkLoader"; // Import chunk loader utility
import { preloadCriticalResources } from "@/lib/animations";

// Optimize font loading
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
  preload: true,
  fallback: ['system-ui', 'arial'],
});

export const metadata: Metadata = {
  title: "SecureHealth - Blockchain Health Records & Insurance Platform",
  description: "Secure, blockchain-powered health records and insurance platform. Manage your medical data with complete privacy and control.",
  keywords: ["health", "blockchain", "medical records", "insurance", "privacy", "HIPAA", "DISHA"],
  authors: [{ name: "SecureHealth Team" }],
  openGraph: {
    title: "SecureHealth - Blockchain Health Records & Insurance Platform",
    description: "Secure, blockchain-powered health records and insurance platform.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SecureHealth - Blockchain Health Records & Insurance Platform",
    description: "Secure, blockchain-powered health records and insurance platform.",
  },
  robots: {
    index: true,
    follow: true,
  },
  // Performance optimizations
  other: {
    'X-DNS-Prefetch-Control': 'on',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'origin-when-cross-origin',
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0f172a" },
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Preload critical resources on client side
  if (typeof window !== 'undefined') {
    preloadCriticalResources();
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
        <link rel="preload" href="/fonts/inter-var.woff2" as="font" type="font/woff2" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://health-2v5j.vercel.app" />
        
        {/* Critical CSS inline */}
        <style dangerouslySetInnerHTML={{
          __html: `
            /* Critical CSS for above-the-fold content */
            body { 
              font-family: ${inter.style.fontFamily}, system-ui, sans-serif;
              margin: 0;
              padding: 0;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
            }
            .loading { 
              opacity: 0; 
              transition: opacity 0.3s ease-in-out; 
            }
            .loaded { 
              opacity: 1; 
            }
          `
        }} />
      </head>
      <body className={inter.className}>
        <ChunkLoadErrorBoundary>
          <Layout>
            {children}
          </Layout>
          <OfflineWarning />
          <Toaster />
        </ChunkLoadErrorBoundary>
      </body>
    </html>
  );
}