import { fetchAllSports } from "@/lib/api/allsports";
import { getLeagueCategory, TOURNAMENT_BY_ID } from "@/lib/config";
import { translateStatus } from "@/lib/translations";
import { translateCountry } from "@/lib/i18n/countries";
import { SELECAO_BY_ID } from "@/lib/selecoes";
import { worldCupMatchHref, matchDateSlug, matchPairSlug } from "@/lib/world-cup-match-url";
import { getCBFUpcomingMatches } from "./cbf-calendar";
import {
  getWorldCupKnockoutFixtures,
  getWorldCupKnockoutLiveScores,
  type WorldCupFixture,
  type WorldCupLiveScore,
} from "./match-detail";
import { withSnapshot } from "./snapshot-store";
import type { NormalizedMatch, CBFMatch } from "@/types/match";

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
// 4h30 após o INÍCIO: cobre 90' + intervalo + prorrogação + pênaltis (~3h no pior caso,
// jogo de mata-mata) + ~1h30 de vitrine pós-jogo. Antes eram 3h, e um jogo de mata-mata
// que ia pra prorrogação/pênaltis (terminava ~3h após o apito) sumia da barra quase junto
// com o fim — dava a impressão de "não mostra nada". Ao vivo/intervalo nunca some.
const FINISHED_VISIBLE_AFTER_START_SEC = 4.5 * 3600;
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
  // withSnapshot: a allsportsapi2 às vezes devolve 204/vazio nas rodadas do mata-mata
  // (intermitente). Quando isso acontece, serve a ÚLTIMA lista boa de jogos da Copa
  // (snapshot) em vez de esvaziar → a home não cai pro fallback de ligas durante a Copa.
  // freshMatches re-aplicado no fim tira do snapshot stale os que já encerraram há +1h.
  const r =
    (await withSnapshot<NormalizedMatch[]>(
      "worldcup",
      "bar",
      () => fetchWorldCupBarMatchesLive(),
      (d) => Array.isArray(d) && d.length > 0
    )) || [];
  return freshMatches(r).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
}

// Converte um confronto do cuptrees (mata-mata) pro formato da barra. Vem como
// "agendado" — o placar/ao vivo é preenchido depois pelo polling /api/copa/ao-vivo
// (mesmo id `api_<eventId>` do feed matches/live). Nomes já em PT-BR (translateCountry
// aplicado no getWorldCupKnockoutFixtures).
function knockoutFixtureToBarMatch(f: WorldCupFixture): NormalizedMatch {
  const ts = f.timestamp ? new Date(f.timestamp * 1000) : new Date();
  return {
    id: `api_${f.id}`,
    apiId: f.id,
    league: "Copa do Mundo",
    leagueId: WORLD_CUP_LEAGUE_ID,
    country: "World",
    homeTeam: f.home,
    awayTeam: f.away,
    homeScore: null,
    awayScore: null,
    homeLogo: f.homeId ? `/api/team-img/${f.homeId}` : null,
    awayLogo: f.awayId ? `/api/team-img/${f.awayId}` : null,
    time: ts.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" }),
    date: ts.toISOString().split("T")[0],
    timestamp: f.timestamp || 0,
    status: "scheduled",
    statusText: "Não iniciado",
    minute: "",
    category: getLeagueCategory(WORLD_CUP_LEAGUE_ID),
    homeId: f.homeId,
    awayId: f.awayId,
    href: worldCupMatchHref(f.timestamp || 0, f.homeId, f.awayId, f.home, f.away),
  };
}

// WorldCupLiveScore (statusType do Sofascore) -> campos de status do card da barra.
function liveScoreToBarStatus(
  s: WorldCupLiveScore
): Pick<NormalizedMatch, "status" | "statusText" | "minute"> {
  if (s.statusType === "inprogress" || s.statusType === "interrupted")
    return { status: "live", statusText: s.statusDesc || "Ao Vivo", minute: s.statusDesc || "" };
  if (s.statusType === "finished")
    return { status: "finished", statusText: "Encerrado", minute: "Encerrado" };
  return { status: "scheduled", statusText: s.statusDesc || "Não iniciado", minute: "" };
}

async function fetchWorldCupBarMatchesLive(): Promise<NormalizedMatch[]> {
  // O feed por data (matches/{d}/{m}/{y}) ficou instável na allsportsapi2 (devolve 0
  // eventos pra todas as datas). Buscamos os jogos da Copa pelas RODADAS do torneio —
  // fonte confiável (mesma das páginas de jogo) — e filtramos pra hoje + 2 dias (BR).
  //
  // Pega as rodadas DINAMICAMENTE do endpoint de rounds (grupos 1-3 + mata-mata, que usa
  // números não-sequenciais: 6 R32, 5 R16, 27 QF, 28 SF, 50 3º, 29 Final). Antes era
  // fixo [1,2,3] → no mata-mata a barra ficava VAZIA e a home caía pros jogos gerais do
  // mundo. Fallback pros grupos se o endpoint de rounds falhar.
  //
  // PORÉM no mata-mata o matches/round/{r} volta VAZIO (a API não popula o knockout por
  // rodada) → a barra ficava vazia mesmo com a Copa em andamento. Por isso buscamos
  // TAMBÉM os confrontos do cuptrees (getWorldCupKnockoutFixtures) e mesclamos.
  const [roundsInfo, knockoutFx, liveFeed] = await Promise.all([
    fetchAllSports<any>(
      `tournament/${WORLD_CUP_LEAGUE_ID}/season/${WC_SEASON_ID}/rounds`,
      3600
    ).catch(() => null),
    getWorldCupKnockoutFixtures().catch(() => [] as WorldCupFixture[]),
    // matches/live (feed global ao vivo, TTL curto) — pra o card já NASCER ao vivo no SSR.
    // No mata-mata o card vem do cuptrees como "scheduled"; sem isso o selo AO VIVO/placar
    // dependeria SÓ do polling do cliente (e sumia se o polling tivesse hiccup).
    fetchAllSports<any>("matches/live", 15).catch(() => null),
  ]);
  const roundNums: number[] = (roundsInfo?.rounds || [])
    .map((r: any) => r?.round)
    .filter((n: any) => typeof n === "number");
  const targetRounds = roundNums.length ? roundNums : WC_GROUP_ROUNDS;

  const rounds = await Promise.all(
    targetRounds.map((r) =>
      fetchAllSports<any>(
        `tournament/${WORLD_CUP_LEAGUE_ID}/season/${WC_SEASON_ID}/matches/round/${r}`,
        600
      ).catch(() => null)
    )
  );
  const start = brasiliaDayStartSec(0);
  const end = brasiliaDayStartSec(3); // hoje + 2 dias
  const inWindow = (ts: number) => ts >= start && ts < end;
  const byId = new Map<string, NormalizedMatch>();

  // 1) Rodadas (grupos): já trazem status real. Mata-mata vem vazio aqui.
  for (const data of rounds) {
    for (const e of (data as any)?.events || []) {
      const m = normalizeEvent(e);
      if (inWindow(m.timestamp || 0) && m.href) byId.set(m.id, m);
    }
  }
  // 2) Mata-mata (cuptrees): preenche o que o matches/round não traz (status "scheduled").
  for (const f of knockoutFx) {
    const m = knockoutFixtureToBarMatch(f);
    if (inWindow(m.timestamp || 0) && m.href && !byId.has(m.id)) byId.set(m.id, m);
  }
  // 3) AO VIVO (matches/live, Copa): sobrepõe status/placar nos cards (inclusive nos do
  //    cuptrees, que nasceram "scheduled") → o selo AO VIVO aparece já no SSR, sem depender
  //    só do polling. Preserva href/nomes do card existente; só atualiza o que muda ao vivo.
  const liveWc = ((liveFeed as any)?.events || []).filter(
    (e: any) => e?.tournament?.uniqueTournament?.id === WORLD_CUP_LEAGUE_ID
  );
  for (const e of liveWc) {
    const live = normalizeEvent(e);
    const existing = byId.get(live.id);
    if (existing) {
      byId.set(live.id, {
        ...existing,
        status: live.status,
        statusText: live.statusText,
        minute: live.minute,
        homeScore: live.homeScore,
        awayScore: live.awayScore,
      });
    } else if (inWindow(live.timestamp || 0) && live.href) {
      byId.set(live.id, live);
    }
  }
  // 4) MATA-MATA encerrado/ao vivo via match/{id} (autoritativo). matches/round vem vazio no
  //    knockout e matches/live só traz o que rola AGORA → um jogo recém-ENCERRADO ficaria
  //    "scheduled" sem placar (o cuptrees tem lag). Sobrepõe status+placar nos cards do
  //    cuptrees pra o "Encerrado 2x1" (ou AO VIVO) aparecer já no SSR, sem depender do polling.
  const knockoutScores = await getWorldCupKnockoutLiveScores().catch(
    () => [] as WorldCupLiveScore[]
  );
  for (const s of knockoutScores) {
    const existing = byId.get(`api_${s.id}`);
    if (!existing) continue;
    byId.set(`api_${s.id}`, {
      ...existing,
      ...liveScoreToBarStatus(s),
      homeScore: s.homeScore,
      awayScore: s.awayScore,
    });
  }
  return freshMatches([...byId.values()]).sort((a, b) => (a.timestamp || 0) - (b.timestamp || 0));
}

// Barra da home, aba "Próximos": jogos ATUAIS das ligas brasileiras (Série A/B/C +
// Copa do Brasil) — ao vivo e recém-encerrados (de matches/live, real-time) + os
// próximos agendados (calendário CBF). Mesmo padrão da Copa: freshMatches tira o jogo
// ~1h após o fim, e ao vivo vem primeiro. Cada card é clicável pro lance a lance.
const BR_BAR_LEAGUE_IDS = new Set([325, 390, 1281, 373]); // Série A, B, C, Copa do Brasil

function leagueMatchHref(m: NormalizedMatch): string | undefined {
  const t = m.leagueId != null ? TOURNAMENT_BY_ID[m.leagueId] : undefined;
  if (!t || !m.homeId || !m.awayId || !m.timestamp) return undefined;
  return `/futebol/${t.slug}/jogo/${matchDateSlug(m.timestamp)}/${matchPairSlug(
    m.homeId,
    m.awayId,
    m.homeTeam,
    m.awayTeam
  )}`;
}

// Barra da home com as ligas BR separada em duas abas:
// - `today`:    jogos de HOJE (Brasília) — ao vivo/recém-encerrados (matches/live) +
//               agendados de hoje vindos do calendário CBF (fonte confiável; o feed
//               por data da API anda quebrado devolvendo 0). Estes recebem o polling
//               de placar ao vivo (LiveScoreProvider) na home.
// - `upcoming`: jogos dos PRÓXIMOS DIAS (a partir de amanhã, Brasília), só CBF.
// Antes tudo caía numa lista só que virava a aba "Próximos" — os jogos de hoje que
// ainda não tinham começado ficavam em "Próximos" em vez de "Hoje".
export interface BrazilianBarMatches {
  today: NormalizedMatch[];
  upcoming: NormalizedMatch[];
}

function cbfToNormalized(c: CBFMatch): NormalizedMatch {
  return {
    id: `cbf_${c.id}`,
    apiId: 0,
    league: c.championship || "",
    leagueId: undefined as unknown as number,
    country: "Brasil",
    homeTeam: c.home,
    awayTeam: c.away,
    homeScore: null,
    awayScore: null,
    homeLogo: c.homeId ? `/api/team-img/${c.homeId}` : null,
    awayLogo: c.awayId ? `/api/team-img/${c.awayId}` : null,
    time: c.time,
    date: c.date,
    timestamp: c.timestamp,
    status: "scheduled" as const,
    statusText: c.date,
    minute: "",
    category: "brasil",
    homeId: c.homeId ?? undefined,
    awayId: c.awayId ?? undefined,
    href: c.href,
  };
}

// Junta listas da barra, deduplicando pelo PAR de times. Cards ao vivo/encerrados
// (id `api_*`, com placar e status reais) vencem os agendados do CBF (`cbf_*`) do
// mesmo confronto. Ordena ao-vivo-primeiro (sortForBar).
export function mergeBarMatches(...lists: NormalizedMatch[][]): NormalizedMatch[] {
  const all = lists
    .flat()
    .sort((a, b) => (a.id.startsWith("cbf_") ? 1 : 0) - (b.id.startsWith("cbf_") ? 1 : 0));
  const seen = new Set<number>();
  const out: NormalizedMatch[] = [];
  for (const m of all) {
    const key = m.homeId && m.awayId ? m.homeId * 1e6 + m.awayId : 0;
    if (key && seen.has(key)) continue;
    if (key) seen.add(key);
    out.push(m);
  }
  return out.sort(sortForBar);
}

export async function getBrazilianBarMatches(): Promise<BrazilianBarMatches> {
  const [todayRaw, cbf] = await Promise.all([
    getTodayMatches().catch(() => []),
    getCBFUpcomingMatches().catch(() => []),
  ]);

  const todayStart = brasiliaDayStartSec(0);
  const todayEnd = brasiliaDayStartSec(1);

  // 1) Ao vivo / recém-encerrados das ligas BR (matches/live é real-time), com link.
  //    São sempre de hoje.
  const live = freshMatches(todayRaw)
    .filter((m) => m.leagueId != null && BR_BAR_LEAGUE_IDS.has(m.leagueId))
    .map((m) => ({ ...m, href: m.href ?? leagueMatchHref(m) }));

  // 2) Agendados (calendário CBF) → NormalizedMatch, separados por dia (Brasília).
  const scheduled = cbf.filter((c) => c.homeId && c.awayId).map(cbfToNormalized);
  const scheduledToday = scheduled.filter(
    (m) => m.timestamp >= todayStart && m.timestamp < todayEnd
  );
  const scheduledFuture = scheduled.filter((m) => m.timestamp >= todayEnd);

  return {
    today: mergeBarMatches(live, scheduledToday),
    upcoming: mergeBarMatches(scheduledFuture),
  };
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

// Fallback da barra "Hoje" quando NÃO há jogo da Copa: filtra os jogos de hoje pras
// ligas RELEVANTES (FUTEBOL_TODAY_ORDER) — NUNCA o feed global (matches/live traz
// centenas de ligas menores do mundo). Com link pro lance a lance. Evita o "todos os
// jogos do mundo" na barra (que aparecia quando a Copa entrou no mata-mata ou em hiccup).
// Ligas que NÃO entram na barra ao vivo da HOME (mas seguem em /futebol e na própria
// página do campeonato). Série D fica fora da home a pedido (muitos jogos, poluiria a barra).
const HOME_BAR_EXCLUDE = new Set([10326]); // Brasileirão Série D

export function relevantBarMatches(matches: NormalizedMatch[]): NormalizedMatch[] {
  const allow = new Set(FUTEBOL_TODAY_ORDER);
  return matches
    .filter((m) => m.leagueId != null && allow.has(m.leagueId) && !HOME_BAR_EXCLUDE.has(m.leagueId))
    .map((m) => ({ ...m, href: m.href ?? leagueMatchHref(m) }))
    .sort(sortForBar);
}

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
