import { fetchAllSports } from "@/lib/api/allsports";
import { TOURNAMENT_BY_SLUG } from "@/lib/config";
import { translateStatus } from "@/lib/translations";
import { getStandings } from "./standings";
import { withSnapshot } from "./snapshot-store";
import type { ChampionshipData } from "@/types/tournament";
import type { ChampionshipMatch } from "@/types/match";

/* eslint-disable @typescript-eslint/no-explicit-any */

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
  const cr = cd.currentRound || 1;

  const data = await fetchAllSports<any>(
    `tournament/${id}/season/${seasonId}/matches/round/${cr}`,
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
  const totalRounds = roundsData?.rounds?.length || 38;
  const rounds = Array.from({ length: totalRounds }, (_, i) => i + 1);

  // Fetch standings
  const standings = await getStandings(id, seasonId, 21600);

  // Rodadas 1..currentRound+1 em PARALELO (sem sleep). Antes era um loop sequencial com
  // await sleep(250) por rodada → ~N×250ms de latência FIXA em toda página de jogo de
  // liga (medido ~5s p/ Série A/B). O semáforo do fetchAllSports já limita a 2 simultâneas
  // + retry em 429, então o paralelo é seguro. Mesma otimização já feita em getWorldCupFixtures.
  // Past rounds (< currentRound) nunca mudam → TTL 24h; atual/próxima → 6h.
  const endRound = Math.min(totalRounds, currentRound + 1);
  const roundData = await Promise.all(
    Array.from({ length: endRound }, (_, i) => i + 1).map((r) =>
      fetchAllSports<any>(
        `tournament/${id}/season/${seasonId}/matches/round/${r}`,
        r < currentRound ? 86400 : 21600
      ).then((data) => ({ r, data }))
    )
  );
  const matchesByRound: Record<number, ChampionshipMatch[]> = {};
  for (const { r, data } of roundData) {
    if (data?.events) {
      matchesByRound[r] = data.events.map((e: any) => normalizeMatch(e, r));
    }
  }

  return {
    tournament: { id, seasonId, name },
    rounds,
    currentRound,
    standings,
    matchesByRound,
    updatedAt: new Date().toISOString(),
  };
}
