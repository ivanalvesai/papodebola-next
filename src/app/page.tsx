import { WorldCupBanner } from "@/components/world-cup-banner";
import { MatchBar } from "@/components/match-bar/match-bar";
import { HighlightsSection } from "@/components/home/highlights-section";
import { NewsSection } from "@/components/home/news-section";
import { TransfersSection } from "@/components/home/transfers-section";
import { StandingsWidget } from "@/components/sidebar/standings-widget";
import { WorldCupGroupsWidget } from "@/components/sidebar/world-cup-groups-widget";
import { ScorersWidget } from "@/components/sidebar/scorers-widget";
import { NextMatchWidget } from "@/components/sidebar/next-match-widget";
import { RecentResultsWidget } from "@/components/sidebar/recent-results-widget";
import { MyTeamWidget } from "@/components/sidebar/my-team-widget";

import { getTodayMatches } from "@/lib/data/matches";
import { getCBFUpcomingMatches } from "@/lib/data/cbf-calendar";
import { getHighlights, getTransfers } from "@/lib/data/home";
import { getLatestArticles } from "@/lib/data/articles";
import { getBrasileiraoStandings, getWorldCupStandings } from "@/lib/data/standings";
import { getTopScorers } from "@/lib/data/scorers";
import { getChampionshipData } from "@/lib/data/championship";
import { enrichStandingsWithForm } from "@/lib/standings-utils";
import type { ChampionshipMatch } from "@/types/match";
import type { ChampionshipData } from "@/types/tournament";

export const revalidate = 1800;

export default async function HomePage() {
  const [
    todayMatches,
    cbfUpcoming,
    highlights,
    transfers,
    articles,
    rawStandings,
    worldCupGroups,
    scorers,
    champData,
  ] = await Promise.all([
    getTodayMatches().catch(() => []),
    getCBFUpcomingMatches().catch(() => []),
    getHighlights().catch(() => []),
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

  return (
    <>
      <WorldCupBanner />
      <MatchBar todayMatches={todayMatches} cbfUpcoming={cbfUpcoming} />

      <div className="mx-auto max-w-[1240px] px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Main content */}
          <div className="space-y-6">
            <HighlightsSection highlights={highlights} />
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
            <MyTeamWidget />
            <NextMatchWidget match={nextMatch} />
            {/* Tabelas no desktop: Copa do Mundo antes do Brasileirao.
                So aparece no desktop (no mobile sobem pra logo apos as noticias). */}
            <div className="hidden lg:block space-y-6">
              <WorldCupGroupsWidget groups={worldCupGroups} />
              <StandingsWidget standings={standings} />
            </div>
            <ScorersWidget scorers={scorers} />
            <RecentResultsWidget matches={todayMatches} />
          </aside>
        </div>
      </div>
    </>
  );
}
