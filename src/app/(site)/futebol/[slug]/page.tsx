import type { Metadata } from "next";
import { TOURNAMENT_BY_SLUG } from "@/lib/config";
import { CmsPage, cmsPageMetadata } from "@/components/payload/cms-page-route";
import ChampionshipClient from "./championship-client";

// Slug fora de TOURNAMENT_BY_SLUG -> 404 REAL (notFound no server). Com o loading.tsx
// já fora da raiz, o notFound() volta a emitir status 404 (sem soft-404).
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const t = TOURNAMENT_BY_SLUG[slug];
  if (!t) return (await cmsPageMetadata(`/futebol/${slug}`)) || { title: "Campeonato não encontrado" };
  return {
    alternates: { canonical: `/futebol/${slug}` },
    title: `${t.name}: Tabela, Classificação e Jogos`,
    description: `Acompanhe ${t.name} no Papo de Bola: tabela de classificação, jogos, rodadas, resultados e horários atualizados.`,
  };
}

export default async function CampeonatoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  if (!TOURNAMENT_BY_SLUG[slug]) return <CmsPage path={`/futebol/${slug}`} />;
  return <ChampionshipClient />;
}
