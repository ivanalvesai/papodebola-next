import Link from "next/link";
import type { AgendaLeagueGroup } from "@/lib/data/agenda";
import type { WatchPost } from "@/lib/data/watch";
import { getBroadcasters } from "@/lib/broadcasters";
import { TOURNAMENTS, champPath } from "@/lib/config";

// Lista "Jogos de hoje: onde assistir" (hub /onde-assistir): por campeonato, cada jogo com
// horário, times, canal (do post, se houver, senão o detentor do campeonato) e o link pro
// post ou, sem post, pro lance a lance. Dados da agenda salva (sem API no render).
const slugByName = new Map(Object.values(TOURNAMENTS).map((t) => [t.name, t.slug]));

export function WatchAgenda({
  leagues,
  posts,
}: {
  leagues: AgendaLeagueGroup[];
  posts: Map<number, WatchPost>;
}) {
  if (!leagues.length) return null;
  return (
    <div className="space-y-5">
      {leagues.map((lg) => {
        const slug = slugByName.get(lg.league);
        const fallback = getBroadcasters(lg.league).join(", ");
        return (
          <section key={lg.league} className="overflow-hidden rounded-lg border border-border-custom bg-card-bg">
            <header className="flex items-center justify-between border-b border-border-light bg-surface px-4 py-2.5">
              <h3 className="text-sm font-bold uppercase tracking-wide text-text-primary">{lg.league}</h3>
              {slug && (
                <Link href={champPath(slug)} className="text-sm font-semibold text-green hover:text-green-hover">
                  Tabela
                </Link>
              )}
            </header>
            <ul className="divide-y divide-border-light">
              {lg.events.map((e) => {
                const post = posts.get(e.id);
                const channels = post?.article.watch?.channels || fallback;
                const live = e.statusType === "inprogress";
                const done = e.statusType === "finished";
                const href = post?.article.url || e.href;
                return (
                  <li key={e.id} className="grid grid-cols-[56px_1fr] items-center gap-3 px-4 py-3 sm:grid-cols-[64px_1fr_auto]">
                    <span className={`text-sm font-bold ${live ? "text-red" : "text-text-secondary"}`}>
                      {live ? "AO VIVO" : done ? "Fim" : e.time}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-base font-semibold text-text-primary">
                        {e.home}
                        {(live || done) && e.homeScore !== null ? ` ${e.homeScore} x ${e.awayScore} ` : " x "}
                        {e.away}
                      </p>
                      {channels && !done && <p className="text-sm text-text-secondary">{channels}</p>}
                    </div>
                    {href && (
                      <Link
                        href={href}
                        className="col-span-2 text-sm font-semibold text-green hover:text-green-hover sm:col-span-1 sm:text-right"
                      >
                        {post ? "Onde assistir e escalações" : live ? "Ao vivo" : "Lance a lance"}
                      </Link>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}
    </div>
  );
}
