export interface Article {
  originalTitle: string;
  rewrittenTitle: string;
  rewrittenText: string;
  /** HTML rico do WordPress (h2/h3/listas/links), preservado para exibicao. */
  contentHtml?: string;
  slug: string;
  source: "Manual" | "WordPress";
  image: string;
  /** Legenda/crédito da imagem destacada (p/ atribuição de licença, ex: CC BY). */
  imageCaption?: string;
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
