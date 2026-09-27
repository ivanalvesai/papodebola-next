// Seleção PURA dos jogos que ainda precisam ser arquivados (lance a lance completo em
// data/snapshots/matches/{id}.json). Sem import de módulo de servidor: é testada com
// `node --test --experimental-strip-types` e usada pela rotina /api/archive/run.

export interface ArchiveMatch {
  id: number;
  timestamp: number; // startTimestamp (segundos)
  status?: string; // notstarted | inprogress | finished | postponed | canceled ... (ausente = desconhecido)
}

export interface ArchiveTournamentInput {
  slug: string;
  matches: ArchiveMatch[];
}

export interface ArchiveTournamentPlan {
  slug: string;
  finishedMatches: number;
  alreadyArchived: number;
  pending: ArchiveMatch[]; // encerrados sem snapshot final, do mais antigo pro mais novo
}

export interface ArchivePlan {
  tournaments: ArchiveTournamentPlan[];
  queue: { slug: string; match: ArchiveMatch }[]; // o que esta execução vai buscar (≤ max)
  pendingTotal: number;
}

// Jogo sem status (fixtures da fase de grupos da Copa não trazem) conta como encerrado
// depois de 3h do apito inicial; o getMatchDetail confirma o status real na hora.
export const UNKNOWN_STATUS_FINISHED_AFTER_S = 3 * 60 * 60;

export function isFinishedMatch(m: ArchiveMatch, nowSec: number): boolean {
  if (!m.id) return false;
  if (m.status) return m.status === "finished";
  return m.timestamp > 0 && m.timestamp + UNKNOWN_STATUS_FINISHED_AFTER_S < nowSec;
}

// `archivedFinished`: ids cujo snapshot existe E está com event.statusType === "finished".
// Ordem: torneios na ordem recebida; dentro de cada um, jogos mais antigos primeiro.
// Um mesmo id em dois torneios (ou repetido na lista) só entra uma vez.
export function planArchive(
  input: ArchiveTournamentInput[],
  archivedFinished: ReadonlySet<number>,
  max: number,
  nowSec: number
): ArchivePlan {
  const seen = new Set<number>();
  const tournaments: ArchiveTournamentPlan[] = [];
  const queue: ArchivePlan["queue"] = [];
  let pendingTotal = 0;
  const cap = Math.max(0, Math.floor(max));

  for (const t of input) {
    const finished = t.matches
      .filter((m) => isFinishedMatch(m, nowSec))
      .filter((m) => (seen.has(m.id) ? false : (seen.add(m.id), true)))
      .sort((a, b) => a.timestamp - b.timestamp || a.id - b.id);
    const pending = finished.filter((m) => !archivedFinished.has(m.id));
    tournaments.push({
      slug: t.slug,
      finishedMatches: finished.length,
      alreadyArchived: finished.length - pending.length,
      pending,
    });
    pendingTotal += pending.length;
    for (const match of pending) {
      if (queue.length >= cap) break;
      queue.push({ slug: t.slug, match });
    }
  }
  return { tournaments, queue, pendingTotal };
}
