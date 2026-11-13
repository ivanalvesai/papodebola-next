import type { Metadata } from "next";
import { jsonLd } from "@/lib/json-ld";
import { getArticles } from "@/lib/data/articles";
import { getPayloadPage } from "@/lib/data/payload-pages";
import { PageBlock } from "@/components/payload/page-blocks";
import { NewsFeed } from "@/components/news/news-feed";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import ChampionshipClient from "../../[slug]/championship-client";
import { getWatchPosts } from "@/lib/data/watch";
import { WatchPostsStrip } from "@/components/onde-assistir/watch-post-card";

// HUB da Liga das Nações (UEFA Nations League 26/27). Padrão da Copa Feminina:
// - CONTEÚDO (H1, subtítulo, SEO e blocos de texto) editável no /cms → Páginas, slug
//   "liga-das-nacoes" (DEDICATED_PAGE_ROUTES faz /paginas/liga-das-nacoes → aqui);
// - DADOS (classificação dos 14 grupos das Ligas A–D, rodadas, placar ao vivo) vêm do
//   motor genérico de campeonatos (TOURNAMENTS.NATIONS_LEAGUE → /api/championship/liga-das-nacoes).
// Os jogos ficam em ./jogo/{DD-MM-YYYY}/{casa}-{fora} (champPath em config.ts).
export const revalidate = 1800;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";
const CMS_SLUG = "liga-das-nacoes";
const SLUG = "liga-das-nacoes";
const CATEGORY = "Futebol Internacional";
const PATH = "/futebol/futebol-internacional/liga-das-nacoes";

const DEFAULT_TITLE = "Liga das Nações 2026/27: tabela, classificação e jogos ao vivo | Papo de Bola";
const DEFAULT_DESC =
  "Liga das Nações da UEFA 2026/27: classificação dos grupos das Ligas A, B, C e D, jogos de hoje, rodadas, resultados e lance a lance ao vivo.";
const DEFAULT_H1 = "Liga das Nações 2026/27";
const DEFAULT_SUBTITLE =
  "Classificação dos grupos, jogos da rodada e placar ao vivo das seleções europeias na Liga das Nações da UEFA.";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPayloadPage(CMS_SLUG).catch(() => null);
  const title = page?.seo?.metaTitle || DEFAULT_TITLE;
  const description = page?.seo?.metaDescription || DEFAULT_DESC;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: PATH },
    openGraph: { title, description, url: `${SITE_URL}${PATH}`, type: "website" },
  };
}

export default async function LigaDasNacoesHubPage() {
  const [page, res, watch] = await Promise.all([
    getPayloadPage(CMS_SLUG).catch(() => null),
    getArticles({ perPage: 20, category: CATEGORY }).catch(() => ({ articles: [] })),
    // Posts "onde assistir" dos próximos jogos: só o CARD aqui; o post mora em /onde-assistir/{slug}.
    getWatchPosts({ tag: "Liga das Nações", upcoming: true, limit: 8 }).catch(() => []),
  ]);
  const articles = res.articles;
  const h1 = page?.hero?.h1 || DEFAULT_H1;
  const subtitle = page?.hero?.subtitle || DEFAULT_SUBTITLE;
  const blocks = page?.layout || [];

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Futebol", item: `${SITE_URL}/futebol` },
      { "@type": "ListItem", position: 3, name: "Liga das Nações", item: `${SITE_URL}${PATH}` },
    ],
  };
  const eventLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: "Liga das Nações da UEFA 2026/27",
    sport: "Futebol",
    image: [`${SITE_URL}/og-image.jpg`],
    description: DEFAULT_DESC,
    startDate: "2026-09-24",
    endDate: "2027-06-06",
    eventStatus: "https://schema.org/EventScheduled",
    location: { "@type": "Place", name: "Europa" },
    organizer: { "@type": "Organization", name: "UEFA", url: "https://www.uefa.com" },
    url: `${SITE_URL}${PATH}`,
  };

  const header = (
    <>
      <PageBreadcrumb
        className="mb-3"
        items={[
          { label: "Início", href: "/" },
          { label: "Futebol", href: "/futebol" },
          { label: "Liga das Nações" },
        ]}
      />
      <h1 className="text-2xl font-bold leading-tight text-text-primary sm:text-3xl">{h1}</h1>
      <p className="mb-6 mt-2 text-sm text-text-secondary sm:text-base">{subtitle}</p>
    </>
  );

  return (
    <>
      <ChampionshipClient slug={SLUG} header={header} />

      <div className="mx-auto max-w-[1240px] space-y-8 px-4 pb-8">
        <WatchPostsStrip posts={watch} title="Onde assistir os próximos jogos" />

        {/* Textos editáveis no /cms → Páginas → "Liga das Nações" (como funciona, guia...). */}
        {blocks.length > 0 && (
          <div className="space-y-4 leading-relaxed text-text-secondary">
            {blocks.map((block: unknown, i: number) => (
              <PageBlock key={i} block={block} />
            ))}
          </div>
        )}

        {articles.length > 0 && (
          <section>
            <h2 className="mb-3 border-b-2 border-green pb-2 text-lg font-bold text-text-primary">
              Últimas notícias do futebol internacional
            </h2>
            <NewsFeed initial={articles} category={CATEGORY} seeAllHref="/noticias/futebol-internacional" />
          </section>
        )}
      </div>

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(breadcrumbLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLd(eventLd) }} />
    </>
  );
}
