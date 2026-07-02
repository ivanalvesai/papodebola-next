import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getPayloadPage } from "@/lib/data/payload-pages";
import { PageBlocks } from "@/components/payload/page-blocks";

// Rota genérica: renderiza QUALQUER "Página" criada no Payload em /paginas/{slug}.
// Página nova no CMS = no ar na hora, sem ligar rota a rota. 404 se não existir.
export const dynamic = "force-dynamic";

// Slugs que têm rota DEDICADA (ex: /sobre) não respondem aqui — evita conteúdo
// duplicado (/paginas/sobre e /sobre seriam a mesma página).
const DEDICATED = new Set([
  "sobre",
  "contato",
  "parceiros",
  "politica-de-privacidade",
  "termos-de-uso",
  "jogos-de-hoje-futebol", // renderizada pela rota /jogos-de-hoje/futebol (blocos dinâmicos)
  "santana-de-parnaiba-municipal", // renderizada no rodapé de /sp/santana-de-parnaiba/municipal
]);

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await getPayloadPage(slug);
  if (!page) return {};
  return {
    title: page.seo?.metaTitle || page.title,
    description: page.seo?.metaDescription,
    alternates: { canonical: `/paginas/${slug}` },
  };
}

export default async function PaginaPayload({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (DEDICATED.has(slug)) notFound();
  const page = await getPayloadPage(slug);
  if (!page) notFound();
  return <PageBlocks page={page} />;
}
