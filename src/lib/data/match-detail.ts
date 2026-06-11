import { fetchAllSports } from "@/lib/api/allsports";
import { translateCountry } from "@/lib/i18n/countries";
import { translateStatus } from "@/lib/translations";
import { matchDateSlug, matchPairSlug } from "@/lib/world-cup-match-url";
import { getWorldCupStandings } from "./standings";
import type { StandingsGroup } from "@/types/standings";

/* eslint-disable @typescript-eslint/no-explicit-any */

const WC = { id: 16, seasonId: 58210 } as const;
const GROUP_ROUNDS = [1, 2, 3] as const;

// ---------- Resolução data+slug -> jogo da Copa ----------

export interface WorldCupFixture {
  id: number;
  homeId: number;
  awayId: number;
  home: string;
  away: string;
  timestamp: number;
  round: number;
}

// Lista achatada de todos os jogos de grupo (fixtures estáveis -> TTL longo).
export async function getWorldCupFixtures(): Promise<WorldCupFixture[]> {
  const out: WorldCupFixture[] = [];
  for (const r of GROUP_ROUNDS) {
    const data = await fetchAllSports<any>(
      `tournament/${WC.id}/season/${WC.seasonId}/matches/round/${r}`,
      21600 // 6h: calendário não muda
    );
    for (const e of data?.events || []) {
      out.push({
        id: e.id,
        homeId: e.homeTeam?.id || 0,
        awayId: e.awayTeam?.id || 0,
        home: translateCountry(e.homeTeam?.name || ""),
        away: translateCountry(e.awayTeam?.name || ""),
        timestamp: e.startTimestamp || 0,
        round: r,
      });
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  return out;
}

export async function resolveWorldCupMatch(
  dateSlug: string,
  pairSlug: string
): Promise<WorldCupFixture | null> {
  const fixtures = await getWorldCupFixtures();
  return (
    fixtures.find(
      (f) =>
        matchDateSlug(f.timestamp) === dateSlug &&
        matchPairSlug(f.homeId, f.awayId, f.home, f.away) === pairSlug
    ) || null
  );
}

// Grupo (classificação) que contém os dois times do jogo.
export async function getMatchGroup(
  homeId: number,
  awayId: number
): Promise<StandingsGroup | null> {
  const groups = await getWorldCupStandings();
  return (
    groups.find((g) => {
      const ids = new Set(g.rows.map((r) => r.teamId));
      return ids.has(homeId) && ids.has(awayId);
    }) || null
  );
}

// ---------- Detalhe do jogo (event / incidents / lineups / statistics) ----------

export interface MatchEvent {
  id: number;
  homeId: number;
  awayId: number;
  home: string;
  away: string;
  homeScore: number | null;
  awayScore: number | null;
  statusType: string; // notstarted | inprogress | finished
  statusDesc: string; // PT-BR
  startTimestamp: number;
  periodStart: number; // currentPeriodStartTimestamp (pra cronômetro)
  live: boolean;
}

export interface MatchIncident {
  type: string; // goal | card | substitution | period | injuryTime
  cls: string; // regular | yellow | red | ...
  minute: number | null;
  addedTime: number | null;
  player: string | null;
  assist: string | null;
  playerIn: string | null;
  playerOut: string | null;
  isHome: boolean | null;
  homeScore: number | null;
  awayScore: number | null;
  text: string | null;
}

export interface LineupPlayer {
  id: number;
  name: string;
  number: number | null;
  position: string; // G | D | M | F
  rating: string | null;
  captain: boolean;
}

export interface TeamLineup {
  formation: string | null;
  starters: LineupPlayer[];
  bench: LineupPlayer[];
}

export interface MatchStatItem {
  name: string;
  home: string;
  away: string;
  homeNum: number;
  awayNum: number;
}

export interface MatchDetail {
  event: MatchEvent;
  incidents: MatchIncident[];
  home: TeamLineup | null;
  away: TeamLineup | null;
  stats: MatchStatItem[];
}

function normalizeEvent(e: any): MatchEvent {
  const type = e?.status?.type || "";
  return {
    id: e?.id,
    homeId: e?.homeTeam?.id || 0,
    awayId: e?.awayTeam?.id || 0,
    home: translateCountry(e?.homeTeam?.name || ""),
    away: translateCountry(e?.awayTeam?.name || ""),
    homeScore: e?.homeScore?.current ?? null,
    awayScore: e?.awayScore?.current ?? null,
    statusType: type,
    statusDesc: translateStatus(e?.status?.description) || "",
    startTimestamp: e?.startTimestamp || 0,
    periodStart: e?.time?.currentPeriodStartTimestamp || 0,
    live: type === "inprogress",
  };
}

function normalizeIncidents(raw: any): MatchIncident[] {
  const list: any[] = raw?.incidents || [];
  return list.map((i) => ({
    type: i?.incidentType || "",
    cls: i?.incidentClass || "",
    minute: typeof i?.time === "number" ? i.time : null,
    addedTime: typeof i?.addedTime === "number" ? i.addedTime : null,
    player: i?.player?.name || null,
    assist: i?.assist1?.name || null,
    playerIn: i?.playerIn?.name || null,
    playerOut: i?.playerOut?.name || null,
    isHome: typeof i?.isHome === "boolean" ? i.isHome : null,
    homeScore: typeof i?.homeScore === "number" ? i.homeScore : null,
    awayScore: typeof i?.awayScore === "number" ? i.awayScore : null,
    text: i?.text || null,
  }));
}

function normalizePlayer(p: any): LineupPlayer {
  return {
    id: p?.player?.id || 0,
    name: p?.player?.name || "",
    number: p?.shirtNumber ?? p?.player?.jerseyNumber ?? null,
    position: p?.position || "",
    rating: p?.statistics?.rating ? String(p.statistics.rating) : null,
    captain: !!p?.captain,
  };
}

function normalizeLineup(side: any): TeamLineup | null {
  if (!side || !Array.isArray(side.players)) return null;
  const players: any[] = side.players;
  return {
    formation: side.formation || null,
    starters: players.filter((p) => !p?.substitute).map(normalizePlayer),
    bench: players.filter((p) => p?.substitute).map(normalizePlayer),
  };
}

function toNum(v: any): number {
  if (typeof v === "number") return v;
  const m = String(v ?? "").match(/[\d.]+/);
  return m ? parseFloat(m[0]) : 0;
}

function normalizeStats(raw: any): MatchStatItem[] {
  const periods: any[] = raw?.statistics || [];
  const all = periods.find((p) => p?.period === "ALL") || periods[0];
  if (!all) return [];
  const out: MatchStatItem[] = [];
  for (const g of all.groups || []) {
    for (const it of g.statisticsItems || []) {
      out.push({
        name: it?.name || "",
        home: String(it?.home ?? ""),
        away: String(it?.away ?? ""),
        homeNum: toNum(it?.home),
        awayNum: toNum(it?.away),
      });
    }
  }
  return out;
}

// TTL curto p/ ao vivo, longo p/ encerrado. Recebe o status já conhecido.
function liveTtl(statusType: string, liveSecs = 25, doneSecs = 86400, soonSecs = 600): number {
  if (statusType === "inprogress") return liveSecs;
  if (statusType === "finished") return doneSecs;
  return soonSecs; // notstarted
}

// Detalhe completo (server render inicial). Busca o event primeiro pra saber o
// status e adaptar o TTL do resto (não martela a API em jogo encerrado).
export async function getMatchDetail(id: number): Promise<MatchDetail | null> {
  const eventRaw = await fetchAllSports<any>(`match/${id}`, 30);
  if (!eventRaw?.event) return null;
  const event = normalizeEvent(eventRaw.event);
  const ttl = liveTtl(event.statusType);

  const [incRaw, lineRaw, statRaw] = await Promise.all([
    fetchAllSports<any>(`match/${id}/incidents`, ttl),
    fetchAllSports<any>(`match/${id}/lineups`, event.statusType === "finished" ? 86400 : 3600),
    fetchAllSports<any>(`match/${id}/statistics`, ttl),
  ]);

  return {
    event,
    incidents: normalizeIncidents(incRaw),
    home: normalizeLineup(lineRaw?.home),
    away: normalizeLineup(lineRaw?.away),
    stats: normalizeStats(statRaw),
  };
}

// Versão "live" enxuta pro polling do cliente (sem escalação, que muda pouco).
export interface MatchLive {
  event: MatchEvent;
  incidents: MatchIncident[];
  stats: MatchStatItem[];
}

export async function getMatchLive(id: number): Promise<MatchLive | null> {
  const eventRaw = await fetchAllSports<any>(`match/${id}`, 25);
  if (!eventRaw?.event) return null;
  const event = normalizeEvent(eventRaw.event);
  const ttl = liveTtl(event.statusType);
  const [incRaw, statRaw] = await Promise.all([
    fetchAllSports<any>(`match/${id}/incidents`, ttl),
    fetchAllSports<any>(`match/${id}/statistics`, ttl),
  ]);
  return { event, incidents: normalizeIncidents(incRaw), stats: normalizeStats(statRaw) };
}
