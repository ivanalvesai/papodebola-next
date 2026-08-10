import type { Metadata } from "next";
import Link from "next/link";
import { getArticles } from "@/lib/data/articles";
import { getPayloadPage } from "@/lib/data/payload-pages";
import { PageBlock } from "@/components/payload/page-blocks";
import { NewsFeed } from "@/components/news/news-feed";

// HUB da Copa do Mundo Feminina de 2027 (Brasil). Mesmo padrão do /apostas: o CONTEÚDO
// (H1, subtítulo, SEO e blocos) é editável no /cms → Páginas, slug "copa-do-mundo-feminina";
// o layout (breadcrumb, feed de notícias, schema) fica no código.
//
// A ideia é crescer aqui dentro sem tocar em código: tabela de classificados, grupos,
// artilharia, sedes, calendário — tudo isso entra como BLOCO da página no /cms (texto,
// tabela, cards de link, imagem, vídeo...). Quando a API esportiva abrir os dados do
// torneio (2027), dá pra plugar blocos dinâmicos, como já é feito em /jogos-de-hoje/futebol.
//
// As notícias da categoria "Copa do Mundo Feminina" caem em /futebol/copa-do-mundo-feminina/{slug}
// (CATEGORY_HUB em config.ts) e aparecem no feed abaixo.
export const revalidate = 1800;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";
const CMS_SLUG = "copa-do-mundo-feminina";
const CATEGORY = "Copa do Mundo Feminina";
const PATH = "/futebol/copa-do-mundo-feminina";

const DEFAULT_TITLE =
  "Copa do Mundo Feminina 2027 no Brasil: seleções classificadas, sedes e tabela | Papo de Bola";
const DEFAULT_DESC =
  "Tudo sobre a Copa do Mundo Feminina de 2027 no Brasil: seleções já classificadas, vagas em disputa, sedes, datas, tabela e as últimas notícias do Mundial.";
const DEFAULT_H1 = "Copa do Mundo Feminina 2027";
const DEFAULT_SUBTITLE =
  "O Mundial é aqui: 24 de junho a 25 de julho de 2027, em oito cidades brasileiras. Acompanhe as classificadas, as vagas em jogo e as notícias do torneio.";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPayloadPage(CMS_SLUG).catch(() => null);
  const title = page?.seo?.metaTitle || DEFAULT_TITLE;
  const description = page?.seo?.metaDescription || DEFAULT_DESC;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: PATH },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${PATH}`,
      type: "website",
    },
  };
}

export default async function CopaFemininaHubPage() {
  const [page, res] = await Promise.all([
    getPayloadPage(CMS_SLUG).catch(() => null),
    getArticles({ perPage: 20, category: CATEGORY }).catch(() => ({ articles: [] })),
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
      { "@type": "ListItem", position: 3, name: "Copa do Mundo Feminina 2027", item: `${SITE_URL}${PATH}` },
    ],
  };

  // Datas e sede oficiais da FIFA — ajudam o Google a entender que a página é do evento.
  const eventLd = {
    "@context": "https://schema.org",
    "@type": "SportsEvent",
    name: "Copa do Mundo Feminina da FIFA 2027",
    sport: "Futebol",
    startDate: "2027-06-24",
    endDate: "2027-07-25",
    eventStatus: "https://schema.org/EventScheduled",
    location: { "@type": "Country", name: "Brasil" },
    organizer: { "@type": "Organization", name: "FIFA", url: "https://www.fifa.com" },
    url: `${SITE_URL}${PATH}`,
  };

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6">
      <nav className="mb-3 text-xs text-text-muted" aria-label="Trilha de navegação">
        <Link href="/" className="hover:text-green hover:underline">
          Início
        </Link>{" "}
        /{" "}
        <Link href="/futebol" className="hover:text-green hover:underline">
          Futebol
        </Link>{" "}
        / <span className="text-text-secondary">Copa do Mundo Feminina 2027</span>
      </nav>

      <h1 className="text-2xl font-bold leading-tight text-text-primary sm:text-3xl">{h1}</h1>
      <p className="mt-2 text-sm text-text-secondary sm:text-base">{subtitle}</p>

      <div className="mt-6 space-y-8">
        {/* Conteúdo editável no /cms → Páginas → "Copa do Mundo Feminina 2027".
            É aqui que entram as tabelas (classificados, grupos, artilharia), os textos
            de guia e o que mais o editorial quiser, sem mexer em código. */}
        {blocks.length > 0 && (
          <div className="space-y-4 rounded-lg border border-border-custom bg-card-bg p-5 leading-relaxed text-text-secondary sm:p-6">
            {blocks.map((block: unknown, i: number) => (
              <PageBlock key={i} block={block} />
            ))}
          </div>
        )}

        <section>
          <h2 className="mb-3 border-b-2 border-green pb-2 text-lg font-bold text-text-primary">
            Últimas notícias da Copa do Mundo Feminina
          </h2>
          {articles.length > 0 ? (
            <NewsFeed initial={articles} category={CATEGORY} seeAllHref={PATH} />
          ) : (
            <div className="rounded-lg border border-border-custom bg-card-bg p-8 text-center text-sm text-text-muted">
              Ainda não há notícias publicadas sobre o Mundial Feminino de 2027. Volte em breve.
            </div>
          )}
        </section>
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(eventLd) }}
      />
    </div>
  );
}
