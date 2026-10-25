import { getArticles } from "@/lib/data/articles";
import { buildNewsSitemap } from "@/lib/seo/feeds";
import { articleFeedItem } from "@/lib/seo/article-feed";
import type { Article } from "@/types/article";

// Sitemap do Google Notícias: só posts das últimas 48h (regra do formato news:).
export const revalidate = 600;

export async function GET() {
  const { articles } = await getArticles({ perPage: 100 }).catch(() => ({ articles: [] as Article[] }));
  const xml = buildNewsSitemap(articles.map(articleFeedItem), Date.now(), "Papo de Bola");
  return new Response(xml, { headers: { "Content-Type": "application/xml; charset=utf-8" } });
}
