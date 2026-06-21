import type { Metadata } from "next";
import { Trophy, Newspaper } from "lucide-react";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { WorldCupTournamentSchema } from "@/components/seo/world-cup-tournament-schema";
import { GroupRow } from "@/components/world-cup/group-row";
import { PhaseNav } from "@/components/world-cup/phase-nav";
import { CopaLiveProvider } from "@/components/world-cup/copa-live-provider";
import { SelecoesCarousel } from "@/components/world-cup/selecoes-carousel";
import { WorldCupScorers } from "@/components/world-cup/world-cup-scorers";
import { NewsFeed } from "@/components/news/news-feed";
import { getWorldCupData } from "@/lib/data/world-cup";
import { getWorldCupScorers } from "@/lib/data/scorers";
import { getArticles } from "@/lib/data/articles";

const COPA_CATEGORY = "Copa do Mundo";

// 10 min durante a Copa: a pagina re-renderiza rapido pra a tabela de pontos
// pegar o standings fresco (TTL 5 min). Sem isso, o HTML so atualizava a cada
// 30 min e segurava pontos errados de jogo recem-terminado. (Placar dos cards ja
// e ao vivo via CopaLiveProvider; aqui e a tabela de classificacao.)
export const revalidate = 600;

export const metadata: Metadata = {
  alternates: { canonical: "/futebol/copa-do-mundo" },
  title: "Tabela e Jogos da Copa do Mundo 2026",
  description:
    "Acompanhe a Copa do Mundo 2026 com tabela, classificação dos grupos, jogos, datas e horários atualizados.",
};

export default async function CopaDoMundoPage() {
  const [{ groups }, scorers, cupNews] = await Promise.all([
    getWorldCupData(),
    getWorldCupScorers(),
    getArticles({ category: COPA_CATEGORY, perPage: 20 }),
  ]);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <WorldCupTournamentSchema />
      <PageBreadcrumb
        className="mb-4"
        items={[{ label: "Início", href: "/" }, { label: "Copa do Mundo 2026" }]}
      />

      <h1 className="text-xl font-bold text-text-primary mb-1 flex items-center gap-2">
        <Trophy className="h-5 w-5 text-green" />
        Copa do Mundo 2026
      </h1>
      <p className="text-sm text-text-muted mb-6">
        Classificação de cada grupo e os jogos da rodada ao lado &middot; use a seta para avançar
        as rodadas. Horários de Brasília. Os 2 primeiros de cada grupo avançam (destaque em verde).
      </p>

      <section>
        <PhaseNav active="grupos" />
        {groups.length === 0 ? (
          <p className="text-text-muted text-sm py-6">Classificação indisponível no momento.</p>
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
          Notícias da Copa do Mundo
        </h2>
        <p className="text-xs text-text-muted mb-4">
          Últimas notícias, bastidores e análises da Copa do Mundo 2026
        </p>
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
