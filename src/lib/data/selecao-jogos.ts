import { fetchAllSports } from "@/lib/api/allsports";
import { translateCountry } from "@/lib/i18n/countries";
import { BRAZIL_ID, SELECAO_BY_ID } from "@/lib/selecoes";
import { matchDateSlug, matchPairSlug } from "@/lib/world-cup-match-url";
import { readSnapshot, saveSnapshot } from "./snapshot-store";
import { getMatchDetail, injectByMinute, type MatchDetail } from "./match-detail";
import { getMatchComments } from "./match-comments";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Jogos da Seleção Brasileira FORA da Copa (amistosos, Eliminatórias...):
// /futebol/selecao-brasileira/{DD-MM-AAAA}/{casa}-{fora}
//
// Durabilidade: todo jogo visto entra num ÍNDICE salvo no volume
// (data/snapshots/selecao/jogos.json). O lance a lance completo fica no snapshot
// padrão do getMatchDetail (data/snapshots/matches/{id}.json). Se a API sair do ar,
// a página e o hub continuam servindo o que já foi arquivado.

export interface SelecaoFixture {
  id: number;
  homeId: number;
  awayId: number;
  home: string;
  away: string;
  timestamp: number;
  tournamentName: string;
  homeScore: number | null;
  awayScore: number | null;
  status: string; // notstarted | inprogress | finished | ...
  dateSlug: string;
  pairSlug: string;
}

const INDEX_CAT = "selecao";
const INDEX_KEY = "jogos";
export const SELECAO_PREFIX = "/futebol/selecao-brasileira";

const TOURNAMENT_PT: Record<string, string> = {
  "International Friendly Games": "Amistoso internacional",
  "Int. Friendly Games": "Amistoso internacional",
  "World Cup Qual. CONMEBOL": "Eliminatórias da Copa",
  "World Cup Qualification CONMEBOL": "Eliminatórias da Copa",
  "Copa América": "Copa América",
  "World Cup": "Copa do Mundo",
};

function tournamentPt(name: string): string {
  return TOURNAMENT_PT[name] || name || "Seleção Brasileira";
}

function teamName(id: number, raw: string): string {
  return SELECAO_BY_ID[id]?.name || translateCountry(raw || "");
}

function eventToFixture(e: any): SelecaoFixture | null {
  const homeId = e?.homeTeam?.id;
  const awayId = e?.awayTeam?.id;
  if (!e?.id || !homeId || !awayId) return null;
  if (homeId !== BRAZIL_ID && awayId !== BRAZIL_ID) return null;
  // Filtro pelo id da seleção principal masculina (sub-20 e feminina têm outros ids na API)
  const hs = e?.homeScore || {};
  const as = e?.awayScore || {};
  const ts = e?.startTimestamp || 0;
  const home = teamName(homeId, e?.homeTeam?.name);
  const away = teamName(awayId, e?.awayTeam?.name);
  return {
    id: e.id,
    homeId,
    awayId,
    home,
    away,
    timestamp: ts,
    tournamentName: tournamentPt(e?.tournament?.uniqueTournament?.name || e?.tournament?.name || ""),
    homeScore: hs.display ?? hs.current ?? null,
    awayScore: as.display ?? as.current ?? null,
    status: e?.status?.type || "",
    dateSlug: matchDateSlug(ts),
    pairSlug: matchPairSlug(homeId, awayId, home, away),
  };
}

export function selecaoMatchHref(f: Pick<SelecaoFixture, "dateSlug" | "pairSlug">): string {
  return `${SELECAO_PREFIX}/${f.dateSlug}/${f.pairSlug}`;
}

async function readIndex(): Promise<SelecaoFixture[]> {
  return (await readSnapshot<SelecaoFixture[]>(INDEX_CAT, INDEX_KEY)) || [];
}

// Une o índice salvo com os jogos novos (o mais recente da API vence) e grava.
async function mergeIndex(fresh: SelecaoFixture[]): Promise<SelecaoFixture[]> {
  const byId = new Map<number, SelecaoFixture>();
  for (const f of await readIndex()) byId.set(f.id, f);
  let changed = false;
  for (const f of fresh) {
    const prev = byId.get(f.id);
    if (!prev || JSON.stringify(prev) !== JSON.stringify(f)) changed = true;
    byId.set(f.id, f);
  }
  const all = [...byId.values()].sort((a, b) => b.timestamp - a.timestamp);
  if (changed) await saveSnapshot(INDEX_CAT, INDEX_KEY, all);
  return all;
}

// Busca na API os jogos recentes/próximos/ao vivo do Brasil (TTL curto só pro ao vivo).
async function fetchFreshFixtures(): Promise<SelecaoFixture[]> {
  const [live, prev, next] = await Promise.all([
    fetchAllSports<any>("matches/live", 30).catch(() => null),
    fetchAllSports<any>(`team/${BRAZIL_ID}/matches/previous/0`, 600).catch(() => null),
    fetchAllSports<any>(`team/${BRAZIL_ID}/matches/next/0`, 600).catch(() => null),
  ]);
  const out: SelecaoFixture[] = [];
  const seen = new Set<number>();
  // live primeiro: placar/status mais frescos vencem o do previous/next
  for (const feed of [live, prev, next]) {
    for (const e of (feed as any)?.events || []) {
      const f = eventToFixture(e);
      if (!f || seen.has(f.id)) continue;
      seen.add(f.id);
      out.push(f);
    }
  }
  return out;
}

// Lista de jogos da Seleção (índice durável + API). Nunca lança.
export async function getSelecaoFixtures(): Promise<SelecaoFixture[]> {
  try {
    const fresh = await fetchFreshFixtures();
    return await mergeIndex(fresh);
  } catch {
    return readIndex();
  }
}

// Resolve data + confronto -> jogo. Primeiro o índice salvo (não depende da API);
// se não achar, consulta a API e atualiza o índice.
export async function resolveSelecaoMatch(
  dateSlug: string,
  pairSlug: string
): Promise<SelecaoFixture | null> {
  if (!/^\d{2}-\d{2}-\d{4}$/.test(dateSlug)) return null;
  const match = (list: SelecaoFixture[]) =>
    list.find((f) => f.dateSlug === dateSlug && f.pairSlug === pairSlug) || null;
  const saved = match(await readIndex());
  if (saved) return saved;
  return match(await getSelecaoFixtures());
}

// Atualiza placar/status de um jogo no índice (chamado pela página com o detalhe fresco).
export async function updateSelecaoFixtureScore(
  id: number,
  patch: Pick<SelecaoFixture, "homeScore" | "awayScore" | "status">
): Promise<void> {
  const list = await readIndex();
  const f = list.find((x) => x.id === id);
  if (!f) return;
  if (f.homeScore === patch.homeScore && f.awayScore === patch.awayScore && f.status === patch.status) return;
  Object.assign(f, patch);
  await saveSnapshot(INDEX_CAT, INDEX_KEY, list);
}

// Depois deste tempo desde o apito inicial, um jogo ENCERRADO fica congelado: a página
// serve só o snapshot salvo no volume e não consulta mais a API. As 6h dão folga pro
// provedor fechar estatísticas/notas e pra captura agendada gravar o estado final.
const FREEZE_AFTER_SECS = 6 * 3600;

export async function getSelecaoMatchDetail(f: Pick<SelecaoFixture, "id" | "timestamp">): Promise<MatchDetail | null> {
  const snap = await readSnapshot<MatchDetail>("matches", f.id);
  if (snap?.event?.statusType === "finished" && Date.now() / 1000 - f.timestamp > FREEZE_AFTER_SECS) {
    // Comentários editoriais do /cms continuam entrando (vêm do banco, não da API).
    snap.commentary = injectByMinute(snap.commentary, await getMatchComments(f.id).catch(() => []));
    return snap;
  }
  return getMatchDetail(f.id, f.timestamp);
}
