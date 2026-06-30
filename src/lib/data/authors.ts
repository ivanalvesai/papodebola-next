import { cache } from "react";
import { getPayload } from "payload";
import config from "@payload-config";
import { convertLexicalToHTML } from "@payloadcms/richtext-lexical/html";

// Autores (collection `authors` do Payload) → página /autor/[slug] + byline linkável.
// Retorna null/[] em qualquer erro (banco fora) pra nunca derrubar o render.
/* eslint-disable @typescript-eslint/no-explicit-any */

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";

export interface AuthorProfile {
  id: number;
  name: string;
  slug: string;
  role: string;
  photo: string; // URL absoluta ou ""
  bioHtml: string;
  social: { twitter?: string; instagram?: string; linkedin?: string; email?: string };
  seo: { metaTitle?: string; metaDescription?: string };
}

function mapAuthor(d: any): AuthorProfile {
  const photo = d.photo && typeof d.photo === "object" ? d.photo : null;
  const photoUrl = photo?.sizes?.card?.url || photo?.url || "";
  let bioHtml = "";
  const bio = d.bio;
  if (bio && bio.root && Array.isArray(bio.root.children) && bio.root.children.length) {
    try {
      bioHtml = convertLexicalToHTML({ data: bio });
    } catch {
      bioHtml = "";
    }
  }
  return {
    id: d.id,
    name: d.name || "",
    slug: d.slug || "",
    role: d.role || "",
    photo: photoUrl ? `${SITE_URL}${photoUrl}` : "",
    bioHtml,
    social: d.social || {},
    seo: d.seo || {},
  };
}

// Um autor pelo slug. (Sem drafts: o autor é público assim que salvo no /cms.)
export const getAuthorBySlug = cache(
  async (slug: string): Promise<AuthorProfile | null> => {
    if (process.env.NEXT_PHASE === "phase-production-build") return null;
    try {
      const payload = await getPayload({ config });
      const res = await payload.find({
        collection: "authors",
        where: { slug: { equals: slug } },
        limit: 1,
        depth: 1,
      });
      return res.docs[0] ? mapAuthor(res.docs[0]) : null;
    } catch {
      return null;
    }
  }
);

// Slugs dos autores (pro sitemap).
export const getAuthorSlugs = cache(async (): Promise<string[]> => {
  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "authors",
      limit: 200,
      depth: 0,
      pagination: false,
    });
    return res.docs.map((d: any) => d.slug).filter(Boolean);
  } catch {
    return [];
  }
});
