import { fetchAllSports } from "@/lib/api/allsports";
import { TOURNAMENT_BY_SLUG } from "@/lib/config";
import { translateStatus } from "@/lib/translations";
import { getStandings } from "./standings";
import type { ChampionshipData } from "@/types/tournament";
import type { ChampionshipMatch } from "@/types/match";

/* eslint-disable @typescript-eslint/no-explicit-any */

function normalizeMatch(event: any, round: number): ChampionshipMatch {
  return {
    id: event.id,
    home: event.homeTeam?.name || "",
    away: event.awayTeam?.name || "",
    homeId: event.homeTeam?.id || 0,
    awayId: event.awayTeam?.id || 0,
    homeScore: event.homeScore?.current ?? null,
    awayScore: event.awayScore?.current ?? null,
    status: event.status?.type || "",
    statusDesc: translateStatus(event.status?.description) || "",
    timestamp: event.startTimestamp || 0,
    round,
  };
}

export async function getChampionshipData(
  slug: string
): Promise<ChampionshipData | null> {
  const tournament = TOURNAMENT_BY_SLUG[slug];
  if (!tournament || !tournament.seasonId) return null;

  const { id, seasonId, name } = tournament;

  // Fetch rounds info
  const roundsData = await fetchAllSports<any>(
    `tournament/${id}/season/${seasonId}/rounds`,
    7200
  );

  const currentRound = roundsData?.currentRound?.round || 1;
  const totalRounds = roundsData?.rounds?.length || 38;
  const rounds = Array.from({ length: totalRounds }, (_, i) => i + 1);

  // Fetch standings
  const standings = await getStandings(id, seasonId, 7200);

  // Fetch matches: 5 rounds back (for form dots) + 2 ahead (for schedule)
  const matchesByRound: Record<number, ChampionshipMatch[]> = {};
  const startRound = Math.max(1, currentRound - 5);
  const endRound = Math.min(totalRounds, currentRound + 2);

  for (let r = startRound; r <= endRound; r++) {
    const data = await fetchAllSports<any>(
      `tournament/${id}/season/${seasonId}/matches/round/${r}`,
      7200
    );

    if (data?.events) {
      matchesByRound[r] = data.events.map((e: any) => normalizeMatch(e, r));
    }

    await new Promise((resolve) => setTimeout(resolve, 300));
  }

  return {
    tournament: { id, seasonId, name },
    rounds,
    currentRound,
    standings,
    matchesByRound,
    updatedAt: new Date().toISOString(),
  };
}
