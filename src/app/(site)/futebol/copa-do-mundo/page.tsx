import type { Metadata } from "next";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { KnockoutMatches } from "@/components/world-cup/knockout-matches";
import { currentKnockoutPhase } from "@/lib/world-cup-phases";
import { WorldCupTournamentSchema } from "@/components/seo/world-cup-tournament-schema";
import { GroupRow } from "@/components/world-cup/group-row";
import { PhaseNav } from "@/components/world-cup/phase-nav";
import { CopaLiveProvider } from "@/components/world-cup/copa-live-provider";
import { SelecoesCarousel } from "@/components/world-cup/selecoes-carousel";
import { WorldCupScorers } from "@/components/world-cup/world-cup-scorers";
import { NewsFeed } from "@/components/news/news-feed";
import { getWorldCupData, getKnockoutFixtures } from "@/lib/data/world-cup";
import { getWorldCupScorers } from "@/lib/data/scorers";
import { getArticles } from "@/lib/data/articles";
import { getEditableText } from "@/components/editable";

const COPA_CATEGORY = "Copa do Mundo";

// 10 min durante a Copa: a pagina re-renderiza rapido pra a tabela de pontos
// pegar o standings fresco (TTL 5 min). Sem isso, o HTML so atualizava a cada
// 30 min e segurava pontos errados de jogo recem-terminado. (Placar dos cards ja
// e ao vivo via CopaLiveProvider; aqui e a tabela de classificacao.)
export const revalidate = 600;

export async function generateMetadata(): Promise<Metadata> {
  const [title, description] = await Promise.all([
    getEditableText("copa.meta.title"),
    getEditableText("copa.meta.description"),
  ]);
  return {
    alternates: { canonical: "/futebol/copa-do-mundo" },
    title,
    description,
  };
}

export default async function CopaDoMundoPage() {
  // Fase atual (por data): no mata-mata, o hub lidera com os confrontos da fase da vez
  // (jogos de hoje/oitavas) — antes dos grupos, que já são histórico.
  const phase = currentKnockoutPhase();
  const [{ groups }, scorers, cupNews, knockoutItems] = await Promise.all([
    getWorldCupData(),
    getWorldCupScorers(),
    getArticles({ category: COPA_CATEGORY, perPage: 20 }),
    phase.slug === "grupos" ? Promise.resolve([]) : getKnockoutFixtures(phase.slug, phase.round).catch(() => []),
  ]);
  const showPhase = phase.slug !== "grupos" && knockoutItems.length > 0;

  // Textos editáveis (painel "Páginas" → Copa do Mundo), com fallback no registro.
  const [h1, intro, standingsEmpty, noticiasH2, noticiasSub] = await Promise.all([
    getEditableText("copa.h1"),
    getEditableText("copa.intro"),
    getEditableText("copa.standings.empty"),
    getEditableText("copa.noticias.h2"),
    getEditableText("copa.noticias.sub"),
  ]);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <WorldCupTournamentSchema />
      <PageBreadcrumb
        className="mb-4"
        items={[{ label: "Início", href: "/" }, { label: "Copa do Mundo 2026" }]}
      />

      <h1 className="text-xl font-bold text-text-primary mb-1">{h1}</h1>
      <p className="text-sm text-text-muted mb-6">{intro}</p>

      {/* No mata-mata, os confrontos da fase atual (ex.: oitavas) lideram o hub. */}
      {showPhase && (
        <section className="mb-8">
          <div className="mb-3 flex items-center justify-between gap-2">
            <h2 className="text-lg font-bold text-text-primary">
              {phase.longLabel}: jogos, horários e onde assistir
            </h2>
            <Link
              href={phase.href}
              className="whitespace-nowrap text-sm font-semibold text-green hover:underline"
            >
              Ver chaveamento completo &rarr;
            </Link>
          </div>
          <KnockoutMatches items={knockoutItems} />
        </section>
      )}

      <section>
        {showPhase && (
          <h2 className="mb-3 text-lg font-bold text-text-primary">Classificação dos grupos</h2>
        )}
        <PhaseNav active="grupos" />
        {groups.length === 0 ? (
          <p className="text-text-muted text-sm py-6">{standingsEmpty}</p>
        ) : (
          <CopaLiveProvider>
            <div className="space-y-4">
              {groups.map((g) => (
                <GroupRow key={g.name} group={g} />
              ))}
            </div>
          </CopaLiveProvider>
        )}
      </section>

      {/* Artilharia: logo apos as tabelas de grupos, antes das selecoes */}
      <WorldCupScorers scorers={scorers} />

      {/* Carrossel de seleções (estilo ge.globo) */}
      <SelecoesCarousel />

      {/* Notícias da Copa: mesmo feed da home (foto + título + trecho), filtrado
          pela categoria Copa do Mundo, com rolagem infinita. */}
      <section className="mt-10 pt-6 border-t border-border-custom">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-green" />
          {noticiasH2}
        </h2>
        <p className="text-xs text-text-muted mb-4">{noticiasSub}</p>
        <div className="max-w-[760px]">
          <NewsFeed
            initial={cupNews.articles}
            category={COPA_CATEGORY}
            seeAllHref="/noticias/copa-do-mundo"
          />
        </div>
      </section>
    </div>
  );
}
