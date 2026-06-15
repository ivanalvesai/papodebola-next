import { fetchAllSports } from "@/lib/api/allsports";
import { getLeagueCategory } from "@/lib/config";
import { translateStatus } from "@/lib/translations";
import { translateCountry } from "@/lib/i18n/countries";
import { SELECAO_BY_ID } from "@/lib/selecoes";
import { worldCupMatchHref } from "@/lib/world-cup-match-url";
import type { NormalizedMatch } from "@/types/match";

/* eslint-disable @typescript-eslint/no-explicit-any */

// uniqueTournament id da Copa do Mundo 2026 no Sofascore/AllSports.
const WORLD_CUP_LEAGUE_ID = 16;

function mapStatus(event: any): {
  status: NormalizedMatch["status"];
  statusText: string;
  minute: string;
} {
  const type = event.status?.type;
  const code = event.status?.code;
  const desc = event.status?.description;

  if (type === "inprogress") {
    if (code === 6) return { status: "live", statusText: "1º Tempo", minute: `${desc || ""}` };
    if (code === 7) return { status: "live", statusText: "2º Tempo", minute: `${desc || ""}` };
    if (code === 41) return { status: "live", statusText: "Prorrogação", minute: `${desc || ""}` };
    return { status: "live", statusText: "Ao Vivo", minute: `${desc || ""}` };
  }

  if (type === "finished") {
    if (code === 120) return { status: "finished", statusText: "AP", minute: "AP" };
    if (code === 110) return { status: "finished", statusText: "Pen.", minute: "Pen." };
    return { status: "finished", statusText: "Encerrado", minute: "Encerrado" };
  }

  if (code === 31) return { status: "halftime", statusText: "Intervalo", minute: "Intervalo" };
  if (type === "postponed") return { status: "postponed", statusText: "Adiado", minute: "Adiado" };
  if (type === "canceled") return { status: "cancelled", statusText: "Cancelado", minute: "Cancelado" };

  return { status: "scheduled", statusText: translateStatus(desc) || "Não iniciado", minute: "" };
}

function normalizeEvent(event: any): NormalizedMatch {
  const { status, statusText, minute } = mapStatus(event);
  const homeId = event.homeTeam?.id;
  const awayId = event.awayTeam?.id;
  const leagueId = event.tournament?.uniqueTournament?.id;

  // Jogo da Copa → nome em PT-BR e link pra página do jogo ao vivo.
  const isWorldCup = leagueId === WORLD_CUP_LEAGUE_ID;
  const inSelecoes = !!SELECAO_BY_ID[homeId] && !!SELECAO_BY_ID[awayId];
  const href =
    isWorldCup && inSelecoes
      ? worldCupMatchHref(event.startTimestamp || 0, homeId, awayId, event.homeTeam?.name, event.awayTeam?.name)
      : undefined;

  const ts = event.startTimestamp ? new Date(event.startTimestamp * 1000) : new Date();

  return {
    id: `api_${event.id}`,
    apiId: event.id,
    league: isWorldCup
      ? "Copa do Mundo"
      : event.tournament?.uniqueTournament?.name || event.tournament?.name || "",
    leagueId,
    country: event.tournament?.category?.name || "",
    homeTeam: isWorldCup ? translateCountry(event.homeTeam?.name || "") : event.homeTeam?.name || "",
    awayTeam: isWorldCup ? translateCountry(event.awayTeam?.name || "") : event.awayTeam?.name || "",
    homeScore: event.homeScore?.current ?? null,
    awayScore: event.awayScore?.current ?? null,
    homeLogo: homeId ? `/img/team/${homeId}/image` : null,
    awayLogo: awayId ? `/img/team/${awayId}/image` : null,
    time: ts.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }),
    date: ts.toISOString().split("T")[0],
    timestamp: event.startTimestamp || 0,
    status,
    statusText,
    minute,
    category: leagueId ? getLeagueCategory(leagueId) : "all",
    homeId,
    awayId,
    href,
  };
}

// Jogos de uma data (offset em dias a partir de hoje). offset=0 hoje, 1 amanha, etc.
async function getMatchesOnOffset(offset: number): Promise<NormalizedMatch[]> {
  const dt = new Date();
  dt.setDate(dt.getDate() + offset);
  const d = dt.getDate();
  const m = dt.getMonth() + 1;
  const y = dt.getFullYear();

  const data = await fetchAllSports<any>(
    `matches/${d}/${m}/${y}`,
    3600
  );

  if (!data?.events) return [];
  return data.events.map(normalizeEvent);
}

export async function getTodayMatches(): Promise<NormalizedMatch[]> {
  return getMatchesOnOffset(0);
}

export async function getTomorrowMatches(): Promise<NormalizedMatch[]> {
  return getMatchesOnOffset(1);
}

// Barra da home durante a Copa: jogos da Copa de hoje + proximos 2 dias, sem
// duplicar e ordenados por horario real. Mostra os jogos de madrugada (ex: 01:00
// do dia seguinte) com a data no card, pra ninguem perder por causa do horario.
export async function getWorldCupBarMatches(): Promise<NormalizedMatch[]> {
  const days = await Promise.all([0, 1, 2].map((o) => getMatchesOnOffset(o).catch(() => [])));
  const seen = new Set<string>();
  const wc: NormalizedMatch[] = [];
  for (const list of days) {
    for (const match of list) {
      if (match.href && !seen.has(match.id)) {
        seen.add(match.id);
        wc.push(match);
      }
    }
  }
  return wc.sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
}

// Campeonatos principais, na ordem que devem aparecer em /futebol. Os que não
// estiverem aqui (ligas menores com jogo no dia) vêm depois, ordenados por
// quantidade de jogos. Mesmos ids da agenda geral (uniqueTournament.id):
// Copa do Mundo, Brasileirão A/B/C/D, Copa do Brasil/Nordeste, Libertadores,
// Sul-Americana, Champions, Europa League, Premier, LaLiga, Serie A, Bundesliga,
// Ligue 1, Eliminatórias.
const FUTEBOL_TODAY_ORDER = [
  16, 325, 390, 1281, 10326, 373, 1596, 384, 480, 7, 679, 17, 8, 23, 35, 34, 11, 13,
];

export interface LeagueMatchGroup {
  leagueId: number;
  league: string;
  matches: NormalizedMatch[];
}

// Ordena ao vivo/intervalo primeiro, depois os que vão começar, encerrados por
// último — e dentro de cada grupo por horário real (mesma lógica da barra "Hoje").
function sortForBar(a: NormalizedMatch, b: NormalizedMatch): number {
  const pr = (s: NormalizedMatch["status"]) =>
    s === "live" || s === "halftime" ? 0 : s === "scheduled" ? 1 : 2;
  const pa = pr(a.status);
  const pb = pr(b.status);
  if (pa !== pb) return pa - pb;
  return (a.timestamp || 0) - (b.timestamp || 0);
}

// Jogos de futebol de hoje, agrupados por campeonato (um carrossel por liga em
// /futebol). Só os campeonatos principais (FUTEBOL_TODAY_ORDER) pra página ficar
// limpa estilo ge.globo — o feed global traz centenas de ligas menores. Na ordem
// definida (Copa do Mundo, Série A/B/C, Copa do Brasil, Libertadores, etc.).
export async function getTodayFootballByLeague(): Promise<LeagueMatchGroup[]> {
  const matches = await getTodayMatches().catch(() => []);
  const allow = new Set(FUTEBOL_TODAY_ORDER);

  const byId = new Map<number, NormalizedMatch[]>();
  for (const m of matches) {
    const id = m.leagueId;
    if (id == null || !allow.has(id)) continue;
    const list = byId.get(id);
    if (list) list.push(m);
    else byId.set(id, [m]);
  }

  const order = new Map(FUTEBOL_TODAY_ORDER.map((id, i) => [id, i]));
  const groups: LeagueMatchGroup[] = [];
  for (const [id, list] of byId) {
    list.sort(sortForBar);
    groups.push({ leagueId: id, league: list[0].league || "Outros", matches: list });
  }

  groups.sort((a, b) => (order.get(a.leagueId) ?? 0) - (order.get(b.leagueId) ?? 0));

  return groups;
}

export async function getLiveMatches(): Promise<NormalizedMatch[]> {
  const data = await fetchAllSports<any>("matches/live", 300);
  if (!data?.events) return [];
  return data.events.map(normalizeEvent);
}
