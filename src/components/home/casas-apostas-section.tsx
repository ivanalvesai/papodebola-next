import Link from "next/link";
import Image from "next/image";
import { Dice5, Newspaper } from "lucide-react";
import type { Article } from "@/types/article";

interface Props {
  articles: Article[];
}

/**
 * Card da home "Casas de Apostas" (entre Últimas Notícias e Mercado da Bola).
 * As notícias da categoria ficam em UMA linha (scroll horizontal) + botão "VER MAIS"
 * pro hub /casas-de-apostas. Só renderiza quando há post publicado na categoria — sem
 * post, não aparece (não polui a home). Traz o selo +18 (compliance).
 */
export function CasasApostasSection({ articles }: Props) {
  if (!articles.length) return null;

  return (
    <section className="rounded-lg border border-border-custom bg-card-bg p-6">
      <div className="mb-4 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 text-base font-bold text-text-primary">
          <Dice5 className="h-5 w-5 text-green" />
          Casas de Apostas
          <span className="rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-800">
            +18
          </span>
        </h2>
        <Link
          href="/apostas"
          className="shrink-0 text-xs font-bold uppercase tracking-wide text-green hover:underline"
        >
          Ver mais
        </Link>
      </div>

      {/* Uma linha, rolagem horizontal (estilo "Dicas de Apostas" do Lance). */}
      <div className="-mx-1 flex snap-x gap-3 overflow-x-auto px-1 pb-2">
        {articles.map((a) => (
          <Link
            key={a.slug}
            href={a.url}
            className="group w-[210px] shrink-0 snap-start sm:w-[230px]"
          >
            <div className="relative aspect-[16/9] overflow-hidden rounded-lg bg-body">
              {a.image ? (
                <Image
                  src={a.image}
                  alt={a.rewrittenTitle}
                  fill
                  sizes="230px"
                  unoptimized
                  className="object-cover transition-transform duration-300 group-hover:scale-105"
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-text-muted">
                  <Newspaper className="h-8 w-8" />
                </div>
              )}
            </div>
            <h3 className="mt-2 line-clamp-2 text-sm font-semibold leading-tight text-text-primary group-hover:text-green">
              {a.rewrittenTitle}
            </h3>
          </Link>
        ))}
      </div>

      <p className="mt-1 text-xs text-text-muted">
        +18 · Jogue com responsabilidade. O Papo de Bola não realiza apostas.
      </p>
    </section>
  );
}
