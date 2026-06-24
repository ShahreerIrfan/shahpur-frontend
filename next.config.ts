import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 30,
    },
  },
  // Skip image optimization - too heavy for 1-core VPS
  // Images are served directly from the backend with caching
  images: {
    unoptimized: true,
  },
  async rewrites() {
    return [
      {
        source: "/favicon.ico",
        destination: "/api/favicon",
      },
    ];
  },
  async headers() {
    return [
      {
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
