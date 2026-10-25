import type { FeedItem } from "@/lib/seo/feeds";
import type { Article } from "@/types/article";

const BASE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";

// Article (Payload/WP normalizado) → item do feed RSS / sitemap de notícias.
export function articleFeedItem(a: Article): FeedItem {
  return {
    title: a.rewrittenTitle || a.originalTitle,
    url: `${BASE}${a.url}`,
    description: a.excerpt,
    date: a.pubDate,
    image: a.image ? (a.image.startsWith("http") ? a.image : `${BASE}${a.image}`) : undefined,
  };
}
