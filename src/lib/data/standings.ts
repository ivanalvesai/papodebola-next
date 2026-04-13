import { fetchAllSports } from "@/lib/api/allsports";
import { TOURNAMENTS } from "@/lib/config";
import type { StandingsGroup, StandingRow } from "@/types/standings";

/* eslint-disable @typescript-eslint/no-explicit-any */

function normalizeStandingRow(row: any): StandingRow {
  return {
    pos: row.position ?? 0,
    team: row.team?.name || "",
    teamId: row.team?.id || 0,
    pts: row.points ?? 0,
    matches: row.matches ?? 0,
    wins: row.wins ?? 0,
    draws: row.draws ?? 0,
    losses: row.losses ?? 0,
    gf: row.scoresFor ?? 0,
    ga: row.scoresAgainst ?? 0,
    gd: (row.scoresFor ?? 0) - (row.scoresAgainst ?? 0),
    promo: row.promotion?.text || "",
  };
}

export async function getStandings(
  tournamentId: number,
  seasonId: number,
  revalidate: number = 3600
): Promise<StandingsGroup[]> {
  const data = await fetchAllSports<any>(
    `tournament/${tournamentId}/season/${seasonId}/standings/total`,
    revalidate
  );

  if (!data?.standings) return [];

  return data.standings.map((group: any) => ({
    name: group.name || "",
    rows: (group.rows || []).map(normalizeStandingRow),
  }));
}

export async function getBrasileiraoStandings(): Promise<StandingsGroup[]> {
  const t = TOURNAMENTS.BRASILEIRAO_A;
  if (!t.seasonId) return [];
  return getStandings(t.id, t.seasonId);
}
