import { fetchAllSports } from "@/lib/api/allsports";
import { translateCountry } from "@/lib/i18n/countries";
import { translateStatus } from "@/lib/translations";
import { getWorldCupStandings } from "./standings";
import type { StandingsGroup } from "@/types/standings";
import type { ChampionshipMatch } from "@/types/match";

/* eslint-disable @typescript-eslint/no-explicit-any */

const WC = { id: 16, seasonId: 58210 } as const;

// Fase de grupos = rodadas 1-3 (24 jogos cada). O mata-mata (Round of 32/16,
// quartas, etc.) só ganha confrontos depois do sorteio pós-grupos, entao fica
// de fora por enquanto.
const GROUP_ROUNDS = [1, 2, 3] as const;

export interface WorldCupMatchday {
  round: number;
  name: string;
  matches: ChampionshipMatch[];
}

export interface WorldCupData {
  groups: StandingsGroup[];
  matchdays: WorldCupMatchday[];
}

function normalizeMatch(e: any, round: number): ChampionshipMatch {
  return {
    id: e.id,
    home: translateCountry(e.homeTeam?.name || ""),
    away: translateCountry(e.awayTeam?.name || ""),
    homeId: e.homeTeam?.id || 0,
    awayId: e.awayTeam?.id || 0,
    homeScore: e.homeScore?.current ?? null,
    awayScore: e.awayScore?.current ?? null,
    status: e.status?.type || "",
    statusDesc: translateStatus(e.status?.description) || "",
    timestamp: e.startTimestamp || 0,
    round,
  };
}

export async function getWorldCupData(): Promise<WorldCupData> {
  const groups = await getWorldCupStandings();

  const matchdays: WorldCupMatchday[] = [];
  for (const r of GROUP_ROUNDS) {
    const data = await fetchAllSports<any>(
      `tournament/${WC.id}/season/${WC.seasonId}/matches/round/${r}`,
      1800
    );
    const matches = (data?.events || [])
      .map((e: any) => normalizeMatch(e, r))
      .sort((a: ChampionshipMatch, b: ChampionshipMatch) => a.timestamp - b.timestamp);
    matchdays.push({ round: r, name: `${r}ª Rodada`, matches });
    // pausa curta pra nao estourar o semaphore/rate-limit da AllSportsApi
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  return { groups, matchdays };
}
