import { cache } from "react";
import { unstable_cache } from "next/cache";
import { getPayload } from "payload";
import config from "@payload-config";

// Banners promocionais (collection `promoBanners`). O servidor manda todos os ativos que
// ainda não terminaram; quem decide se está no período é o navegador (a página fica em
// cache, mas o banner entra/sai na hora certa).
/* eslint-disable @typescript-eslint/no-explicit-any */

export interface PromoBanner {
  slug: string;
  desktop: string;
  mobile: string;
  alt: string;
  hasLink: boolean;
  startsAt: string | null;
  endsAt: string | null;
}

const isBuild = () => process.env.NEXT_PHASE === "phase-production-build";
const mediaUrl = (m: any): string => (m && typeof m === "object" ? String(m.url || "") : "");

async function load(): Promise<PromoBanner[]> {
  if (isBuild()) return [];
  try {
    const payload = await getPayload({ config });
    const now = new Date().toISOString();
    const res = await payload.find({
      collection: "promoBanners" as any,
      where: {
        and: [
          { active: { equals: true } },
          { or: [{ endsAt: { exists: false } }, { endsAt: { equals: null } }, { endsAt: { greater_than: now } }] },
        ],
      },
      sort: "startsAt",
      limit: 20,
      depth: 1,
    });
    return res.docs
      .map((d: any): PromoBanner => ({
        slug: String(d.slug || ""),
        desktop: mediaUrl(d.imageDesktop),
        mobile: mediaUrl(d.imageMobile) || mediaUrl(d.imageDesktop),
        alt: String(d.alt || d.name || "Oferta"),
        hasLink: !!String(d.url || "").trim(),
        startsAt: d.startsAt || null,
        endsAt: d.endsAt || null,
      }))
      .filter((b) => b.slug && b.desktop);
  } catch {
    return [];
  }
}

const fetchPromoBanners = unstable_cache(load, ["promo-banners"], { tags: ["promoBanners"], revalidate: 300 });

export const getPromoBanners = cache(async (): Promise<PromoBanner[]> => {
  try {
    return await fetchPromoBanners();
  } catch {
    return [];
  }
});
