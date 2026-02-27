import type { NextConfig } from "next";

// Parse backend URL for image remote patterns
const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:4000';
const url = new URL(backendUrl);

const nextConfig: NextConfig = {
  // Increase body size limit for file uploads through rewrites proxy
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  async rewrites() {
    return {
      // beforeFiles rewrites are checked before pages/api routes
      beforeFiles: [
        {
          source: '/uploads/:path*',
          destination: `${backendUrl}/uploads/:path*`,
        },
      ],
      // afterFiles rewrites are checked after pages/api routes
      // So /api/news/upload-image and /api/posts/upload-images will be handled by API routes first
      afterFiles: [
        {
          source: '/api/:path*',
          destination: `${backendUrl}/api/:path*`,
        },
      ],
      fallback: [],
    };
  },
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
