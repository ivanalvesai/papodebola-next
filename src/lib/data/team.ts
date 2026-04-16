import { fetchAllSports } from "@/lib/api/allsports";
import { TEAM_BY_SLUG, TOURNAMENTS } from "@/lib/config";
import { getArticles } from "./articles";
import { getBrasileiraoStandings } from "./standings";
import type { NormalizedMatch } from "@/types/match";
import type { StandingRow } from "@/types/standings";
import type { Article } from "@/types/article";
import type { Scorer } from "@/types/team";
import { translateStatus } from "@/lib/translations";

/* eslint-disable @typescript-eslint/no-explicit-any */

export interface TeamPageData {
  name: string;
  id: number;
  slug: string;
  standingPosition: StandingRow | null;
  news: Article[];
  todayMatch: TeamMatch | null;
  upcomingMatches: TeamMatch[];
  recentMatches: TeamMatch[];
  topPlayers: Scorer[];
}

export interface TeamMatch {
  id: number;
  home: string;
  away: string;
  homeId: number;
  awayId: number;
  homeScore: number | null;
  awayScore: number | null;
  league: string;
  status: string;
  statusText: string;
  date: string;
  time: string;
  timestamp: number;
  venue?: string;
}

function normalizeTeamMatch(event: any): TeamMatch {
  const ts = event.startTimestamp ? new Date(event.startTimestamp * 1000) : new Date();
  return {
    id: event.id,
    home: event.homeTeam?.name || "",
    away: event.awayTeam?.name || "",
    homeId: event.homeTeam?.id || 0,
    awayId: event.awayTeam?.id || 0,
    homeScore: event.homeScore?.current ?? null,
    awayScore: event.awayScore?.current ?? null,
    league: event.tournament?.uniqueTournament?.name || event.tournament?.name || "",
    status: event.status?.type || "",
    statusText: translateStatus(event.status?.description),
    date: ts.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" }),
    time: ts.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }),
    timestamp: event.startTimestamp || 0,
    venue: event.venue?.stadium?.name || "",
  };
}

export async function getTeamNextEvents(teamId: number): Promise<TeamMatch[]> {
  const data = await fetchAllSports<any>(`team/${teamId}/matches/next/0`, 3600);
  if (!data?.events) return [];
  return data.events.map(normalizeTeamMatch);
}

export async function getTeamPreviousEvents(teamId: number): Promise<TeamMatch[]> {
  const data = await fetchAllSports<any>(`team/${teamId}/matches/previous/0`, 3600);
  if (!data?.events) return [];
  return data.events.map(normalizeTeamMatch).reverse();
}

export async function getTeamTopPlayers(teamId: number): Promise<Scorer[]> {
  const t = TOURNAMENTS.BRASILEIRAO_A;
  if (!t.seasonId) return [];

  const data = await fetchAllSports<any>(
    `team/${teamId}/tournament/${t.id}/season/${t.seasonId}/best-players`,
    86400
  );

  const players = (data?.topPlayers?.goals || data?.bestPlayers?.goals) || [];
  return players.slice(0, 10).map((p: any) => ({
    player: {
      id: p.player?.id || 0,
      name: p.player?.name || "",
      shortName: p.player?.shortName || "",
    },
    team: { id: teamId, name: "" },
    goals: p.statistics?.goals || 0,
    rating: p.statistics?.rating || null,
  }));
}

export async function getTeamStandingPosition(teamId: number): Promise<StandingRow | null> {
  const standings = await getBrasileiraoStandings();
  const rows = standings[0]?.rows || [];
  return rows.find((r) => r.teamId === teamId) || null;
}

export async function getTeamPageData(slug: string): Promise<TeamPageData | null> {
  const team = TEAM_BY_SLUG[slug];
  if (!team) return null;

  const [nextEvents, prevEvents, topPlayers, position, newsResult] = await Promise.all([
    getTeamNextEvents(team.id).catch(() => []),
    getTeamPreviousEvents(team.id).catch(() => []),
    getTeamTopPlayers(team.id).catch(() => []),
    getTeamStandingPosition(team.id).catch(() => null),
    getArticles({ tag: team.name, perPage: 10 }).catch(() => ({ articles: [], total: 0 })),
  ]);

  // Find today's match
  const today = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const todayMatch = nextEvents.find((m) => m.date === today) || prevEvents.find((m) => m.date === today) || null;

  return {
    name: team.name,
    id: team.id,
    slug: team.slug,
    standingPosition: position,
    news: newsResult.articles,
    todayMatch,
    upcomingMatches: nextEvents.slice(0, 10),
    recentMatches: prevEvents.slice(0, 10),
    topPlayers,
  };
}
