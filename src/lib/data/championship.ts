import { fetchAllSports } from "@/lib/api/allsports";
import { TOURNAMENT_BY_SLUG } from "@/lib/config";
import { translateStatus } from "@/lib/translations";
import { getStandings } from "./standings";
import { withSnapshot } from "./snapshot-store";
import type { ChampionshipData, RoundRef } from "@/types/tournament";
import type { ChampionshipMatch } from "@/types/match";

/* eslint-disable @typescript-eslint/no-explicit-any */

// Rótulos PT dos rounds de mata-mata (por slug da API). Fallback: o `name` da API.
// Convenção "avos de final": o número = quantidade de CONFRONTOS (= times/2). Logo,
// Round of 32 (32 times, 16 jogos) = "16 avos de final".
const KO_LABEL: Record<string, string> = {
  "round-of-128": "64 avos de final",
  "round-of-64": "32 avos de final",
  "round-of-32": "16 avos de final",
  "round-of-16": "Oitavas de final",
  quarterfinals: "Quartas de final",
  "quarter-finals": "Quartas de final",
  semifinals: "Semifinal",
  "semi-finals": "Semifinal",
  final: "Final",
  "3rd-place": "Disputa de 3º lugar",
  "third-place": "Disputa de 3º lugar",
};
// Ordem do chaveamento (pra listar 32avos → oitavas → quartas → semi → final).
const KO_RANK: Record<string, number> = {
  "round-of-128": 1,
  "round-of-64": 2,
  "round-of-32": 3,
  "round-of-16": 4,
  quarterfinals: 5,
  "quarter-finals": 5,
  semifinals: 6,
  "semi-finals": 6,
  "3rd-place": 7,
  "third-place": 7,
  final: 8,
};
const koLabel = (slug?: string, name?: string) =>
  (slug && KO_LABEL[slug]) || name || "Fase final";

// Monta a lista ordenada de rounds (grupos por número; mata-mata por chaveamento).
function buildRoundList(apiRounds: any[]): { list: RoundRef[]; groupRounds: number[] } {
  const group: RoundRef[] = [];
  const ko: RoundRef[] = [];
  for (const r of apiRounds || []) {
    if (r?.slug) {
      ko.push({ key: r.slug, round: r.round, slug: r.slug, label: koLabel(r.slug, r.name), knockout: true });
    } else if (typeof r?.round === "number") {
      group.push({ key: String(r.round), round: r.round, label: `Rodada ${r.round}`, knockout: false });
    }
  }
  group.sort((a, b) => a.round - b.round);
  ko.sort((a, b) => (KO_RANK[a.slug!] ?? 99) - (KO_RANK[b.slug!] ?? 99));
  return { list: [...group, ...ko], groupRounds: group.map((r) => r.round) };
}

// Path do feed de jogos de um round (mata-mata precisa do slug pra não colidir com a
// rodada de grupo de mesmo número).
function roundMatchesPath(id: number, seasonId: number, ref: RoundRef): string {
  return ref.knockout
    ? `tournament/${id}/season/${seasonId}/matches/round/${ref.round}/slug/${ref.slug}`
    : `tournament/${id}/season/${seasonId}/matches/round/${ref.round}`;
}

function normalizeMatch(event: any, round: number): ChampionshipMatch {
  return {
    id: event.id,
    home: event.homeTeam?.name || "",
    away: event.awayTeam?.name || "",
    homeId: event.homeTeam?.id || 0,
    awayId: event.awayTeam?.id || 0,
    homeScore: event.homeScore?.current ?? null,
    awayScore: event.awayScore?.current ?? null,
    status: event.status?.type || "",
    statusDesc: translateStatus(event.status?.description) || "",
    timestamp: event.startTimestamp || 0,
    round,
  };
}

// Placares ao vivo da rodada atual de um campeonato — consumido pelo polling da
// tabela (selo AO VIVO + placar). TTL curto só na rodada atual; a lista de rounds
// (pra achar a current) é cacheada 6h.
export interface ChampionshipLiveScore {
  id: number;
  homeScore: number | null;
  awayScore: number | null;
  statusType: string; // notstarted | inprogress | finished
  statusDesc: string;
}

// Porteira do ao vivo: janela em torno do horário marcado (abre 5min antes, fica ~3h20).
const LIVE_GATE_BEFORE_S = 5 * 60;
const LIVE_GATE_AFTER_S = 200 * 60;

export async function getChampionshipLiveScores(
  slug: string
): Promise<ChampionshipLiveScore[]> {
  const tournament = TOURNAMENT_BY_SLUG[slug];
  if (!tournament || !tournament.seasonId) return [];

  // Porteira: só consulta o feed AO VIVO (TTL 20s) se há jogo da liga na janela. Usa a
  // agenda já cacheada/snapshot (getChampionshipData) → custo ~zero. Antes, o polling da
  // tabela batia no matches/round a cada 20s mesmo horas ANTES do jogo começar.
  const cd = await getChampionshipData(slug);
  if (!cd) return [];
  const now = Date.now() / 1000;
  const inWindow = Object.values(cd.matchesByRound)
    .flat()
    .some((m) => {
      if (!m.timestamp) return false;
      const delta = now - m.timestamp;
      return delta >= -LIVE_GATE_BEFORE_S && delta <= LIVE_GATE_AFTER_S;
    });
  if (!inWindow) return [];

  const { id, seasonId } = tournament;
  // Round atual pode ser mata-mata (precisa do slug). Usa o roundList/currentRoundKey.
  const curRef =
    (cd.roundList || []).find((r) => r.key === cd.currentRoundKey) ||
    ({ key: String(cd.currentRound || 1), round: cd.currentRound || 1, label: "", knockout: false } as RoundRef);

  const data = await fetchAllSports<any>(
    roundMatchesPath(id, seasonId, curRef),
    20 // curto: placar ao vivo
  );
  return (data?.events || []).map((e: any) => ({
    id: e.id,
    homeScore: e.homeScore?.current ?? null,
    awayScore: e.awayScore?.current ?? null,
    statusType: e.status?.type || "",
    statusDesc: translateStatus(e.status?.description) || "",
  }));
}

// Tabela + jogos do campeonato. Salva snapshot quando vem dado real e serve o snapshot
// quando a API falha/esvazia (ver snapshot-store) → não perde a tabela depois do torneio.
export async function getChampionshipData(slug: string): Promise<ChampionshipData | null> {
  return withSnapshot<ChampionshipData>(
    "championships",
    slug,
    () => fetchChampionshipDataLive(slug),
    (d) => (d.standings?.[0]?.rows?.length ?? 0) > 0 || Object.keys(d.matchesByRound || {}).length > 0
  );
}

async function fetchChampionshipDataLive(
  slug: string
): Promise<ChampionshipData | null> {
  const tournament = TOURNAMENT_BY_SLUG[slug];
  if (!tournament || !tournament.seasonId) return null;

  const { id, seasonId, name } = tournament;

  // Fetch rounds info
  const roundsData = await fetchAllSports<any>(
    `tournament/${id}/season/${seasonId}/rounds`,
    21600
  );

  const currentRound = roundsData?.currentRound?.round || 1;
  const currentRoundKey = roundsData?.currentRound?.slug || String(currentRound);
  const { list: allRounds, groupRounds } = buildRoundList(roundsData?.rounds || []);
  const hasKnockout = allRounds.some((r) => r.knockout);
  // Fallback (API não trouxe rounds): liga sequencial de 38 rodadas.
  const roundRefs: RoundRef[] = allRounds.length
    ? allRounds
    : Array.from({ length: 38 }, (_, i) => ({ key: String(i + 1), round: i + 1, label: `Rodada ${i + 1}`, knockout: false }));

  // Fetch standings (pode ter N grupos — Série D tem 16)
  const standings = await getStandings(id, seasonId, 21600);

  // Rodada corrente REAL: alguns feeds devolvem currentRound.round DEFASADO — ex.: Série A
  // 2026 voltou currentRound=4 com a tabela já em J=18, e só as rodadas 1..5 carregavam
  // (o resto sumia do seletor). A classificação é a fonte confiável de quantas rodadas já
  // rolaram (maior "matches" disputado), então corrigimos a rodada corrente por ela. Só
  // pra liga sequencial: no mata-mata a "current" é um slug/chaveamento, não número.
  const maxPlayed = standings.reduce(
    (mx, g) => g.rows.reduce((m, r) => Math.max(m, r.matches || 0), mx),
    0
  );
  const effectiveCurrent = hasKnockout ? currentRound : Math.max(currentRound, maxPlayed);

  // Quais rounds buscar:
  // - Torneio com mata-mata (Série D): busca TODOS os rounds de grupo (fase curta, ~10) +
  //   todos os do mata-mata. A "current" aponta pro KO, então o antigo "currentRound+1"
  //   não serve.
  // - Liga sequencial (Série A/B/C): mantém a otimização — só até effectiveCurrent+1 (evita
  //   38 requests). Rounds futuros continuam no seletor, só sem jogos carregados ainda.
  const groupRefs = roundRefs.filter((r) => !r.knockout);
  const koRefs = roundRefs.filter((r) => r.knockout);
  const groupToFetch = hasKnockout
    ? groupRefs
    : groupRefs.filter((r) => r.round <= Math.min(groupRefs.length || 38, effectiveCurrent + 1));
  const toFetch = [...groupToFetch, ...koRefs];

  // Em PARALELO (o semáforo do fetchAllSports limita a 2 simultâneas + retry em 429).
  // Past group rounds (< current) TTL 24h; atual/próxima e mata-mata → 6h.
  const roundData = await Promise.all(
    toFetch.map((ref) =>
      fetchAllSports<any>(
        roundMatchesPath(id, seasonId, ref),
        !ref.knockout && ref.round < effectiveCurrent ? 86400 : 21600
      ).then((data) => ({ ref, data }))
    )
  );
  const matchesByRound: Record<string, ChampionshipMatch[]> = {};
  for (const { ref, data } of roundData) {
    if (data?.events?.length) {
      matchesByRound[ref.key] = data.events.map((e: any) => normalizeMatch(e, ref.round));
    }
  }

  // Dropa APENAS rounds de mata-mata sem jogos (ex.: "Round of 64" placeholder vazio).
  // Rounds de grupo ficam no seletor mesmo sem jogos carregados (ligas sequenciais).
  const roundList = roundRefs.filter((r) => !r.knockout || matchesByRound[r.key]?.length);

  // Se a classificação corrigiu a rodada corrente (currentRound da API defasado), reflete
  // isso no que a página abre por padrão e no que o polling ao vivo mira. Só liga sequencial.
  const outCurrentRound = effectiveCurrent;
  const outCurrentRoundKey = hasKnockout ? currentRoundKey : String(effectiveCurrent);

  return {
    tournament: { id, seasonId, name },
    rounds: groupRounds.length ? groupRounds : roundRefs.filter((r) => !r.knockout).map((r) => r.round),
    roundList,
    currentRound: outCurrentRound,
    currentRoundKey: outCurrentRoundKey,
    standings,
    matchesByRound,
    updatedAt: new Date().toISOString(),
  };
}
