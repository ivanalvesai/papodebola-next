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
      where: { _status: { equals: "published" } },
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

/* eslint-disable @typescript-eslint/no-explicit-any */
export interface PayloadPage {
  title?: string;
  slug?: string;
  hero?: { h1?: string; subtitle?: string };
  layout?: any[];
  seo?: { metaTitle?: string; metaDescription?: string };
}
