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
  async redirects() {
    return [
      { source: "/campeonato/:slug", destination: "/futebol/:slug", permanent: true },
      { source: "/times/:slug", destination: "/futebol/times/:slug", permanent: true },
      { source: "/times/:slug/:sub*", destination: "/futebol/times/:slug/:sub*", permanent: true },
    ];
  },
};

export default nextConfig;
