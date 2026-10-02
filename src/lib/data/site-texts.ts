import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getPayload } from "payload";
import config from "@payload-config";
import { matchRoute, textValue, type PageTextsDoc } from "@/lib/seo/merge-metadata";

// Textos e SEO editáveis no /cms: global `siteSettings` + collection `pageTexts`.
// Cache de 5 min com tags (os hooks do CMS expiram na hora ao salvar) + cache()
// por request. QUALQUER erro (Postgres fora, build) → null → defaults do código.
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface SiteSettings {
  siteName?: string | null;
  metaTitleDefault?: string | null;
  metaDescriptionDefault?: string | null;
  social?: {
    instagram?: string | null;
    x?: string | null;
    youtube?: string | null;
    facebook?: string | null;
    tiktok?: string | null;
  } | null;
}

const isBuild = () => process.env.NEXT_PHASE === "phase-production-build";

const fetchSiteSettings = unstable_cache(
  async (): Promise<SiteSettings | null> => {
    if (isBuild()) return null;
    try {
      const payload = await getPayload({ config });
      const doc = await payload.findGlobal({ slug: "siteSettings" as any, depth: 0 });
      return (doc as SiteSettings) ?? null;
    } catch {
      return null;
    }
  },
  ["site-settings"],
  { tags: ["siteSettings"], revalidate: 300 }
);

export const getSiteSettings = cache(async (): Promise<SiteSettings | null> => {
  try {
    return await fetchSiteSettings();
  } catch {
    return null;
  }
});

function slim(doc: any): PageTextsDoc {
  return {
    route: doc?.route,
    label: doc?.label,
    seo: doc?.seo ?? null,
    texts: Array.isArray(doc?.texts)
      ? doc.texts.map((t: any) => ({ key: t?.key ?? null, value: t?.value ?? null }))
      : null,
  };
}

const fetchExact = unstable_cache(
  async (route: string): Promise<PageTextsDoc | null> => {
    if (isBuild()) return null;
    try {
      const payload = await getPayload({ config });
      const res = await payload.find({
        collection: "pageTexts" as any,
        where: { route: { equals: route } },
        limit: 1,
        depth: 0,
        pagination: false,
      });
      return res.docs[0] ? slim(res.docs[0]) : null;
    } catch {
      return null;
    }
  },
  ["page-texts-exact"],
  { tags: ["pageTexts"], revalidate: 300 }
);

// Todos os docs de padrão (rota com ":") — lista pequena.
const fetchPatterns = unstable_cache(
  async (): Promise<PageTextsDoc[] | null> => {
    if (isBuild()) return null;
    try {
      const payload = await getPayload({ config });
      const res = await payload.find({
        collection: "pageTexts" as any,
        where: { route: { contains: ":" } },
        limit: 500,
        depth: 0,
        pagination: false,
      });
      return res.docs.map(slim);
    } catch {
      return null;
    }
  },
  ["page-texts-patterns"],
  { tags: ["pageTexts"], revalidate: 300 }
);

// Só a busca exata (a chave já é a rota canônica: path fixo ou o padrão ":param").
export const getPageTextsExact = cache(async (route: string): Promise<PageTextsDoc | null> => {
  try {
    return await fetchExact(route);
  } catch {
    return null;
  }
});

// Doc da rota: busca exata; senão o padrão ":param" que casar; senão null.
export const getPageTexts = cache(async (route: string): Promise<PageTextsDoc | null> => {
  try {
    const exact = await getPageTextsExact(route);
    if (exact) return exact;
    const patterns = await fetchPatterns();
    if (!patterns?.length) return null;
    const hit = matchRoute(route, patterns.map((p) => String(p.route || "")));
    return hit ? patterns.find((p) => p.route === hit) ?? null : null;
  } catch {
    return null;
  }
});

export { textValue };
