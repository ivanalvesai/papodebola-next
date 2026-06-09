"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Newspaper, Loader2 } from "lucide-react";
import type { Article } from "@/types/article";

interface NewsSectionProps {
  articles: Article[];
}

const PAGE_SIZE = 20;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Card de destaque com imagem de fundo e titulo sobreposto (estilo ge.globo). */
function FeaturedCard({ article, big }: { article: Article; big?: boolean }) {
  return (
    <Link
      href={`/artigos/${article.slug}`}
      className={`group relative block overflow-hidden rounded-lg bg-body ${
        big
          ? "aspect-[16/10] lg:aspect-auto lg:row-span-2 lg:h-full"
          : "aspect-[16/9]"
      }`}
    >
      {article.image ? (
        <Image
          src={article.image}
          alt=""
          fill
          sizes={big ? "(max-width:1024px) 100vw, 40vw" : "(max-width:1024px) 100vw, 20vw"}
          className="object-cover transition-transform duration-300 group-hover:scale-105"
          unoptimized
          priority={big}
        />
      ) : (
        <div className="flex h-full w-full items-center justify-center text-text-muted">
          <Newspaper className="h-10 w-10" />
        </div>
      )}

      {/* Gradiente para legibilidade do texto */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

      {/* Texto sobreposto */}
      <div className={`absolute inset-x-0 bottom-0 ${big ? "p-4 sm:p-5" : "p-3 sm:p-4"}`}>
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

/** Item do feed estilo ge.globo: imagem a esquerda, editoria + titulo + trecho a direita. */
function FeedItem({ article }: { article: Article }) {
  return (
    <Link
      href={`/artigos/${article.slug}`}
      className="group flex gap-4 border-t border-border-light py-4 first:border-t-0 first:pt-0"
    >
      <div className="aspect-[16/9] w-28 shrink-0 overflow-hidden rounded bg-body sm:w-44">
        {article.image ? (
          <Image
            src={article.image}
            alt=""
            width={176}
            height={99}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            unoptimized
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-text-muted">
            <Newspaper className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <div className="mb-1 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
          {article.category}
        </div>
        <h3 className="line-clamp-2 text-base font-bold leading-snug text-text-primary transition-colors group-hover:text-green">
          {article.rewrittenTitle}
        </h3>
        <p className="mt-1 line-clamp-2 text-sm leading-snug text-text-muted">
          {article.rewrittenText.slice(0, 160)}
        </p>
        <div className="mt-1.5 text-[11px] text-text-muted">{formatDate(article.pubDate)}</div>
      </div>
    </Link>
  );
}

export function NewsSection({ articles }: NewsSectionProps) {
  const featured = articles.slice(0, 3);

  // Feed = tudo depois dos 3 destaques; cresce com a rolagem (scroll infinito).
  const [feed, setFeed] = useState<Article[]>(() => articles.slice(3));
  const [page, setPage] = useState(1); // pagina 1 (os 20 iniciais) ja veio do servidor
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const seen = useRef<Set<string>>(new Set(articles.map((a) => a.slug)));
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const next = page + 1;
      const res = await fetch(`/api/articles?page=${next}&limit=${PAGE_SIZE}`);
      if (!res.ok) throw new Error("fetch failed");
      const data = await res.json();
      const incoming: Article[] = (data.articles || []).filter((a: Article) => {
        if (seen.current.has(a.slug)) return false;
        seen.current.add(a.slug);
        return true;
      });
      setFeed((f) => [...f, ...incoming]);
      setPage(next);
      if (incoming.length === 0 || (data.pages && next >= data.pages)) {
        setHasMore(false);
      }
    } catch {
      setHasMore(false); // em erro, para de tentar (nao trava a navegacao)
    } finally {
      setLoading(false);
    }
  }, [loading, hasMore, page]);

  // Observa o sentinel: carrega o proximo lote so quando ele se aproxima da viewport.
  // rootMargin pequeno => carrega sob demanda, sem puxar tudo de uma vez (pagina leve).
  useEffect(() => {
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) loadMore();
      },
      { rootMargin: "400px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [loadMore, hasMore]);

  if (articles.length === 0) {
    return (
      <section className="rounded-lg border border-border-custom bg-card-bg p-6">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-text-primary">
          <Newspaper className="h-5 w-5 text-green" />
          Ultimas Noticias
        </h2>
        <p className="py-6 text-center text-sm text-text-muted">Nenhuma noticia disponivel</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border-custom bg-card-bg p-6">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-text-primary">
        <Newspaper className="h-5 w-5 text-green" />
        Ultimas Noticias
      </h2>

      {/* 3 destaques: 1 grande a esquerda + 2 alinhados a direita */}
      {featured.length > 0 && (
        <div className="mb-6 grid gap-3 lg:grid-cols-2 lg:grid-rows-2">
          <FeaturedCard article={featured[0]} big />
          {featured.slice(1).map((a) => (
            <FeaturedCard key={a.slug} article={a} />
          ))}
        </div>
      )}

      {/* Feed em coluna unica (uma noticia abaixo da outra) com rolagem infinita */}
      {feed.length > 0 && (
        <div>
          {feed.map((a) => (
            <FeedItem key={a.slug} article={a} />
          ))}
        </div>
      )}

      {/* Sentinel + estado de carregamento */}
      <div ref={sentinelRef} className="h-px w-full" aria-hidden />

      <div className="mt-5 text-center">
        {loading ? (
          <span className="inline-flex items-center gap-2 text-sm text-text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando mais noticias...
          </span>
        ) : hasMore ? (
          <button
            onClick={loadMore}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-green transition-colors hover:text-green-hover"
          >
            Mostrar mais
          </button>
        ) : (
          <Link
            href="/noticias"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-green transition-colors hover:text-green-hover"
          >
            Ver todas as noticias &rarr;
          </Link>
        )}
      </div>
    </section>
  );
}
