import type { Metadata } from "next";
import { WorldCupBanner } from "@/components/world-cup-banner";
import { MatchBar } from "@/components/match-bar/match-bar";
import { CopaLiveProvider } from "@/components/world-cup/copa-live-provider";
// Destaques e Melhores Momentos desativado temporariamente (reativar depois).
// import { HighlightsSection } from "@/components/home/highlights-section";
import { NewsSection } from "@/components/home/news-section";
import { TransfersSection } from "@/components/home/transfers-section";
import { StandingsWidget } from "@/components/sidebar/standings-widget";
import { WorldCupGroupsWidget } from "@/components/sidebar/world-cup-groups-widget";
import { ScorersWidget } from "@/components/sidebar/scorers-widget";
import { NextMatchWidget } from "@/components/sidebar/next-match-widget";
import { RecentResultsWidget } from "@/components/sidebar/recent-results-widget";
import { MyTeamWidget } from "@/components/sidebar/my-team-widget";

import { getTodayMatches, getWorldCupBarMatches } from "@/lib/data/matches";
import { getCBFUpcomingMatches } from "@/lib/data/cbf-calendar";
import { getTransfers } from "@/lib/data/home"; // getHighlights desativado (ver Destaques)
import { getLatestArticles } from "@/lib/data/articles";
import { getBrasileiraoStandings, getWorldCupStandings } from "@/lib/data/standings";
import { getTopScorers } from "@/lib/data/scorers";
import { getChampionshipData } from "@/lib/data/championship";
import { enrichStandingsWithForm } from "@/lib/standings-utils";
import { getPageOverride } from "@/lib/data/page-overrides-store";
import type { ChampionshipMatch } from "@/types/match";
import type { ChampionshipData } from "@/types/tournament";

export const revalidate = 1800;

// Defaults da home (usados quando não há override editado no painel "Páginas").
const HOME_DEFAULTS = {
  h1: "Papo de Bola — Futebol brasileiro e mundial: notícias, jogos ao vivo e classificações",
  metaTitle: "Papo de Bola | Futebol e Esportes do Brasil e do Mundo",
  metaDescription:
    "Acompanhe notícias de futebol e esportes, jogos de hoje, resultados ao vivo, tabelas, classificações e as principais competições do mundo.",
};

// Lê o override editável no painel (aba "Páginas") com fallback pros defaults.
export async function generateMetadata(): Promise<Metadata> {
  const ov = await getPageOverride("/");
  const title = ov.metaTitle || HOME_DEFAULTS.metaTitle;
  const description = ov.metaDescription || HOME_DEFAULTS.metaDescription;
  return {
    // `absolute` evita o template "%s | Papo de Bola" do layout (senao duplicaria a marca).
    title: { absolute: title },
    description,
    alternates: { canonical: "/" },
    openGraph: { title, description },
  };
}

export default async function HomePage() {
  const homeOverride = await getPageOverride("/");
  const [
    todayMatches,
    copaBar,
    cbfUpcoming,
    // highlights,  // Destaques desativado temporariamente
    transfers,
    articles,
    rawStandings,
    worldCupGroups,
    scorers,
    champData,
  ] = await Promise.all([
    getTodayMatches().catch(() => []),
    getWorldCupBarMatches().catch(() => []),
    getCBFUpcomingMatches().catch(() => []),
    // getHighlights().catch(() => []),  // Destaques desativado temporariamente
    getTransfers().catch(() => []),
    getLatestArticles(20).catch(() => []),
    getBrasileiraoStandings().catch(() => []),
    getWorldCupStandings().catch(() => []),
    getTopScorers().catch(() => []),
    getChampionshipData("brasileirao-serie-a").catch(() => null as ChampionshipData | null),
  ]);

  // Enrich standings with form dots from matches already loaded — zero extra API requests
  const standings = champData
    ? enrichStandingsWithForm(rawStandings, champData.matchesByRound, champData.currentRound)
    : rawStandings;

  // Find next scheduled match from championship data already loaded
  let nextMatch: ChampionshipMatch | null = null;
  if (champData?.matchesByRound) {
    const now = Date.now() / 1000;
    for (const round of Object.keys(champData.matchesByRound).map(Number).sort((a, b) => a - b)) {
      for (const m of champData.matchesByRound[round]) {
        if (m.status === "notstarted" && m.timestamp > now) {
          if (!nextMatch || m.timestamp < nextMatch.timestamp) {
            nextMatch = m;
          }
        }
      }
      if (nextMatch) break;
    }
  }

  // Durante a Copa, a barra de cima mostra os jogos da Copa de hoje + proximos 2
  // dias (com link pra página do jogo ao vivo), ordenados por horario real e com
  // a data no card. Sem jogos da Copa, cai pros jogos gerais de hoje.
  const copaToday = copaBar;
  const barMatches = copaToday.length ? copaToday : todayMatches;

  return (
    <>
      {/* H1 da home (acessível, sem alterar o layout) — sinal de tópico principal. */}
      <h1 className="sr-only">{homeOverride.h1 || HOME_DEFAULTS.h1}</h1>
      <WorldCupBanner />
      {/* Com jogo da Copa hoje, embrulha a barra no provider de placar ao vivo
          (mesmo polling de 15s da tabela da Copa, endpoint cacheado: N clientes
          = 1 chamada à API). Sem jogo da Copa, barra normal sem polling. */}
      {copaToday.length ? (
        <CopaLiveProvider>
          <MatchBar todayMatches={barMatches} cbfUpcoming={cbfUpcoming} />
        </CopaLiveProvider>
      ) : (
        <MatchBar todayMatches={barMatches} cbfUpcoming={cbfUpcoming} />
      )}

      <div className="mx-auto max-w-[1240px] px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Main content */}
          <div className="space-y-6">
            {/* Destaques e Melhores Momentos — desativado temporariamente, reativar depois:
            <HighlightsSection highlights={highlights} /> */}
            <NewsSection articles={articles} />
            {/* Tabelas no celular: logo apos as noticias, antes do Mercado da Bola.
                So aparece no mobile (no desktop ficam no sidebar). */}
            <div className="space-y-6 lg:hidden">
              <WorldCupGroupsWidget groups={worldCupGroups} />
              <StandingsWidget standings={standings} />
            </div>
            <TransfersSection transfers={transfers} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Tabelas no topo do sidebar (desktop): Copa do Mundo 2026 alinhada com
                as Ultimas Noticias + Brasileirao logo abaixo. So no desktop; no mobile
                sobem pra logo apos as noticias (ver bloco lg:hidden no main). */}
            <div className="hidden lg:block space-y-6">
              <WorldCupGroupsWidget groups={worldCupGroups} />
              <StandingsWidget standings={standings} />
            </div>
            <MyTeamWidget />
            <NextMatchWidget match={nextMatch} />
            <ScorersWidget scorers={scorers} />
            <RecentResultsWidget matches={todayMatches} />
          </aside>
        </div>
      </div>
    </>
  );
}
