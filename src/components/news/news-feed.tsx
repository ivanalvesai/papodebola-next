"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Newspaper, Loader2 } from "lucide-react";
import type { Article } from "@/types/article";

const PAGE_SIZE = 20;

function formatDate(d: string) {
  return new Date(d).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/** Item do feed estilo ge.globo: imagem a esquerda, editoria + titulo + trecho a direita. */
export function FeedItem({ article }: { article: Article }) {
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

interface NewsFeedProps {
  /** Artigos ja carregados no servidor — semente do feed. */
  initial: Article[];
  /** Nome da categoria WP pra filtrar (?cat=). Ausente = todas. */
  category?: string;
  /** Pagina ja representada por `initial` (default 1). O scroll busca a partir da proxima. */
  startPage?: number;
  /** Slugs ja exibidos fora do feed (ex: destaques da home), pra nao repetir. */
  excludeSlugs?: string[];
  /** Destino do "Ver todas" quando acabar o scroll. */
  seeAllHref?: string;
}

/**
 * Feed de noticias em coluna unica com rolagem infinita (IntersectionObserver).
 * Carrega o proximo lote so quando o sentinel se aproxima da viewport — pagina leve.
 */
export function NewsFeed({
  initial,
  category,
  startPage = 1,
  excludeSlugs = [],
  seeAllHref = "/noticias",
}: NewsFeedProps) {
  const [feed, setFeed] = useState<Article[]>(initial);
  const [page, setPage] = useState(startPage);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);

  const seen = useRef<Set<string>>(
    new Set([...excludeSlugs, ...initial.map((a) => a.slug)])
  );
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadMore = useCallback(async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    try {
      const next = page + 1;
      const qs = new URLSearchParams({ page: String(next), limit: String(PAGE_SIZE) });
      if (category) qs.set("cat", category);
      const res = await fetch(`/api/articles?${qs.toString()}`);
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
  }, [loading, hasMore, page, category]);

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

  if (feed.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-text-muted">
        Nenhuma noticia disponivel
      </p>
    );
  }

  return (
    <>
      <div>
        {feed.map((a) => (
          <FeedItem key={a.slug} article={a} />
        ))}
      </div>

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
            href={seeAllHref}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-green transition-colors hover:text-green-hover"
          >
            Ver todas as noticias &rarr;
          </Link>
        )}
      </div>
    </>
  );
}
