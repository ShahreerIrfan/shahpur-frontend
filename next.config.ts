import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    staleTimes: {
      dynamic: 0,
      static: 0,
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

