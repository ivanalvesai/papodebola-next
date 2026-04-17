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
      // /esporte/* virou URL top-level por esporte (abr/2026)
      { source: "/esporte/nba", destination: "/basquete/nba", permanent: true },
      { source: "/esporte/tenis", destination: "/tenis", permanent: true },
      { source: "/esporte/f1", destination: "/formula-1", permanent: true },
      { source: "/esporte/mma", destination: "/combate", permanent: true },
      { source: "/esporte/volei", destination: "/volei", permanent: true },
      { source: "/esporte/esports", destination: "/esports", permanent: true },
      { source: "/esporte/nfl", destination: "/futebol-americano", permanent: true },
    ];
  },
};

export default nextConfig;
