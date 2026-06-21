import Link from "next/link";
import Image from "next/image";
import { Newspaper } from "lucide-react";
import type { Article } from "@/types/article";
import { NewsFeed } from "@/components/news/news-feed";

interface NewsSectionProps {
  articles: Article[];
}

/** Card de destaque com imagem de fundo e titulo sobreposto (estilo ge.globo). */
function FeaturedCard({ article, big }: { article: Article; big?: boolean }) {
  return (
    <Link
      href={article.url}
      className={`group relative block overflow-hidden rounded-lg bg-body ${
        big
          ? "aspect-[16/10] lg:aspect-auto lg:row-span-2 lg:h-full"
          : "aspect-[16/9]"
      }`}
    >
      {article.image ? (
        <Image
          src={article.image}
          alt={article.rewrittenTitle}
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

export function NewsSection({ articles }: NewsSectionProps) {
  const featured = articles.slice(0, 3);

  if (articles.length === 0) {
    return (
      <section className="rounded-lg border border-border-custom bg-card-bg p-6">
        <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-text-primary">
          <Newspaper className="h-5 w-5 text-green" />
          Últimas Notícias
        </h2>
        <p className="py-6 text-center text-sm text-text-muted">Nenhuma notícia disponível</p>
      </section>
    );
  }

  return (
    <section className="rounded-lg border border-border-custom bg-card-bg p-6">
      <h2 className="mb-4 flex items-center gap-2 text-base font-bold text-text-primary">
        <Newspaper className="h-5 w-5 text-green" />
        Últimas Notícias
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

      {/* Feed em coluna unica (os 3 destaques ficam de fora). Na home SEM rolagem
          infinita: mostra 10 e cresce so no botao "Mostrar mais" — assim a pagina
          tem fim e da pra chegar no rodape. (A pagina da Copa mantem o scroll.) */}
      <NewsFeed
        initial={articles.slice(3)}
        excludeSlugs={featured.map((a) => a.slug)}
        seeAllHref="/noticias"
        infinite={false}
        initialVisible={10}
        step={10}
      />
    </section>
  );
}
