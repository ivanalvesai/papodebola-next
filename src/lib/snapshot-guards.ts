// Guardas PURAS contra regressão de snapshot permanente (data/snapshots): um dado novo
// "real" mas mais velho que o snapshot (ex.: cópia do disco da API servida num apagão)
// não pode sobrescrever o snapshot melhor. Sem import de módulo de servidor: testadas
// com `node --test --experimental-strip-types` e usadas em withSnapshot.
import type { MatchSnapshotLike } from "./archive-select";

// Jogo: snapshot encerrado e o dado novo não encerrado = regressão.
export function isMatchRegression(
  prev: MatchSnapshotLike | null | undefined,
  next: MatchSnapshotLike | null | undefined
): boolean {
  return prev?.event?.statusType === "finished" && next?.event?.statusType !== "finished";
}

export interface ChampionshipSnapshotLike {
  tournament?: { seasonId?: number } | null;
  matchesByRound?: Record<string, { status?: string }[] | null | undefined> | null;
}

export function countFinishedMatches(d: ChampionshipSnapshotLike | null | undefined): number {
  let n = 0;
  for (const ms of Object.values(d?.matchesByRound || {})) {
    for (const m of ms || []) if (m?.status === "finished") n++;
  }
  return n;
}

// Campeonato: menos jogos encerrados que o snapshot = regressão. Só compara a MESMA
// temporada — na virada de temporada (seasonId novo) o dado novo sempre substitui.
export function isChampionshipRegression(
  prev: ChampionshipSnapshotLike | null | undefined,
  next: ChampionshipSnapshotLike | null | undefined
): boolean {
  const ps = prev?.tournament?.seasonId;
  const ns = next?.tournament?.seasonId;
  if (ps != null && ns != null && ps !== ns) return false;
  return countFinishedMatches(next) < countFinishedMatches(prev);
}
