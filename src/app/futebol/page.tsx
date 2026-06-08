import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { getArticles } from "@/lib/data/articles";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Futebol: notícias, jogos e classificações",
  description:
    "Futebol brasileiro e mundial: últimas notícias, Brasileirão, Copa do Mundo 2026, Libertadores, Champions League e mais no Papo de Bola.",
  alternates: { canonical: "/futebol" },
};

export default async function FutebolPage() {
  const { articles } = await getArticles({ perPage: 13 }).catch(() => ({
    articles: [],
    total: 0,
  }));

  const [featured, ...rest] = articles;

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <PageBreadcrumb
        className="mb-4"
        items={[{ label: "Início", href: "/" }, { label: "Futebol" }]}
      />

      <h1 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
        <Newspaper className="h-6 w-6 text-green" />
        Futebol
      </h1>

      {articles.length === 0 ? (
        <div className="bg-card-bg rounded-lg border border-border-custom p-12 text-center">
          <Newspaper className="h-12 w-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">Nenhuma noticia encontrada</p>
        </div>
      ) : (
        <>
          {featured && (
            <Link
              href={`/artigos/${featured.slug}`}
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
                  <h2 className="text-xl font-bold text-text-primary leading-tight mb-3 group-hover:text-green transition-colors">
                    {featured.rewrittenTitle}
                  </h2>
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
                href={`/artigos/${article.slug}`}
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
                  <div className="text-[10px] font-bold text-green uppercase mb-1.5">
                    {article.category}
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary leading-tight line-clamp-2 mb-2 group-hover:text-green transition-colors">
                    {article.rewrittenTitle}
                  </h3>
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

          <div className="text-center mt-8">
            <Link
              href="/noticias"
              className="inline-block text-sm font-semibold text-green hover:text-green-hover"
            >
              Ver todas as notícias &rarr;
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
