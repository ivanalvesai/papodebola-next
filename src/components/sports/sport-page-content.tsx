import { getSportData } from "@/lib/data/sports";
import { translateStatus } from "@/lib/translations";
import { PageBreadcrumb, type BreadcrumbItem } from "@/components/seo/page-breadcrumb";

interface SportPageContentProps {
  sportKey: string;
  title: string;
  breadcrumbItems: BreadcrumbItem[];
}

export async function SportPageContent({
  sportKey,
  title,
  breadcrumbItems,
}: SportPageContentProps) {
  const data = await getSportData(sportKey);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <PageBreadcrumb className="mb-4" items={breadcrumbItems} />
      <h1 className="text-xl font-bold text-text-primary mb-6">{title}</h1>

      <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
        {/* Main */}
        <div className="space-y-6">
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
              <h2 className="text-sm font-bold text-text-primary uppercase mb-4">Proximos Dias</h2>
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
              <h3 className="text-sm font-bold text-text-primary px-4 py-3 border-b border-border-custom">Classificacao</h3>
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
