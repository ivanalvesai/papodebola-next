import Link from "next/link";
import type { TeamPageData } from "@/lib/data/team";
import { teamSlugById } from "@/lib/data/team";
import { standingsWindow } from "@/lib/standings-window";

// Rodapé das abas do time: notícias do time, recorte da tabela e próximo adversário.
// Tira a página do "beco sem saída" (quem chega pelo Google tem pra onde seguir). Só
// usa o que getTeamPageDataFor já buscou — nenhuma chamada nova à API. Bloco vazio some.
const card = "bg-card-bg rounded-lg border border-border-custom";

export async function TeamCrossLinks({ data }: { data: TeamPageData }) {
  const news = data.news.slice(0, 4);
  const table = standingsWindow(data.standingsTable, data.id, 2);
  const slugs = await Promise.all(table.map((r) => (r.teamId === data.id ? data.slug : teamSlugById(r.teamId))));
  const next = data.upcomingMatches[0] || null;
  const isHome = next ? next.homeId === data.id : false;
  const opponent = next ? { name: isHome ? next.away : next.home, slug: isHome ? next.awaySlug : next.homeSlug } : null;

  if (!news.length && !table.length && !next) return null;

  return (
    <div className="mx-auto max-w-[1240px] px-4 pb-8">
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {news.length > 0 && (
          <section className={`${card} md:col-span-2`}>
            <h2 className="border-b border-border-custom px-4 py-3 text-base font-bold text-text-primary">
              Últimas do {data.name}
            </h2>
            <ul className="divide-y divide-border-light">
              {news.map((a) => (
                <li key={a.slug}>
                  <Link href={a.url} className="block px-4 py-3 hover:bg-body">
                    <span className="line-clamp-2 text-sm font-semibold text-text-primary">{a.rewrittenTitle}</span>
                    <span className="mt-1 block text-xs text-text-muted">
                      {new Date(a.pubDate).toLocaleDateString("pt-BR", {
                        day: "2-digit",
                        month: "short",
                        timeZone: "America/Sao_Paulo",
                      })}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
            <Link href={`/futebol/times/${data.slug}`} className="block border-t border-border-custom py-3 text-center text-sm font-semibold text-green hover:bg-body">
              Mais notícias do {data.name} &rarr;
            </Link>
          </section>
        )}

        <div className="space-y-4">
          {next && opponent && (
            <section className={card}>
              <h2 className="border-b border-border-custom px-4 py-3 text-base font-bold text-text-primary">Próximo adversário</h2>
              <div className="space-y-2 px-4 py-3 text-sm">
                <p className="text-text-secondary">
                  {next.home} x {next.away} · {next.date} {next.time}
                </p>
                {next.href && (
                  <Link href={next.href} className="block font-semibold text-green hover:text-green-hover">
                    Detalhes do jogo &rarr;
                  </Link>
                )}
                {opponent.slug && (
                  <Link href={`/futebol/times/${opponent.slug}`} className="block font-semibold text-green hover:text-green-hover">
                    Tudo sobre o {opponent.name} &rarr;
                  </Link>
                )}
              </div>
            </section>
          )}

          {table.length > 0 && (
            <section className={card}>
              <h2 className="border-b border-border-custom px-4 py-3 text-base font-bold text-text-primary">
                {data.name} na tabela
              </h2>
              <table className="w-full text-sm">
                <tbody>
                  {table.map((r, i) => {
                    const own = r.teamId === data.id;
                    const slug = slugs[i];
                    return (
                      <tr key={r.teamId} className={own ? "bg-green-light font-bold" : ""}>
                        <td className="w-8 px-3 py-2 text-text-muted">{r.pos}º</td>
                        <td className="py-2">
                          {slug && !own ? (
                            <Link href={`/futebol/times/${slug}`} className="hover:text-green">
                              {r.team}
                            </Link>
                          ) : (
                            r.team
                          )}
                        </td>
                        <td className="px-3 py-2 text-right tabular-nums">{r.pts} pts</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
              {data.tournament && (
                <Link href={`/futebol/${data.tournament.slug}`} className="block border-t border-border-custom py-3 text-center text-sm font-semibold text-green hover:bg-body">
                  Classificação completa &rarr;
                </Link>
              )}
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
