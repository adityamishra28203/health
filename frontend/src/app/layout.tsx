import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from "@/components/layout/Layout";
import { OfflineWarning } from "@/components/offline-warning";
import { Toaster } from "sonner";
import { ChunkLoadErrorBoundary } from "@/components/ChunkLoadErrorBoundary";
import { AuthProvider } from "@/context/AuthContext";
import "@/lib/chunkLoader"; // Import chunk loader utility
// import { preloadCriticalResources } from "@/lib/animations"; // Not needed for font optimization

// Optimize font loading
const inter = Inter({ 
  subsets: ["latin"],
  display: 'swap',
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

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload critical resources */}
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
          <AuthProvider>
            <Layout>
              {children}
            </Layout>
            <OfflineWarning />
            <Toaster />
          </AuthProvider>
        </ChunkLoadErrorBoundary>
      </body>
    </html>
  );
}