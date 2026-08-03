import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: process.env.HOSTINGER_SKIP_DB_SYNC === "true"
  },
  experimental: {
    cpus: 1
  },
  typescript: {
    ignoreBuildErrors: process.env.HOSTINGER_SKIP_DB_SYNC === "true"
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups"
          },
          {
            key: "Cache-Control",
            value: "no-store"
          }
        ]
      }
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.googleapis.com"
      },
      {
        protocol: "https",
        hostname: "**.firebasestorage.app"
      }
    ]
  }
};

export default nextConfig;
