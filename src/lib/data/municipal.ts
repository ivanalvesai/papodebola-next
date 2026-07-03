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

export async function getMunicipalMatch(slug: string): Promise<MunicipalMatch | null> {
  const all = await readMatches();
  return all[slug] || null;
}

export async function getMunicipalMatchSlugs(): Promise<string[]> {
  const all = await readMatches();
  return Object.keys(all);
}
