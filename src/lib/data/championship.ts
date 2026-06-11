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
    21600
  );

  const currentRound = roundsData?.currentRound?.round || 1;
  const totalRounds = roundsData?.rounds?.length || 38;
  const rounds = Array.from({ length: totalRounds }, (_, i) => i + 1);

  // Fetch standings
  const standings = await getStandings(id, seasonId, 21600);

  // Fetch rounds from 1 to currentRound+1.
  // Past rounds (< currentRound) are finalized and never change → TTL 24h.
  // Current and next (>= currentRound) → TTL 6h.
  const matchesByRound: Record<number, ChampionshipMatch[]> = {};
  const endRound = Math.min(totalRounds, currentRound + 1);

  for (let r = 1; r <= endRound; r++) {
    const ttl = r < currentRound ? 86400 : 21600;
    const data = await fetchAllSports<any>(
      `tournament/${id}/season/${seasonId}/matches/round/${r}`,
      ttl
    );

    if (data?.events) {
      matchesByRound[r] = data.events.map((e: any) => normalizeMatch(e, r));
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
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
