import type { Metadata } from "next";
import { MatchBar } from "@/components/match-bar/match-bar";
import { LiveScoreProvider } from "@/components/world-cup/copa-live-provider";
// Destaques e Melhores Momentos desativado temporariamente (reativar depois).
// import { HighlightsSection } from "@/components/home/highlights-section";
import { NewsSection } from "@/components/home/news-section";
import { CasasApostasSection } from "@/components/home/casas-apostas-section";
import { TransfersSection } from "@/components/home/transfers-section";
import { StandingsWidget } from "@/components/sidebar/standings-widget";
import { ScorersWidget } from "@/components/sidebar/scorers-widget";
import { NextMatchWidget } from "@/components/sidebar/next-match-widget";
import { RecentResultsWidget } from "@/components/sidebar/recent-results-widget";
import { MyTeamWidget } from "@/components/sidebar/my-team-widget";

import { getTodayMatches, getBrazilianBarMatches, freshMatches, relevantBarMatches, mergeBarMatches } from "@/lib/data/matches";
import { getTransfers } from "@/lib/data/home"; // getHighlights desativado (ver Destaques)
import { getLatestArticles, getArticles } from "@/lib/data/articles";
import { getBrasileiraoStandings } from "@/lib/data/standings";
import { getTopScorers } from "@/lib/data/scorers";
import { getChampionshipData } from "@/lib/data/championship";
import { enrichStandingsWithForm } from "@/lib/standings-utils";
import { Editable, getEditableText } from "@/components/editable";
import type { ChampionshipMatch } from "@/types/match";
import type { ChampionshipData } from "@/types/tournament";

export const revalidate = 1800;

// Title/description editáveis no painel "Páginas" (com fallback no default do registro).
export async function generateMetadata(): Promise<Metadata> {
  const [title, description] = await Promise.all([
    getEditableText("home.meta.title"),
    getEditableText("home.meta.description"),
  ]);
  return {
    // `absolute` evita o template "%s | Papo de Bola" do layout (senao duplicaria a marca).
    title: { absolute: title },
    description,
    alternates: { canonical: "/" },
    // images explícito: o openGraph aqui SUBSTITUI o do layout, então sem isto a
    // home ficava sem og:image (preview vazio ao compartilhar). Reusa o og-image.jpg.
    openGraph: {
      title,
      description,
      images: [{ url: "/og-image.jpg", width: 1200, height: 630 }],
    },
  };
}

export default async function HomePage() {
  const [
    todayMatches,
    brazilBar,
    // highlights,  // Destaques desativado temporariamente
    transfers,
    articles,
    casasArticles,
    rawStandings,
    scorers,
    champData,
  ] = await Promise.all([
    getTodayMatches().catch(() => []),
    getBrazilianBarMatches().catch(() => ({ today: [], upcoming: [] })),
    // getHighlights().catch(() => []),  // Destaques desativado temporariamente
    getTransfers().catch(() => []),
    getLatestArticles(20).catch(() => []),
    getArticles({ perPage: 12, category: "Casas de Apostas" })
      .then((r) => r.articles)
      .catch(() => []),
    getBrasileiraoStandings().catch(() => []),
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

  // Aba "Hoje": jogos de HOJE das ligas BR (Série A/B/C + Copa do Brasil, via CBF confiável
  // + ao vivo) MESCLADOS com as demais ligas relevantes de hoje que porventura estejam ao
  // vivo (Libertadores, Champions, etc.). O feed por data da API anda quebrado (devolve 0),
  // então os agendados de hoje vêm do calendário CBF — por isso a aba "Hoje" mostra os jogos
  // do dia mesmo antes de começarem. Aba "Próximos": só os próximos dias (brazilBar.upcoming).
  const barMatches = mergeBarMatches(
    relevantBarMatches(freshMatches(todayMatches)),
    brazilBar.today
  );

  // Placar ao vivo do bar SEM bater na API: faz polling dos endpoints de ao vivo que JÁ
  // existem (cacheados+gateados, compartilhados com as páginas das ligas). Só liga o
  // polling quando há jogo ao vivo ou prestes a começar (≤90min) — senão o bar fica estático.
  const nowSec = Date.now() / 1000;
  const leagueLiveSoon = brazilBar.today.some(
    (m) =>
      m.status === "live" ||
      m.status === "halftime" ||
      (m.status === "scheduled" && m.timestamp - nowSec < 90 * 60)
  );
  const liveEndpoints = leagueLiveSoon
    ? [
        "/api/championship/brasileirao-serie-a/ao-vivo",
        "/api/championship/brasileirao-serie-b/ao-vivo",
      ]
    : [];

  return (
    <>
      {/* H1 da home (acessível, sem alterar o layout) — sinal de tópico principal. */}
      <Editable id="home.h1" as="h1" className="sr-only" />
      {/* Provider de placar ao vivo pra barra: só faz polling quando há jogo BR ao vivo
          ou prestes a começar (endpoint cacheado: N clientes = 1 chamada à API). */}
      <LiveScoreProvider endpoints={liveEndpoints}>
        <MatchBar todayMatches={barMatches} upcomingMatches={brazilBar.upcoming} />
      </LiveScoreProvider>

      <div className="mx-auto max-w-[1240px] px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_340px] gap-6">
          {/* Main content */}
          <div className="space-y-6">
            {/* Destaques e Melhores Momentos — desativado temporariamente, reativar depois:
            <HighlightsSection highlights={highlights} /> */}
            <NewsSection articles={articles} />
            {/* Card "Casas de Apostas" entre as Ultimas Noticias e o Mercado da Bola.
                So aparece quando ha post publicado na categoria (senao nao renderiza). */}
            <CasasApostasSection articles={casasArticles} />
            {/* Tabelas no celular: logo apos as noticias, antes do Mercado da Bola.
                So aparece no mobile (no desktop ficam no sidebar). */}
            <div className="space-y-6 lg:hidden">
              <StandingsWidget standings={standings} />
            </div>
            <TransfersSection transfers={transfers} />
          </div>

          {/* Sidebar */}
          <aside className="space-y-6">
            {/* Tabela do Brasileirão no topo do sidebar (desktop), alinhada com as Ultimas
                Noticias. So no desktop; no mobile sobe pra logo apos as noticias. */}
            <div className="hidden lg:block space-y-6">
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
