import { getArticles } from "@/lib/data/articles";
import { buildRss } from "@/lib/seo/feeds";
import { articleFeedItem } from "@/lib/seo/article-feed";
import type { Article } from "@/types/article";

// Feed RSS dos últimos posts publicados (agregadores, Google Notícias). /feed e /rss
// redirecionam pra cá (next.config).
export const revalidate = 900;
const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";

export async function GET() {
  const { articles } = await getArticles({ perPage: 50 }).catch(() => ({ articles: [] as Article[] }));
  const xml = buildRss(articles.map(articleFeedItem), {
    title: "Papo de Bola",
    url: BASE,
    description: "Notícias de futebol brasileiro e mundial",
  });
  return new Response(xml, { headers: { "Content-Type": "application/rss+xml; charset=utf-8" } });
}
