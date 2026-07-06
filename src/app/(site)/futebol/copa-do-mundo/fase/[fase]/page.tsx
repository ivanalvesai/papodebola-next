import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Trophy, Newspaper } from "lucide-react";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { PhaseNav } from "@/components/world-cup/phase-nav";
import { KnockoutMatches } from "@/components/world-cup/knockout-matches";
import { WorldCupScorers } from "@/components/world-cup/world-cup-scorers";
import { NewsFeed } from "@/components/news/news-feed";
import { getKnockoutFixtures } from "@/lib/data/world-cup";
import { getWorldCupScorers } from "@/lib/data/scorers";
import { getArticles } from "@/lib/data/articles";
import { KNOCKOUT_PHASES, PHASE_BY_SLUG } from "@/lib/world-cup-phases";
import { knockoutVenueLabel } from "@/lib/world-cup-knockout-schedule";

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

  const [items, scorers, cupNews] = await Promise.all([
    getKnockoutFixtures(phase.slug, phase.round),
    getWorldCupScorers().catch(() => []),
    getArticles({ category: COPA_CATEGORY, perPage: 20 }),
  ]);

  // Schema SportsEvent de cada confronto (com data + estádio) enquanto é placeholder
  // — dá conteúdo estruturado pro Google ANTES dos times. Quando vira jogo real, cada
  // confronto linka pra página do jogo (que tem o próprio schema), então não duplica.
  const scheds = items.flatMap((i) => (i.kind === "placeholder" ? [i.sched] : []));
  const eventSchema =
    scheds.length > 0
      ? {
          "@context": "https://schema.org",
          "@graph": scheds.map((s) => ({
            "@type": "SportsEvent",
            name: `${phase.longLabel}: ${s.homeSlot} x ${s.awaySlot} — Copa do Mundo 2026`,
            sport: "Soccer",
            startDate: s.date,
            eventStatus: "https://schema.org/EventScheduled",
            location: {
              "@type": "Place",
              name: knockoutVenueLabel(s),
              address: { "@type": "PostalAddress", addressLocality: s.city, addressCountry: s.country },
            },
            organizer: { "@type": "Organization", name: "FIFA", url: "https://www.fifa.com" },
            superEvent: { "@type": "SportsEvent", name: "Copa do Mundo FIFA 2026" },
          })),
        }
      : null;

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      {eventSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(eventSchema) }}
        />
      )}
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
        Confrontos, datas e estádios das {phase.longLabel} da Copa do Mundo 2026. Os times
        entram automaticamente quando a fase de grupos terminar.
      </p>

      <section>
        <PhaseNav active={phase.slug} />
        <KnockoutMatches items={items} />
      </section>

      {/* Artilharia: segue em todas as fases (mesma da hub), até a final. */}
      <WorldCupScorers scorers={scorers} />

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
