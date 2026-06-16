import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trophy } from "lucide-react";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { getCraques, getCraqueBySlug } from "@/lib/data/craques";

export const revalidate = 1800;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";

export async function generateStaticParams() {
  const craques = await getCraques().catch(() => []);
  return craques.map((c) => ({ slug: c.slug }));
}

function plain(text: string, max: number): string {
  return (text || "").replace(/\s+/g, " ").trim().slice(0, max);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = await getCraqueBySlug(slug);
  if (!c) return {};
  return {
    title: c.rewrittenTitle,
    description: plain(c.rewrittenText, 155),
    alternates: { canonical: `/futebol/craque/${slug}` },
    ...(c.image ? { openGraph: { images: [{ url: c.image }] } } : {}),
  };
}

export default async function CraquePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = await getCraqueBySlug(slug);
  if (!c) notFound();

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: c.rewrittenTitle,
    jobTitle: "Futebolista",
    url: `${SITE_URL}/futebol/craque/${slug}`,
    ...(c.image ? { image: c.image } : {}),
    description: plain(c.rewrittenText, 300),
  };

  return (
    <div className="mx-auto max-w-[760px] px-4 py-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personSchema) }}
      />

      <PageBreadcrumb
        className="mb-4"
        items={[
          { label: "Início", href: "/" },
          { label: "Futebol", href: "/futebol" },
          { label: c.rewrittenTitle },
        ]}
      />

      <h1 className="mb-4 flex items-center gap-2 text-2xl font-bold leading-tight text-text-primary">
        <Trophy className="h-6 w-6 shrink-0 text-green" />
        {c.rewrittenTitle}
      </h1>

      {/* A imagem é adicionada manualmente no corpo do post (WP), pra controlar
          tamanho/posição. A imagem destacada continua valendo só pro OG/schema. */}
      <article
        className="prose-craque"
        dangerouslySetInnerHTML={{ __html: c.contentHtml || "" }}
      />

      <style>{`
        .prose-craque { color: var(--color-text-secondary, #444); font-size: 15px; line-height: 1.7; }
        .prose-craque h2 { font-size: 20px; font-weight: 700; margin: 28px 0 10px; color: var(--color-text-primary, #111); }
        .prose-craque h3 { font-size: 17px; font-weight: 700; margin: 22px 0 8px; }
        .prose-craque p { margin: 0 0 16px; }
        .prose-craque ul, .prose-craque ol { margin: 0 0 16px 22px; }
        .prose-craque li { margin-bottom: 6px; }
        .prose-craque a { color: #00965E; text-decoration: underline; }
        .prose-craque img { max-width: 100%; height: auto; border-radius: 8px; margin: 16px 0; }
        .prose-craque table { width: 100%; border-collapse: collapse; margin: 16px 0; font-size: 14px; }
        .prose-craque th, .prose-craque td { border: 1px solid var(--color-border-custom, #e5e5e5); padding: 8px; text-align: left; }
      `}</style>
    </div>
  );
}
