import { readFile } from "fs/promises";
import { join } from "path";

// Detalhe estático de um jogo municipal (SisGel), lido do arquivo raspado no volume
// (data/sisgel-matches.json). Gols, escalação, local, arbitragem — sem tempo real.
export interface MunicipalPlayer {
  name: string;
  yellow: number;
  red: number;
}
export interface MunicipalGoal {
  player: string;
  goals: number;
  isHome: boolean;
  ownGoal?: boolean;
}
export interface MunicipalMatch {
  slug: string;
  dateSlug: string;
  token: string;
  division: string;
  divisionSlug: string;
  round: number;
  phase?: string;
  roundLabel?: string;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  date: string;
  time: string;
  venue: string;
  status: string;
  homeBadge: string;
  awayBadge: string;
  goals: MunicipalGoal[];
  lineups: { home: MunicipalPlayer[]; away: MunicipalPlayer[] };
  referee: string;
  scrapedAt: string;
}

async function readMatches(): Promise<Record<string, MunicipalMatch>> {
  try {
    const raw = await readFile(join(process.cwd(), "data", "sisgel-matches.json"), "utf-8");
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

// Chave composta no arquivo: "DD-MM-YYYY/home-away" (padrão da URL /jogo/[data]/[slug]).
export async function getMunicipalMatch(dateSlug: string, pairSlug: string): Promise<MunicipalMatch | null> {
  const all = await readMatches();
  return all[`${dateSlug}/${pairSlug}`] || null;
}

// Retorna as chaves compostas "data/par" (o sitemap monta /jogo/{data}/{par}).
export async function getMunicipalMatchKeys(): Promise<string[]> {
  const all = await readMatches();
  return Object.keys(all);
}
