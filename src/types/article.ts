export interface Article {
  originalTitle: string;
  rewrittenTitle: string;
  rewrittenText: string;
  /** Resumo do WP (excerpt) — fonte preferida da meta description (cai pro corpo se vazio). */
  excerpt?: string;
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
  /** slug do autor (perfil no Payload) — quando há, o byline linka /autor/{slug}. */
  authorSlug?: string;
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
