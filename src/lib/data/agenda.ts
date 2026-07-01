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
import { saveSnapshot, readSnapshot } from "./snapshot-store";

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

// ===== Futebol de hoje, com CACHE (dev grava, prod lê) =====
// O feed por data (matches/{d}/{m}/{y}) está quebrado. Arquitetura ([[arquitetura_so_dev_consulta_api]]):
// SÓ o dev consulta a API (cron → refreshTodayFootballStore), grava em data/snapshots/agenda/
// (volume COMPARTILHADO); prod e as páginas LEEM o store (getStoredFootballAgenda) — nunca
// computam. Economia: rodada atual (não todas), congela encerrados (não re-consulta), TTL do
// feed curto só p/ liga com jogo ao vivo/próximo, longo no resto.
//
// Campeonatos PRINCIPAIS (nunca "qualquer campeonato do mundo"): Brasileirão A/B/C + Copa do
// Brasil + continentais. Copa do Mundo entra separada (fixtures).
const FOOTBALL_AGENDA_CHAMPS = [
  "brasileirao-serie-a",
  "brasileirao-serie-b",
  "brasileirao-serie-c",
  "copa-do-brasil",
  "libertadores",
  "sudamericana",
];

// [início, fim) do dia em horário de Brasília (00:00 BRT = 03:00 UTC).
function dayBoundsBRT(date: Date): [number, number] {
  const start = Date.UTC(date.getFullYear(), date.getMonth(), date.getDate(), 3, 0, 0) / 1000;
  return [start, start + 24 * 3600];
}

// YYYY-MM-DD no fuso de Brasília (chave do store do dia).
function brDateStr(d: Date = new Date()): string {
  const br = new Date(d.getTime() - 3 * 3600 * 1000);
  return `${br.getUTCFullYear()}-${String(br.getUTCMonth() + 1).padStart(2, "0")}-${String(br.getUTCDate()).padStart(2, "0")}`;
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

function rawFootballEventToAgenda(e: any, league: string, slug: string): AgendaEvent {
  const ts = e.startTimestamp || 0;
  const statusType = e.status?.type || "";
  const homeId = e.homeTeam?.id || 0;
  const awayId = e.awayTeam?.id || 0;
  const home = e.homeTeam?.name || "";
  const away = e.awayTeam?.name || "";
  return {
    id: e.id,
    league,
    home,
    away,
    homeId,
    awayId,
    homeScore: e.homeScore?.current ?? null,
    awayScore: e.awayScore?.current ?? null,
    status:
      translateStatus(e.status?.description) ||
      (statusType === "finished" ? "Encerrado" : statusType === "inprogress" ? "Ao Vivo" : ""),
    statusType,
    time: hhmm(ts),
    timestamp: ts,
    href: homeId && awayId && ts ? championshipMatchHref(slug, ts, homeId, awayId, home, away) : `/futebol/${slug}`,
  };
}

// Jogos de um campeonato num dia — LEVE: só a rodada atual (+ a próxima, p/ virada), não
// TODAS as rodadas (getChampionshipData buscava até ~39 feeds → causava os ~40s). `matchTtl`
// é adaptativo (curto só p/ liga com jogo ao vivo/próximo).
async function champEventsForDay(
  slug: string,
  start: number,
  end: number,
  matchTtl: number
): Promise<AgendaEvent[]> {
  const t = TOURNAMENT_BY_SLUG[slug];
  if (!t || !t.seasonId) return [];
  const roundsData = await fetchAllSports<any>(
    `tournament/${t.id}/season/${t.seasonId}/rounds`,
    21600
  ).catch(() => null);
  const cr = roundsData?.currentRound?.round || 1;
  const total = roundsData?.rounds?.length || cr;
  const targets = [...new Set([cr, cr + 1].filter((r) => r >= 1 && r <= total))];
  const feeds = await Promise.all(
    targets.map((r) =>
      fetchAllSports<any>(`tournament/${t.id}/season/${t.seasonId}/matches/round/${r}`, matchTtl).catch(
        () => null
      )
    )
  );
  const out: AgendaEvent[] = [];
  const seen = new Set<number>();
  for (const f of feeds)
    for (const e of f?.events || []) {
      const ts = e.startTimestamp || 0;
      if (ts < start || ts >= end || seen.has(e.id)) continue;
      seen.add(e.id);
      out.push(rawFootballEventToAgenda(e, t.name, slug));
    }
  return out;
}

// Computa o futebol de um dia das fontes confiáveis. `opts.ttlFor(slug)` = TTL do feed da
// rodada por liga; `opts.frozen` = jogos já encerrados (id→evento) p/ NÃO re-consultar match/{id}.
export async function getFootballAgendaForDay(
  date: Date,
  opts: { ttlFor?: (slug: string) => number; frozen?: Map<number, AgendaEvent> } = {}
): Promise<AgendaLeagueGroup[]> {
  const [start, end] = dayBoundsBRT(date);
  const inDay = (ts?: number) => !!ts && ts >= start && ts < end;
  const nowSec = Date.now() / 1000;
  const ttlFor = opts.ttlFor || (() => 600);
  const frozen = opts.frozen;

  const [fixtures, ...champLists] = await Promise.all([
    getWorldCupFixtures().catch(() => [] as WorldCupFixture[]),
    ...FOOTBALL_AGENDA_CHAMPS.map((s) => champEventsForDay(s, start, end, ttlFor(s))),
  ]);

  const events: AgendaEvent[] = [];

  // Copa: fixtures do dia; status/placar reais por match/{id} nos que já começaram — mas
  // jogo já ENCERRADO no store é congelado (não re-consulta a API).
  const dayFixtures = fixtures.filter((f) => inDay(f.timestamp));
  const wcEvents = await Promise.all(
    dayFixtures.map(async (f) => {
      const fz = frozen?.get(f.id);
      if (fz && fz.statusType === "finished") return fz;
      const ev =
        f.timestamp && f.timestamp <= nowSec ? await getMatchEvent(f.id, f.timestamp).catch(() => null) : null;
      return wcFixtureToAgenda(f, ev);
    })
  );
  events.push(...wcEvents);
  for (const list of champLists) events.push(...list);

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

// ---- Store (volume compartilhado): dev grava, prod/páginas leem ----
interface StoredFootballAgenda {
  date: string; // YYYY-MM-DD (BRT)
  updatedAt: string;
  leagues: AgendaLeagueGroup[];
}

// LEITURA (prod + páginas): só o store de HOJE. NUNCA bate na API. Vazio se o store é de
// outro dia (o cron do dev regenera na virada).
export async function getStoredFootballAgenda(): Promise<AgendaLeagueGroup[]> {
  const snap = await readSnapshot<StoredFootballAgenda>("agenda", "football-today");
  if (!snap || snap.date !== brDateStr()) return [];
  return snap.leagues || [];
}

// REFRESH (só o dev, via cron): computa e grava. Econômico — congela encerrados e usa TTL
// curto no feed da rodada SÓ p/ ligas com jogo ao vivo/prestes a começar.
export async function refreshTodayFootballStore(): Promise<{
  ok: true;
  games: number;
  leagues: number;
}> {
  const today = brDateStr();
  const prev = await readSnapshot<StoredFootballAgenda>("agenda", "football-today");
  const prevGames = prev && prev.date === today ? prev.leagues.flatMap((l) => l.events) : [];

  const frozen = new Map<number, AgendaEvent>();
  const nameToSlug = new Map(
    FOOTBALL_AGENDA_CHAMPS.map((s) => [TOURNAMENT_BY_SLUG[s]?.name || s, s] as const)
  );
  const liveSlugs = new Set<string>();
  const nowSec = Date.now() / 1000;
  for (const g of prevGames) {
    if (g.statusType === "finished") frozen.set(g.id, g);
    const soon = g.timestamp > nowSec && g.timestamp - nowSec < 2 * 3600;
    if (g.statusType === "inprogress" || soon) {
      const slug = nameToSlug.get(g.league);
      if (slug) liveSlugs.add(slug);
    }
  }
  // Feed da rodada: 60s p/ liga com jogo ao vivo/próximo; 30min no resto (economia).
  const ttlFor = (slug: string) => (liveSlugs.has(slug) ? 60 : 1800);

  const leagues = await getFootballAgendaForDay(new Date(), { ttlFor, frozen });
  await saveSnapshot("agenda", "football-today", {
    date: today,
    updatedAt: new Date().toISOString(),
    leagues,
  } satisfies StoredFootballAgenda);

  const games = leagues.reduce((n, l) => n + l.events.length, 0);
  return { ok: true, games, leagues: leagues.length };
}

// data: objeto Date (qualquer hora do dia desejado, horário do servidor).
export async function getGeneralAgenda(date: Date): Promise<AgendaSportGroup[]> {
  const d = date.getDate();
  const m = date.getMonth() + 1;
  const y = date.getFullYear();
  // Fallback ao vivo só vale pra HOJE (matches/live = jogos de agora).
  const now = new Date();
  const isToday = d === now.getDate() && m === now.getMonth() + 1 && y === now.getFullYear();

  // Futebol sempre em primeiro. HOJE: lê o STORE (dev grava via cron; prod só lê — nunca bate
  // na API). Outros dias (seletor de data): computa na hora (leve; futuros = agendados).
  const footballGroup: AgendaSportGroup = {
    sport: "Futebol",
    sportSlug: "futebol",
    leagues: isToday
      ? await getStoredFootballAgenda().catch(() => [])
      : await getFootballAgendaForDay(date).catch(() => []),
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
