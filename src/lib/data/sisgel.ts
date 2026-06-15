import { readFile } from "fs/promises";
import { join } from "path";

// Dados dos campeonatos municipais de Santana de Parnaíba (raspados do SisGel
// 2x/dia pelo scripts/scrape-sisgel.js → data/sisgel.json, volume Docker).

export interface MunicipalTeam {
  pos: number;
  name: string;
  pts: number;
  games: number;
  wins: number;
  draws: number;
  losses: number;
  gf: number;
  ga: number;
  gd: number;
  badge: string;
}

export interface MunicipalGroup {
  name: string;
  teams: MunicipalTeam[];
}

export interface MunicipalMatch {
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
  homeBadgeLocal: string;
  awayBadgeLocal: string;
}

export interface MunicipalChampionship {
  name: string;
  city: string;
  state: string;
  year: string;
  groups: MunicipalGroup[];
  matches: MunicipalMatch[];
  matchesByRound: Record<string, MunicipalMatch[]>;
  roundMeta?: Record<string, { phase?: string; label?: string }>;
  totalRounds: number;
  updatedAt: string;
}

export async function getMunicipalChampionships(): Promise<MunicipalChampionship[]> {
  try {
    const raw = await readFile(join(process.cwd(), "data", "sisgel.json"), "utf-8");
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

// 1ª Divisão (campeonato cujo nome começa com "1ª Divisão"); fallback no 1º item.
export async function getFirstDivision(): Promise<MunicipalChampionship | null> {
  const champs = await getMunicipalChampionships();
  return champs.find((c) => /^1[ªaª]?\s*divis/i.test(c.name)) || champs[0] || null;
}
