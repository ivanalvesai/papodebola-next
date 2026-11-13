import { fetchAllSports } from "@/lib/api/allsports";
import { toWatchMatch, type WatchMatch } from "@/lib/watch-info";
import { championshipMatchHref } from "./match-detail";
import { withSnapshot } from "./snapshot-store";

// Dados da "Ficha do jogo" dos posts de onde assistir. O match/{id} cru é arquivado em
// data/snapshots/watch/{id}.json (regra de ouro): se a API cair, a ficha continua no ar.
// TTL 5 min (status/placar ao vivo vêm do lance a lance; aqui é só a ficha).
export async function getWatchMatch(id: number): Promise<WatchMatch | null> {
  if (!id) return null;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const raw = await withSnapshot<any>(
    "watch",
    id,
    async () => (await fetchAllSports<{ event?: unknown }>(`match/${id}`, 300))?.event ?? null,
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
    (e: any) => !!e?.id && !!e?.homeTeam
  ).catch(() => null);
  return toWatchMatch(raw, championshipMatchHref);
}
