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

export interface AgendaLeagueGroup {
  league: string;
  events: AgendaEvent[];
}

export interface AgendaSportGroup {
  sport: string;
  sportSlug: string;
  leagues: AgendaLeagueGroup[];
}

// Vôlei (Liga das Nações/Golden League) são seleções nacionais com nome em inglês
// vindo da API — traduz igual à Copa do Mundo. Futebol só traduz a Copa do Mundo
// (clubes ficam com o nome original).
function shouldTranslateNames(sportSlug: string, leagueId: number | undefined): boolean {
  if (sportSlug === "volei") return true;
  if (sportSlug === "futebol" && leagueId === WORLD_CUP_ID) return true;
  return false;
}

function normalize(event: any, sportSlug: string): AgendaEvent {
  const ts = event.startTimestamp ? new Date(event.startTimestamp * 1000) : new Date();
  const leagueId = event.tournament?.uniqueTournament?.id;
  const translate = shouldTranslateNames(sportSlug, leagueId);
  const homeName = event.homeTeam?.name || event.homeTeam?.shortName || "";
  const awayName = event.awayTeam?.name || event.awayTeam?.shortName || "";
  return {
    id: event.id,
    league: event.tournament?.uniqueTournament?.name || event.tournament?.name || "",
    home: translate ? translateCountry(homeName) : homeName,
    away: translate ? translateCountry(awayName) : awayName,
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
      const data = await fetchAllSports<any>(src.endpoint(d, m, y), 1800).catch(() => null);
      const allow = new Set(src.ids);
      const events: AgendaEvent[] = (data?.events || [])
        .filter((e: any) => allow.has(e.tournament?.uniqueTournament?.id))
        .map((e: any) => normalize(e, src.sportSlug))
        .sort(sortForBar);

      // Agrupa por campeonato preservando a ordem (eventos já ordenados por
      // status/horário) — um carrossel por liga dentro do esporte.
      const byLeague = new Map<string, AgendaEvent[]>();
      for (const e of events) {
        const key = e.league || "Outros";
        const list = byLeague.get(key);
        if (list) list.push(e);
        else byLeague.set(key, [e]);
      }
      const leagues: AgendaLeagueGroup[] = [...byLeague.entries()].map(([league, evs]) => ({
        league,
        events: evs.slice(0, 40),
      }));

      return { sport: src.sport, sportSlug: src.sportSlug, leagues };
    })
  );

  // Só os esportes com jogos no dia, e futebol sempre primeiro (ordem das SOURCES).
  return groups.filter((g) => g.leagues.length > 0);
}

// Ordena ao vivo primeiro, depois agendados, encerrados por último; dentro de
// cada grupo, por horário real.
function sortForBar(a: AgendaEvent, b: AgendaEvent): number {
  const pr = (t: string) => (t === "inprogress" ? 0 : t === "finished" ? 2 : 1);
  const pa = pr(a.statusType);
  const pb = pr(b.statusType);
  if (pa !== pb) return pa - pb;
  return (a.timestamp || 0) - (b.timestamp || 0);
}
