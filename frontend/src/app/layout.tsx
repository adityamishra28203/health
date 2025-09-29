import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Layout from "@/components/layout/Layout";
import { OfflineWarning } from "@/components/offline-warning";
import { Toaster } from "sonner";
import { ChunkLoadErrorBoundary } from "@/components/ChunkLoadErrorBoundary";
import "@/lib/chunkLoader"; // Import chunk loader utility

const inter = Inter({ subsets: ["latin"] });

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
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
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