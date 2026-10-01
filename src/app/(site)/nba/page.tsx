import type { Metadata } from "next";
import { SportPageContent } from "@/components/sports/sport-page-content";
import { buildMetadata } from "@/lib/seo/build-metadata";

// Basquete = NBA (e, futuramente, NBB). Não há mais landing genérica /basquete: ela
// e /basquete/nba redirecionam pra cá (ver next.config). Notícias da categoria "NBA"
// vivem em /nba/{slug} (catch-all) e são listadas aqui via SPORT_WP_CATEGORY.
export const revalidate = 86400;

export async function generateMetadata(): Promise<Metadata> {
  return buildMetadata("/nba", {
    alternates: { canonical: "/nba" },
    title: "NBA - Notícias, Resultados e Classificação",
    description:
      "NBA: últimas notícias, resultados, classificação das conferências, calendário de jogos e playoffs da temporada.",
  });
}

export default function NbaPage() {
  return (
    <SportPageContent
      sportKey="basquete-nba"
      title="NBA"
      breadcrumbItems={[{ label: "Início", href: "/" }, { label: "NBA" }]}
    />
  );
}
