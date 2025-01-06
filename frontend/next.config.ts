import type { NextConfig } from 'next';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

const nextConfig: NextConfig = {
  reactStrictMode: true,
  env: { NEXT_PUBLIC_API_URI: process.env.NEXT_PUBLIC_API_URI },
};

export default nextConfig;
