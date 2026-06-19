import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Newspaper, Trophy } from "lucide-react";
import { getArticles } from "@/lib/data/articles";
import { SELECOES, SELECAO_BY_SLUG, BRAZIL_ID } from "@/lib/selecoes";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { TeamLogo } from "@/components/ui/team-logo";

export const revalidate = 1800;
export const dynamicParams = false;

interface PageProps {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  // Brasil tem página própria; não gera /selecoes/brasil
  return SELECOES.filter((s) => s.id !== BRAZIL_ID).map((s) => ({ slug: s.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const s = SELECAO_BY_SLUG[slug];
  if (!s) return {};
  return {
    title: `Seleção de ${s.name}: notícias e jogos na Copa do Mundo 2026`,
    description: `Tudo sobre a seleção de ${s.name} na Copa do Mundo 2026: jogos, grupo e últimas notícias no Papo de Bola.`,
    alternates: { canonical: `/futebol/selecoes/${slug}` },
  };
}

export default async function SelecaoPage({ params }: PageProps) {
  const { slug } = await params;
  const selecao = SELECAO_BY_SLUG[slug];
  if (!selecao || selecao.id === BRAZIL_ID) notFound();

  // Conteúdo da seleção = artigos marcados com o país (tag). Ao publicar um
  // artigo com a tag do país, ele aparece aqui automaticamente.
  const { articles } = await getArticles({ tag: selecao.name, perPage: 12 }).catch(() => ({
    articles: [],
    total: 0,
  }));

  const [featured, ...rest] = articles;

  return (
    <div className="mx-auto max-w-[1000px] px-4 py-8">
      <PageBreadcrumb
        className="mb-4"
        items={[
          { label: "Início", href: "/" },
          { label: "Copa do Mundo 2026", href: "/futebol/copa-do-mundo" },
          { label: selecao.name },
        ]}
      />

      {/* Hero */}
      <div className="bg-gradient-to-br from-green to-green-hover rounded-lg p-6 mb-8 text-white flex items-center gap-4">
        <div className="w-16 h-16 rounded-full overflow-hidden bg-white/15 flex items-center justify-center shrink-0">
          <TeamLogo teamId={selecao.id} alt={selecao.name} size={56} className="object-cover" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Seleção de {selecao.name}</h1>
          <p className="text-sm opacity-95">
            Jogos, grupo e notícias rumo à Copa do Mundo 2026.
          </p>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-bold text-text-primary flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-green" />
          Últimas notícias
        </h2>
        <Link
          href="/futebol/copa-do-mundo"
          className="text-xs font-semibold text-green hover:text-green-hover flex items-center gap-1"
        >
          <Trophy className="h-3.5 w-3.5" /> Tabela da Copa
        </Link>
      </div>

      {articles.length === 0 ? (
        <div className="bg-card-bg rounded-lg border border-border-custom p-8 text-center">
          <p className="text-text-muted text-sm">
            Ainda não há notícias sobre a seleção de {selecao.name}. Volte em breve.
          </p>
        </div>
      ) : (
        <>
          {featured && (
            <Link
              href={featured.url}
              className="group block bg-card-bg rounded-lg border border-border-custom overflow-hidden mb-6 hover:shadow-md transition-shadow"
            >
              <div className="grid grid-cols-1 md:grid-cols-2">
                {featured.image && (
                  <div className="aspect-video md:aspect-auto">
                    <Image
                      src={featured.image}
                      alt=""
                      width={620}
                      height={350}
                      className="w-full h-full object-cover"
                      priority
                      unoptimized
                    />
                  </div>
                )}
                <div className="p-6 flex flex-col justify-center">
                  <div className="text-xs font-bold text-green uppercase mb-2">
                    {featured.category}
                  </div>
                  <h3 className="text-xl font-bold text-text-primary leading-tight mb-3 group-hover:text-green transition-colors">
                    {featured.rewrittenTitle}
                  </h3>
                  <p className="text-sm text-text-muted line-clamp-3">
                    {featured.rewrittenText.substring(0, 200)}...
                  </p>
                </div>
              </div>
            </Link>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {rest.map((article) => (
              <Link
                key={article.slug}
                href={article.url}
                className="group bg-card-bg rounded-lg border border-border-custom overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                <div className="aspect-video bg-body">
                  {article.image ? (
                    <Image
                      src={article.image}
                      alt=""
                      width={400}
                      height={225}
                      className="w-full h-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-text-muted">
                      <Newspaper className="h-10 w-10" />
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h4 className="text-sm font-semibold text-text-primary leading-tight line-clamp-2 mb-2 group-hover:text-green transition-colors">
                    {article.rewrittenTitle}
                  </h4>
                  <div className="text-[11px] text-text-muted">
                    {new Date(article.pubDate).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "short",
                    })}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
