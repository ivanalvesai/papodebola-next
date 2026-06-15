import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
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
  async headers() {
    // Áreas de admin nunca devem ser indexadas (são client components protegidos
    // por auth, sem como exportar `robots` via metadata — daí o header global).
    return [
      {
        source: "/painel-pdb-9x/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
      {
        source: "/studio-pdb/:path*",
        headers: [{ key: "X-Robots-Tag", value: "noindex, nofollow" }],
      },
    ];
  },
  async redirects() {
    return [
      // /agenda renomeada pra /jogos-de-hoje (jun/2026) — termo mais forte de SEO
      { source: "/agenda", destination: "/jogos-de-hoje", permanent: true },
      { source: "/agenda/:path*", destination: "/jogos-de-hoje/:path*", permanent: true },
      // /municipal virou /sp/santana-de-parnaiba/municipal (hierarquia geográfica)
      { source: "/municipal", destination: "/sp/santana-de-parnaiba/municipal", permanent: true },
      // jogos de hoje por esporte vivem sob /jogos-de-hoje/{esporte} (futebol, volei, basquete...)
      { source: "/futebol/jogos-hoje", destination: "/jogos-de-hoje/futebol", permanent: true },
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
