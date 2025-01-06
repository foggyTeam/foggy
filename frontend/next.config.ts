import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  env: { API_URI: process.env.API_URI },
};

export default nextConfig;
