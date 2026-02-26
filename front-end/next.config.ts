import type { NextConfig } from "next";

// Parse backend URL for image remote patterns
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const url = new URL(backendUrl);

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: url.protocol.replace(':', '') as 'http' | 'https',
        hostname: url.hostname,
        port: url.port || '',
        pathname: '/uploads/**',
      },
      // Fallback for localhost dev
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4000',
        pathname: '/uploads/**',
      },
    ],
    dangerouslyAllowSVG: true,
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
