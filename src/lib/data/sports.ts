import { fetchSport } from "@/lib/api/allsports";
import type { SportData, SportEvent, SportConfig } from "@/types/sport";

/* eslint-disable @typescript-eslint/no-explicit-any */

const SPORT_CONFIGS: Record<string, SportConfig> = {
  nba: { slug: "nba", api: "basketball", tournamentId: 132, seasonId: 80229, hasStandings: true },
  tenis: { slug: "tenis", api: "tennis", rankingType: "atp", hasRankings: true },
  f1: { slug: "f1", api: "motorsport" },
  mma: { slug: "mma", api: "mma", tournamentId: 19906 },
  volei: { slug: "volei", api: "volleyball" },
  esports: { slug: "esports", api: "esports" },
  nfl: { slug: "nfl", api: "american-football" },
};

function normalizeEvent(event: any): SportEvent {
  const ts = event.startTimestamp ? new Date(event.startTimestamp * 1000) : new Date();
  return {
    id: event.id,
    home: event.homeTeam?.name || event.homeTeam?.shortName || "",
    away: event.awayTeam?.name || event.awayTeam?.shortName || "",
    homeId: event.homeTeam?.id || 0,
    awayId: event.awayTeam?.id || 0,
    homeScore: event.homeScore?.current ?? null,
    awayScore: event.awayScore?.current ?? null,
    league: event.tournament?.uniqueTournament?.name || event.tournament?.name || "",
    status: event.status?.description || event.status?.type || "",
    time: ts.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }),
    timestamp: event.startTimestamp || 0,
  };
}

export async function getSportData(slug: string): Promise<SportData | null> {
  const config = SPORT_CONFIGS[slug];
  if (!config) return null;

  const { api } = config;

  // Live events
  const liveData = await fetchSport<any>(api, "events/live", 300);
  const live = (liveData?.events || []).map(normalizeEvent);

  // Today's events
  const now = new Date();
  const d = now.getDate();
  const m = now.getMonth() + 1;
  const y = now.getFullYear();
  const todayData = await fetchSport<any>(api, `events/${d}/${m}/${y}`, 3600);
  const today = (todayData?.events || []).map(normalizeEvent);

  // Calendar (next 5 days)
  const calendar = [];
  for (let i = 1; i <= 5; i++) {
    const date = new Date();
    date.setDate(date.getDate() + i);
    const dd = date.getDate();
    const mm = date.getMonth() + 1;
    const yy = date.getFullYear();

    const dayData = await fetchSport<any>(api, `events/${dd}/${mm}/${yy}`, 86400);
    const events = (dayData?.events || []).map(normalizeEvent);

    const label = date.toLocaleDateString("pt-BR", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
      timeZone: "America/Sao_Paulo",
    });

    calendar.push({
      date: `${yy}-${String(mm).padStart(2, "0")}-${String(dd).padStart(2, "0")}`,
      label,
      events,
    });

    await new Promise((r) => setTimeout(r, 300));
  }

  // Standings (NBA)
  let standings = null;
  if (config.hasStandings && config.tournamentId && config.seasonId) {
    const data = await fetchSport<any>(
      api,
      `tournament/${config.tournamentId}/season/${config.seasonId}/standings/total`,
      86400
    );
    if (data?.standings) {
      standings = data.standings.map((g: any) => ({
        name: g.name || "",
        rows: (g.rows || []).map((r: any) => ({
          pos: r.position ?? 0,
          team: r.team?.name || "",
          teamId: r.team?.id || 0,
          pts: r.points ?? 0,
          matches: r.matches ?? 0,
          wins: r.wins ?? 0,
          draws: r.draws ?? 0,
          losses: r.losses ?? 0,
          gf: r.scoresFor ?? 0,
          ga: r.scoresAgainst ?? 0,
          gd: (r.scoresFor ?? 0) - (r.scoresAgainst ?? 0),
          promo: r.promotion?.text || "",
        })),
      }));
    }
  }

  // Rankings (Tennis)
  let rankings = null;
  if (config.hasRankings && config.rankingType) {
    const data = await fetchSport<any>(api, `rankings/${config.rankingType}`, 86400);
    if (data?.rankings?.[0]?.rows) {
      rankings = data.rankings[0].rows.slice(0, 20).map((r: any) => ({
        pos: r.ranking ?? 0,
        name: r.team?.name || "",
        teamId: r.team?.id || 0,
        points: r.points ?? 0,
      }));
    }
  }

  return {
    live,
    today,
    calendar,
    standings,
    rankings,
    updated: new Date().toISOString(),
  };
}
