import type { Metadata } from "next";
import { jsonLd } from "@/lib/json-ld";
import { getStoredFootballAgenda, type AgendaLeagueGroup } from "@/lib/data/agenda";
import { getPayloadPage } from "@/lib/data/payload-pages";
import { getWatchPosts, type WatchPost } from "@/lib/data/watch";
import { splitByStatus, liveEndpointsFor } from "@/lib/ao-vivo";
import { TOURNAMENTS, champPath } from "@/lib/config";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { LiveScoreProvider } from "@/components/world-cup/copa-live-provider";
import { MatchCarousel } from "@/components/match-bar/match-carousel";
import { agendaEventToCard } from "@/components/payload/agenda-blocks";
import { WatchPostsStrip } from "@/components/onde-assistir/watch-post-card";
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

function Section({
  title,
  tone = "default",
  groups,
}: {
  title: string;
  tone?: "live" | "default" | "muted";
  groups: AgendaLeagueGroup[];
}) {
  if (!groups.length) return null;
  const total = groups.reduce((n, g) => n + g.events.length, 0);
  const color = tone === "live" ? "border-red text-red" : tone === "muted" ? "border-border-custom text-text-secondary" : "border-green text-text-primary";
  return (
    <section>
      <h2 className={`mb-3 flex items-center gap-2 border-b-2 pb-2 text-lg font-bold ${color}`}>
        {tone === "live" && <span className="h-2.5 w-2.5 animate-pulse rounded-full bg-red" aria-hidden />}
        {title} <span className="text-sm font-semibold text-text-muted">({total})</span>
      </h2>
      <div className="space-y-4">
        {groups.map((g) => {
          const slug = slugByName.get(g.league);
          return (
            <MatchCarousel
              key={g.league}
              title={g.league}
              count={g.events.length}
              href={slug ? champPath(slug) : undefined}
              hrefLabel="Tabela"
              matches={g.events.map(agendaEventToCard)}
            />
          );
        })}
      </div>
    </section>
  );
}

export default async function AoVivoPage() {
  const [page, leagues, watch] = await Promise.all([
    getPayloadPage("ao-vivo").catch(() => null),
    getStoredFootballAgenda().catch(() => []),
    getWatchPosts({ upcoming: true, limit: 8 }).catch(() => [] as WatchPost[]),
  ]);
  const { live, upcoming, finished } = splitByStatus(leagues);
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
          <Section title="Ao vivo agora" tone="live" groups={live} />
          <WatchPostsStrip posts={watch} title="Onde assistir os próximos jogos" />
          <Section title="Ainda hoje" groups={upcoming} />
          <Section title="Encerrados hoje" tone="muted" groups={finished} />

          {!leagues.length && (
            <div className="rounded-lg border border-border-custom bg-card-bg p-8 text-center">
              <p className="text-base font-semibold text-text-primary">Nenhum jogo ao vivo agora.</p>
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
