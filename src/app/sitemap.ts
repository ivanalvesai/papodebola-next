import type { MetadataRoute } from "next";
import { TEAMS, SPORTS } from "@/lib/config";
import { TOURNAMENTS } from "@/lib/config";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://papodebola.com.br";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${BASE}/noticias`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/agenda`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE}/ao-vivo`, lastModified: now, changeFrequency: "always", priority: 0.8 },
    { url: `${BASE}/sobre`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/contato`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/privacidade`, changeFrequency: "monthly", priority: 0.2 },
  ];

  // Team cluster pages
  const teamPages: MetadataRoute.Sitemap = TEAMS.flatMap((t) => [
    { url: `${BASE}/times/${t.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${BASE}/times/${t.slug}/jogo-hoje`, lastModified: now, changeFrequency: "daily" as const, priority: 0.7 },
    { url: `${BASE}/times/${t.slug}/onde-assistir`, lastModified: now, changeFrequency: "daily" as const, priority: 0.6 },
    { url: `${BASE}/times/${t.slug}/escalacao`, lastModified: now, changeFrequency: "daily" as const, priority: 0.6 },
    { url: `${BASE}/times/${t.slug}/proximos-jogos`, lastModified: now, changeFrequency: "daily" as const, priority: 0.7 },
    { url: `${BASE}/times/${t.slug}/estatisticas`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 },
  ]);

  // Championship pages
  const champPages: MetadataRoute.Sitemap = Object.values(TOURNAMENTS)
    .filter((t) => t.seasonId)
    .map((t) => ({
      url: `${BASE}/campeonato/${t.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

  // Sport pages
  const sportPages: MetadataRoute.Sitemap = SPORTS.map((s) => ({
    url: `${BASE}/esporte/${s.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...teamPages, ...champPages, ...sportPages];
}
