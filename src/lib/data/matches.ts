import { fetchAllSports } from "@/lib/api/allsports";
import { getLeagueCategory } from "@/lib/config";
import { translateStatus } from "@/lib/translations";
import { translateCountry } from "@/lib/i18n/countries";
import { SELECAO_BY_ID } from "@/lib/selecoes";
import { worldCupMatchHref } from "@/lib/world-cup-match-url";
import type { NormalizedMatch } from "@/types/match";

/* eslint-disable @typescript-eslint/no-explicit-any */

// uniqueTournament id da Copa do Mundo 2026 no Sofascore/AllSports.
export const WORLD_CUP_LEAGUE_ID = 16;

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
    homeLogo: homeId ? `/api/team-img/${homeId}` : null,
    awayLogo: awayId ? `/api/team-img/${awayId}` : null,
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

// ===== "Hoje" em horário de Brasília =====
// O feed matches/{d}/{m}/{y} é por data UTC e o servidor roda em UTC. Um dia de
// Brasília (UTC-3) vai de 03:00 UTC até 03:00 UTC do dia seguinte → cai em DOIS
// feeds UTC. Por isso "matches/hoje" sozinho vazava os jogos do fim de noite de
// ontem (que já viraram UTC do dia seguinte) e ainda perdia os da madrugada de hoje.

// Início (epoch s) do dia de Brasília, com 'offset' dias a partir de hoje.
function brasiliaDayStartSec(offset = 0): number {
  const nowBr = new Date(Date.now() - 3 * 3600 * 1000);
  return (
    Date.UTC(nowBr.getUTCFullYear(), nowBr.getUTCMonth(), nowBr.getUTCDate() + offset) / 1000 +
    3 * 3600
  );
}

// Jogo só fica visível até ~1h após o apito. Sem hora de fim na API, estimamos fim
// = início + 2h (90' + intervalo + acréscimos) e damos +1h de tolerância → some 3h
// após o INÍCIO. Baseado em TEMPO (não no status), porque o status pode vir velho do
// proxy (jogo encerrado aparecendo como "notstarted") — pelo horário de início a
// gente acerta sempre. Ao vivo/intervalo nunca some (jogo pode esticar). Use só onde
// o foco é "o que vem" (barra, agenda) — não em telas de resultados/encerrados.
const FINISHED_VISIBLE_AFTER_START_SEC = 3 * 3600;
export function freshMatches(list: NormalizedMatch[]): NormalizedMatch[] {
  const now = Date.now() / 1000;
  return list.filter((m) => {
    if (m.status === "live" || m.status === "halftime") return true;
    return now < (m.timestamp || 0) + FINISHED_VISIBLE_AFTER_START_SEC;
  });
}

async function fetchMatchesByUtcDate(dt: Date): Promise<NormalizedMatch[]> {
  const data = await fetchAllSports<any>(
    `matches/${dt.getUTCDate()}/${dt.getUTCMonth() + 1}/${dt.getUTCFullYear()}`,
    3600
  );
  let events: any[] = data?.events || [];
  // Fallback: o feed por data da allsportsapi2 às vezes devolve 0 eventos (instável).
  // Nesse caso usa o feed AO VIVO (matches/live) — ao menos os jogos em andamento
  // aparecem. O chamador (getBrasiliaDayMatches) filtra pelo intervalo do dia.
  if (events.length === 0) {
    const live = await fetchAllSports<any>("matches/live", 60).catch(() => null);
    events = (live as any)?.events || [];
  }
  return events.map(normalizeEvent);
}

// Jogos de UM dia de Brasília (offset em dias). Busca os 2 feeds UTC que cobrem o dia
// e filtra pelo intervalo real de Brasília [00:00, 24:00). Dedupe por id. Mantém
// encerrados — quem quer só os recentes aplica freshMatches() em cima.
async function getBrasiliaDayMatches(offset: number): Promise<NormalizedMatch[]> {
  const dayStart = brasiliaDayStartSec(offset);
  const dayEnd = dayStart + 24 * 3600;
  const [a, b] = await Promise.all([
    fetchMatchesByUtcDate(new Date(dayStart * 1000)).catch(() => []),
    fetchMatchesByUtcDate(new Date((dayStart + 24 * 3600) * 1000)).catch(() => []),
  ]);
  const seen = new Set<string>();
  const out: NormalizedMatch[] = [];
  for (const match of [...a, ...b]) {
    const ts = match.timestamp || 0;
    if (ts < dayStart || ts >= dayEnd || seen.has(match.id)) continue;
    seen.add(match.id);
    out.push(match);
  }
  return out;
}

export async function getTodayMatches(): Promise<NormalizedMatch[]> {
  return getBrasiliaDayMatches(0);
}

export async function getTomorrowMatches(): Promise<NormalizedMatch[]> {
  return getBrasiliaDayMatches(1);
}

// Barra da home durante a Copa: jogos da Copa de hoje + proximos 2 dias (Brasília),
// SEM os encerrados há +1h (freshMatches), ordenados por horario real. Os jogos de
// madrugada do dia seguinte aparecem com a data no card.
const WC_SEASON_ID = 58210; // Copa do Mundo 2026
const WC_GROUP_ROUNDS = [1, 2, 3];

export async function getWorldCupBarMatches(): Promise<NormalizedMatch[]> {
  // O feed por data (matches/{d}/{m}/{y}) ficou instável na allsportsapi2 (devolve 0
  // eventos pra todas as datas). Buscamos os jogos da Copa pelas RODADAS do torneio —
  // fonte confiável (mesma das páginas de jogo) — e filtramos pra hoje + 2 dias (BR).
  const rounds = await Promise.all(
    WC_GROUP_ROUNDS.map((r) =>
      fetchAllSports<any>(
        `tournament/${WORLD_CUP_LEAGUE_ID}/season/${WC_SEASON_ID}/matches/round/${r}`,
        600
      ).catch(() => null)
    )
  );
  const start = brasiliaDayStartSec(0);
  const end = brasiliaDayStartSec(3); // hoje + 2 dias
  const seen = new Set<string>();
  const wc: NormalizedMatch[] = [];
  for (const data of rounds) {
    for (const e of (data as any)?.events || []) {
      const m = normalizeEvent(e);
      const ts = m.timestamp || 0;
      if (ts >= start && ts < end && m.href && !seen.has(m.id)) {
        seen.add(m.id);
        wc.push(m);
      }
    }
  }
  return freshMatches(wc).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
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
  // freshMatches: tira os encerrados há +1h pra os carrosséis priorizarem o que vem.
  const matches = freshMatches(await getTodayMatches().catch(() => []));
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

// Jogos da Copa do Mundo ao vivo AGORA (dado fresco, 30s) — pro cron de "começou
// o jogo". Filtra pelo torneio da Copa (id 16), então pega QUALQUER fase (grupos,
// oitavas, final…) que a API marcar como ao vivo, sem precisar de lista fixa.
export async function getWorldCupLiveMatches(): Promise<NormalizedMatch[]> {
  const data = await fetchAllSports<any>("matches/live", 30);
  if (!data?.events) return [];
  return data.events
    .map(normalizeEvent)
    .filter((m: NormalizedMatch) => m.leagueId === WORLD_CUP_LEAGUE_ID);
}
