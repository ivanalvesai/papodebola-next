import { fetchAllSports } from "@/lib/api/allsports";
import { TOURNAMENTS } from "@/lib/config";
import { translateCountry } from "@/lib/i18n/countries";
import { getBrasileiraoStandings } from "./standings";
import type { Scorer } from "@/types/team";

/* eslint-disable @typescript-eslint/no-explicit-any */

const WORLD_CUP = { id: 16, seasonId: 58210 } as const;

// Artilharia da Copa do Mundo via endpoint de estatisticas do torneio: 1 request
// so, ja ordenada por gols (diferente do Brasileirao, que e por time). Antes da
// Copa comecar a API devolve { results: [] } — popula sozinho no 1o gol marcado.
export async function getWorldCupScorers(): Promise<Scorer[]> {
  const data = await fetchAllSports<any>(
    `tournament/${WORLD_CUP.id}/season/${WORLD_CUP.seasonId}/statistics?order=-goals&limit=20&accumulation=total&group=summary`,
    3600
  );

  const results: any[] = data?.results || [];
  return results
    .filter((r) => (r.goals || 0) > 0 && r.player?.id)
    .map((r) => ({
      player: {
        id: r.player.id,
        name: r.player.name || "",
        shortName: r.player.shortName || r.player.name || "",
      },
      team: {
        id: r.team?.id || 0,
        name: translateCountry(r.team?.name || ""),
      },
      goals: r.goals || 0,
      rating: r.rating ?? null,
    }))
    .slice(0, 15);
}

export async function getTopScorers(): Promise<Scorer[]> {
  const t = TOURNAMENTS.BRASILEIRAO_A;
  if (!t.seasonId) return [];

  // Get top 10 teams from standings
  const standings = await getBrasileiraoStandings();
  const topTeams = standings[0]?.rows?.slice(0, 10) || [];

  if (topTeams.length === 0) return [];

  const allScorers: Scorer[] = [];
  const seenPlayers = new Set<number>();

  // Fetch best players for each top team
  for (const team of topTeams) {
    const data = await fetchAllSports<any>(
      `team/${team.teamId}/tournament/${t.id}/season/${t.seasonId}/best-players`,
      86400
    );

    const players = (data?.topPlayers?.goals || data?.bestPlayers?.goals) || [];
    for (const p of players) {
      if (p.player?.id && !seenPlayers.has(p.player.id)) {
        seenPlayers.add(p.player.id);
        allScorers.push({
          player: {
            id: p.player.id,
            name: p.player.name || "",
            shortName: p.player.shortName || p.player.name || "",
          },
          team: {
            id: team.teamId,
            name: team.team,
          },
          goals: p.statistics?.goals || 0,
          rating: p.statistics?.rating || null,
        });
      }
    }

    // Rate limiting
    await new Promise((r) => setTimeout(r, 300));
  }

  return allScorers.sort((a, b) => b.goals - a.goals).slice(0, 15);
}
