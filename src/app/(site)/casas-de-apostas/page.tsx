import type { Metadata } from "next";
import Link from "next/link";
import { getPayloadPage } from "@/lib/data/payload-pages";
import { PageBlock } from "@/components/payload/page-blocks";
import { getArticles } from "@/lib/data/articles";
import { NewsFeed } from "@/components/news/news-feed";
import { BettingDisclaimer } from "@/components/apostas/betting-disclaimer";

// Hub editável no CMS (Payload, collection "pages", slug "casas-de-apostas"). Enquanto a
// página não é criada/publicada no /cms, cai no fallback abaixo (mesmo padrão de /politica).
// ISR 30min: refresca conteúdo do CMS + notícias da categoria.
export const revalidate = 1800;

const DEFAULT_TITLE = "Casa de Aposta: Guia e Comparativo 2026 | Papo de Bola";
const DEFAULT_DESC =
  "Compare as melhores casas de apostas do Brasil: bônus, licença e odds. Guia atualizado com análise de cada casa de aposta licenciada pela SPA.";
const DEFAULT_H1 = "Casa de Aposta: Guia Completo das Melhores Casas de Apostas do Brasil";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";

// FAQ (também vira FAQPage schema quando o hub roda no fallback).
const FAQ: { q: string; a: string }[] = [
  {
    q: "Casas de apostas são legais no Brasil?",
    a: "Sim. Desde a Lei 14.790/2023, as apostas de quota fixa são reguladas no Brasil. São legais as casas de aposta autorizadas pela Secretaria de Prêmios e Apostas (SPA) do Ministério da Fazenda, que operam em domínios terminados em .bet.br.",
  },
  {
    q: "Como saber se uma casa de aposta é confiável?",
    a: "Verifique se ela aparece na lista de autorizadas pela SPA, se o domínio termina em .bet.br, se exibe o número de autorização e se oferece canais de atendimento e ferramentas de jogo responsável. Desconfie de promessas de ganho fácil.",
  },
  {
    q: "Qual casa de aposta paga mais rápido?",
    a: "O saque via Pix costuma ser o mais rápido, com muitas casas processando em minutos. O tempo real depende da política de cada plataforma e da validação de conta (KYC). Compare os prazos na nossa tabela antes de escolher.",
  },
  {
    q: "O Papo de Bola realiza apostas?",
    a: "Não. O Papo de Bola é um portal de conteúdo esportivo e informativo. Não somos uma casa de apostas, não intermediamos apostas e podemos incluir links de afiliados de plataformas autorizadas. Aposte com responsabilidade — proibido para menores de 18 anos.",
  },
];

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

/** Conteúdo padrão do hub enquanto não há página publicada no CMS. */
function HubFallback() {
  return (
    <>
      <p>
        A <strong>melhor casa de aposta</strong> é aquela que combina licença da SPA, bônus honesto,
        boas odds e saque rápido via Pix — e isso varia conforme o seu perfil. Reunimos abaixo um
        comparativo das principais <strong>casas de apostas</strong> autorizadas a operar no Brasil,
        com os critérios que importam na hora de escolher onde apostar com segurança.
      </p>

      <h2 className="pt-2 text-lg font-bold text-text-primary">Como escolher uma casa de aposta confiável</h2>
      <ul className="list-disc space-y-2 pl-5">
        <li>
          <strong className="text-text-primary">Licença SPA (.bet.br):</strong> só aposte em casas
          autorizadas pela Secretaria de Prêmios e Apostas, com domínio terminado em .bet.br.
        </li>
        <li>
          <strong className="text-text-primary">Pagamento via Pix:</strong> depósito e saque rápidos,
          com prazos claros.
        </li>
        <li>
          <strong className="text-text-primary">Odds e mercados:</strong> cotações competitivas e
          variedade de campeonatos e apostas ao vivo.
        </li>
        <li>
          <strong className="text-text-primary">Suporte e app:</strong> atendimento em português e
          aplicativo estável para apostar pelo celular.
        </li>
        <li>
          <strong className="text-text-primary">Jogo responsável:</strong> ferramentas de limite de
          depósito, autoexclusão e alerta de tempo de jogo.
        </li>
      </ul>

      <h2 className="pt-2 text-lg font-bold text-text-primary">Perguntas frequentes</h2>
      {FAQ.map((f) => (
        <div key={f.q}>
          <h3 className="pt-1 text-base font-bold text-text-primary">{f.q}</h3>
          <p>{f.a}</p>
        </div>
      ))}
    </>
  );
}

export default async function CasasDeApostasPage() {
  const [page, res] = await Promise.all([
    getPayloadPage("casas-de-apostas"),
    getArticles({ perPage: 24, category: "Casas de Apostas" }).catch(() => ({
      articles: [],
      total: 0,
    })),
  ]);
  const articles = res.articles;
  const blocks = page?.layout || [];
  const h1 = page?.hero?.h1 || DEFAULT_H1;
  const subtitle = page?.hero?.subtitle;
  const usingFallback = blocks.length === 0;

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Início", item: SITE_URL },
      { "@type": "ListItem", position: 2, name: "Casas de Apostas", item: `${SITE_URL}/casas-de-apostas` },
    ],
  };
  const faqLd = usingFallback
    ? {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: FAQ.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      }
    : null;

  return (
    <div className="mx-auto max-w-[820px] px-4 py-8">
      {/* Breadcrumb */}
      <nav className="mb-3 text-xs text-text-muted" aria-label="Trilha de navegação">
        <Link href="/" className="hover:text-green hover:underline">
          Início
        </Link>{" "}
        / <span className="text-text-secondary">Casas de Apostas</span>
      </nav>

      <h1 className="text-2xl font-bold leading-tight text-text-primary sm:text-3xl">{h1}</h1>
      {subtitle && <p className="mt-2 text-sm text-text-muted">{subtitle}</p>}

      <BettingDisclaimer className="mt-5" />

      {/* Conteúdo editável (CMS) ou fallback */}
      <div className="mt-6 space-y-5 rounded-lg border border-border-custom bg-card-bg p-6 leading-relaxed text-text-secondary sm:p-8">
        {usingFallback ? (
          <HubFallback />
        ) : (
          blocks.map((block: unknown, i: number) => <PageBlock key={i} block={block} />)
        )}
      </div>

      {/* Últimas notícias sobre casas de apostas */}
      {articles.length > 0 && (
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-bold text-text-primary">
            Últimas notícias sobre casas de apostas
          </h2>
          <NewsFeed
            initial={articles}
            category="Casas de Apostas"
            seeAllHref="/noticias/casas-de-apostas"
          />
        </section>
      )}

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}
    </div>
  );
}
