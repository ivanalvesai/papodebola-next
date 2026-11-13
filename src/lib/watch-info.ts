// "Onde assistir": dados editoriais do post (canal de transmissão) guardados no bloco
// Lexical `matchInfo` ("Ficha do jogo"). O resto da ficha (data, hora, estádio, árbitro,
// bandeiras) sai do jogo (post.matchId → snapshot), nunca digitado à mão, pra não divergir.
// Puro (sem Payload) pra rodar no node:test.
import { translateCountry } from "./i18n/countries.ts";
import { TOURNAMENTS } from "./config.ts";
import { groupLabel } from "./group-label.ts";

export interface WatchInfo {
  channels: string;
  confirmed: boolean;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function findBlock(node: any, type: string): any | null {
  if (!node || typeof node !== "object") return null;
  if (node.type === "block" && node.fields?.blockType === type) return node.fields;
  for (const child of node.children || []) {
    const hit = findBlock(child, type);
    if (hit) return hit;
  }
  return null;
}

export function extractWatchInfo(content: any): WatchInfo | null {
  if (!content || typeof content !== "object" || !content.root) return null;
  const f = findBlock(content.root, "matchInfo");
  const channels = String(f?.channels ?? "").trim();
  if (!channels) return null;
  return { channels, confirmed: !!f.channelsConfirmed };
}

// Árbitro do match/{id} da API (campo `referee`). Sem nome → null (a ficha omite a linha).
export function normalizeReferee(e: any): { name: string; country: string } | null {
  const name = String(e?.referee?.name ?? "").trim();
  if (!name) return null;
  const country = String(e?.referee?.country?.name ?? "").trim();
  return { name, country: country ? translateCountry(country) : "" };
}

// Cidades-sede europeias mais comuns em PT (o resto fica como vem da API).
const CITY_PT: Record<string, string> = {
  Amsterdam: "Amsterdã", Belgrade: "Belgrado", London: "Londres", Rome: "Roma", Milan: "Milão",
  Munich: "Munique", Cologne: "Colônia", Vienna: "Viena", Prague: "Praga", Warsaw: "Varsóvia",
  Lisbon: "Lisboa", Brussels: "Bruxelas", Copenhagen: "Copenhague", Stockholm: "Estocolmo",
  Athens: "Atenas", Bucharest: "Bucareste", Budapest: "Budapeste", Sofia: "Sófia",
  Edinburgh: "Edimburgo", Geneva: "Genebra", Zurich: "Zurique", Basel: "Basileia",
  Bratislava: "Bratislava", Ljubljana: "Liubliana", Chisinau: "Chisinau", Luxembourg: "Luxemburgo",
  Seville: "Sevilha", Paris: "Paris", Dublin: "Dublin", Cardiff: "Cardiff", Oslo: "Oslo",
  Helsinki: "Helsinque", Tbilisi: "Tbilisi", Baku: "Baku", Tirana: "Tirana", Minsk: "Minsk",
  Riga: "Riga", Yerevan: "Erevan", Nicosia: "Nicósia", Podgorica: "Podgorica", Belfast: "Belfast",
};

export interface WatchMatch {
  id: number;
  home: string;
  away: string;
  homeId: number;
  awayId: number;
  timestamp: number;
  statusType: string;
  homeScore: number | null;
  awayScore: number | null;
  champSlug: string | null;
  tournament: string;
  group: string;
  round: number | null;
  venue: { stadium: string; city: string; capacity: number | null } | null;
  referee: { name: string; country: string } | null;
  href: string | null;
}

export type MatchHrefFn = (
  champSlug: string, timestamp: number, homeId: number, awayId: number, home: string, away: string
) => string;

// match/{id} cru da API → dados da Ficha do jogo. O href do lance a lance é injetado
// (championshipMatchHref no servidor) pra este arquivo continuar puro.
export function toWatchMatch(e: any, makeHref: MatchHrefFn): WatchMatch | null {
  if (!e?.id || !e?.homeTeam || !e?.awayTeam) return null;
  const utId = e?.tournament?.uniqueTournament?.id;
  const t = Object.values(TOURNAMENTS).find((x) => x.id === utId) || null;
  const home = translateCountry(e.homeTeam.name || "");
  const away = translateCountry(e.awayTeam.name || "");
  const ts = e.startTimestamp || 0;
  const v = e.venue;
  const stadium = String(v?.name || v?.stadium?.name || "").trim();
  const cityRaw = String(v?.city?.name || "").trim();
  const cap = v?.stadium?.capacity ?? v?.capacity;
  const num = (x: any) => (typeof x === "number" ? x : null);
  return {
    id: e.id,
    home,
    away,
    homeId: e.homeTeam.id || 0,
    awayId: e.awayTeam.id || 0,
    timestamp: ts,
    statusType: e?.status?.type || "notstarted",
    homeScore: num(e?.homeScore?.display ?? e?.homeScore?.current),
    awayScore: num(e?.awayScore?.display ?? e?.awayScore?.current),
    champSlug: t?.slug || null,
    tournament: t?.name || String(e?.tournament?.uniqueTournament?.name || e?.tournament?.name || ""),
    group: groupLabel(String(e?.tournament?.name || "")),
    round: num(e?.roundInfo?.round),
    venue: stadium ? { stadium, city: CITY_PT[cityRaw] || cityRaw, capacity: typeof cap === "number" ? cap : null } : null,
    referee: normalizeReferee(e),
    href: t ? makeHref(t.slug, ts, e.homeTeam.id || 0, e.awayTeam.id || 0, home, away) : null,
  };
}

// Marcador que o conversor do bloco matchInfo imprime no HTML do corpo: a página do post
// encaixa o card React da Ficha do jogo exatamente onde o redator pôs o bloco.
export const MATCH_INFO_SLOT = '<div class="pdb-matchinfo-slot"></div>';
export function splitAtMatchInfoSlot(html: string): [string, string] {
  const i = html.indexOf(MATCH_INFO_SLOT);
  if (i < 0) return ["", html];
  return [html.slice(0, i), html.slice(i + MATCH_INFO_SLOT.length)];
}

const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").trim();

// Seleciona posts de onde assistir por tag do campeonato e/ou jogos, ordenados pelo
// horário do jogo (kickoff: matchId → timestamp); post sem jogo conhecido vai pro fim.
export function pickWatchPosts<T extends { tags?: string[]; matchId?: number }>(
  posts: T[],
  opts: { tag?: string; matchIds?: number[] },
  kickoff: Map<number, number>
): T[] {
  const tag = opts.tag ? fold(opts.tag) : "";
  const ids = opts.matchIds ? new Set(opts.matchIds) : null;
  const ko = (p: T) => (p.matchId != null ? kickoff.get(p.matchId) : undefined) ?? Infinity;
  return posts
    .filter((p) => (!tag || (p.tags || []).some((t) => fold(t) === tag)) && (!ids || (p.matchId != null && ids.has(p.matchId))))
    .sort((a, b) => ko(a) - ko(b));
}

// Rótulo do dia do jogo no fuso de Brasília: "Hoje", "Amanhã" ou "Sábado, 14/11".
const BR_DAY = (ts: number) =>
  new Date(ts * 1000).toLocaleDateString("en-CA", { timeZone: "America/Sao_Paulo" }); // YYYY-MM-DD
export function watchDayLabel(ts: number, nowSec: number = Date.now() / 1000): string {
  const d = BR_DAY(ts);
  if (d === BR_DAY(nowSec)) return "Hoje";
  if (d === BR_DAY(nowSec + 86400)) return "Amanhã";
  const s = new Date(ts * 1000).toLocaleDateString("pt-BR", {
    weekday: "long", day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo",
  });
  const label = s.replace(/-feira/, "").replace(/^(\w)/, (c) => c.toUpperCase());
  return label;
}
