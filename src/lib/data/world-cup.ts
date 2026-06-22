import { fetchAllSports } from "@/lib/api/allsports";
import { translateCountry } from "@/lib/i18n/countries";
import { translateStatus } from "@/lib/translations";
import { enrichStandingsWithForm } from "@/lib/standings-utils";
import { getWorldCupStandings } from "./standings";
import type { StandingRow } from "@/types/standings";
import type { ChampionshipMatch } from "@/types/match";
import { KNOCKOUT_SCHEDULE, type KnockoutItem } from "@/lib/world-cup-knockout-schedule";

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

// Confrontos de uma fase eliminatória (mata-mata) por número de rodada.
// Hoje volta vazio (chaveamento só existe após o sorteio pós-grupos); quando a
// API tiver os jogos, a página da fase popula sozinha via ISR. Ordena por data.
export async function getWorldCupKnockout(round: number): Promise<ChampionshipMatch[]> {
  const data = await fetchAllSports<any>(
    `tournament/${WC.id}/season/${WC.seasonId}/matches/round/${round}`,
    1800
  );
  return (data?.events || [])
    .map((e: any) => normalizeMatch(e, round))
    .sort((a: ChampionshipMatch, b: ChampionshipMatch) => a.timestamp - b.timestamp);
}

// Itens de uma fase eliminatória pra renderizar: usa os jogos REAIS da API quando
// já existem; senão cai no calendário FIXO da FIFA (placeholder com data/local/slot).
// Mesma URL/página nos dois casos → quando os times entram, o SEO da página é mantido
// (o conteúdo só fica mais rico). Ver world-cup-knockout-schedule.ts.
export async function getKnockoutFixtures(
  phaseSlug: string,
  round: number | null
): Promise<KnockoutItem[]> {
  const api = round != null ? await getWorldCupKnockout(round).catch(() => []) : [];
  if (api.length) return api.map((match) => ({ kind: "real", match }));
  return KNOCKOUT_SCHEDULE.filter((s) => s.phase === phaseSlug).map((sched) => ({
    kind: "placeholder",
    sched,
  }));
}

export async function getWorldCupData(): Promise<WorldCupData> {
  const standingsGroups = await getWorldCupStandings();

  // Busca os jogos de cada rodada (todos os grupos juntos) — em paralelo. O semáforo
  // do fetchAllSports já limita a 2 simultâneas + retry em 429; sem pausas fixas.
  const roundMatches: Record<number, ChampionshipMatch[]> = {};
  const fetched = await Promise.all(
    GROUP_ROUNDS.map((r) =>
      fetchAllSports<any>(
        `tournament/${WC.id}/season/${WC.seasonId}/matches/round/${r}`,
        1800
      ).then((data) => ({ r, data }))
    )
  );
  for (const { r, data } of fetched) {
    roundMatches[r] = (data?.events || []).map((e: any) => normalizeMatch(e, r));
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

    // bolinhas de "últimos jogos" a partir dos jogos do próprio grupo
    const matchesByRound: Record<number, ChampionshipMatch[]> = {};
    for (const rd of rounds) matchesByRound[rd.round] = rd.matches;
    const lastRound = GROUP_ROUNDS[GROUP_ROUNDS.length - 1];
    const rows = enrichStandingsWithForm([{ name: g.name, rows: g.rows }], matchesByRound, lastRound)[0].rows;

    return { name: g.name, rows, rounds, defaultRound: pickDefaultRound(rounds, nowSec) };
  });

  return { groups };
}
