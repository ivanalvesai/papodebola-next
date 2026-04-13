export interface Article {
  originalTitle: string;
  rewrittenTitle: string;
  rewrittenText: string;
  slug: string;
  source: "Manual" | "WordPress";
  image: string;
  category: string;
  tags: string[];
  team: string | null;
  author: string;
  pubDate: string;
  createdAt: string;
  url: string;
  updatedAt?: string;
  wpId?: number;
}

export interface ArticleListResponse {
  articles: Article[];
  total: number;
  page: number;
  pages: number;
}
