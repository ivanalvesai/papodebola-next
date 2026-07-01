import { fetchAllSports } from "@/lib/api/allsports";
import { translateStatus } from "@/lib/translations";
import { translateCountry } from "@/lib/i18n/countries";
import { SELECAO_BY_ID } from "@/lib/selecoes";
import { worldCupMatchHref } from "@/lib/world-cup-match-url";
import { TOURNAMENTS, TOURNAMENT_BY_SLUG } from "@/lib/config";
import {
  getWorldCupFixtures,
  getMatchEvent,
  championshipMatchHref,
  type WorldCupFixture,
  type MatchEvent,
} from "./match-detail";
import { getChampionshipData } from "./championship";
import type { ChampionshipMatch } from "@/types/match";

/* eslint-disable @typescript-eslint/no-explicit-any */

// leagueId (uniqueTournament.id) → slug da página do campeonato em /futebol/[slug].
const FUTEBOL_SLUG_BY_ID = new Map(Object.values(TOURNAMENTS).map((t) => [t.id, t.slug]));

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

// FUTEBOL não usa mais o feed por data (matches/{d}/{m}/{y}) — ele devolve [] há semanas
// (bug do provedor). É montado à parte em getFootballAgendaForDay() a partir de fontes
// CONFIÁVEIS (rodadas/cuptrees da Copa + getChampionshipData por liga). Os outros esportes
// seguem no feed por data com fallback ao vivo (funcionam).
const SOURCES: AgendaSource[] = [
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
  href?: string; // link pra página do jogo (só jogos da Copa entre seleções)
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
  const isWC = sportSlug === "futebol" && leagueId === WORLD_CUP_ID;
  const translate = shouldTranslateNames(sportSlug, leagueId);
  const homeName = event.homeTeam?.name || event.homeTeam?.shortName || "";
  const awayName = event.awayTeam?.name || event.awayTeam?.shortName || "";
  const homeId = event.homeTeam?.id || 0;
  const awayId = event.awayTeam?.id || 0;

  // Link do card: Copa → página do jogo (lance a lance); futebol não-Copa →
  // página do campeonato (se tiver); outros esportes → página do esporte. Assim
  // nenhum card é beco sem saída (recupera o 2º pageview).
  let href: string | undefined;
  if (isWC && SELECAO_BY_ID[homeId] && SELECAO_BY_ID[awayId]) {
    href = worldCupMatchHref(event.startTimestamp || 0, homeId, awayId, homeName, awayName);
  } else if (sportSlug === "futebol") {
    const slug = FUTEBOL_SLUG_BY_ID.get(leagueId);
    if (slug) href = `/futebol/${slug}`;
  } else if (sportSlug) {
    href = `/${sportSlug}`;
  }

  return {
    id: event.id,
    // "FIFA World Cup" vem em inglês da API — exibe "Copa do Mundo" (igual à home).
    league: isWC
      ? "Copa do Mundo"
      : event.tournament?.uniqueTournament?.name || event.tournament?.name || "",
    home: translate ? translateCountry(homeName) : homeName,
    away: translate ? translateCountry(awayName) : awayName,
    homeId,
    awayId,
    homeScore: event.homeScore?.current ?? null,
    awayScore: event.awayScore?.current ?? null,
    status: translateStatus(event.status?.description) || translateStatus(event.status?.type) || "",
    statusType: event.status?.type || "",
    time: ts.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }),
    timestamp: event.startTimestamp || 0,
    href,
  };
}

// ===== Futebol de um dia, de fontes CONFIÁVEIS (o feed por data está quebrado) =====
// Copa: getWorldCupFixtures (grupos + mata-mata via cuptrees) + status/placar reais por
// match/{id} nos jogos já iniciados. Campeonatos cobertos: getChampionshipData (round feeds).
const FOOTBALL_AGENDA_CHAMPS = [
  "brasileirao-serie-a",
  "brasileirao-serie-b",
  "copa-do-brasil",
  "libertadores",
  "sudamericana",
];

// [início, fim) do dia em horário de Brasília (00:00 BRT = 03:00 UTC), a partir do
// ano/mês/dia da data pedida (o servidor roda em UTC; a data já vem "no dia" desejado).
function dayBoundsBRT(date: Date): [number, number] {
  const start = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 3, 0, 0) / 1000;
  return [start, start + 24 * 3600];
}

function hhmm(ts: number): string {
  return new Date(ts * 1000).toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });
}

function wcFixtureToAgenda(f: WorldCupFixture, ev: MatchEvent | null): AgendaEvent {
  return {
    id: f.id,
    league: "Copa do Mundo",
    home: f.home,
    away: f.away,
    homeId: f.homeId,
    awayId: f.awayId,
    homeScore: ev?.homeScore ?? null,
    awayScore: ev?.awayScore ?? null,
    status:
      translateStatus(ev?.statusDesc) ||
      (ev?.statusType === "finished" ? "Encerrado" : ev?.statusType === "inprogress" ? "Ao Vivo" : ""),
    statusType: ev?.statusType || "notstarted",
    time: hhmm(f.timestamp || 0),
    timestamp: f.timestamp || 0,
    href: worldCupMatchHref(f.timestamp || 0, f.homeId, f.awayId, f.home, f.away),
  };
}

function champMatchToAgenda(m: ChampionshipMatch, league: string, slug: string): AgendaEvent {
  return {
    id: m.id,
    league,
    home: m.home,
    away: m.away,
    homeId: m.homeId,
    awayId: m.awayId,
    homeScore: m.homeScore,
    awayScore: m.awayScore,
    status:
      m.statusDesc ||
      (m.status === "finished" ? "Encerrado" : m.status === "inprogress" ? "Ao Vivo" : ""),
    statusType: m.status,
    time: hhmm(m.timestamp || 0),
    timestamp: m.timestamp || 0,
    href:
      m.homeId && m.awayId && m.timestamp
        ? championshipMatchHref(slug, m.timestamp, m.homeId, m.awayId, m.home, m.away)
        : `/futebol/${slug}`,
  };
}

export async function getFootballAgendaForDay(date: Date): Promise<AgendaLeagueGroup[]> {
  const [start, end] = dayBoundsBRT(date);
  const inDay = (ts?: number) => !!ts && ts >= start && ts < end;
  const nowSec = Date.now() / 1000;

  const [fixtures, ...champData] = await Promise.all([
    getWorldCupFixtures().catch(() => [] as WorldCupFixture[]),
    ...FOOTBALL_AGENDA_CHAMPS.map((s) => getChampionshipData(s).catch(() => null)),
  ]);

  const events: AgendaEvent[] = [];

  // Copa: fixtures do dia; status/placar reais por match/{id} nos que já começaram
  // (autoritativo — matches/round vem vazio no mata-mata e o feed por data está quebrado).
  const dayFixtures = fixtures.filter((f) => inDay(f.timestamp));
  const wcEvents = await Promise.all(
    dayFixtures.map(async (f) => {
      const ev = f.timestamp && f.timestamp <= nowSec ? await getMatchEvent(f.id, f.timestamp).catch(() => null) : null;
      return wcFixtureToAgenda(f, ev);
    })
  );
  events.push(...wcEvents);

  // Campeonatos cobertos (fonte confiável: round feeds via getChampionshipData).
  FOOTBALL_AGENDA_CHAMPS.forEach((slug, i) => {
    const data = champData[i];
    if (!data) return;
    const league = TOURNAMENT_BY_SLUG[slug]?.name || data.tournament?.name || slug;
    for (const list of Object.values(data.matchesByRound)) {
      for (const mt of list) if (inDay(mt.timestamp)) events.push(champMatchToAgenda(mt, league, slug));
    }
  });

  events.sort(sortForBar);
  const byLeague = new Map<string, AgendaEvent[]>();
  for (const e of events) {
    const key = e.league || "Outros";
    const list = byLeague.get(key);
    if (list) list.push(e);
    else byLeague.set(key, [e]);
  }
  return [...byLeague.entries()].map(([league, evs]) => ({ league, events: evs.slice(0, 40) }));
}

// data: objeto Date (qualquer hora do dia desejado, horário do servidor).
export async function getGeneralAgenda(date: Date): Promise<AgendaSportGroup[]> {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  // Fallback ao vivo só vale pra HOJE (matches/live = jogos de agora).
  const now = new Date();
  const isToday = d === now.getDate() && m === now.getMonth() + 1 && y === now.getFullYear();

  // Futebol de fonte confiável (o feed por data está quebrado) — sempre em primeiro.
  const footballGroup: AgendaSportGroup = {
    sport: "Futebol",
    sportSlug: "futebol",
    leagues: await getFootballAgendaForDay(date).catch(() => []),
  };

  const otherGroups = await Promise.all(
    SOURCES.map(async (src) => {
      let data = await fetchAllSports<any>(src.endpoint(d, m, y), 1800).catch(() => null);
      // Fallback: o feed por data às vezes devolve 0 (instável na allsportsapi2). Em HOJE,
      // usa o feed ao vivo do esporte (mesma raiz do endpoint) pra ao menos os ao vivo.
      if (!data?.events?.length && isToday) {
        const liveEp = src.endpoint(d, m, y).replace(/\/\d+\/\d+\/\d+$/, "/live");
        data = await fetchAllSports<any>(liveEp, 60).catch(() => null);
      }
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

  // Futebol sempre primeiro; só os esportes com jogos no dia.
  return [footballGroup, ...otherGroups].filter((g) => g.leagues.length > 0);
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
