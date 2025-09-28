import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://health-j0gvmolnu-adityamishra28203s-projects.vercel.app',
    NEXT_PUBLIC_IPFS_URL: process.env.NEXT_PUBLIC_IPFS_URL || 'https://ipfs.infura.io:5001',
    NEXT_PUBLIC_BLOCKCHAIN_URL: process.env.NEXT_PUBLIC_BLOCKCHAIN_URL || 'https://mainnet.infura.io/v3/your-project-id',
    NEXT_PUBLIC_USE_MOCK_DATA: process.env.NEXT_PUBLIC_USE_MOCK_DATA || 'true',
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.NEXT_PUBLIC_API_URL || 'https://health-j0gvmolnu-adityamishra28203s-projects.vercel.app'}/api/:path*`,
      },
    ];
  },
};

export default nextConfig;
