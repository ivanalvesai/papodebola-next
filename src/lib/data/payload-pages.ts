import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";

// Busca uma "Página" do Payload por slug. Retorna null em QUALQUER erro (banco
// fora, página inexistente) — quem chama faz fallback pro conteúdo atual em código.
// cache() dedup por request (metadata + page usam a mesma busca).
export const getPayloadPage = cache(async (slug: string) => {
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "pages",
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 2,
    });
    return (res.docs[0] as PayloadPage) || null;
  } catch {
    return null;
  }
});

// Slugs das páginas autorais publicadas (pro sitemap). Vazio em erro/sem páginas.
export const getPayloadPageSlugs = cache(async (): Promise<string[]> => {
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "pages",
      where: { and: [{ _status: { equals: "published" } }, { path: { exists: false } }] },
      limit: 500,
      depth: 0,
      pagination: false,
    });
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    return res.docs.map((d: any) => d.slug).filter(Boolean);
  } catch {
    return [];
  }
});

export const getPayloadPageByPath = cache(async (path: string, opts?: { draft?: boolean }): Promise<PayloadPage | null> => {
  if (!path || !path.startsWith("/")) return null;
  try {
    const payload = await getPayload({ config });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const where: any = opts?.draft ? { path: { equals: path } } : { and: [{ path: { equals: path } }, { _status: { equals: "published" } }] };
    const res = await payload.find({ collection: "pages", where, limit: 1, depth: 2, draft: !!opts?.draft });
    return (res.docs[0] as unknown as PayloadPage) || null;
  } catch { return null; }
});

export const getPayloadPageById = cache(async (id: number | string, draft = false): Promise<PayloadPage | null> => {
  try {
    const payload = await getPayload({ config });
    return (await payload.findByID({ collection: "pages", id, depth: 2, draft })) as unknown as PayloadPage;
  } catch { return null; }
});

// Caminhos publicados com `path` (sitemap). Vazio em erro.
export const getPayloadPagePaths = cache(async (): Promise<string[]> => {
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({ collection: "pages", where: { and: [{ _status: { equals: "published" } }, { path: { exists: true } }] }, limit: 500, depth: 0, pagination: false });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return res.docs.map((d: any) => d.path).filter((p: any) => typeof p === "string" && p.startsWith("/"));
  } catch { return []; }
});

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PayloadPage {
  id: number;
  title?: string;
  slug?: string;
  path?: string | null;
  layoutStyle?: { width?: "narrow" | "wide" | "full"; showBreadcrumb?: boolean };
  hero?: {
    h1?: string;
    subtitle?: string;
    style?: "centered" | "left" | "banner";
    image?: { url?: string; alt?: string } | number | null;
  };
  layout?: any[];
  editor?: "blocks" | "puck";
  puckData?: any;
  showSponsors?: boolean;
  _status?: string;
  seo?: { metaTitle?: string; metaDescription?: string };
}
