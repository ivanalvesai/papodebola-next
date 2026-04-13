import type { StandingsGroup, StandingRow, FormResult } from "@/types/standings";
import type { ChampionshipMatch } from "@/types/match";

// Pure functions — no API calls, safe for client and server components

export function enrichStandingsWithForm(
  standings: StandingsGroup[],
  matchesByRound: Record<number, ChampionshipMatch[]>,
  currentRound: number
): StandingsGroup[] {
  const rounds = Object.keys(matchesByRound).map(Number).sort((a, b) => a - b);

  return standings.map((group) => ({
    ...group,
    rows: group.rows.map((row) => ({
      ...row,
      recentForm: calcForm(row.teamId, matchesByRound, rounds, currentRound),
      posChange: calcPosChange(row, matchesByRound, rounds, currentRound),
    })),
  }));
}

function calcForm(
  teamId: number,
  matchesByRound: Record<number, ChampionshipMatch[]>,
  rounds: number[],
  currentRound: number
): FormResult[] {
  const form: FormResult[] = [];

  for (let r = currentRound; r >= 1 && form.length < 5; r--) {
    if (!rounds.includes(r)) continue;
    const matches = matchesByRound[r] || [];
    for (const m of matches) {
      if (m.homeId !== teamId && m.awayId !== teamId) continue;
      if (m.homeScore == null || m.awayScore == null) continue;

      const isHome = m.homeId === teamId;
      const teamScore = isHome ? m.homeScore : m.awayScore;
      const oppScore = isHome ? m.awayScore : m.homeScore;

      if (teamScore > oppScore) form.push("W");
      else if (teamScore < oppScore) form.push("L");
      else form.push("D");
    }
  }

  return form.slice(0, 5);
}

function calcPosChange(
  row: StandingRow,
  matchesByRound: Record<number, ChampionshipMatch[]>,
  rounds: number[],
  currentRound: number
): number {
  for (let r = currentRound; r >= 1; r--) {
    if (!rounds.includes(r)) continue;
    const matches = matchesByRound[r] || [];
    for (const m of matches) {
      if (m.homeId !== row.teamId && m.awayId !== row.teamId) continue;
      if (m.homeScore == null || m.awayScore == null) continue;

      const isHome = m.homeId === row.teamId;
      const teamScore = isHome ? m.homeScore : m.awayScore;
      const oppScore = isHome ? m.awayScore : m.homeScore;

      if (teamScore > oppScore) return row.pos <= 4 ? 0 : 1;
      if (teamScore < oppScore) return row.pos >= 17 ? 0 : -1;
      return 0;
    }
  }
  return 0;
}
