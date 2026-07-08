import type { Metadata } from "next";
import Link from "next/link";
import { getArticles } from "@/lib/data/articles";
import { getPayloadPage } from "@/lib/data/payload-pages";
import { PageBlock } from "@/components/payload/page-blocks";
import { CasasApostasIndex } from "@/components/apostas/casas-apostas-index";
import { BettingDisclaimer } from "@/components/apostas/betting-disclaimer";

// Índice de notícias de "Casas de Apostas" (estilo home / lance.com.br/sites-de-apostas):
// recebe TODAS as notícias da categoria. O guia comparativo (money page) é um POST em
// /casas-de-apostas/melhores-casas-apostas-brasil, destacado num banner aqui. ISR 30min.
//
// SEO + H1/subtítulo + conteúdo são EDITÁVEIS no /cms → Páginas (collection "pages", slug
// "casas-de-apostas"): a página do CMS controla os metadados e os blocos de conteúdo
// (texto/galeria/tabela...), que renderizam ABAIXO das notícias (texto de SEO da página, que
// desce conforme os posts entram). O layout de notícias (destaque/linha/feed) fica no código.
export const revalidate = 1800;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";
const GUIDE_SLUG = "melhores-casas-apostas-brasil";

const DEFAULT_TITLE = "Casas de Apostas: Notícias, Bônus e Guia das Bets | Papo de Bola";
const DEFAULT_DESC =
  "Últimas notícias sobre casas de apostas no Brasil: bônus, novas plataformas .bet.br, dicas e o guia comparativo das melhores casas de aposta autorizadas pela SPA.";
const DEFAULT_H1 = "Casas de Apostas";
const DEFAULT_SUBTITLE = "Notícias, análises e guias das casas de apostas autorizadas no Brasil.";

export async function generateMetadata(): Promise<Metadata> {
  const page = await getPayloadPage("casas-de-apostas");
  const title = page?.seo?.metaTitle || DEFAULT_TITLE;
  const description = page?.seo?.metaDescription || DEFAULT_DESC;
  return {
    title: { absolute: title },
    description,
    alternates: { canonical: "/casas-de-apostas" },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}/casas-de-apostas`,
      type: "website",
    },
  };
}

export default async function CasasDeApostasPage() {
  const [page, res] = await Promise.all([
    getPayloadPage("casas-de-apostas"),
    getArticles({ perPage: 30, category: "Casas de Apostas" }).catch(() => ({ articles: [] })),
  ]);
  const articles = res.articles;

  const h1 = page?.hero?.h1 || DEFAULT_H1;
  const subtitle = page?.hero?.subtitle || DEFAULT_SUBTITLE;
  const introBlocks = page?.layout || [];

  // O guia comparativo é destacado num banner e não repete no grid de notícias.
  const guide = articles.find((a) => a.slug === GUIDE_SLUG) || null;
  const news = articles.filter((a) => a.slug !== GUIDE_SLUG);

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Casas de Apostas", item: `${SITE_URL}/casas-de-apostas` },
    ],
  };

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-6">
      <nav className="mb-3 text-xs text-text-muted" aria-label="Trilha de navegação">
        <Link href="/" className="hover:text-green hover:underline">
          Início
        </Link>{" "}
        / <span className="text-text-secondary">Casas de Apostas</span>
      </nav>

      <h1 className="text-2xl font-bold leading-tight text-text-primary sm:text-3xl">{h1}</h1>
      <p className="mt-1 text-sm text-text-muted">{subtitle}</p>

      <BettingDisclaimer className="mt-4" />

      {/* Banner do guia comparativo (money page) — só quando o post está publicado. */}
      {guide && (
        <Link
          href={guide.url}
          className="group mt-5 flex items-center justify-between gap-4 rounded-lg border border-green bg-green-light px-5 py-4 transition-colors hover:bg-green"
        >
          <div>
            <div className="text-[11px] font-bold uppercase tracking-wide text-green group-hover:text-white">
              Guia
            </div>
            <div className="text-sm font-bold text-text-primary group-hover:text-white sm:text-base">
              {guide.rewrittenTitle}
            </div>
          </div>
          <span className="shrink-0 text-lg font-bold text-green group-hover:text-white">→</span>
        </Link>
      )}

      <div className="mt-6 space-y-8">
        {news.length > 0 && <CasasApostasIndex articles={news} />}

        {/* Conteúdo editável no /cms → Páginas → "Casas de Apostas (índice)" (blocos: texto,
            galeria, tabela, colunas...). Renderiza ABAIXO das notícias — é o texto de
            SEO/keywords da página; conforme os posts entram, ele desce naturalmente. */}
        {introBlocks.length > 0 && (
          <div className="space-y-4 rounded-lg border border-border-custom bg-card-bg p-6 leading-relaxed text-text-secondary">
            {introBlocks.map((block: unknown, i: number) => (
              <PageBlock key={i} block={block} />
            ))}
          </div>
        )}

        {news.length === 0 && introBlocks.length === 0 && (
          <div className="rounded-lg border border-border-custom bg-card-bg p-10 text-center text-text-muted">
            Ainda não há notícias sobre casas de apostas. Volte em breve.
          </div>
        )}
      </div>

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
    </div>
  );
}
