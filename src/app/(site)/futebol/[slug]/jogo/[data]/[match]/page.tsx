import type { Metadata } from "next";
import {
  ChampionshipMatchPage,
  championshipMatchMetadata,
  type ChampionshipMatchParams,
} from "@/components/match/championship-match-page";

// Lance a lance de QUALQUER campeonato: /futebol/{campeonato}/jogo/{data}/{confronto}.
// Corpo/SEO compartilhados em championship-match-page (também usados pela Liga das Nações).
export const revalidate = 30;

export async function generateMetadata({ params }: { params: Promise<ChampionshipMatchParams> }): Promise<Metadata> {
  return championshipMatchMetadata(await params);
}

export default async function JogoCampeonatoPage({ params }: { params: Promise<ChampionshipMatchParams> }) {
  return <ChampionshipMatchPage {...await params} />;
}
