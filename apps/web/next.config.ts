import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    cpus: 1
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups"
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
