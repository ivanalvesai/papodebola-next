import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
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

function mapPost(p: any): Article {
  const tags = (p.tags || []).map((x: any) => x.tag).filter(Boolean);
  const cover = typeof p.cover === "object" && p.cover ? p.cover : null;
  // URL absoluta (serve display + OG/schema). Servida via /cms-api/media/file/<name>.
  const image = cover?.url ? `${SITE_URL}${cover.url}` : "";
  const category = p.category || "Futebol brasileiro";
  const pubDate = p.publishedDate || p.createdAt || new Date().toISOString();
  return {
    imageCaption: cover?.alt || "",
    originalTitle: p.title || "",
    rewrittenTitle: p.title || "",
    rewrittenText: stripHtml(p.body || "").slice(0, 5000),
    excerpt: p.excerpt || "",
    contentHtml: p.body || "",
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

export async function getArticleBySlugPayload(slug: string): Promise<Article | null> {
  if (process.env.NEXT_PHASE === "phase-production-build") return null;
  try {
    const payload = await getClient();
    const res = await payload.find({
      collection: "posts",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
    });
    return res.docs[0] ? mapPost(res.docs[0]) : null;
  } catch {
    return null;
  }
}
