import { fetchAllSports } from "@/lib/api/allsports";
import { TOURNAMENTS } from "@/lib/config";
import type { StandingsGroup, StandingRow, FormResult } from "@/types/standings";

/* eslint-disable @typescript-eslint/no-explicit-any */

function getFormFromMatches(
  teamId: number,
  matchesByRound: Record<number, any[]>,
  rounds: number[],
  currentRound: number,
  count: number = 5
): FormResult[] {
  const form: FormResult[] = [];

  // Walk backwards from currentRound
  for (let r = currentRound; r >= 1 && form.length < count; r--) {
    if (!rounds.includes(r)) continue;
    const matches = matchesByRound[r] || [];
    for (const m of matches) {
      const hid = m.homeTeam?.id || 0;
      const aid = m.awayTeam?.id || 0;
      const hs = m.homeScore?.current;
      const as_ = m.awayScore?.current;
      const finished = m.status?.type === "finished";

      if (!finished || hs == null || as_ == null) continue;
      if (hid !== teamId && aid !== teamId) continue;

      const isHome = hid === teamId;
      const teamScore = isHome ? hs : as_;
      const oppScore = isHome ? as_ : hs;

      if (teamScore > oppScore) form.push("W");
      else if (teamScore < oppScore) form.push("L");
      else form.push("D");
    }
  }

  return form.slice(0, count);
}

function getPosChange(
  teamId: number,
  currentStandings: any[],
  matchesByRound: Record<number, any[]>,
  rounds: number[],
  currentRound: number
): number {
  // Simple approach: if last round match was W, likely climbed; L, likely dropped
  // More accurate: compare with a hypothetical previous standings
  // We use a simpler heuristic based on points vs neighbors
  const currentRow = currentStandings.find((r: any) => (r.team?.id || 0) === teamId);
  if (!currentRow) return 0;

  const pos = currentRow.position || 0;

  // Check the last finished round for this team
  for (let r = currentRound; r >= 1; r--) {
    if (!rounds.includes(r)) continue;
    const matches = matchesByRound[r] || [];
    for (const m of matches) {
      const hid = m.homeTeam?.id || 0;
      const aid = m.awayTeam?.id || 0;
      const hs = m.homeScore?.current;
      const as_ = m.awayScore?.current;
      const finished = m.status?.type === "finished";

      if (!finished || hs == null || as_ == null) continue;
      if (hid !== teamId && aid !== teamId) continue;

      const isHome = hid === teamId;
      const teamScore = isHome ? hs : as_;
      const oppScore = isHome ? as_ : hs;

      // Won = likely moved up, Lost = likely moved down, Draw = stable
      if (teamScore > oppScore) return pos <= 4 ? 0 : 1; // already top = stable
      if (teamScore < oppScore) return pos >= 17 ? 0 : -1; // already bottom = stable
      return 0;
    }
  }

  return 0;
}

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
    posChange: 0,
    recentForm: [],
  };
}

export async function getStandings(
  tournamentId: number,
  seasonId: number,
  revalidate: number = 1800
): Promise<StandingsGroup[]> {
  const data = await fetchAllSports<any>(
    `tournament/${tournamentId}/season/${seasonId}/standings/total`,
    revalidate
  );

  if (!data?.standings) return [];

  // Also fetch recent rounds for form calculation
  const roundsData = await fetchAllSports<any>(
    `tournament/${tournamentId}/season/${seasonId}/rounds`,
    revalidate
  );
  const currentRound = roundsData?.currentRound?.round || 0;
  const totalRounds = roundsData?.rounds?.length || 0;
  const rounds = Array.from({ length: totalRounds }, (_, i) => i + 1);

  // Fetch last 5 rounds for form
  const matchesByRound: Record<number, any[]> = {};
  const startRound = Math.max(1, currentRound - 5);
  for (let r = startRound; r <= currentRound; r++) {
    const roundData = await fetchAllSports<any>(
      `tournament/${tournamentId}/season/${seasonId}/matches/round/${r}`,
      revalidate
    );
    if (roundData?.events) {
      matchesByRound[r] = roundData.events;
    }
    await new Promise((resolve) => setTimeout(resolve, 200));
  }

  return data.standings.map((group: any) => ({
    name: group.name || "",
    rows: (group.rows || []).map((row: any) => {
      const base = normalizeStandingRow(row);
      base.recentForm = getFormFromMatches(base.teamId, matchesByRound, rounds, currentRound, 5);
      base.posChange = getPosChange(base.teamId, group.rows || [], matchesByRound, rounds, currentRound);
      return base;
    }),
  }));
}

export async function getBrasileiraoStandings(): Promise<StandingsGroup[]> {
  const t = TOURNAMENTS.BRASILEIRAO_A;
  if (!t.seasonId) return [];
  return getStandings(t.id, t.seasonId);
}
