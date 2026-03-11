import dotenv from 'dotenv';

const loadEnv = (envFilePath) => {
  dotenv.config({ path: envFilePath });
};

const envFilePath = (() => {
  switch (process.env.NODE_ENV) {
    case 'development':
      return '.env.development';
    case 'production':
      return '.env.production';
    case 'test':
      return '.env.test';
    case 'staging':
      return '.env.staging';
    default:
      return '.env';
  }
})();

loadEnv(envFilePath);

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    missingSuspenseWithCSRBailout: false,
  },
  transpilePackages: ['@mui/x-date-pickers'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'creeddocs.s3.us-east-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'greenbits.technology',
      },
      {
        protocol: 'https',
        hostname: 'api.oronapp.com',
      },
      {
        protocol: "https",
        hostname: "minio-oooo808gg008www4sgw4kkk8.15.204.240.209.sslip.io",
      },
    ],
  },
  env: {
    BASE_URL: process.env.BASE_URL,
    NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  webpack: (
    config,
    { buildId, dev, isServer, defaultLoaders, nextRuntime, webpack }
  ) => {
    config.externals.push({ canvas: 'commonjs canvas' });
    return config;
  },
};

export default nextConfig;
