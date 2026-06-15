import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays } from "lucide-react";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { AgendaTabs } from "@/components/agenda/agenda-tabs";
import { MatchCarousel } from "@/components/match-bar/match-carousel";
import { getGeneralAgenda, type AgendaEvent } from "@/lib/data/agenda";
import type { MatchBarCardProps } from "@/components/match-bar/match-bar-card";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Agenda Esportiva - Jogos de Hoje de Todos os Esportes",
  description: "Agenda esportiva do dia: futebol, basquete, vôlei, NFL e mais. Horários (de Brasília) dos principais campeonatos, dia a dia.",
};

function isoOf(dt: Date): string {
  return `${dt.getFullYear()}-${String(dt.getMonth() + 1).padStart(2, "0")}-${String(dt.getDate()).padStart(2, "0")}`;
}

function toCard(e: AgendaEvent): MatchBarCardProps {
  const status =
    e.statusType === "inprogress" ? "live" : e.statusType === "finished" ? "finished" : "scheduled";
  return {
    id: `api_${e.id}`,
    homeTeam: e.home,
    awayTeam: e.away,
    homeLogo: e.homeId ? `/img/team/${e.homeId}/image` : null,
    awayLogo: e.awayId ? `/img/team/${e.awayId}/image` : null,
    homeScore: e.homeScore,
    awayScore: e.awayScore,
    time: e.time,
    timestamp: e.timestamp,
    status,
    statusText: e.status || (status === "live" ? "Ao Vivo" : ""),
    league: e.league,
  };
}

function parseSelected(d?: string): Date {
  if (d && /^\d{4}-\d{2}-\d{2}$/.test(d)) {
    const [y, m, day] = d.split("-").map(Number);
    return new Date(y, m - 1, day, 12, 0, 0); // meio-dia: evita virada de fuso
  }
  return new Date();
}

export default async function AgendaPage({
  searchParams,
}: {
  searchParams: Promise<{ d?: string }>;
}) {
  const { d } = await searchParams;
  const selected = parseSelected(d);
  const selISO = isoOf(selected);

  const groups = await getGeneralAgenda(selected).catch(() => []);

  // Abas de data: hoje + próximos 6 dias.
  const days = Array.from({ length: 7 }, (_, i) => {
    const dt = new Date();
    dt.setDate(dt.getDate() + i);
    return dt;
  });
  const todayISO = isoOf(days[0]);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <PageBreadcrumb
        className="mb-4"
        items={[{ label: "Início", href: "/" }, { label: "Agenda" }]}
      />
      <h1 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
        <CalendarDays className="h-6 w-6 text-green" />
        Agenda Esportiva
      </h1>

      <AgendaTabs active="geral" />

      {/* Date selector */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-6">
        {days.map((dt) => {
          const iso = isoOf(dt);
          const isSel = iso === selISO;
          const isToday = iso === todayISO;
          const label = dt.toLocaleDateString("pt-BR", { weekday: "short", timeZone: "America/Sao_Paulo" }).replace(".", "");
          const dm = dt.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit", timeZone: "America/Sao_Paulo" });
          return (
            <Link
              key={iso}
              href={iso === todayISO ? "/agenda" : `/agenda?d=${iso}`}
              scroll={false}
              className={`flex flex-col items-center shrink-0 w-[72px] py-2 rounded-lg border text-center transition-colors ${
                isSel
                  ? "bg-green text-white border-green"
                  : "bg-card-bg border-border-custom text-text-secondary hover:border-green"
              }`}
            >
              <span className="text-[11px] font-semibold uppercase">{isToday ? "Hoje" : label}</span>
              <span className="text-xs">{dm}</span>
            </Link>
          );
        })}
      </div>

      {/* Sport groups */}
      {groups.length === 0 ? (
        <div className="bg-card-bg rounded-lg border border-border-custom py-12 text-center">
          <CalendarDays className="h-10 w-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted text-sm">
            Nenhum jogo dos principais campeonatos neste dia.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {groups.map((group) => (
            <div key={group.sport}>
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-base font-bold text-text-primary uppercase">{group.sport}</h2>
                {group.sportSlug && (
                  <Link href={`/${group.sportSlug}`} className="text-xs text-green font-semibold hover:text-green-hover">
                    Ver mais &rsaquo;
                  </Link>
                )}
              </div>
              <div className="space-y-4">
                {group.leagues.map((lg) => (
                  <MatchCarousel
                    key={`${group.sport}-${lg.league}`}
                    title={lg.league}
                    count={lg.events.length}
                    matches={lg.events.map(toCard)}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-[11px] text-text-muted mt-6">
        Horários de Brasília. Mostramos os principais campeonatos de cada modalidade.
      </p>
    </div>
  );
}
