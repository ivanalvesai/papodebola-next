import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";
import { Newspaper } from "lucide-react";
import { getSportData } from "@/lib/data/sports";
import { getArticles } from "@/lib/data/articles";
import { SPORT_WP_CATEGORY } from "@/lib/config";
import { translateStatus } from "@/lib/translations";
import { PageBreadcrumb, type BreadcrumbItem } from "@/components/seo/page-breadcrumb";

interface SportPageContentProps {
  sportKey: string;
  title: string;
  breadcrumbItems: BreadcrumbItem[];
  featured?: ReactNode; // destaque opcional no topo (ex: torneio com chaveamento)
}

export async function SportPageContent({
  sportKey,
  title,
  breadcrumbItems,
  featured,
}: SportPageContentProps) {
  const catName = SPORT_WP_CATEGORY[sportKey];
  const [data, newsRes] = await Promise.all([
    getSportData(sportKey),
    catName
      ? getArticles({ category: catName, perPage: 12 }).catch(() => ({ articles: [], total: 0 }))
      : Promise.resolve({ articles: [], total: 0 }),
  ]);
  const news = newsRes.articles;

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <PageBreadcrumb className="mb-4" items={breadcrumbItems} />
      <h1 className="text-xl font-bold text-text-primary mb-6">{title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Main (min-w-0: sem isso, a faixa rolável de tênis empurra a largura da
            coluna do grid e a página vaza horizontalmente na tela) */}
        <div className="min-w-0 space-y-6">
          {featured}
          {/* Notícias da categoria (links pra /{esporte}/{slug}) */}
          {news.length > 0 && (
            <div className="bg-card-bg rounded-lg border border-border-custom p-6">
              <h2 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase text-text-primary">
                <Newspaper className="h-4 w-4 text-green" />
                Últimas Notícias
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {news.map((a) => (
                  <Link
                    key={a.slug}
                    href={a.url}
                    className="group flex gap-3 border-b border-border-light pb-4 last:border-0 sm:border-0 sm:pb-0"
                  >
                    <div className="aspect-[16/9] w-24 shrink-0 overflow-hidden rounded bg-body sm:w-32">
                      {a.image ? (
                        <Image
                          src={a.image}
                          alt=""
                          width={128}
                          height={72}
                          className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          unoptimized
                        />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-text-muted">
                          <Newspaper className="h-5 w-5" />
                        </div>
                      )}
                    </div>
                    <h3 className="line-clamp-3 flex-1 text-sm font-semibold leading-snug text-text-primary transition-colors group-hover:text-green">
                      {a.rewrittenTitle}
                    </h3>
                  </Link>
                ))}
              </div>
            </div>
          )}
          {/* Live */}
          {data && data.live.length > 0 && (
            <div className="bg-card-bg rounded-lg border border-red p-6">
              <h2 className="text-sm font-bold text-red uppercase mb-4">Ao Vivo</h2>
              <div className="space-y-3">
                {data.live.map((e) => (
                  <div key={e.id} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{e.home} vs {e.away}</div>
                      <div className="text-[10px] text-text-muted">{e.league}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-bold">{e.homeScore} - {e.awayScore}</div>
                      <div className="text-[10px] text-red font-semibold">{translateStatus(e.status)}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Today */}
          <div className="bg-card-bg rounded-lg border border-border-custom p-6">
            <h2 className="text-sm font-bold text-text-primary uppercase mb-4">Jogos de Hoje</h2>
            {!data || data.today.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-4">Nenhum jogo hoje</p>
            ) : (
              <div className="space-y-2">
                {data.today.map((e) => (
                  <div key={e.id} className="flex items-center justify-between py-2 border-b border-border-light last:border-0">
                    <div className="flex-1">
                      <div className="text-sm font-semibold">{e.home} vs {e.away}</div>
                      <div className="text-[10px] text-text-muted">{e.league}</div>
                    </div>
                    <div className="text-right">
                      {e.homeScore !== null ? (
                        <div className="text-sm font-bold">{e.homeScore} - {e.awayScore}</div>
                      ) : (
                        <div className="text-sm font-semibold text-text-secondary">{e.time}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Calendar */}
          {data && data.calendar.length > 0 && (
            <div className="bg-card-bg rounded-lg border border-border-custom p-6">
              <h2 className="text-sm font-bold text-text-primary uppercase mb-4">Próximos Dias</h2>
              {data.calendar.map((day) => (
                <div key={day.date} className="mb-4 last:mb-0">
                  <div className="text-xs font-bold text-green uppercase mb-2">{day.label}</div>
                  {day.events.length === 0 ? (
                    <p className="text-text-muted text-xs">Sem jogos</p>
                  ) : (
                    <div className="space-y-1">
                      {day.events.slice(0, 10).map((e) => (
                        <div key={e.id} className="flex items-center justify-between text-xs py-1">
                          <span className="font-semibold truncate flex-1">{e.home} vs {e.away}</span>
                          <span className="text-text-muted ml-2">{e.time}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <aside className="space-y-6">
          {/* Rankings (Tennis) */}
          {data?.rankings && (
            <div className="bg-card-bg rounded-lg border border-border-custom">
              <h3 className="text-sm font-bold text-text-primary px-4 py-3 border-b border-border-custom">Rankings</h3>
              <div className="divide-y divide-border-light">
                {data.rankings.map((r) => (
                  <div key={r.pos} className="flex items-center gap-3 px-4 py-2 text-xs">
                    <span className="w-6 text-center font-bold text-text-muted">{r.pos}</span>
                    <span className="font-semibold flex-1">{r.name}</span>
                    <span className="text-text-muted">{r.points} pts</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Standings (NBA) */}
          {data?.standings && data.standings.length > 0 && (
            <div className="bg-card-bg rounded-lg border border-border-custom">
              <h3 className="text-sm font-bold text-text-primary px-4 py-3 border-b border-border-custom">Classificação</h3>
              {data.standings.map((group) => (
                <div key={group.name || "default"}>
                  {group.name && (
                    <div className="px-4 py-1.5 text-[10px] font-bold text-green uppercase bg-body">{group.name}</div>
                  )}
                  <div className="divide-y divide-border-light">
                    {group.rows.slice(0, 8).map((r) => (
                      <div key={r.teamId} className="flex items-center gap-2 px-4 py-1.5 text-xs">
                        <span className="w-4 text-center text-text-muted">{r.pos}</span>
                        <span className="font-semibold flex-1 truncate">{r.team}</span>
                        <span className="text-text-muted">{r.wins}V {r.losses}D</span>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </aside>
      </div>
    </div>
  );
}
