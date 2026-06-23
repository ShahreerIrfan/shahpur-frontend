import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  reactStrictMode: true,
  // Disable ALL client-side router caching.
  // This forces every navigation to fetch fresh data from the server,
  // eliminating the "first click doesn't work after idle" bug.
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 30,
    },
  },
  async rewrites() {
    return [
      {
        source: "/favicon.ico",
        destination: "/api/favicon",
      },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "**",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
