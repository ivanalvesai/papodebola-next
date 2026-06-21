"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Newspaper, Loader2 } from "lucide-react";
import type { Article } from "@/types/article";

const PAGE_SIZE = 20; // lote buscado na API (== perPage do load inicial, sem pular itens)

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
      href={article.url}
      className="group flex gap-4 border-t border-border-light py-4 first:border-t-0 first:pt-0"
    >
      <div className="w-32 shrink-0 self-start overflow-hidden rounded sm:w-52">
        {article.image ? (
          // <img> puro: mostra a imagem na proporção NATURAL preenchendo a largura
          // (sem cortar, sem encolher, sem distorcer). next/image forçaria uma proporção fixa.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={article.image}
            alt={article.rewrittenTitle}
            loading="lazy"
            className="block h-auto w-full transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex aspect-[16/9] w-full items-center justify-center bg-body text-text-muted">
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
  /** Pagina ja representada por `initial` (default 1). O scroll/botao busca a partir da proxima. */
  startPage?: number;
  /** Slugs ja exibidos fora do feed (ex: destaques da home), pra nao repetir. */
  excludeSlugs?: string[];
  /** Destino do "Ver todas" quando acabar. */
  seeAllHref?: string;
  /** true (default) = rolagem infinita; false = so botao "Mostrar mais" (ex: home). */
  infinite?: boolean;
  /** Quantos itens exibir de inicio no modo botao (default: todos do `initial`). */
  initialVisible?: number;
  /** Quantos revelar a cada "Mostrar mais" no modo botao (default 10). */
  step?: number;
}

/**
 * Feed de noticias em coluna unica (foto a esquerda, titulo + trecho a direita).
 * - infinite=true: rolagem infinita via IntersectionObserver (carrega sob demanda).
 * - infinite=false: mostra `initialVisible` itens e cresce so no clique de "Mostrar mais"
 *   (assim a pagina tem fim e da pra chegar no rodape — usado na home).
 */
export function NewsFeed({
  initial,
  category,
  startPage = 1,
  excludeSlugs = [],
  seeAllHref = "/noticias",
  infinite = true,
  initialVisible,
  step = 10,
}: NewsFeedProps) {
  const [feed, setFeed] = useState<Article[]>(initial);
  const [page, setPage] = useState(startPage);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(false);
  const [visible, setVisible] = useState(initialVisible ?? initial.length);

  const seen = useRef<Set<string>>(
    new Set([...excludeSlugs, ...initial.map((a) => a.slug)])
  );
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  // Busca o proximo lote na API e anexa ao feed.
  const fetchMore = useCallback(async () => {
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

  // Botao "Mostrar mais" (modo nao-infinito): revela o que ja veio antes de buscar mais.
  const showMore = useCallback(async () => {
    if (loading) return;
    if (visible < feed.length) {
      setVisible((v) => v + step);
      return;
    }
    if (hasMore) {
      await fetchMore();
      setVisible((v) => v + step);
    }
  }, [loading, visible, feed.length, hasMore, step, fetchMore]);

  // Observer so no modo infinito: carrega quando o sentinel se aproxima da viewport.
  useEffect(() => {
    if (!infinite) return;
    const el = sentinelRef.current;
    if (!el || !hasMore) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) fetchMore();
      },
      { rootMargin: "400px 0px" }
    );
    io.observe(el);
    return () => io.disconnect();
  }, [infinite, fetchMore, hasMore]);

  if (feed.length === 0) {
    return (
      <p className="py-6 text-center text-sm text-text-muted">
        Nenhuma noticia disponivel
      </p>
    );
  }

  const items = infinite ? feed : feed.slice(0, visible);
  const canLoadMore = infinite ? hasMore : visible < feed.length || hasMore;

  return (
    <>
      <div>
        {items.map((a) => (
          <FeedItem key={a.slug} article={a} />
        ))}
      </div>

      {/* Sentinel so no modo infinito */}
      {infinite && <div ref={sentinelRef} className="h-px w-full" aria-hidden />}

      <div className="mt-5 text-center">
        {loading ? (
          <span className="inline-flex items-center gap-2 text-sm text-text-muted">
            <Loader2 className="h-4 w-4 animate-spin" />
            Carregando mais noticias...
          </span>
        ) : canLoadMore ? (
          <button
            onClick={infinite ? fetchMore : showMore}
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
