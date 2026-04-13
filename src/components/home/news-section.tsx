"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Newspaper, PlusCircle } from "lucide-react";
import type { Article } from "@/types/article";

interface NewsSectionProps {
  articles: Article[];
}

export function NewsSection({ articles }: NewsSectionProps) {
  const [showCount, setShowCount] = useState(7);

  if (articles.length === 0) {
    return (
      <section className="bg-card-bg rounded-lg border border-border-custom p-6">
        <h2 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
          <Newspaper className="h-5 w-5 text-green" />
          Ultimas Noticias
        </h2>
        <p className="text-text-muted text-sm text-center py-6">
          Nenhuma noticia disponivel
        </p>
      </section>
    );
  }

  const visible = articles.slice(0, showCount);

  return (
    <section className="bg-card-bg rounded-lg border border-border-custom p-6">
      <h2 className="text-base font-bold text-text-primary mb-4 flex items-center gap-2">
        <Newspaper className="h-5 w-5 text-green" />
        Ultimas Noticias
      </h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {visible.map((article) => (
          <Link
            key={article.slug}
            href={`/artigos/${article.slug}`}
            className="group flex gap-3 rounded-lg hover:bg-card-hover p-2 -m-2 transition-colors"
          >
            {/* Thumbnail */}
            <div className="w-24 h-16 rounded overflow-hidden bg-body shrink-0">
              {article.image ? (
                <Image
                  src={article.image}
                  alt=""
                  width={96}
                  height={64}
                  className="w-full h-full object-cover"
                  unoptimized
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-text-muted">
                  <Newspaper className="h-6 w-6" />
                </div>
              )}
            </div>

            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-green uppercase">
                Papo de Bola
              </div>
              <div className="text-sm font-semibold text-text-primary leading-tight line-clamp-2 group-hover:text-green transition-colors">
                {article.rewrittenTitle}
              </div>
              <div className="text-[11px] text-text-muted mt-1">
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

      {/* Show more */}
      <div className="text-center mt-5">
        {showCount < articles.length ? (
          <button
            onClick={() => setShowCount((c) => c + 7)}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-green hover:text-green-hover transition-colors"
          >
            <PlusCircle className="h-4 w-4" />
            Mostrar Mais
          </button>
        ) : (
          <Link
            href="/noticias"
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-green hover:text-green-hover transition-colors"
          >
            Ver todas as noticias &rarr;
          </Link>
        )}
      </div>
    </section>
  );
}
