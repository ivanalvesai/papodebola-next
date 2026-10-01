import type { Metadata } from "next";
import { TOURNAMENT_BY_SLUG } from "@/lib/config";
import { buildMetadata } from "@/lib/seo/build-metadata";

// A página do campeonato (/futebol/[slug]) é client component (busca via fetch),
// então o SEO — inclusive o canonical auto-referente — vive aqui no layout server.
async function metadataDefaults({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const tournament = TOURNAMENT_BY_SLUG[slug];
  const name = tournament?.name;

  return {
    title: name ? `${name}: tabela, classificação e jogos` : "Campeonato",
    description: name
      ? `${name}: classificação atualizada, rodadas, jogos e resultados ao vivo no Papo de Bola.`
      : undefined,
    alternates: { canonical: `/futebol/${slug}` },
  };
}

// SEO editável no /cms (Textos e SEO das páginas, rota "/futebol/:slug") sobre os defaults acima.
export async function generateMetadata(
  props: Parameters<typeof metadataDefaults>[0]
): Promise<Metadata> {
  return buildMetadata("/futebol/:slug", await metadataDefaults(props));
}

export default function CampeonatoLayout({ children }: { children: React.ReactNode }) {
  return children;
}
