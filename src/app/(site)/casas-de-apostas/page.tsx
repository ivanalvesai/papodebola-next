import type { Metadata } from "next";
import Link from "next/link";
import { getArticles } from "@/lib/data/articles";
import { CasasApostasIndex } from "@/components/apostas/casas-apostas-index";
import { BettingDisclaimer } from "@/components/apostas/betting-disclaimer";

// Índice de notícias de "Casas de Apostas" (estilo home / lance.com.br/sites-de-apostas):
// recebe TODAS as notícias da categoria. O guia comparativo (money page) é um POST em
// /casas-de-apostas/melhores-casas-apostas-brasil, destacado num banner aqui. ISR 30min.
export const revalidate = 1800;

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";
const GUIDE_SLUG = "melhores-casas-apostas-brasil";

export const metadata: Metadata = {
  title: {
    absolute: "Casas de Apostas: Notícias, Bônus e Guia das Bets | Papo de Bola",
  },
  description:
    "Últimas notícias sobre casas de apostas no Brasil: bônus, novas plataformas .bet.br, dicas e o guia comparativo das melhores casas de aposta autorizadas pela SPA.",
  alternates: { canonical: "/casas-de-apostas" },
  openGraph: {
    title: "Casas de Apostas — Papo de Bola",
    description:
      "Notícias, análises e guia das melhores casas de apostas autorizadas no Brasil.",
    url: `${SITE_URL}/casas-de-apostas`,
    type: "website",
  },
};

export default async function CasasDeApostasPage() {
  const { articles } = await getArticles({ perPage: 30, category: "Casas de Apostas" }).catch(
    () => ({ articles: [] })
  );

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

      <h1 className="text-2xl font-bold leading-tight text-text-primary sm:text-3xl">
        Casas de Apostas
      </h1>
      <p className="mt-1 text-sm text-text-muted">
        Notícias, análises e guias das casas de apostas autorizadas no Brasil.
      </p>

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

      <div className="mt-6">
        {news.length > 0 ? (
          <CasasApostasIndex articles={news} />
        ) : (
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
