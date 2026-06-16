import { fetchWP } from "@/lib/api/wordpress";
import { articleHref } from "@/lib/config";
import type { Article } from "@/types/article";

/* eslint-disable @typescript-eslint/no-explicit-any */

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 60);
}

// Decodifica entidades HTML (incl. numericas decimais e hex) para texto puro.
// O WordPress devolve title.rendered com entidades como &#8216; / &#8217;
// (aspas curvas), &#8230; (reticencias) etc. — sem isso, aparecem cruas no titulo.
function decodeEntities(s: string): string {
  return s
    .replace(/&#x([0-9a-fA-F]+);/g, (_, h) => String.fromCodePoint(parseInt(h, 16)))
    .replace(/&#(\d+);/g, (_, n) => String.fromCodePoint(parseInt(n, 10)))
    .replace(/&nbsp;/g, " ")
    .replace(/&hellip;/g, "…")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&lsquo;/g, "‘")
    .replace(/&rsquo;/g, "’")
    .replace(/&ldquo;/g, "“")
    .replace(/&rdquo;/g, "”")
    .replace(/&laquo;/g, "«")
    .replace(/&raquo;/g, "»")
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&amp;/g, "&"); // &amp; por ultimo para nao re-decodificar
}

function stripHtml(html: string): string {
  return decodeEntities(html.replace(/<[^>]+>/g, " "))
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeArticle(post: any, categories: Record<number, string>, tags: Record<number, string>): Article {
  const title = stripHtml(post.title?.rendered || "");
  const slug = post.slug || generateSlug(title);
  const contentHtml = post.content?.rendered || "";
  // Versao em texto puro: usada para meta description, excerpt nas listas e
  // contagem de palavras. A exibicao do artigo usa contentHtml (HTML real).
  const content = stripHtml(contentHtml).slice(0, 5000);

  const postCategories = (post.categories || []).map((id: number) => categories[id]).filter(Boolean);
  const postTags = (post.tags || []).map((id: number) => tags[id]).filter(Boolean);

  // Featured image (+ legenda/crédito da imagem, p/ atribuição de licença)
  let image = "";
  let imageCaption = "";
  const embedded = post._embedded?.["wp:featuredmedia"]?.[0];
  if (embedded?.source_url) {
    image = embedded.source_url;
    imageCaption = (embedded.caption?.rendered || "").replace(/<[^>]+>/g, "").trim();
  }

  const category = postCategories[0] || "Futebol Brasileiro";

  return {
    imageCaption,
    originalTitle: title,
    rewrittenTitle: title,
    rewrittenText: content,
    contentHtml,
    slug,
    source: "WordPress",
    image,
    category,
    tags: postTags,
    team: postTags[0] || null,
    author: post._embedded?.author?.[0]?.name || "Redação",
    pubDate: post.date || new Date().toISOString(),
    createdAt: post.date || new Date().toISOString(),
    // URL canônica por categoria (/{categoria}/{slug}); fallback /artigos pra
    // categorias que colidem com rotas existentes. Ver articleHref em config.
    url: articleHref(category, slug),
    wpId: post.id,
  };
}

let categoriesCache: Record<number, string> | null = null;
let tagsCache: Record<number, string> | null = null;

async function getCategories(): Promise<Record<number, string>> {
  if (categoriesCache) return categoriesCache;

  const data = await fetchWP<any[]>("categories?per_page=50", 86400);
  if (!data) return {};

  const result: Record<number, string> = Object.fromEntries(data.map((c: any) => [c.id, c.name]));
  categoriesCache = result;
  return result;
}

async function getTags(): Promise<Record<number, string>> {
  if (tagsCache) return tagsCache;

  const data = await fetchWP<any[]>("tags?per_page=100", 86400);
  if (!data) return {};

  const result: Record<number, string> = Object.fromEntries(data.map((t: any) => [t.id, t.name]));
  tagsCache = result;
  return result;
}

export async function getArticles(options?: {
  page?: number;
  perPage?: number;
  category?: string;
  search?: string;
  tag?: string;
  noCache?: boolean;
}): Promise<{ articles: Article[]; total: number }> {
  const { page = 1, perPage = 20, category, search, tag, noCache } = options || {};
  const categories = await getCategories();
  const tags = await getTags();

  let endpoint = `posts?per_page=${perPage}&page=${page}&orderby=date&order=desc&_embed`;

  if (category) {
    const catId = Object.entries(categories).find(([, name]) => name === category)?.[0];
    if (catId) endpoint += `&categories=${catId}`;
  }

  // Craques (ex: Sócrates) têm página própria em /futebol/craque/[slug] e NÃO são
  // notícia. Excluímos a categoria das listagens (home, /noticias, /futebol, sitemap,
  // "Leia também") pra não duplicar conteúdo nem poluir o feed — a menos que a própria
  // categoria "Craques" seja pedida explicitamente.
  if (category !== "Craques") {
    const craquesId = Object.entries(categories).find(([, name]) => name === "Craques")?.[0];
    if (craquesId) endpoint += `&categories_exclude=${craquesId}`;
  }

  if (search) {
    endpoint += `&search=${encodeURIComponent(search)}`;
  }

  if (tag) {
    const tagId = Object.entries(tags).find(([, name]) => name.toLowerCase() === tag.toLowerCase())?.[0];
    if (tagId) endpoint += `&tags=${tagId}`;
  }

  // tag "wp-articles" → revalidateTag refresca toda listagem ao publicar um post (real-time).
  const data = await fetchWP<any[]>(endpoint, noCache ? 0 : 1800, ["wp-articles"]);
  if (!data) return { articles: [], total: 0 };

  const articles = data.map((post: any) => normalizeArticle(post, categories, tags));

  return { articles, total: articles.length < perPage ? (page - 1) * perPage + articles.length : page * perPage + 1 };
}

export async function getArticleBySlug(slug: string, noCache?: boolean): Promise<Article | null> {
  const categories = await getCategories();
  const tags = await getTags();

  const data = await fetchWP<any[]>(`posts?slug=${encodeURIComponent(slug)}&_embed`, noCache ? 0 : 1800, ["wp-articles"]);
  if (!data || data.length === 0) return null;

  return normalizeArticle(data[0], categories, tags);
}

export async function getLatestArticles(count: number = 15): Promise<Article[]> {
  const { articles } = await getArticles({ perPage: count });
  return articles;
}

export async function getRelatedArticles(category: string, excludeSlug: string, count: number = 4): Promise<Article[]> {
  const { articles } = await getArticles({ perPage: count + 1, category });
  return articles.filter((a) => a.slug !== excludeSlug).slice(0, count);
}
