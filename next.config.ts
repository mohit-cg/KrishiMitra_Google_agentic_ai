
import type {NextConfig} from 'next';
require('dotenv').config({ path: './.env' });

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      // {
      //   protocol: 'https',
      //   hostname: 'placehold.co',
      //   port: '3000',
      //   pathname: '/**',
      // },
      // {
      //   protocol: 'https',
      //   hostname: 'placehold.co',
      //   pathname: '/**',
      // },
      // {
      //   protocol: 'https',
      //   hostname: 'storage.googleapis.com',
      //   pathname: '/**',
      // },
    ],
    unoptimized: true, 
  },
};

export default nextConfig;
