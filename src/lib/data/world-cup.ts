import { fetchAllSports } from "@/lib/api/allsports";
import { translateCountry } from "@/lib/i18n/countries";
import { translateStatus } from "@/lib/translations";
import { enrichStandingsWithForm } from "@/lib/standings-utils";
import { getWorldCupStandings } from "./standings";
import { getWorldCupKnockoutFixtures } from "./match-detail";
import type { StandingRow, StandingsGroup } from "@/types/standings";
import type { ChampionshipMatch } from "@/types/match";
import { KNOCKOUT_SCHEDULE, type KnockoutItem } from "@/lib/world-cup-knockout-schedule";

/* eslint-disable @typescript-eslint/no-explicit-any */

const WC = { id: 16, seasonId: 58210 } as const;

// Fase de grupos = rodadas 1-3 (24 jogos cada; 2 por grupo). O mata-mata só
// ganha confrontos depois do sorteio pós-grupos, entao fica de fora por ora.
const GROUP_ROUNDS = [1, 2, 3] as const;

export interface WorldCupGroupRound {
  round: number;
  matches: ChampionshipMatch[];
}

export interface WorldCupGroup {
  name: string;
  rows: StandingRow[];
  rounds: WorldCupGroupRound[];
  defaultRound: number; // rodada que abre por padrao (a "atual" do grupo)
}

// Escolhe a rodada a exibir: se o proximo jogo do grupo for em <=2 dias, abre na
// rodada dele; senao fica na ultima ja iniciada; antes de tudo comecar, rodada 1.
// Assim nao trava na rodada 1 e "pula" pro proximo confronto como os grandes sites.
const TWO_DAYS = 2 * 86400;
function pickDefaultRound(rounds: WorldCupGroupRound[], nowSec: number): number {
  const all = rounds.flatMap((r) => r.matches);
  const upcoming = all
    .filter((m) => m.status === "notstarted")
    .sort((a, b) => a.timestamp - b.timestamp);
  const started = all.filter((m) => m.status !== "notstarted");
  const next = upcoming[0];
  if (next && next.timestamp - nowSec <= TWO_DAYS) return next.round;
  if (started.length) return Math.max(...started.map((m) => m.round));
  return rounds[0]?.round ?? 1;
}

export interface WorldCupData {
  groups: WorldCupGroup[];
}

function normalizeMatch(e: any, round: number): ChampionshipMatch {
  return {
    id: e.id,
    home: translateCountry(e.homeTeam?.name || ""),
    away: translateCountry(e.awayTeam?.name || ""),
    homeId: e.homeTeam?.id || 0,
    awayId: e.awayTeam?.id || 0,
    homeScore: e.homeScore?.current ?? null,
    awayScore: e.awayScore?.current ?? null,
    status: e.status?.type || "",
    statusDesc: translateStatus(e.status?.description) || "",
    timestamp: e.startTimestamp || 0,
    round,
  };
}

// Confrontos de uma fase eliminatória (mata-mata) por número de rodada.
// Hoje volta vazio (chaveamento só existe após o sorteio pós-grupos); quando a
// API tiver os jogos, a página da fase popula sozinha via ISR. Ordena por data.
export async function getWorldCupKnockout(round: number): Promise<ChampionshipMatch[]> {
  const data = await fetchAllSports<any>(
    `tournament/${WC.id}/season/${WC.seasonId}/matches/round/${round}`,
    1800
  );
  return (data?.events || [])
    .map((e: any) => normalizeMatch(e, round))
    .sort((a: ChampionshipMatch, b: ChampionshipMatch) => a.timestamp - b.timestamp);
}

// Itens de uma fase eliminatória pra renderizar: usa os jogos REAIS da API quando
// já existem; senão cai no calendário FIXO da FIFA (placeholder com data/local/slot).
// Mesma URL/página nos dois casos → quando os times entram, o SEO da página é mantido
// (o conteúdo só fica mais rico). Ver world-cup-knockout-schedule.ts.
// Resolve um slot do calendário ("1º do Grupo C") pro time REAL — só se o grupo já
// encerrou (todas as linhas com 3 jogos). Slots de melhor-3º / vencedor de jogo -> null.
function resolveSlot(
  slot: string,
  standings: StandingsGroup[]
): { id: number; name: string } | null {
  const m = slot.match(/(\d+)\D*?do\s+Grupo\s+([A-L])/i);
  if (!m) return null;
  const pos = parseInt(m[1], 10);
  const group = standings.find(
    (g) => g.name.replace(/grupo\s*/i, "").trim().toUpperCase() === m[2].toUpperCase()
  );
  if (!group || !group.rows.every((r) => (r.matches || 0) >= 3)) return null;
  const row = group.rows.find((r) => r.pos === pos) || group.rows[pos - 1];
  return row?.teamId ? { id: row.teamId, name: row.team } : null;
}

// Itens da fase: usa o cuptrees (confrontos confirmados) + o calendário fixo da FIFA.
// - 2 lados resolvidos (grupos encerrados) + jogo no cuptrees -> card REAL (link + ao vivo).
// - 1 lado resolvido -> placeholder com o time já definido no slot (ex: "Alemanha x 3º ...").
// - nenhum -> placeholder do calendário. O round endpoint da API vem vazio no mata-mata.
// Rodada (do cuptrees) por fase: R32=6, R16=7, QF=8, SF=9, Final/3º=10. Usado pra achar
// o confronto real pelo time de UM lado só (quando o outro slot é "melhor 3º" e não resolve).
const PHASE_ROUND: Record<string, number> = {
  "16-avos": 6,
  oitavas: 7,
  quartas: 8,
  semifinais: 9,
  "terceiro-lugar": 10,
  final: 10,
};

export async function getKnockoutFixtures(
  phaseSlug: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  round: number | null
): Promise<KnockoutItem[]> {
  const [standings, knockoutFx] = await Promise.all([
    getWorldCupStandings().catch(() => [] as StandingsGroup[]),
    getWorldCupKnockoutFixtures().catch(() => []),
  ]);
  const pairKey = (a: number, b: number) => [a, b].sort((x, y) => x - y).join("-");
  const fxByPair = new Map<string, (typeof knockoutFx)[number]>();
  // Índice por (rodada, time): cada seleção joga UM jogo por fase, então isso acha o
  // confronto mesmo quando só um lado resolve pela classificação (o outro é melhor 3º).
  const fxByTeam = new Map<string, (typeof knockoutFx)[number]>();
  for (const f of knockoutFx) {
    fxByPair.set(pairKey(f.homeId, f.awayId), f);
    fxByTeam.set(`${f.round}-${f.homeId}`, f);
    fxByTeam.set(`${f.round}-${f.awayId}`, f);
  }
  const phaseRnd = PHASE_ROUND[phaseSlug];

  return KNOCKOUT_SCHEDULE.filter((s) => s.phase === phaseSlug).map((sched): KnockoutItem => {
    const h = resolveSlot(sched.homeSlot, standings);
    const a = resolveSlot(sched.awaySlot, standings);
    // Confronto real do cuptrees: por par (2 slots resolvidos) OU pelo único slot resolvido
    // (o outro é "3º (Grupos ...)" / "Vencedor do Jogo N", que não vem da classificação) —
    // o jogo daquele time já traz o adversário real definido no chaveamento.
    let fx = h && a ? fxByPair.get(pairKey(h.id, a.id)) : undefined;
    if (!fx && phaseRnd && (h || a)) {
      const known = (h || a)!;
      fx = fxByTeam.get(`${phaseRnd}-${known.id}`);
    }
    if (fx) {
      return {
        kind: "real",
        match: {
          id: fx.id,
          home: fx.home,
          away: fx.away,
          homeId: fx.homeId,
          awayId: fx.awayId,
          homeScore: null,
          awayScore: null,
          status: "notstarted",
          statusDesc: "",
          timestamp: fx.timestamp,
          round: fx.round,
        },
      };
    }
    if (h || a) {
      return {
        kind: "placeholder",
        sched: {
          ...sched,
          homeSlot: h ? h.name : sched.homeSlot,
          awaySlot: a ? a.name : sched.awaySlot,
          homeTeamId: h?.id,
          awayTeamId: a?.id,
        },
      };
    }
    return { kind: "placeholder", sched };
  });
}

export async function getWorldCupData(): Promise<WorldCupData> {
  const standingsGroups = await getWorldCupStandings();

  // Busca os jogos de cada rodada (todos os grupos juntos) — em paralelo. O semáforo
  // do fetchAllSports já limita a 2 simultâneas + retry em 429; sem pausas fixas.
  const roundMatches: Record<number, ChampionshipMatch[]> = {};
  const fetched = await Promise.all(
    GROUP_ROUNDS.map((r) =>
      fetchAllSports<any>(
        `tournament/${WC.id}/season/${WC.seasonId}/matches/round/${r}`,
        1800
      ).then((data) => ({ r, data }))
    )
  );
  for (const { r, data } of fetched) {
    roundMatches[r] = (data?.events || []).map((e: any) => normalizeMatch(e, r));
  }

  // Associa cada jogo ao seu grupo pelos times (ambos pertencem ao mesmo grupo)
  const nowSec = Date.now() / 1000;
  const groups: WorldCupGroup[] = standingsGroups.map((g) => {
    const ids = new Set(g.rows.map((r) => r.teamId));
    const rounds: WorldCupGroupRound[] = GROUP_ROUNDS.map((r) => ({
      round: r,
      matches: (roundMatches[r] || [])
        .filter((m) => ids.has(m.homeId) && ids.has(m.awayId))
        .sort((a, b) => a.timestamp - b.timestamp),
    }));

    // bolinhas de "últimos jogos" a partir dos jogos do próprio grupo
    const matchesByRound: Record<number, ChampionshipMatch[]> = {};
    for (const rd of rounds) matchesByRound[rd.round] = rd.matches;
    const lastRound = GROUP_ROUNDS[GROUP_ROUNDS.length - 1];
    const rows = enrichStandingsWithForm([{ name: g.name, rows: g.rows }], matchesByRound, lastRound)[0].rows;

    return { name: g.name, rows, rounds, defaultRound: pickDefaultRound(rounds, nowSec) };
  });

  return { groups };
}
