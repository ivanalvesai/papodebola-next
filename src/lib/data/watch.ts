import { fetchAllSports } from "@/lib/api/allsports";
import { toWatchMatch, pickWatchPosts, type WatchMatch } from "@/lib/watch-info";
import { WATCH_CATEGORY } from "@/lib/config";
import type { Article } from "@/types/article";
import { getArticles } from "./articles";
import { championshipMatchHref } from "./match-detail";
import { withSnapshot, readSnapshot } from "./snapshot-store";

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

// Listagens (hub, /ao-vivo, campeonato, jogo): usa a cópia salva do jogo e só vai à API
// se ainda não houver snapshot — N cards não viram N chamadas.
async function getWatchMatchForList(id: number): Promise<WatchMatch | null> {
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  const snap = await readSnapshot<any>("watch", id).catch(() => null);
  if (snap) return toWatchMatch(snap, championshipMatchHref);
  return getWatchMatch(id);
}

export interface WatchPost {
  article: Article;
  match: WatchMatch | null;
}

// Posts de onde assistir (categoria silada), por tag do campeonato e/ou jogos.
// upcoming: só jogos que ainda não acabaram (início há menos de 3 h) ou sem jogo ligado.
export async function getWatchPosts(opts: {
  tag?: string;
  matchIds?: number[];
  limit?: number;
  upcoming?: boolean;
} = {}): Promise<WatchPost[]> {
  const { articles } = await getArticles({ perPage: 60, category: WATCH_CATEGORY }).catch(() => ({
    articles: [] as Article[],
  }));
  const ids = [...new Set(articles.map((a) => a.matchId).filter((x): x is number => !!x))];
  const matches = new Map<number, WatchMatch>();
  await Promise.all(
    ids.map(async (id) => {
      const m = await getWatchMatchForList(id).catch(() => null);
      if (m) matches.set(id, m);
    })
  );
  const kickoff = new Map([...matches].map(([id, m]) => [id, m.timestamp]));
  const now = Date.now() / 1000;
  return pickWatchPosts(articles, { tag: opts.tag, matchIds: opts.matchIds }, kickoff)
    .map((article) => ({ article, match: article.matchId ? matches.get(article.matchId) || null : null }))
    .filter((p) => !opts.upcoming || !p.match || p.match.timestamp > now - 3 * 3600)
    .slice(0, opts.limit ?? 60);
}
