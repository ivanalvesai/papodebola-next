import type { Metadata } from "next";
import Image from "next/image";
import { getCBFCalendar } from "@/lib/data/cbf-calendar";
import { Calendar } from "lucide-react";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";

export const revalidate = 43200;

export const metadata: Metadata = {
  title: "Agenda de Jogos - Futebol Brasileiro",
  description: "Calendario completo de jogos do futebol brasileiro. Brasileirao, Copa do Brasil e mais. Datas, horarios e estadios.",
};

export default async function AgendaPage() {
  const calendar = await getCBFCalendar().catch(() => ({ championships: [], updatedAt: "" }));

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <PageBreadcrumb
        className="mb-4"
        items={[
          { label: "Início", href: "/" },
          { label: "Agenda" },
        ]}
      />
      <h1 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
        <Calendar className="h-6 w-6 text-green" />
        Agenda - Futebol Brasileiro
      </h1>

      <div className="space-y-8">
        {calendar.championships.map((champ) => (
          <div key={champ.cbfId} className="bg-card-bg rounded-lg border border-border-custom">
            <h2 className="text-base font-bold text-text-primary px-6 py-4 border-b border-border-custom">
              {champ.name}
              <span className="ml-2 text-xs font-normal text-text-muted">
                Rodada {champ.currentRound} | {champ.totalMatches} jogos
              </span>
            </h2>

            {/* Upcoming matches */}
            {champ.upcoming.length === 0 ? (
              <p className="text-text-muted text-sm text-center py-6">Nenhum jogo proximo</p>
            ) : (
              <div className="divide-y divide-border-light">
                {champ.upcoming.slice(0, 15).map((m) => (
                  <div key={m.id} className="flex items-center gap-4 px-6 py-3 hover:bg-card-hover transition-colors">
                    {/* Date */}
                    <div className="w-20 text-center shrink-0">
                      <div className="text-xs text-text-muted">{m.date}</div>
                      <div className="text-sm font-bold text-text-primary">{m.time}</div>
                    </div>

                    {/* Teams */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 text-sm">
                        {m.homeId && (
                          <Image src={`/img/team/${m.homeId}/image`} alt="" width={20} height={20} className="rounded-full" unoptimized />
                        )}
                        <span className="font-semibold truncate">{m.home}</span>
                        <span className="text-text-muted mx-1">vs</span>
                        {m.awayId && (
                          <Image src={`/img/team/${m.awayId}/image`} alt="" width={20} height={20} className="rounded-full" unoptimized />
                        )}
                        <span className="font-semibold truncate">{m.away}</span>
                      </div>
                    </div>

                    {/* Round + Venue */}
                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-green font-semibold">Rodada {m.round}</div>
                      {m.venue && <div className="text-[10px] text-text-muted truncate max-w-[150px]">{m.venue}</div>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
