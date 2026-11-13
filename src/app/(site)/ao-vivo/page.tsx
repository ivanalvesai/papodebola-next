import type { Metadata } from "next";
import { jsonLd } from "@/lib/json-ld";
import { getStoredFootballAgenda } from "@/lib/data/agenda";
import { getPayloadPage } from "@/lib/data/payload-pages";
import { liveEndpointsFor, orderCompetitions, competitionIntro } from "@/lib/ao-vivo";
import { TOURNAMENTS, champPath } from "@/lib/config";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { LiveScoreProvider } from "@/components/world-cup/copa-live-provider";
import { LiveMatchCard } from "@/components/ao-vivo/live-match-card";
import { PageBlock } from "@/components/payload/page-blocks";
import { buildMetadata } from "@/lib/seo/build-metadata";

// /ao-vivo: jogos de futebol de hoje com placar em tempo real, no layout do site.
// Dados da agenda SALVA (store do dev, 1/min) — nada de API no render (o endpoint por
// data da API está quebrado). Placar ao vivo pelo polling compartilhado (LiveScoreProvider).
export const revalidate = 60;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";
const PATH = "/ao-vivo";
const DEFAULT_TITLE = "Jogos ao vivo hoje: placares em tempo real e onde assistir | Papo de Bola";
const DEFAULT_DESC =
  "Acompanhe os jogos de futebol ao vivo hoje com placar em tempo real, horários, onde assistir e lance a lance: Brasileirão, Liga das Nações, Champions e mais.";
const DEFAULT_H1 = "Jogos ao vivo hoje";
const DEFAULT_SUBTITLE =
  "Placar em tempo real dos jogos de futebol de hoje, com horário de Brasília, onde assistir e o lance a lance de cada partida.";

const slugByName = new Map(Object.values(TOURNAMENTS).map((t) => [t.name, t.slug]));
const anchor = (league: string) =>
  league.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPayloadPage("ao-vivo").catch(() => null);
  const title = page?.seo?.metaTitle || DEFAULT_TITLE;
  const description = page?.seo?.metaDescription || DEFAULT_DESC;
  return buildMetadata(PATH, {
    title: { absolute: title },
    description,
    alternates: { canonical: PATH },
    openGraph: { title, description, url: `${SITE_URL}${PATH}`, type: "website", siteName: "Papo de Bola", locale: "pt_BR" },
    twitter: { card: "summary_large_image", title, description },
  });
}

export default async function AoVivoPage() {
  const [page, leagues] = await Promise.all([
    getPayloadPage("ao-vivo").catch(() => null),
    getStoredFootballAgenda().catch(() => []),
  ]);
  const competitions = orderCompetitions(leagues);
  const liveNow = competitions.reduce((n, c) => n + c.live, 0);
  const total = competitions.reduce((n, c) => n + c.events.length, 0);
  const endpoints = liveEndpointsFor(leagues);
  const h1 = page?.hero?.h1 || DEFAULT_H1;
  const subtitle = page?.hero?.subtitle || DEFAULT_SUBTITLE;
  const blocks = page?.layout || [];

  const events = leagues.flatMap((l) => l.events.map((e) => ({ ...e, league: l.league })));
  const collectionLd = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: h1,
    description: DEFAULT_DESC,
    url: `${SITE_URL}${PATH}`,
    inLanguage: "pt-BR",
    mainEntity: {
      "@type": "ItemList",
      itemListElement: events.slice(0, 40).map((e, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "SportsEvent",
          name: `${e.home} x ${e.away}`,
          sport: "Futebol",
          startDate: new Date(e.timestamp * 1000).toISOString(),
          homeTeam: { "@type": "SportsTeam", name: e.home },
          awayTeam: { "@type": "SportsTeam", name: e.away },
          ...(e.href ? { url: `${SITE_URL}${e.href}` } : {}),
          superEvent: { "@type": "SportsEvent", name: e.league },
        },
      })),
    },
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Ao Vivo", item: `${SITE_URL}${PATH}` },
    ],
  };

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <PageBreadcrumb className="mb-3" items={[{ label: "Início", href: "/" }, { label: "Ao Vivo" }]} />
      <h1 className="text-2xl font-bold leading-tight text-text-primary sm:text-3xl">{h1}</h1>
      <p className="mb-8 mt-2 max-w-[760px] text-base text-text-secondary">{subtitle}</p>

      <LiveScoreProvider endpoints={endpoints}>
        <div className="space-y-10">
          {competitions.length > 0 && (
            <nav aria-label="Campeonatos de hoje" className="flex flex-wrap gap-2">
              <span className="py-1 text-sm font-semibold text-text-secondary">
                {total} {total === 1 ? "jogo" : "jogos"} hoje{liveNow ? `, ${liveNow} ao vivo agora` : ""}:
              </span>
              {competitions.map((c) => (
                <a
                  key={c.league}
                  href={`#${anchor(c.league)}`}
                  className={`rounded-full border px-3 py-1 text-sm font-semibold transition-colors hover:border-green hover:text-green ${c.live ? "border-red text-red" : "border-border-custom text-text-primary"}`}
                >
                  {c.league} ({c.events.length})
                </a>
              ))}
            </nav>
          )}

          {competitions.map((c) => {
            const slug = slugByName.get(c.league);
            const champ = slug ? champPath(slug) : undefined;
            return (
              <section key={c.league} id={anchor(c.league)} className="scroll-mt-24">
                <div className={`mb-2 flex flex-wrap items-baseline justify-between gap-2 border-b-2 pb-2 ${c.live ? "border-red" : "border-green"}`}>
                  <h2 className="flex items-center gap-2 text-xl font-bold text-text-primary">
                    {c.live > 0 && <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red" aria-hidden />}
                    {c.league}: jogos de hoje e placar ao vivo
                  </h2>
                  {champ && (
                    <a href={champ} className="text-sm font-semibold text-green hover:underline">
                      Tabela e rodadas da {c.league}
                    </a>
                  )}
                </div>
                <p className="mb-4 text-base text-text-secondary">{competitionIntro(c.league, c.events)}</p>
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                  {c.events.map((e) => (
                    <LiveMatchCard key={e.id} e={e} fallbackHref={champ} />
                  ))}
                </div>
              </section>
            );
          })}

          {!leagues.length && (
            <div className="rounded-lg border border-border-custom bg-card-bg p-8 text-center">
              <p className="text-base font-semibold text-text-primary">Nenhum jogo na agenda de hoje.</p>
              <p className="mt-1 text-sm text-text-secondary">
                Veja a{" "}
                <a href="/jogos-de-hoje/futebol" className="font-semibold text-green">
                  agenda de jogos de hoje
                </a>{" "}
                e{" "}
                <a href="/onde-assistir" className="font-semibold text-green">
                  onde assistir aos próximos jogos
                </a>
                .
              </p>
            </div>
          )}

          {blocks.length > 0 && (
            <div className="space-y-4 leading-relaxed text-text-secondary">
              {blocks.map((block: unknown, i: number) => (
                <PageBlock key={i} block={block} />
              ))}
            </div>
          )}
        </div>
      </LiveScoreProvider>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(collectionLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbLd) }} />
    </div>
  );
}
