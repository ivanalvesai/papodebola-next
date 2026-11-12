import type { Metadata } from "next";
import { ChampionshipMatchPage, championshipMatchMetadata } from "@/components/match/championship-match-page";

// Lance a lance da Liga das Nações:
// /futebol/futebol-internacional/liga-das-nacoes/jogo/{DD-MM-YYYY}/{casa}-{fora}
// Mesmo motor dos campeonatos (ISR 30 s + polling do LiveMatch no cliente).
export const revalidate = 30;

const SLUG = "liga-das-nacoes";
type Params = { data: string; match: string };

export async function generateMetadata({ params }: { params: Promise<Params> }): Promise<Metadata> {
  const { data, match } = await params;
  return championshipMatchMetadata(
    { slug: SLUG, data, match },
    "/futebol/futebol-internacional/liga-das-nacoes/jogo/:data/:match"
  );
}

export default async function JogoLigaDasNacoesPage({ params }: { params: Promise<Params> }) {
  const { data, match } = await params;
  return <ChampionshipMatchPage slug={SLUG} data={data} match={match} />;
}
