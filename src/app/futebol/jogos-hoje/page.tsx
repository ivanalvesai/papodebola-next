import type { Metadata } from "next";
import Image from "next/image";
import { getTodayMatches } from "@/lib/data/matches";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { CalendarDays } from "lucide-react";
import type { NormalizedMatch } from "@/types/match";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Jogos de Futebol Hoje - Placares e Horários",
  description:
    "Todos os jogos de futebol de hoje: Brasileirão, Copa do Brasil, Libertadores, Champions League e mais. Horários, placares ao vivo e classificação.",
};

function groupByLeague(matches: NormalizedMatch[]) {
  const groups: Record<string, NormalizedMatch[]> = {};
  for (const m of matches) {
    const key = m.league || "Outros";
    if (!groups[key]) groups[key] = [];
    groups[key].push(m);
  }
  return Object.entries(groups).sort(([a], [b]) => a.localeCompare(b, "pt-BR"));
}

export default async function JogosHojePage() {
  const matches = await getTodayMatches().catch(() => []);
  const grouped = groupByLeague(matches);

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-8">
      <PageBreadcrumb
        className="mb-4"
        items={[
          { label: "Início", href: "/" },
          { label: "Futebol", href: "/futebol" },
          { label: "Jogos de Hoje" },
        ]}
      />
      <h1 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
        <CalendarDays className="h-6 w-6 text-green" />
        Jogos de Futebol Hoje
      </h1>

      {matches.length === 0 ? (
        <div className="bg-card-bg rounded-lg border border-border-custom p-8 text-center">
          <p className="text-text-muted text-sm">Nenhum jogo de futebol encontrado para hoje.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {grouped.map(([league, items]) => (
            <div key={league} className="bg-card-bg rounded-lg border border-border-custom overflow-hidden">
              <h2 className="text-sm font-bold text-text-primary px-4 py-3 bg-body border-b border-border-custom">
                {league}
                <span className="ml-2 text-xs font-normal text-text-muted">{items.length} jogos</span>
              </h2>
              <div className="divide-y divide-border-light">
                {items.map((m) => {
                  const isLive = m.status === "live" || m.status === "halftime";
                  return (
                    <div
                      key={m.id}
                      className={`flex items-center gap-3 px-4 py-3 ${isLive ? "bg-red-light" : ""}`}
                    >
                      <div className="w-20 text-center shrink-0">
                        {isLive ? (
                          <div className="text-xs font-bold text-red">{m.statusText || "AO VIVO"}</div>
                        ) : m.status === "finished" ? (
                          <div className="text-xs font-bold text-text-muted">Encerrado</div>
                        ) : (
                          <div className="text-sm font-bold text-text-primary">{m.time}</div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0 space-y-1">
                        <div className="flex items-center gap-2 text-sm">
                          {m.homeLogo && (
                            <Image src={m.homeLogo} alt="" width={20} height={20} className="rounded-full" unoptimized />
                          )}
                          <span className="font-semibold truncate flex-1">{m.homeTeam}</span>
                          {m.homeScore !== null && (
                            <span className="font-bold text-text-primary">{m.homeScore}</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          {m.awayLogo && (
                            <Image src={m.awayLogo} alt="" width={20} height={20} className="rounded-full" unoptimized />
                          )}
                          <span className="font-semibold truncate flex-1">{m.awayTeam}</span>
                          {m.awayScore !== null && (
                            <span className="font-bold text-text-primary">{m.awayScore}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
