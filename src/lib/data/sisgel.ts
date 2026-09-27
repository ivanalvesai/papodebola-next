import { readFile, readdir } from "fs/promises";
import { join } from "path";
import { mergeChampionships } from "./municipal-archive";

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
  slug?: string;
  dateSlug?: string;
}

export interface MunicipalChampionship {
  name: string;
  slug?: string;
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

async function readJson<T>(path: string, fallback: T): Promise<T> {
  try {
    return JSON.parse(await readFile(path, "utf-8")) as T;
  } catch {
    return fallback;
  }
}

// Arquivo congelado por temporada: data/archive/municipal/{ano}/{sisgel.json,sisgel-matches.json}
// (cópia do estado final, gravada 1x à mão — o código nunca escreve aí). Devolve o conteúdo
// de cada ano, do mais novo pro mais antigo.
export async function readMunicipalArchive<T>(file: string, fallback: T): Promise<T[]> {
  const dir = join(process.cwd(), "data", "archive", "municipal");
  let years: string[] = [];
  try {
    years = (await readdir(dir)).filter((y) => /^\d{4}$/.test(y)).sort().reverse();
  } catch {
    return [];
  }
  return Promise.all(years.map((y) => readJson<T>(join(dir, y, file), fallback)));
}

// Vivo (data/sisgel.json, reescrito pelo scraper) + arquivo congelado. Vivo vence;
// campeonato que sumiu do vivo segue servido do arquivo (ver mergeChampionships).
export async function getMunicipalChampionships(): Promise<MunicipalChampionship[]> {
  const live = await readJson<unknown>(join(process.cwd(), "data", "sisgel.json"), []);
  const archived = (await readMunicipalArchive<unknown>("sisgel.json", [])).flatMap((a) => (Array.isArray(a) ? a : []));
  return mergeChampionships(Array.isArray(live) ? (live as MunicipalChampionship[]) : [], archived as MunicipalChampionship[]);
}

// 1ª Divisão (campeonato cujo nome começa com "1ª Divisão"); fallback no 1º item.
export async function getFirstDivision(): Promise<MunicipalChampionship | null> {
  const champs = await getMunicipalChampionships();
  return champs.find((c) => /^1[ªaª]?\s*divis/i.test(c.name)) || champs[0] || null;
}
