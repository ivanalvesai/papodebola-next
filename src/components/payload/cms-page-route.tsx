import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPayloadPageByPath } from "@/lib/data/payload-pages";
import { PageBlocks } from "@/components/payload/page-blocks";

const SITE = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";

export async function cmsPageMetadata(path: string): Promise<Metadata | null> {
  const page = await getPayloadPageByPath(path);
  if (!page) return null;
  const title = page.seo?.metaTitle || page.title;
  const description = page.seo?.metaDescription || page.hero?.subtitle || undefined;
  const img = page.hero?.image && typeof page.hero.image === "object" ? page.hero.image.url : undefined;
  return {
    title, description,
    alternates: { canonical: path },
    openGraph: { title: title || undefined, description, url: `${SITE}${path}`, type: "website", ...(img ? { images: [{ url: img.startsWith("http") ? img : `${SITE}${img}` }] } : {}) },
  };
}

// Renderiza a página do CMS daquele caminho ou dá 404 real (nunca vaza rascunho).
export async function CmsPage({ path }: { path: string }) {
  const page = await getPayloadPageByPath(path);
  if (!page) notFound();
  return <PageBlocks page={page} />;
}
