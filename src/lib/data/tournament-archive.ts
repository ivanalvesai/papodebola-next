import { TOURNAMENTS } from "@/lib/config";
import {
  planArchive,
  isCompleteMatchSnapshot,
  type ArchiveMatch,
  type ArchiveTournamentInput,
  type MatchSnapshotLike,
} from "@/lib/archive-select";
import { getChampionshipData } from "./championship";
import { getMatchDetail, getWorldCupFixtures, getWorldCupKnockoutFixtures } from "./match-detail";
import { getTopScorers, getWorldCupScorers } from "./scorers";
import { readSnapshot } from "./snapshot-store";

// Arquivamento PERMANENTE de campeonato: garante que todo jogo encerrado tenha o lance a
// lance completo salvo em data/snapshots/matches/{id}.json (via getMatchDetail, que grava
// o snapshot) e renova tabela/artilharia (snapshots + data/api-cache). Assim, quando a
// API parar de servir a temporada, as páginas continuam com tudo. Roda em background
// (cron no dev, madrugada) — nunca num render.

export const WORLD_CUP_SLUG = "copa-do-mundo";
// Cada detalhe = 5 chamadas à API (event, incidents, lineups, statistics, commentary).
// 4s entre jogos deixa folga larga sob o rate limit de 6 req/s.
const MATCH_GAP_MS = 4000;
const TOURNAMENT_GAP_MS = 1000;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export interface ArchiveTournamentSummary {
  slug: string;
  finishedMatches: number;
  alreadyArchived: number;
  archivedNow: number;
}

export interface ArchiveResult {
  archived: number;
  skipped: number;
  remaining: number;
  tournaments: ArchiveTournamentSummary[];
  ms: number;
}

async function isArchivedFinished(id: number): Promise<boolean> {
  // Encerrado E com feed: "finished" oco (falha parcial da API) é refeito na próxima execução.
  const snap = await readSnapshot<MatchSnapshotLike>("matches", id);
  return snap?.event?.statusType === "finished" && isCompleteMatchSnapshot(snap);
}

async function loadTournaments(): Promise<ArchiveTournamentInput[]> {
  const out: ArchiveTournamentInput[] = [];
  let first = true;
  for (const t of Object.values(TOURNAMENTS)) {
    if (!t.seasonId) continue;
    if (!first) await sleep(TOURNAMENT_GAP_MS);
    first = false;
    // Também renova o snapshot de tabela/rodadas do campeonato.
    const cd = await getChampionshipData(t.slug).catch(() => null);
    const matches: ArchiveMatch[] = Object.values(cd?.matchesByRound || {})
      .flat()
      .map((m) => ({ id: m.id, timestamp: m.timestamp, status: m.status || undefined }));
    out.push({ slug: t.slug, matches });
  }

  // Copa do Mundo: grupos (sem status → heurística de horário) + mata-mata (status do cuptrees).
  await sleep(TOURNAMENT_GAP_MS);
  const [groups, knockout] = await Promise.all([
    getWorldCupFixtures().catch(() => []),
    getWorldCupKnockoutFixtures().catch(() => []),
  ]);
  const byId = new Map<number, ArchiveMatch>();
  for (const f of [...groups, ...knockout]) {
    const prev = byId.get(f.id);
    // Mantém a versão com status quando houver (knockout traz, grupos não).
    if (!prev || (!prev.status && f.status)) {
      byId.set(f.id, { id: f.id, timestamp: f.timestamp, status: f.status || undefined });
    }
  }
  out.push({ slug: WORLD_CUP_SLUG, matches: [...byId.values()] });
  return out;
}

export async function archiveFinishedMatches({ maxMatches = 60 }: { maxMatches?: number } = {}): Promise<ArchiveResult> {
  const started = Date.now();
  const tournaments = await loadTournaments();

  // Artilharia: uma chamada por execução renova o api-cache (Série A e Copa são as que o site usa).
  await Promise.all([getTopScorers().catch(() => null), getWorldCupScorers().catch(() => null)]);

  // Quais encerrados já têm snapshot final.
  const archivedFinished = new Set<number>();
  const nowSec = Math.floor(Date.now() / 1000);
  const probe = planArchive(tournaments, new Set(), Number.MAX_SAFE_INTEGER, nowSec);
  for (const { match } of probe.queue) {
    if (await isArchivedFinished(match.id)) archivedFinished.add(match.id);
  }

  const plan = planArchive(tournaments, archivedFinished, maxMatches, nowSec);
  const archivedBySlug = new Map<string, number>();
  let archived = 0;
  let skipped = 0;

  for (let i = 0; i < plan.queue.length; i++) {
    const { slug, match } = plan.queue[i];
    if (i > 0) await sleep(MATCH_GAP_MS);
    // getMatchDetail grava o snapshot quando a API devolve o evento. Só conta como
    // arquivado se o estado devolvido já for o final (API fora → volta o snapshot velho
    // ou null → "skipped", tenta de novo na próxima execução). Evento vindo do disco
    // (stale) não foi gravado como snapshot → também "skipped".
    const detail = await getMatchDetail(match.id, match.timestamp).catch(() => null);
    if (detail?.event?.statusType === "finished" && !detail.stale && isCompleteMatchSnapshot(detail)) {
      archived++;
      archivedBySlug.set(slug, (archivedBySlug.get(slug) || 0) + 1);
    } else {
      skipped++;
    }
  }

  return {
    archived,
    skipped,
    remaining: plan.pendingTotal - archived,
    tournaments: plan.tournaments.map((t) => ({
      slug: t.slug,
      finishedMatches: t.finishedMatches,
      alreadyArchived: t.alreadyArchived,
      archivedNow: archivedBySlug.get(t.slug) || 0,
    })),
    ms: Date.now() - started,
  };
}
