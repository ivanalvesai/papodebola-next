import type { MetadataRoute } from "next";
import { TEAMS, SPORTS, WP_CATEGORY_BY_SLUG } from "@/lib/config";
import { TOURNAMENTS } from "@/lib/config";
import { SELECOES, BRAZIL_ID } from "@/lib/selecoes";
import { KNOCKOUT_PHASES } from "@/lib/world-cup-phases";
import { getArticles } from "@/lib/data/articles";
import { getCraques } from "@/lib/data/craques";
import { getWorldCupFixtures } from "@/lib/data/match-detail";
import { matchDateSlug, matchPairSlug } from "@/lib/world-cup-match-url";
import { getPayloadTeamSlugs } from "@/lib/data/payload-teams";
import { getChampionshipData } from "@/lib/data/championship";

// Ligas cujas páginas de jogo (lance a lance) entram no sitemap. A Copa tem bloco
// próprio (copaMatchPages). Adicionar slugs aqui inclui os jogos da liga na descoberta.
const MATCH_CHAMPIONSHIPS = ["brasileirao-serie-a", "brasileirao-serie-b"];

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";

// Regenera em runtime (30min): o sitemap precisa dos jogos da Copa, que vêm da API
// e NÃO são alcançáveis no build. Assim o Google descobre os jogos antes do apito.
export const revalidate = 1800;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    { url: BASE, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${BASE}/noticias`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${BASE}/futebol`, lastModified: now, changeFrequency: "hourly", priority: 0.85 },
    { url: `${BASE}/jogos-de-hoje`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE}/jogos-de-hoje/futebol`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE}/ao-vivo`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${BASE}/futebol/onde-assistir`, lastModified: now, changeFrequency: "hourly", priority: 0.8 },
    { url: `${BASE}/futebol/selecao-brasileira`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${BASE}/sp`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE}/sp/santana-de-parnaiba`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${BASE}/sp/santana-de-parnaiba/municipal`, lastModified: now, changeFrequency: "daily", priority: 0.5 },
    { url: `${BASE}/sobre`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/contato`, changeFrequency: "monthly", priority: 0.3 },
    { url: `${BASE}/politica-de-privacidade`, changeFrequency: "monthly", priority: 0.2 },
    { url: `${BASE}/termos-de-uso`, changeFrequency: "monthly", priority: 0.2 },
  ];

  // Team cluster pages: config (Série A/Europa) + Payload (Série B). Sem o segundo,
  // os 20 times da Série B ficam fora do sitemap e o Google não os descobre.
  const payloadTeamSlugs = await getPayloadTeamSlugs().catch(() => []);
  const teamSlugs = Array.from(new Set([...TEAMS.map((t) => t.slug), ...payloadTeamSlugs]));
  const teamPages: MetadataRoute.Sitemap = teamSlugs.flatMap((slug) => [
    { url: `${BASE}/futebol/times/${slug}`, lastModified: now, changeFrequency: "daily" as const, priority: 0.8 },
    { url: `${BASE}/futebol/times/${slug}/jogo-hoje`, lastModified: now, changeFrequency: "daily" as const, priority: 0.7 },
    { url: `${BASE}/futebol/times/${slug}/onde-assistir`, lastModified: now, changeFrequency: "daily" as const, priority: 0.6 },
    { url: `${BASE}/futebol/times/${slug}/escalacao`, lastModified: now, changeFrequency: "daily" as const, priority: 0.6 },
    { url: `${BASE}/futebol/times/${slug}/proximos-jogos`, lastModified: now, changeFrequency: "daily" as const, priority: 0.7 },
    { url: `${BASE}/futebol/times/${slug}/estatisticas`, lastModified: now, changeFrequency: "weekly" as const, priority: 0.6 },
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

  // Tênis: torneio com chaveamento próprio (ATP de Halle)
  sportPages.push({
    url: `${BASE}/tenis/halle-2026`,
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

  // Copa do Mundo: hub (fase de grupos) + páginas das fases eliminatórias
  const copaPages: MetadataRoute.Sitemap = [
    {
      url: `${BASE}/futebol/copa-do-mundo`,
      lastModified: now,
      changeFrequency: "hourly" as const,
      priority: 0.9,
    },
    ...KNOCKOUT_PHASES.map((p) => ({
      url: `${BASE}${p.href}`,
      lastModified: now,
      changeFrequency: "daily" as const,
      priority: 0.7,
    })),
  ];

  // Páginas de cada jogo da Copa (descoberta/indexação ANTES do apito). Vem da API
  // (vazio no build; o revalidate em runtime popula). Jogo de hoje/futuro = freq alta.
  const nowSec = Date.now() / 1000;
  const copaFixtures = await getWorldCupFixtures().catch(() => []);
  const copaMatchPages: MetadataRoute.Sitemap = copaFixtures.map((f) => {
    const aindaNaoAcabou = f.timestamp >= nowSec - 4 * 3600;
    return {
      url: `${BASE}/futebol/copa-do-mundo/jogo/${matchDateSlug(f.timestamp)}/${matchPairSlug(
        f.homeId,
        f.awayId,
        f.home,
        f.away
      )}`,
      lastModified: now,
      changeFrequency: aindaNaoAcabou ? ("hourly" as const) : ("weekly" as const),
      priority: aindaNaoAcabou ? 0.8 : 0.5,
    };
  });

  // Páginas de jogo (lance a lance) das ligas brasileiras (Série A e B). Mesma rota
  // /futebol/{liga}/jogo/{data}/{confronto}; usa os MESMOS slugs que a tabela linka.
  // Antes, só os jogos da Copa entravam no sitemap → os da liga ficavam órfãos.
  const champMatchPages: MetadataRoute.Sitemap = (
    await Promise.all(
      MATCH_CHAMPIONSHIPS.map(async (cslug) => {
        const cdata = await getChampionshipData(cslug).catch(() => null);
        if (!cdata) return [] as MetadataRoute.Sitemap;
        const seen = new Set<string>();
        const out: MetadataRoute.Sitemap = [];
        for (const m of Object.values(cdata.matchesByRound).flat()) {
          if (!m.timestamp || !m.homeId || !m.awayId) continue;
          const url = `${BASE}/futebol/${cslug}/jogo/${matchDateSlug(m.timestamp)}/${matchPairSlug(
            m.homeId,
            m.awayId,
            m.home,
            m.away
          )}`;
          if (seen.has(url)) continue;
          seen.add(url);
          const naoAcabou = m.timestamp >= nowSec - 4 * 3600;
          out.push({
            url,
            lastModified: now,
            changeFrequency: naoAcabou ? ("hourly" as const) : ("weekly" as const),
            priority: naoAcabou ? 0.7 : 0.5,
          });
        }
        return out;
      })
    )
  ).flat();

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
    url: `${BASE}${a.url}`,
    lastModified: a.updatedAt || a.pubDate ? new Date(a.updatedAt || a.pubDate) : now,
    changeFrequency: "weekly" as const,
    priority: 0.6,
    // Capa no sitemap (image extension) → ajuda o Google a descobrir/indexar a
    // imagem da notícia no Google Imagens. URL absoluta.
    ...(a.image
      ? { images: [a.image.startsWith("http") ? a.image : `${BASE}${a.image}`] }
      : {}),
  }));

  // Craques (cluster /futebol/craque/[slug]) — só os publicados. getArticles acima
  // já exclui a categoria, então não há entrada /artigos duplicada pro mesmo conteúdo.
  const craques = await getCraques().catch(() => []);
  const craquePages: MetadataRoute.Sitemap = craques.map((c) => ({
    url: `${BASE}/futebol/craque/${c.slug}`,
    lastModified: c.updatedAt || c.pubDate ? new Date(c.updatedAt || c.pubDate) : now,
    changeFrequency: "monthly" as const,
    priority: 0.6,
  }));

  return [
    ...staticPages,
    ...teamPages,
    ...champPages,
    ...sportPages,
    ...parceirosPage,
    ...newsCategoryPages,
    ...copaPages,
    ...copaMatchPages,
    ...champMatchPages,
    ...selecaoPages,
    ...articlePages,
    ...craquePages,
  ];
}
