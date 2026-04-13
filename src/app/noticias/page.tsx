import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Newspaper } from "lucide-react";
import { getArticles } from "@/lib/data/articles";
import { WP_CATEGORIES } from "@/lib/config";

export const revalidate = 1800;

export const metadata: Metadata = {
  title: "Noticias de Futebol",
  description:
    "Ultimas noticias de futebol brasileiro e mundial. Brasileirao, Copa do Brasil, Libertadores, Champions League e mais.",
};

interface PageProps {
  searchParams: Promise<{ cat?: string; search?: string; page?: string }>;
}

export default async function NoticiasPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const category = params.cat || undefined;
  const search = params.search || undefined;
  const page = parseInt(params.page || "1");
  const perPage = 12;

  const { articles, total } = await getArticles({
    page,
    perPage,
    category,
    search,
  });

  const totalPages = Math.ceil(total / perPage);

  return (
    <div className="mx-auto max-w-[1240px] px-4 py-8">
      <h1 className="text-xl font-bold text-text-primary mb-6 flex items-center gap-2">
        <Newspaper className="h-6 w-6 text-green" />
        Noticias
        {category && (
          <span className="text-base font-normal text-text-muted">
            {" "}/ {category}
          </span>
        )}
        {search && (
          <span className="text-base font-normal text-text-muted">
            {" "}/ &quot;{search}&quot;
          </span>
        )}
      </h1>

      {/* Category filters */}
      <div className="flex gap-2 flex-wrap mb-6">
        <Link
          href="/noticias"
          className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
            !category
              ? "bg-green text-white border-green"
              : "bg-surface text-text-secondary border-border-custom hover:border-green hover:text-green"
          }`}
        >
          Todas
        </Link>
        {WP_CATEGORIES.map((cat) => (
          <Link
            key={cat}
            href={`/noticias?cat=${encodeURIComponent(cat)}`}
            className={`px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
              category === cat
                ? "bg-green text-white border-green"
                : "bg-surface text-text-secondary border-border-custom hover:border-green hover:text-green"
            }`}
          >
            {cat}
          </Link>
        ))}
      </div>

      {/* Articles grid */}
      {articles.length === 0 ? (
        <div className="bg-card-bg rounded-lg border border-border-custom p-12 text-center">
          <Newspaper className="h-12 w-12 text-text-muted mx-auto mb-3" />
          <p className="text-text-muted">Nenhuma noticia encontrada</p>
        </div>
      ) : (
        <>
          {/* Featured first article */}
          {page === 1 && articles[0] && (
            <Link
              href={`/artigos/${articles[0].slug}`}
              className="group block bg-card-bg rounded-lg border border-border-custom overflow-hidden mb-6 hover:shadow-md transition-shadow"
            >
              <div className="grid grid-cols-1 md:grid-cols-2">
                {articles[0].image && (
                  <div className="aspect-video md:aspect-auto">
                    <Image
                      src={articles[0].image}
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
                    {articles[0].category}
                  </div>
                  <h2 className="text-xl font-bold text-text-primary leading-tight mb-3 group-hover:text-green transition-colors">
                    {articles[0].rewrittenTitle}
                  </h2>
                  <p className="text-sm text-text-muted line-clamp-3 mb-3">
                    {articles[0].rewrittenText.substring(0, 200)}...
                  </p>
                  <div className="text-xs text-text-muted">
                    {new Date(articles[0].pubDate).toLocaleDateString("pt-BR", {
                      day: "2-digit",
                      month: "long",
                      year: "numeric",
                    })}
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {articles.slice(page === 1 ? 1 : 0).map((article) => (
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
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              {page > 1 && (
                <Link
                  href={`/noticias?${new URLSearchParams({
                    ...(category && { cat: category }),
                    ...(search && { search }),
                    page: String(page - 1),
                  })}`}
                  className="px-4 py-2 text-sm font-semibold text-green border border-green rounded-lg hover:bg-green hover:text-white transition-colors"
                >
                  &larr; Anterior
                </Link>
              )}

              <span className="text-sm text-text-muted px-4">
                Pagina {page} de {totalPages}
              </span>

              {page < totalPages && (
                <Link
                  href={`/noticias?${new URLSearchParams({
                    ...(category && { cat: category }),
                    ...(search && { search }),
                    page: String(page + 1),
                  })}`}
                  className="px-4 py-2 text-sm font-semibold text-green border border-green rounded-lg hover:bg-green hover:text-white transition-colors"
                >
                  Proxima &rarr;
                </Link>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}
