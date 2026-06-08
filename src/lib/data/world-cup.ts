import { fetchAllSports } from "@/lib/api/allsports";
import { translateCountry } from "@/lib/i18n/countries";
import { translateStatus } from "@/lib/translations";
import { getWorldCupStandings } from "./standings";
import type { StandingRow } from "@/types/standings";
import type { ChampionshipMatch } from "@/types/match";

/* eslint-disable @typescript-eslint/no-explicit-any */

const WC = { id: 16, seasonId: 58210 } as const;

// Fase de grupos = rodadas 1-3 (24 jogos cada; 2 por grupo). O mata-mata só
// ganha confrontos depois do sorteio pós-grupos, entao fica de fora por ora.
const GROUP_ROUNDS = [1, 2, 3] as const;

export interface WorldCupGroupRound {
  round: number;
  matches: ChampionshipMatch[];
}

export interface WorldCupGroup {
  name: string;
  rows: StandingRow[];
  rounds: WorldCupGroupRound[];
  defaultRound: number; // rodada que abre por padrao (a "atual" do grupo)
}

// Escolhe a rodada a exibir: se o proximo jogo do grupo for em <=2 dias, abre na
// rodada dele; senao fica na ultima ja iniciada; antes de tudo comecar, rodada 1.
// Assim nao trava na rodada 1 e "pula" pro proximo confronto como os grandes sites.
const TWO_DAYS = 2 * 86400;
function pickDefaultRound(rounds: WorldCupGroupRound[], nowSec: number): number {
  const all = rounds.flatMap((r) => r.matches);
  const upcoming = all
    .filter((m) => m.status === "notstarted")
    .sort((a, b) => a.timestamp - b.timestamp);
  const started = all.filter((m) => m.status !== "notstarted");
  const next = upcoming[0];
  if (next && next.timestamp - nowSec <= TWO_DAYS) return next.round;
  if (started.length) return Math.max(...started.map((m) => m.round));
  return rounds[0]?.round ?? 1;
}

export interface WorldCupData {
  groups: WorldCupGroup[];
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
  const standingsGroups = await getWorldCupStandings();

  // Busca os jogos de cada rodada (todos os grupos juntos)
  const roundMatches: Record<number, ChampionshipMatch[]> = {};
  for (const r of GROUP_ROUNDS) {
    const data = await fetchAllSports<any>(
      `tournament/${WC.id}/season/${WC.seasonId}/matches/round/${r}`,
      1800
    );
    roundMatches[r] = (data?.events || []).map((e: any) => normalizeMatch(e, r));
    await new Promise((resolve) => setTimeout(resolve, 150));
  }

  // Associa cada jogo ao seu grupo pelos times (ambos pertencem ao mesmo grupo)
  const nowSec = Date.now() / 1000;
  const groups: WorldCupGroup[] = standingsGroups.map((g) => {
    const ids = new Set(g.rows.map((r) => r.teamId));
    const rounds: WorldCupGroupRound[] = GROUP_ROUNDS.map((r) => ({
      round: r,
      matches: (roundMatches[r] || [])
        .filter((m) => ids.has(m.homeId) && ids.has(m.awayId))
        .sort((a, b) => a.timestamp - b.timestamp),
    }));
    return { name: g.name, rows: g.rows, rounds, defaultRound: pickDefaultRound(rounds, nowSec) };
  });

  return { groups };
}
