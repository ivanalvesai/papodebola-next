import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trophy, Newspaper } from "lucide-react";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { PhaseNav } from "@/components/world-cup/phase-nav";
import { KnockoutMatches } from "@/components/world-cup/knockout-matches";
import { NewsFeed } from "@/components/news/news-feed";
import { getWorldCupKnockout } from "@/lib/data/world-cup";
import { getArticles } from "@/lib/data/articles";
import { KNOCKOUT_PHASES, PHASE_BY_SLUG } from "@/lib/world-cup-phases";

const COPA_CATEGORY = "Copa do Mundo";

export const revalidate = 1800;

// Pré-gera as páginas das fases eliminatórias (16-avos, oitavas, quartas, semis, final).
export function generateStaticParams() {
  return KNOCKOUT_PHASES.map((p) => ({ fase: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ fase: string }>;
}): Promise<Metadata> {
  const { fase } = await params;
  const phase = PHASE_BY_SLUG[fase];
  if (!phase || phase.slug === "grupos") return {};

  return {
    alternates: { canonical: phase.href },
    title: `${phase.longLabel} da Copa do Mundo 2026 — Jogos e Chaveamento`,
    description: `Confrontos, datas, horários e resultados das ${phase.longLabel} da Copa do Mundo 2026.`,
  };
}

export default async function CopaFasePage({
  params,
}: {
  params: Promise<{ fase: string }>;
}) {
  const { fase } = await params;
  const phase = PHASE_BY_SLUG[fase];
  if (!phase || phase.slug === "grupos" || phase.round === null) notFound();

  const [matches, cupNews] = await Promise.all([
    getWorldCupKnockout(phase.round),
    getArticles({ category: COPA_CATEGORY, perPage: 20 }),
  ]);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <PageBreadcrumb
        className="mb-4"
        items={[
          { label: "Início", href: "/" },
          { label: "Copa do Mundo 2026", href: "/futebol/copa-do-mundo" },
          { label: phase.longLabel },
        ]}
      />

      <h1 className="mb-1 flex items-center gap-2 text-xl font-bold text-text-primary">
        <Trophy className="h-5 w-5 text-green" />
        Copa do Mundo 2026
      </h1>
      <p className="mb-6 text-sm text-text-muted">
        Navegue pelas fases da Copa &middot; horários de Brasília.
      </p>

      <PhaseNav active={phase.slug} />

      <section>
        <h2 className="mb-4 text-lg font-bold text-text-primary">{phase.longLabel}</h2>
        <KnockoutMatches matches={matches} />
      </section>

      {/* Notícias da Copa: dá profundidade e linka internamente enquanto o
          chaveamento não está definido. */}
      <section className="mt-10 border-t border-border-custom pt-6">
        <h2 className="flex items-center gap-2 text-lg font-bold text-text-primary">
          <Newspaper className="h-5 w-5 text-green" />
          Notícias da Copa do Mundo
        </h2>
        <p className="mb-4 text-xs text-text-muted">
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
