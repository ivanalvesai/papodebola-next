import { fetchAllSports } from "@/lib/api/allsports";
import { translateCountry } from "@/lib/i18n/countries";
import { slugifyCategory } from "@/lib/config";
import { BRAZIL_ID } from "@/lib/selecoes";
import { matchDateSlug } from "@/lib/world-cup-match-url";
import { SELECAO_PREFIX } from "./selecao-jogos";
import { readSnapshot, saveSnapshot } from "./snapshot-store";
import { getMatchDetail, injectByMinute, type MatchDetail } from "./match-detail";
import { getMatchComments } from "./match-comments";
import type { NormalizedMatch } from "@/types/match";

/* eslint-disable @typescript-eslint/no-explicit-any */

// AMISTOSOS de seleções acompanhadas (13/11/2026): Brasil, Brasil sub-20, Argentina e Uruguai.
// Entram na barra da home, em /jogos-de-hoje e têm lance a lance em
// /futebol/amistosos/{DD-MM-AAAA}/{casa}-{fora} (o Brasil principal segue na página da
// Seleção, /futebol/selecao-brasileira/...).
//
// Regra de ouro: tudo fica salvo no volume. O ÍNDICE dos jogos vive em
// data/snapshots/amistosos/jogos.json e o lance a lance no snapshot padrão do
// getMatchDetail (data/snapshots/matches/{id}.json). Sem API, a barra e as páginas seguem
// servindo o que já foi arquivado.
//
// Pra acompanhar outra seleção: some o id dela (uniqueTournament não importa; o filtro é o
// nome do torneio conter "Friendly") e, se for nova, baixe a bandeira
// (scripts/download-team-images.mjs).
export const AMISTOSO_TEAM_IDS = [
  BRAZIL_ID, // Brasil
  22672, // Brasil sub-20
  4819, // Argentina
  4725, // Uruguai
];

export const AMISTOSOS_PREFIX = "/futebol/amistosos";
export const AMISTOSOS_LEAGUE = "Amistosos";

export interface AmistosoFixture {
  id: number;
  homeId: number;
  awayId: number;
  home: string;
  away: string;
  timestamp: number;
  tournamentName: string; // "Amistoso internacional" | "Amistoso sub-20"
  uniqueTournamentId?: number;
  homeScore: number | null;
  awayScore: number | null;
  status: string; // notstarted | inprogress | finished | ...
  statusDesc?: string; // "Halftime", "1st half"...
  dateSlug: string;
  pairSlug: string;
}

const INDEX_CAT = "amistosos";
const INDEX_KEY = "jogos";

// "Brazil U20" → "Brasil sub-20"; "Uruguay" → "Uruguai".
export function amistosoTeamName(raw: string): string {
  const m = (raw || "").match(/^(.*?)\s+U-?(\d{2})$/i);
  if (m) return `${translateCountry(m[1])} sub-${m[2]}`;
  return translateCountry(raw || "");
}

function isFriendly(e: any): boolean {
  const n = `${e?.tournament?.uniqueTournament?.name || ""} ${e?.tournament?.name || ""}`;
  return /friendly/i.test(n);
}

function eventToFixture(e: any): AmistosoFixture | null {
  const homeId = e?.homeTeam?.id;
  const awayId = e?.awayTeam?.id;
  if (!e?.id || !homeId || !awayId || !isFriendly(e)) return null;
  const hs = e?.homeScore || {};
  const as = e?.awayScore || {};
  const ts = e?.startTimestamp || 0;
  const home = amistosoTeamName(e?.homeTeam?.name);
  const away = amistosoTeamName(e?.awayTeam?.name);
  const u20 = /U-?20/i.test(`${e?.tournament?.name || ""} ${e?.homeTeam?.name || ""}`);
  return {
    id: e.id,
    homeId,
    awayId,
    home,
    away,
    timestamp: ts,
    tournamentName: u20 ? "Amistoso sub-20" : "Amistoso internacional",
    uniqueTournamentId: e?.tournament?.uniqueTournament?.id,
    homeScore: hs.display ?? hs.current ?? null,
    awayScore: as.display ?? as.current ?? null,
    status: e?.status?.type || "",
    statusDesc: e?.status?.description || "",
    dateSlug: matchDateSlug(ts),
    pairSlug: `${slugifyCategory(home)}-${slugifyCategory(away)}`,
  };
}

// Jogo do Brasil principal tem página na Seleção; os demais, em /futebol/amistosos.
export function amistosoMatchHref(f: Pick<AmistosoFixture, "homeId" | "awayId" | "dateSlug" | "pairSlug">): string {
  if (f.homeId === BRAZIL_ID || f.awayId === BRAZIL_ID) {
    return `${SELECAO_PREFIX}/${f.dateSlug}/${f.pairSlug}`;
  }
  return `${AMISTOSOS_PREFIX}/${f.dateSlug}/${f.pairSlug}`;
}

async function readIndex(): Promise<AmistosoFixture[]> {
  return (await readSnapshot<AmistosoFixture[]>(INDEX_CAT, INDEX_KEY)) || [];
}

async function mergeIndex(fresh: AmistosoFixture[]): Promise<AmistosoFixture[]> {
  const byId = new Map<number, AmistosoFixture>();
  for (const f of await readIndex()) byId.set(f.id, f);
  let changed = false;
  for (const f of fresh) {
    const prev = byId.get(f.id);
    // Encerrado não volta a "ao vivo": o feed matches/live da API às vezes segura o jogo
    // como inprogress horas depois do apito (Japão 3x2 Brasil, 14/11, ficou 2x2 "ao vivo").
    if (prev?.status === "finished" && f.status !== "finished") continue;
    if (!prev || JSON.stringify(prev) !== JSON.stringify(f)) changed = true;
    byId.set(f.id, f);
  }
  const all = [...byId.values()].sort((a, b) => b.timestamp - a.timestamp);
  // Nunca grava índice vazio por cima de um bom (resposta vazia da API).
  if (changed && all.length) await saveSnapshot(INDEX_CAT, INDEX_KEY, all);
  return all;
}

// API: próximos/anteriores de cada seleção (10 min) + feed ao vivo (30 s, cache
// compartilhado com o resto do site) só pro placar dos jogos em andamento.
async function fetchFresh(): Promise<AmistosoFixture[]> {
  const feeds = await Promise.all([
    fetchAllSports<any>("matches/live", 30).catch(() => null),
    ...AMISTOSO_TEAM_IDS.flatMap((id) => [
      fetchAllSports<any>(`team/${id}/matches/next/0`, 600).catch(() => null),
      fetchAllSports<any>(`team/${id}/matches/previous/0`, 600).catch(() => null),
    ]),
  ]);
  const teams = new Set(AMISTOSO_TEAM_IDS);
  const byId = new Map<number, AmistosoFixture>();
  // feed ao vivo primeiro: placar/status mais frescos vencem o do next/previous.
  // Exceção: se o previous já dá o jogo como encerrado, ele vence o live (o feed ao
  // vivo da API deixa jogo fantasma "inprogress" depois do apito).
  for (const feed of feeds) {
    for (const e of (feed as any)?.events || []) {
      if (!teams.has(e?.homeTeam?.id) && !teams.has(e?.awayTeam?.id)) continue;
      const f = eventToFixture(e);
      if (!f) continue;
      const prev = byId.get(f.id);
      if (!prev || (prev.status !== "finished" && f.status === "finished")) byId.set(f.id, f);
    }
  }
  return [...byId.values()];
}

// Índice durável + API. Nunca lança.
export async function getAmistosoFixtures(): Promise<AmistosoFixture[]> {
  try {
    return await mergeIndex(await fetchFresh());
  } catch {
    return readIndex();
  }
}

export async function resolveAmistosoMatch(dateSlug: string, pairSlug: string): Promise<AmistosoFixture | null> {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(dateSlug)) return null;
  const match = (list: AmistosoFixture[]) =>
    list.find((f) => f.dateSlug === dateSlug && f.pairSlug === pairSlug) || null;
  return match(await readIndex()) || match(await getAmistosoFixtures());
}

export async function updateAmistosoFixtureScore(
  id: number,
  patch: Pick<AmistosoFixture, "homeScore" | "awayScore" | "status">
): Promise<void> {
  const list = await readIndex();
  const f = list.find((x) => x.id === id);
  if (!f) return;
  if (f.homeScore === patch.homeScore && f.awayScore === patch.awayScore && f.status === patch.status) return;
  Object.assign(f, patch);
  await saveSnapshot(INDEX_CAT, INDEX_KEY, list);
}

// Encerrado há mais de 6h: serve só o snapshot salvo, sem API (mesma regra da Seleção).
const FREEZE_AFTER_SECS = 6 * 3600;

export async function getAmistosoMatchDetail(f: Pick<AmistosoFixture, "id" | "timestamp">): Promise<MatchDetail | null> {
  const snap = await readSnapshot<MatchDetail>("matches", f.id);
  if (snap?.event?.statusType === "finished" && Date.now() / 1000 - f.timestamp > FREEZE_AFTER_SECS) {
    snap.commentary = injectByMinute(snap.commentary, await getMatchComments(f.id).catch(() => []));
    return snap;
  }
  return getMatchDetail(f.id, f.timestamp);
}

function hhmmBR(ts: number): string {
  return new Date(ts * 1000).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
}
function ddmmyyyyBR(ts: number): string {
  return new Date(ts * 1000).toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", year: "numeric", timeZone: "America/Sao_Paulo" });
}

export function amistosoStatus(f: Pick<AmistosoFixture, "status" | "statusDesc">): NormalizedMatch["status"] {
  if (f.status === "finished") return "finished";
  if (f.status === "inprogress") return /half ?time|intervalo/i.test(f.statusDesc || "") ? "halftime" : "live";
  if (f.status === "postponed") return "postponed";
  if (f.status === "canceled" || f.status === "cancelled") return "cancelled";
  return "scheduled";
}

// Cards da barra da home (Hoje/Próximos) pros amistosos em [fromSec, toSec).
export async function getAmistosoBarMatches(fromSec: number, toSec: number): Promise<NormalizedMatch[]> {
  const list = await getAmistosoFixtures();
  return list
    .filter((f) => f.timestamp >= fromSec && f.timestamp < toSec)
    .map((f) => {
      const status = amistosoStatus(f);
      const date = ddmmyyyyBR(f.timestamp);
      const statusText =
        status === "finished" ? "Encerrado" : status === "halftime" ? "Intervalo" : status === "live" ? "Ao Vivo" : date;
      return {
        id: `ami_${f.id}`,
        apiId: f.id,
        league: AMISTOSOS_LEAGUE,
        leagueId: f.uniqueTournamentId,
        country: "",
        homeTeam: f.home,
        awayTeam: f.away,
        homeScore: status === "scheduled" ? null : f.homeScore,
        awayScore: status === "scheduled" ? null : f.awayScore,
        homeLogo: `/api/team-img/${f.homeId}`,
        awayLogo: `/api/team-img/${f.awayId}`,
        time: hhmmBR(f.timestamp),
        date,
        timestamp: f.timestamp,
        status,
        statusText,
        minute: "",
        category: "all",
        homeId: f.homeId,
        awayId: f.awayId,
        href: amistosoMatchHref(f),
      };
    });
}
