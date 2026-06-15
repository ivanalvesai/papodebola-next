import type { MetadataRoute } from "next";
import { TEAMS, SPORTS, WP_CATEGORY_BY_SLUG } from "@/lib/config";
import { TOURNAMENTS } from "@/lib/config";
import { SELECOES, BRAZIL_ID } from "@/lib/selecoes";
import { getArticles } from "@/lib/data/articles";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${BASE}/noticias`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/futebol`, lastModified: now, changeFrequency: "hourly", priority: 0.85 },
    { url: `${BASE}/jogos-de-hoje`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE}/jogos-de-hoje/futebol`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE}/ao-vivo`, lastModified: now, changeFrequency: "always", priority: 0.8 },
    { url: `${BASE}/futebol/jogos-hoje`, lastModified: now, changeFrequency: "hourly", priority: 0.85 },
    { url: `${BASE}/futebol/onde-assistir`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${BASE}/futebol/selecao-brasileira`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/sp`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE}/sp/santana-de-parnaiba`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE}/sp/santana-de-parnaiba/municipal`, lastModified: now, changeFrequency: "daily", priority: 0.5 },
    { url: `${BASE}/sobre`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/contato`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/privacidade`, changeFrequency: "monthly", priority: 0.2 },
  ];

  // Team cluster pages
  const teamPages: MetadataRoute.Sitemap = TEAMS.flatMap((t) => [
    { url: `${BASE}/futebol/times/${t.slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${BASE}/futebol/times/${t.slug}/jogo-hoje`, lastModified: now, changeFrequency: "daily" as const, priority: 0.7 },
    { url: `${BASE}/futebol/times/${t.slug}/onde-assistir`, lastModified: now, changeFrequency: "daily" as const, priority: 0.6 },
    { url: `${BASE}/futebol/times/${t.slug}/escalacao`, lastModified: now, changeFrequency: "daily" as const, priority: 0.6 },
    { url: `${BASE}/futebol/times/${t.slug}/proximos-jogos`, lastModified: now, changeFrequency: "daily" as const, priority: 0.7 },
    { url: `${BASE}/futebol/times/${t.slug}/estatisticas`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 },
  ]);

  // Championship pages
  const champPages: MetadataRoute.Sitemap = Object.values(TOURNAMENTS)
    .filter((t) => t.seasonId)
    .map((t) => ({
      url: `${BASE}/futebol/${t.slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.8,
    }));

  // Sport pages (top-level, sem prefixo /esporte/)
  const sportPages: MetadataRoute.Sitemap = SPORTS.map((s) => ({
    url: `${BASE}${s.href}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  // Basquete tem subrota NBA (conteúdo do torneio)
  sportPages.push({
    url: `${BASE}/basquete/nba`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.6,
  });

  // Parceiros (institucional)
  const parceirosPage: MetadataRoute.Sitemap = [
    { url: `${BASE}/parceiros`, changeFrequency: "monthly" as const, priority: 0.3 },
  ];

  // Categorias de notícias (URLs limpas /noticias/{slug})
  const newsCategoryPages: MetadataRoute.Sitemap = Object.keys(WP_CATEGORY_BY_SLUG).map(
    (slug) => ({
      url: `${BASE}/noticias/${slug}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })
  );

  // Páginas por seleção (Copa do Mundo) — Brasil já está em staticPages
  const selecaoPages: MetadataRoute.Sitemap = SELECOES.filter(
    (s) => s.id !== BRAZIL_ID
  ).map((s) => ({
    url: `${BASE}/futebol/selecoes/${s.slug}`,
    lastModified: now,
    changeFrequency: "daily" as const,
    priority: 0.6,
  }));

  // Artigos do WordPress (cauda longa). Limite de 100 do WP REST; se houver mais,
  // paginar futuramente. Falha de rede não derruba o sitemap (catch → []).
  const { articles } = await getArticles({ perPage: 100 }).catch(() => ({ articles: [] }));
  const articlePages: MetadataRoute.Sitemap = articles.map((a) => ({
    url: `${BASE}/artigos/${a.slug}`,
    lastModified: a.updatedAt || a.pubDate ? new Date(a.updatedAt || a.pubDate) : now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...teamPages,
    ...champPages,
    ...sportPages,
    ...parceirosPage,
    ...newsCategoryPages,
    ...selecaoPages,
    ...articlePages,
  ];
}
