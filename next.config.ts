import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "papodebola.com.br",
      },
      {
        protocol: "https",
        hostname: "admin.papodebola.com.br",
      },
      {
        protocol: "https",
        hostname: "images.pexels.com",
      },
    ],
    unoptimized: false,
  },
};

export default nextConfig;
