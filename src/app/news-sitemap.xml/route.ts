import { getArticles } from "@/lib/data/articles";
import { buildNewsSitemap } from "@/lib/seo/feeds";
import { articleFeedItem } from "@/lib/seo/article-feed";
import type { Article } from "@/types/article";
import { WATCH_CATEGORY } from "@/lib/config";

// Sitemap do Google Notícias: só posts das últimas 48h (regra do formato news:).
export const revalidate = 600;

export async function GET() {
  // getArticles sem categoria exclui as siladas; "Onde assistir" é notícia e entra à parte.
  const [{ articles: main }, { articles: watch }] = await Promise.all([
    getArticles({ perPage: 100 }).catch(() => ({ articles: [] as Article[] })),
    getArticles({ perPage: 50, category: WATCH_CATEGORY }).catch(() => ({ articles: [] as Article[] })),
  ]);
  // "Onde assistir" já vem no feed geral (não é mais silada); dedup por URL por segurança.
  const seen = new Set<string>();
  const articles = [...main, ...watch].filter((a) => (seen.has(a.url) ? false : (seen.add(a.url), true)));
  const xml = buildNewsSitemap(articles.map(articleFeedItem), Date.now(), "Papo de Bola");
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
