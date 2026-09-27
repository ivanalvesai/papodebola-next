import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getPayloadPage } from "@/lib/data/payload-pages";
import { PageBlocks } from "@/components/payload/page-blocks";
import { dedicatedPageRoute } from "@/lib/dedicated-pages";

// Rota genérica: renderiza QUALQUER "Página" criada no Payload em /paginas/{slug}.
// Página nova no CMS = no ar na hora, sem ligar rota a rota. 404 se não existir.
export const dynamic = "force-dynamic";

// Slugs que têm rota DEDICADA (ex: /sobre) não respondem aqui — evita conteúdo
// duplicado (/paginas/sobre e /sobre seriam a mesma página). 308 pra rota dedicada,
// ANTES de qualquer consulta ao banco (mapa em @/lib/dedicated-pages).

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const dedicated = dedicatedPageRoute(slug);
  if (dedicated) permanentRedirect(dedicated);
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
  const dedicated = dedicatedPageRoute(slug);
  if (dedicated) permanentRedirect(dedicated);
  const page = await getPayloadPage(slug);
  if (!page) notFound();
  return <PageBlocks page={page} />;
}
