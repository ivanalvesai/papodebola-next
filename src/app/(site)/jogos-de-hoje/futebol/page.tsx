import type { Metadata } from "next";
import { Calendar } from "lucide-react";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { AgendaTabs } from "@/components/agenda/agenda-tabs";
import { MatchCarousel } from "@/components/match-bar/match-carousel";
import { LiveScoreProvider } from "@/components/world-cup/copa-live-provider";
import { getFootballAgendaForDay, type AgendaEvent } from "@/lib/data/agenda";
import type { MatchBarCardProps } from "@/components/match-bar/match-bar-card";

export const revalidate = 300;

export const metadata: Metadata = {
  alternates: { canonical: "/jogos-de-hoje/futebol" },
  title: "Jogos de Futebol de Hoje: Copa do Mundo e Campeonatos",
  description:
    "Todos os jogos de futebol de hoje: Copa do Mundo, Brasileirão, Copa do Brasil, Libertadores e mais, com horários, placar ao vivo e onde assistir.",
};

function toCard(e: AgendaEvent): MatchBarCardProps {
  const status =
    e.statusType === "inprogress"
      ? "live"
      : e.statusType === "finished"
        ? "finished"
        : "scheduled";
  return {
    id: `api_${e.id}`,
    homeTeam: e.home,
    awayTeam: e.away,
    homeLogo: e.homeId ? `/api/team-img/${e.homeId}` : null,
    awayLogo: e.awayId ? `/api/team-img/${e.awayId}` : null,
    homeScore: e.homeScore,
    awayScore: e.awayScore,
    time: e.time,
    timestamp: e.timestamp,
    status,
    statusText: e.status || (status === "live" ? "Ao Vivo" : ""),
    league: e.league,
    href: e.href,
  };
}

export default async function AgendaFutebolPage() {
  const leagues = await getFootballAgendaForDay(new Date()).catch(() => []);
  // Liga o polling ao vivo se houver jogo da Copa hoje (mesmo padrão da home).
  const hasCopa = leagues.some((lg) => lg.league === "Copa do Mundo");

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <PageBreadcrumb
        className="mb-4"
        items={[
          { label: "Início", href: "/" },
          { label: "Jogos de Hoje", href: "/jogos-de-hoje" },
          { label: "Futebol" },
        ]}
      />
      <h1 className="text-xl font-bold text-text-primary mb-4 flex items-center gap-2">
        <Calendar className="h-6 w-6 text-green" />
        Jogos de Futebol de Hoje
      </h1>

      <AgendaTabs active="futebol" />

      {leagues.length === 0 ? (
        <div className="bg-card-bg rounded-lg border border-border-custom py-12 text-center">
          <Calendar className="h-10 w-10 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted text-sm">
            Nenhum jogo dos principais campeonatos de futebol hoje. Confira a{" "}
            <a href="/jogos-de-hoje" className="text-green font-semibold hover:underline">
              agenda geral
            </a>
            .
          </p>
        </div>
      ) : (
        <LiveScoreProvider endpoints={hasCopa ? ["/api/copa/ao-vivo"] : []}>
          <div className="space-y-4">
            {leagues.map((lg) => (
              <MatchCarousel
                key={lg.league}
                title={lg.league}
                count={lg.events.length}
                matches={lg.events.map(toCard)}
              />
            ))}
          </div>
        </LiveScoreProvider>
      )}

      <p className="text-[11px] text-text-muted mt-6">
        Horários de Brasília. Copa do Mundo e principais campeonatos do Brasil e do mundo.
      </p>
    </div>
  );
}
