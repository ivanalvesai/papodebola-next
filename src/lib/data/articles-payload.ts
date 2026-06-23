import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";
import { articleHref } from "@/lib/config";
import type { Article } from "@/types/article";

// Leitura de artigos do Payload (Fase 3c). getArticles/getArticleBySlug tentam
// daqui primeiro; se der null (banco fora), caem pro WordPress (fallback).
/* eslint-disable @typescript-eslint/no-explicit-any */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";

function stripHtml(html: string): string {
  return html
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&amp;/g, "&")
    .replace(/\s+/g, " ")
    .trim();
}

// Corpo do post em HTML: prefere o editor visual (Lexical, campo `content`); cai pro
// HTML legado (`body`) enquanto o post não foi migrado. Garante que nada some na
// transição e que o HTML renderizado (logo, o SEO) continue equivalente.
// URL do YouTube/Vimeo -> URL de embed (iframe).
function videoEmbedSrc(url: string): string {
  if (!url) return "";
  const yt = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/|v\/))([\w-]{11})/);
  if (yt) return `https://www.youtube.com/embed/${yt[1]}`;
  const vm = url.match(/vimeo\.com\/(?:video\/)?(\d+)/);
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`;
  return "";
}

// Conversores dos blocos do editor (vídeo, colunas, destaque) -> HTML. Os slugs batem
// com o BlocksFeature em payload.config.ts. A tabela usa os conversores padrão.
const lexicalConverters: any = ({ defaultConverters }: any) => ({
  ...defaultConverters,
  blocks: {
    video: ({ node }: any) => {
      const src = videoEmbedSrc(node?.fields?.url || "");
      if (!src) return "";
      const cap = node?.fields?.caption;
      const figcap = cap ? `<figcaption>${cap}</figcaption>` : "";
      return `<figure class="pdb-video"><div class="pdb-video-frame"><iframe src="${src}" title="${cap || "Vídeo"}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe></div>${figcap}</figure>`;
    },
    columns: ({ node }: any) => {
      const cols = [node?.fields?.col1, node?.fields?.col2, node?.fields?.col3].filter(
        (x: any) => x?.root?.children?.length
      );
      if (!cols.length) return "";
      const inner = cols
        .map((x: any) => `<div class="pdb-col">${convertLexicalToHTML({ data: x })}</div>`)
        .join("");
      return `<div class="pdb-columns pdb-cols-${cols.length}">${inner}</div>`;
    },
    callout: ({ node }: any) => {
      const style = node?.fields?.style || "info";
      const x = node?.fields?.content;
      const inner = x?.root?.children?.length ? convertLexicalToHTML({ data: x }) : "";
      return `<div class="pdb-callout pdb-callout-${style}">${inner}</div>`;
    },
  },
});

function postBodyHtml(p: any): string {
  const c = p.content;
  if (c && typeof c === "object" && c.root && Array.isArray(c.root.children) && c.root.children.length) {
    try {
      return convertLexicalToHTML({ data: c, converters: lexicalConverters });
    } catch {
      return p.body || "";
    }
  }
  return p.body || "";
}

function mapPost(p: any): Article {
  const tags = (p.tags || []).map((x: any) => x.tag).filter(Boolean);
  const bodyHtml = postBodyHtml(p);
  const cover = typeof p.cover === "object" && p.cover ? p.cover : null;
  // Prefere a versão "card" (WebP 800px); cai pro original. URL absoluta (display + OG).
  const coverUrl = cover?.sizes?.card?.url || cover?.url || "";
  const image = coverUrl ? `${SITE_URL}${coverUrl}` : "";
  const category = p.category || "Futebol brasileiro";
  const pubDate = p.publishedDate || p.createdAt || new Date().toISOString();
  return {
    imageCaption: cover?.alt || "",
    originalTitle: p.title || "",
    rewrittenTitle: p.title || "",
    rewrittenText: stripHtml(bodyHtml).slice(0, 5000),
    excerpt: p.excerpt || "",
    contentHtml: bodyHtml,
    slug: p.slug,
    source: "WordPress",
    image,
    category,
    tags,
    team: tags[0] || null,
    author: p.author || "Redação",
    pubDate,
    createdAt: pubDate,
    url: (p.pdbLink || "").trim() || articleHref(category, p.slug),
    wpId: p.wpId,
  };
}

const getClient = cache(async () => getPayload({ config }));

export async function getArticlesPayload(options?: {
  page?: number;
  perPage?: number;
  category?: string;
  search?: string;
  tag?: string;
}): Promise<{ articles: Article[]; total: number } | null> {
  // No build o Postgres não é alcançável (builder fora da pdb-net) → não tenta,
  // retorna null → getArticles cai pro WP. ISR popula do Payload em runtime.
  if (process.env.NEXT_PHASE === "phase-production-build") return null;
  try {
    const payload = await getClient();
    const { page = 1, perPage = 20, category, search, tag } = options || {};
    const and: any[] = [];
    // Só posts PUBLICADOS no site — rascunhos (Studio→CMS) ficam só no /cms.
    and.push({ _status: { equals: "published" } });
    if (category) and.push({ category: { equals: category } });
    // Craques têm página própria — excluídos das listagens (igual ao WP), salvo se pedido.
    if (category !== "Craques") and.push({ category: { not_equals: "Craques" } });
    if (search) and.push({ title: { like: search } });
    if (tag) and.push({ "tags.tag": { like: tag } });

    const res = await payload.find({
      collection: "posts",
      where: and.length ? { and } : {},
      sort: "-publishedDate",
      page,
      limit: perPage,
      depth: 1,
    });
    return { articles: res.docs.map(mapPost), total: res.totalDocs };
  } catch {
    return null;
  }
}

export async function getArticleBySlugPayload(
  slug: string,
  draft = false
): Promise<Article | null> {
  if (process.env.NEXT_PHASE === "phase-production-build") return null;
  try {
    const payload = await getClient();
    // draft=true (preview do /cms): pega a última versão (rascunho), sem filtrar status.
    const res = await payload.find({
      collection: "posts",
      where: draft
        ? { slug: { equals: slug } }
        : { and: [{ slug: { equals: slug } }, { _status: { equals: "published" } }] },
      draft,
      overrideAccess: true,
      limit: 1,
      depth: 1,
    });
    return res.docs[0] ? mapPost(res.docs[0]) : null;
  } catch {
    return null;
  }
}
