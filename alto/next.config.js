/* eslint-disable @typescript-eslint/no-require-imports */
const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Performance optimizations
  swcMinify: true,
  compress: true,

  // Build optimizations
  experimental: {
    optimizeCss: true,
    gzipSize: true,
  },

  // Bundle optimization
  webpack: (config, { dev, isServer }) => {
    // Optimize bundle splitting
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: "all",
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
          },
          common: {
            name: "common",
            minChunks: 2,
            priority: 10,
            reuseExistingChunk: true,
          },
          // Split heavy libraries
          charts: {
            test: /[\\/]node_modules[\\/](recharts|react-chartjs-2|chart\.js)[\\/]/,
            name: "charts",
            chunks: "all",
            priority: 30,
          },
          calendar: {
            test: /[\\/]node_modules[\\/](@syncfusion|react-big-calendar|react-calendar)[\\/]/,
            name: "calendar",
            chunks: "all",
            priority: 30,
          },
          forms: {
            test: /[\\/]node_modules[\\/](react-hook-form|@hookform|react-signature-canvas)[\\/]/,
            name: "forms",
            chunks: "all",
            priority: 20,
          },
        },
      };
    }

    // Optimize imports
    config.resolve.alias = {
      ...config.resolve.alias,
      // Ensure lodash tree shaking
      lodash: "lodash-es",
    };

    return config;
  },

  eslint: {
    ignoreDuringBuilds: true,
  },

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
    // Image optimization
    formats: ["image/webp", "image/avif"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },

  // Headers for caching
  async headers() {
    return [
      {
        source: "/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/api/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=300",
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
