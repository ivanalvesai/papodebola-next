import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { TOURNAMENT_BY_SLUG } from "@/lib/config";
import ChampionshipClient from "./championship-client";

// Slugs válidos são fixos (TOURNAMENT_BY_SLUG). dynamicParams=false → qualquer slug
// fora da lista retorna 404 REAL (antes de renderizar), sem soft-404.
export function generateStaticParams() {
  return Object.keys(TOURNAMENT_BY_SLUG).map((slug) => ({ slug }));
}
export const dynamicParams = false;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const t = TOURNAMENT_BY_SLUG[slug];
  if (!t) return { title: "Campeonato não encontrado" };
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
  if (!TOURNAMENT_BY_SLUG[slug]) notFound();
  return <ChampionshipClient />;
}
