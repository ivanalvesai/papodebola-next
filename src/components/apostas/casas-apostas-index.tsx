import Link from "next/link";
import Image from "next/image";
import { Newspaper } from "lucide-react";
import type { Article } from "@/types/article";
import { NewsFeed } from "@/components/news/news-feed";

/** Card com imagem de fundo + título sobreposto (estilo home/ge.globo). */
function OverlayCard({ article, big }: { article: Article; big?: boolean }) {
  return (
    <Link
      href={article.url}
      className={`group relative block overflow-hidden rounded-lg bg-body ${
        big ? "aspect-[16/10] lg:h-full lg:aspect-auto" : "aspect-[16/9]"
      }`}
    >
      {article.image ? (
        <Image
          src={article.image}
          alt={article.rewrittenTitle}
          fill
          sizes={big ? "(max-width:1024px) 100vw, 55vw" : "(max-width:1024px) 100vw, 25vw"}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized
          priority={big}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-text-muted">
          <Newspaper className="h-10 w-10" />
        </div>
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
      <div className={`absolute inset-x-0 bottom-0 ${big ? "p-4 sm:p-5" : "p-3"}`}>
        <div className="mb-1 text-[10px] font-bold uppercase leading-4 tracking-wide text-white/90">
          {article.category}
        </div>
        <h3
          className={`font-bold leading-tight text-white group-hover:underline ${
            big ? "text-xl line-clamp-3 sm:text-2xl" : "text-sm line-clamp-2 sm:text-base"
          }`}
        >
          {article.rewrittenTitle}
        </h3>
      </div>
    </Link>
  );
}

/** Card da linha de 4 (imagem em cima, título embaixo, com borda). */
function GridCard({ article }: { article: Article }) {
  return (
    <Link
      href={article.url}
      className="group overflow-hidden rounded-lg border border-border-custom bg-card-bg transition-all hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="aspect-[16/9] bg-body">
        {article.image ? (
          <Image
            src={article.image}
            alt={article.rewrittenTitle}
            width={400}
            height={225}
            className="h-full w-full object-cover"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">
            <Newspaper className="h-8 w-8" />
          </div>
        )}
      </div>
      <div className="p-3">
        <h3 className="line-clamp-2 text-sm font-semibold leading-tight text-text-primary group-hover:text-green">
          {article.rewrittenTitle}
        </h3>
      </div>
    </Link>
  );
}

/**
 * Índice de notícias de "Casas de Apostas" (layout estilo lance.com.br/sites-de-apostas):
 * (1) destaque com 1 imagem grande à esquerda + 3 menores à direita;
 * (2) linha de 4 notícias na horizontal;
 * (3) feed vertical "Mais notícias" (imagem + título + data) com "mostrar mais".
 */
export function CasasApostasIndex({ articles }: { articles: Article[] }) {
  const big = articles[0];
  const small = articles.slice(1, 4);
  const row = articles.slice(4, 8);
  const feed = articles.slice(8);
  const excludeSlugs = articles.slice(0, 8).map((a) => a.slug);

  return (
    <div className="space-y-8">
      {/* Destaque: 1 grande + 3 menores */}
      {big && (
        <div className="grid gap-4 lg:grid-cols-[1.55fr_1fr]">
          <OverlayCard article={big} big />
          {small.length > 0 && (
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
              {small.map((a) => (
                <OverlayCard key={a.slug} article={a} />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Linha de 4 */}
      {row.length > 0 && (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {row.map((a) => (
            <GridCard key={a.slug} article={a} />
          ))}
        </div>
      )}

      {/* Mais notícias (feed) */}
      {articles.length > 0 && (
        <section>
          <h2 className="mb-4 flex items-center gap-2 border-b-2 border-green pb-2 text-lg font-bold text-text-primary">
            Mais notícias
          </h2>
          <NewsFeed
            initial={feed}
            category="Casas de Apostas"
            excludeSlugs={excludeSlugs}
            seeAllHref="/apostas"
          />
        </section>
      )}
    </div>
  );
}
