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
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'https://securehealth.app'),
  title: "SecureHealth - Blockchain Health Records & Insurance Platform",
  description: "Transform your healthcare experience with blockchain-powered, HIPAA-compliant health record management. Secure, accessible, and completely under your control. 256-bit encryption, decentralized storage, and seamless insurance integration.",
  keywords: ["health", "blockchain", "medical records", "insurance", "privacy", "HIPAA", "DISHA", "healthcare", "secure", "encrypted", "decentralized"],
  authors: [{ name: "SecureHealth Team" }],
  creator: "SecureHealth",
  publisher: "SecureHealth",
  openGraph: {
    title: "SecureHealth - Blockchain Health Records & Insurance Platform",
    description: "Transform your healthcare experience with blockchain-powered, HIPAA-compliant health record management. Secure, accessible, and completely under your control.",
    type: "website",
    locale: "en_US",
    url: "https://securehealth.app",
    siteName: "SecureHealth",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "SecureHealth - Blockchain Health Records Platform",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SecureHealth - Blockchain Health Records & Insurance Platform",
    description: "Transform your healthcare experience with blockchain-powered, HIPAA-compliant health record management.",
    images: ["/og-image.png"],
    creator: "@securehealth",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  // Performance and security optimizations
  other: {
    'X-DNS-Prefetch-Control': 'on',
    'X-Frame-Options': 'SAMEORIGIN',
    'X-Content-Type-Options': 'nosniff',
    'Referrer-Policy': 'origin-when-cross-origin',
    'X-XSS-Protection': '1; mode=block',
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