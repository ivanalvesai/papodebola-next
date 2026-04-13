import { WorldCupBanner } from "@/components/world-cup-banner";
import { MatchBar } from "@/components/match-bar/match-bar";
import { HighlightsSection } from "@/components/home/highlights-section";
import { NewsSection } from "@/components/home/news-section";
import { TransfersSection } from "@/components/home/transfers-section";
import { StandingsWidget } from "@/components/sidebar/standings-widget";
import { ScorersWidget } from "@/components/sidebar/scorers-widget";
import { NextMatchWidget } from "@/components/sidebar/next-match-widget";
import { RecentResultsWidget } from "@/components/sidebar/recent-results-widget";
import { MyTeamWidget } from "@/components/sidebar/my-team-widget";

import { getTodayMatches } from "@/lib/data/matches";
import { getCBFUpcomingMatches } from "@/lib/data/cbf-calendar";
import { getHighlights, getTransfers } from "@/lib/data/home";
import { getLatestArticles } from "@/lib/data/articles";
import { getBrasileiraoStandings } from "@/lib/data/standings";
import { getTopScorers } from "@/lib/data/scorers";
import { getChampionshipData } from "@/lib/data/championship";
import type { ChampionshipMatch } from "@/types/match";

export const revalidate = 1800;

async function getNextMatch(): Promise<ChampionshipMatch | null> {
  const data = await getChampionshipData("brasileirao-serie-a");
  if (!data?.matchesByRound) return null;

  const now = Date.now() / 1000;
  let next: ChampionshipMatch | null = null;

  for (const round of Object.keys(data.matchesByRound).map(Number).sort((a, b) => a - b)) {
    for (const m of data.matchesByRound[round]) {
      if (m.status === "notstarted" && m.timestamp > now) {
        if (!next || m.timestamp < next.timestamp) {
          next = m;
        }
      }
    }
    if (next) break;
  }

  return next;
}

export default async function HomePage() {
  const [
    todayMatches,
    cbfUpcoming,
    highlights,
    transfers,
    articles,
    standings,
    scorers,
    nextMatch,
  ] = await Promise.all([
    getTodayMatches().catch(() => []),
    getCBFUpcomingMatches().catch(() => []),
    getHighlights().catch(() => []),
    getTransfers().catch(() => []),
    getLatestArticles(20).catch(() => []),
    getBrasileiraoStandings().catch(() => []),
    getTopScorers().catch(() => []),
    getNextMatch().catch(() => null),
  ]);

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
            <TransfersSection transfers={transfers} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            <MyTeamWidget />
            <NextMatchWidget match={nextMatch} />
            <StandingsWidget standings={standings} />
            <ScorersWidget scorers={scorers} />
            <RecentResultsWidget matches={todayMatches} />
          </aside>
        </div>
      </div>
    </>
  );
}
