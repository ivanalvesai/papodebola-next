import { fetchAllSports } from "@/lib/api/allsports";
import { translateStatus } from "@/lib/translations";
import { translateCountry } from "@/lib/i18n/countries";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Agenda GERAL multiesporte (curada): por dia, só as competições principais de
// cada modalidade. Filtra por uniqueTournament.id do Sofascore — assim a agenda
// fica limpa (estilo ge.globo) e enche sozinha quando cada liga entra em temporada.
// Futebol vem do endpoint "bare" matches/{data}; os outros usam {esporte}/matches.

const WORLD_CUP_ID = 16;

interface AgendaSource {
  sport: string;
  sportSlug: string; // pra link da página do esporte (vazio = sem página)
  endpoint: (d: number, m: number, y: number) => string;
  ids: number[]; // uniqueTournament.id das competições principais
}

const SOURCES: AgendaSource[] = [
  {
    sport: "Futebol",
    sportSlug: "futebol",
    endpoint: (d, m, y) => `matches/${d}/${m}/${y}`,
    // Copa do Mundo, Brasileirão A/B, Copa do Brasil, Libertadores, Sul-Americana,
    // Champions, Premier, LaLiga, Serie A, Bundesliga, Ligue 1, Eliminatórias.
    ids: [16, 325, 390, 373, 384, 480, 7, 17, 8, 23, 35, 34, 11, 13],
  },
  {
    sport: "Basquete",
    sportSlug: "basquete",
    endpoint: (d, m, y) => `basketball/matches/${d}/${m}/${y}`,
    ids: [132, 486], // NBA, WNBA
  },
  {
    sport: "Vôlei",
    sportSlug: "volei",
    endpoint: (d, m, y) => `volleyball/matches/${d}/${m}/${y}`,
    ids: [11094, 11093, 139, 625], // Liga das Nações (M/F), Golden League (M/F)
  },
  {
    sport: "Futebol Americano",
    sportSlug: "futebol-americano",
    endpoint: (d, m, y) => `american-football/matches/${d}/${m}/${y}`,
    ids: [9464], // NFL
  },
];

export interface AgendaEvent {
  id: number;
  league: string;
  home: string;
  away: string;
  homeId: number;
  awayId: number;
  homeScore: number | null;
  awayScore: number | null;
  status: string;
  statusType: string;
  time: string;
  timestamp: number;
}

export interface AgendaSportGroup {
  sport: string;
  sportSlug: string;
  events: AgendaEvent[];
}

function normalize(event: any, isFootball: boolean): AgendaEvent {
  const ts = event.startTimestamp ? new Date(event.startTimestamp * 1000) : new Date();
  const leagueId = event.tournament?.uniqueTournament?.id;
  const isWC = isFootball && leagueId === WORLD_CUP_ID;
  const homeName = event.homeTeam?.name || event.homeTeam?.shortName || "";
  const awayName = event.awayTeam?.name || event.awayTeam?.shortName || "";
  return {
    id: event.id,
    league: event.tournament?.uniqueTournament?.name || event.tournament?.name || "",
    home: isWC ? translateCountry(homeName) : homeName,
    away: isWC ? translateCountry(awayName) : awayName,
    homeId: event.homeTeam?.id || 0,
    awayId: event.awayTeam?.id || 0,
    homeScore: event.homeScore?.current ?? null,
    awayScore: event.awayScore?.current ?? null,
    status: translateStatus(event.status?.description) || translateStatus(event.status?.type) || "",
    statusType: event.status?.type || "",
    time: ts.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }),
    timestamp: event.startTimestamp || 0,
  };
}

// data: objeto Date (qualquer hora do dia desejado, horário do servidor).
export async function getGeneralAgenda(date: Date): Promise<AgendaSportGroup[]> {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();

  const groups = await Promise.all(
    SOURCES.map(async (src) => {
      const isFootball = src.sportSlug === "futebol";
      const data = await fetchAllSports<any>(src.endpoint(d, m, y), 1800).catch(() => null);
      const allow = new Set(src.ids);
      const events = (data?.events || [])
        .filter((e: any) => allow.has(e.tournament?.uniqueTournament?.id))
        .map((e: any) => normalize(e, isFootball))
        .sort((a: AgendaEvent, b: AgendaEvent) => a.timestamp - b.timestamp)
        .slice(0, 40);
      return { sport: src.sport, sportSlug: src.sportSlug, events };
    })
  );

  // Só os esportes com jogos no dia, e futebol sempre primeiro.
  return groups.filter((g) => g.events.length > 0);
}
