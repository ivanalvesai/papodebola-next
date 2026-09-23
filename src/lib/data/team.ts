import { fetchAllSports } from "@/lib/api/allsports";
import { TEAM_BY_SLUG, teamTournament, type TeamInfo } from "@/lib/config";
import { getArticles } from "./articles";
import { getStandings } from "./standings";
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
  tournament: { name: string; slug: string } | null;
  standingPosition: StandingRow | null;
  // Tabela completa do campeonato do time (mesma chamada em cache da posição) — usada
  // pelo texto de contexto (distância pro líder / pra zona de rebaixamento).
  standingsTable: StandingRow[];
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
  const data = await fetchAllSports<any>(`team/${teamId}/matches/next/0`, 43200);
  if (!data?.events) return [];
  return data.events.map(normalizeTeamMatch);
}

export async function getTeamPreviousEvents(teamId: number): Promise<TeamMatch[]> {
  const data = await fetchAllSports<any>(`team/${teamId}/matches/previous/0`, 43200);
  if (!data?.events) return [];
  return data.events.map(normalizeTeamMatch).reverse();
}

export async function getTeamTopPlayers(team: TeamInfo): Promise<Scorer[]> {
  const t = teamTournament(team);
  if (!t?.seasonId) return [];

  const data = await fetchAllSports<any>(
    `team/${team.id}/tournament/${t.id}/season/${t.seasonId}/best-players`,
    86400
  );

  const players = (data?.topPlayers?.goals || data?.bestPlayers?.goals) || [];
  return players.slice(0, 10).map((p: any) => ({
    player: {
      id: p.player?.id || 0,
      name: p.player?.name || "",
      shortName: p.player?.shortName || "",
    },
    team: { id: team.id, name: "" },
    goals: p.statistics?.goals || 0,
    rating: p.statistics?.rating || null,
  }));
}

export async function getTeamStandingsTable(team: TeamInfo): Promise<StandingRow[]> {
  const t = teamTournament(team);
  if (!t?.seasonId) return [];
  const standings = await getStandings(t.id, t.seasonId);
  return standings[0]?.rows || [];
}

export async function getTeamStandingPosition(team: TeamInfo): Promise<StandingRow | null> {
  const rows = await getTeamStandingsTable(team);
  return rows.find((r) => r.teamId === team.id) || null;
}

export async function getTeamPageData(slug: string): Promise<TeamPageData | null> {
  const team = TEAM_BY_SLUG[slug];
  if (!team) return null;
  return getTeamPageDataFor(team);
}

// Core: monta os dados da página a partir de uma identidade de time (do config OU de
// um doc do Payload — collection `teams` da Série B). Preserva o ao vivo (mesmas funções).
export async function getTeamPageDataFor(team: TeamInfo): Promise<TeamPageData> {
  const [nextEvents, prevEvents, topPlayers, table, newsResult] = await Promise.all([
    getTeamNextEvents(team.id).catch(() => []),
    getTeamPreviousEvents(team.id).catch(() => []),
    getTeamTopPlayers(team).catch(() => []),
    getTeamStandingsTable(team).catch(() => [] as StandingRow[]),
    getArticles({ tag: team.name, perPage: 10 }).catch(() => ({ articles: [], total: 0 })),
  ]);

  // Find today's match
  const today = new Date().toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric" });
  const todayMatch = nextEvents.find((m) => m.date === today) || prevEvents.find((m) => m.date === today) || null;

  const position = table.find((r) => r.teamId === team.id) || null;
  const trn = teamTournament(team);
  return {
    name: team.name,
    id: team.id,
    slug: team.slug,
    tournament: trn ? { name: trn.name, slug: trn.slug } : null,
    standingPosition: position,
    standingsTable: table,
    news: newsResult.articles,
    todayMatch,
    upcomingMatches: nextEvents.slice(0, 10),
    recentMatches: prevEvents.slice(0, 10),
    topPlayers,
  };
}

export type SuggestPlayer = { name: string; number: string; playerId: string };

// Titulares de um lado do lineup (não-substitutos), na ordem da API (goleiro -> ataque).
function starters(side: any): SuggestPlayer[] {
  const players: any[] = Array.isArray(side?.players) ? side.players : [];
  return players
    .filter((p) => !p?.substitute)
    .map((p) => ({
      name: p?.player?.name || "",
      number: String(p?.shirtNumber ?? p?.player?.jerseyNumber ?? ""),
      playerId: p?.player?.id ? String(p.player.id) : "",
    }))
    .filter((p) => p.name);
}

export interface TeamLastLineup {
  teamName: string;
  formation: string;
  players: SuggestPlayer[];
  fromMatch: number;
  opponent: string;
  date: string;
  league: string;
}

// Pega o XI provável = escalação do jogo anterior mais recente que TENHA lineup.
// maxGames limita as chamadas (render de página usa poucas; o editor pode ir mais longe).
export async function getTeamLastLineup(teamId: number, maxGames = 6): Promise<TeamLastLineup | null> {
  const prev = await getTeamPreviousEvents(teamId);
  // mais recentes primeiro
  const games = [...prev].sort((a, b) => (b.timestamp || 0) - (a.timestamp || 0));
  for (const g of games.slice(0, maxGames)) {
    const raw = await fetchAllSports<any>(`match/${g.id}/lineups`, 86400);
    if (!raw) continue;
    const isHome = g.homeId === teamId;
    const side = isHome ? raw.home : raw.away;
    const list = starters(side);
    if (list.length >= 7) {
      return {
        teamName: isHome ? g.home : g.away,
        formation: side?.formation || "",
        players: list.slice(0, 11),
        fromMatch: g.id,
        opponent: isHome ? g.away : g.home,
        date: g.date,
        league: g.league,
      };
    }
  }
  return null;
}
