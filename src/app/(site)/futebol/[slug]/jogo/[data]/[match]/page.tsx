import type { Metadata } from "next";
import {
  ChampionshipMatchPage,
  championshipMatchMetadata,
  type ChampionshipMatchParams,
} from "@/components/match/championship-match-page";

// Lance a lance de QUALQUER campeonato: /futebol/{campeonato}/jogo/{data}/{confronto}.
// Corpo/SEO compartilhados em championship-match-page (também usados pela Liga das Nações).
export const revalidate = 30;

// generateStaticParams vazio = ISR sob demanda: sem ele o Next marca a rota como
// dinâmica (ƒ) e remonta a página do zero a cada acesso (0,6–1,9 s). Com ele, o 1º acesso
// monta e os seguintes saem prontos do cache (~30 ms), revalidando em segundo plano.
export async function generateStaticParams() {
  return [];
}

export async function generateMetadata({ params }: { params: Promise<ChampionshipMatchParams> }): Promise<Metadata> {
  return championshipMatchMetadata(await params);
}

export default async function JogoCampeonatoPage({ params }: { params: Promise<ChampionshipMatchParams> }) {
  return <ChampionshipMatchPage {...await params} />;
}
