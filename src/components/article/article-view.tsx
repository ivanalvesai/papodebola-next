import Image from "next/image";
import Link from "next/link";
import { Clock, Pen, BookOpen, Tag, Trophy, Radio, CalendarDays, Newspaper } from "lucide-react";
import type { Article } from "@/types/article";
import { slugifyCategory, WP_CATEGORY_BY_SLUG } from "@/lib/config";
import type { getBrasileiraoStandings } from "@/lib/data/standings";
import { ShareButtons } from "@/components/article/share-buttons";
import { InstagramEmbedLoader } from "@/components/article/instagram-embed";
import { TweetEmbedLoader } from "@/components/article/x-embed";
import { ProseStyles } from "@/components/article/prose-styles";
import { ArticleSchema } from "@/components/seo/article-schema";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";
import { StandingsWidget } from "@/components/sidebar/standings-widget";
import { BettingDisclaimer } from "@/components/apostas/betting-disclaimer";

type Standings = Awaited<ReturnType<typeof getBrasileiraoStandings>>;

// Sidebar de engajamento do artigo (desktop): empurra o leitor de SEO pra
// próxima sessão em vez de virar beco sem saída. Reusa a classificação real.
function ArticleSidebar({ standings }: { standings: Standings }) {
  const ctas = [
    { href: "/jogos-de-hoje", label: "Jogos de hoje", icon: CalendarDays },
    { href: "/futebol/copa-do-mundo", label: "Copa do Mundo 2026", icon: Trophy },
    { href: "/ao-vivo", label: "Placar ao vivo", icon: Radio },
    { href: "/noticias", label: "Últimas notícias", icon: Newspaper },
  ];
  return (
    <div className="space-y-4">
      <div className="rounded-lg border border-border-custom bg-surface p-4">
        <h3 className="mb-3 text-xs font-bold uppercase tracking-wider text-text-muted">
          Continue no Papo de Bola
        </h3>
        <div className="space-y-1">
          {ctas.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="flex items-center gap-2 rounded-md px-2 py-2 text-sm font-semibold text-text-secondary transition-colors hover:bg-green-light hover:text-green"
            >
              <c.icon className="h-4 w-4 shrink-0 text-green" />
              {c.label}
            </Link>
          ))}
        </div>
      </div>
      {standings.length > 0 && <StandingsWidget standings={standings} />}
    </div>
  );
}

// Sanitizacao leve do HTML vindo do WordPress (CMS proprio, autores confiaveis):
// remove apenas vetores de XSS e mantem a estrutura editorial (h2/h3/listas/links,
// inclusive os estilos inline da caixa "Neste artigo").
function sanitizeHtml(html: string): string {
  return html
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, "")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, "")
    .replace(/\son\w+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, "")
    .replace(/(href|src)\s*=\s*("|')\s*javascript:[^"']*\2/gi, '$1=$2#$2');
}

// SEO/performance das imagens DENTRO do corpo do post (vêm como HTML cru, sem
// next/image): injeta loading=lazy + decoding=async, dá dimensões às miniaturas do
// YouTube (hqdefault 480x360 → mata CLS) e preenche alt vazio com o título (palavra-
// chave natural). Mantém atributos que já existem.
function enhanceBodyImages(html: string, fallbackAlt: string): string {
  const alt = fallbackAlt.replace(/"/g, "&quot;");
  return html.replace(/<img\b[^>]*>/gi, (tag) => {
    let t = tag;
    if (!/\sloading=/i.test(t)) t = t.replace(/<img/i, '<img loading="lazy"');
    if (!/\sdecoding=/i.test(t)) t = t.replace(/<img/i, '<img decoding="async"');
    if (/img\.youtube\.com/i.test(t) && !/\swidth=/i.test(t)) {
      t = t.replace(/<img/i, '<img width="480" height="360"');
    }
    if (/\salt\s*=\s*""/i.test(t)) t = t.replace(/\salt\s*=\s*""/i, ` alt="${alt}"`);
    else if (!/\salt=/i.test(t)) t = t.replace(/<img/i, `<img alt="${alt}"`);
    return t;
  });
}

function formatParagraphs(text: string): string {
  return text
    .split(/\n\n|\n/)
    .filter((p) => p.trim())
    .map((p) => {
      let t = p.trim();
      // Bold subtitles: ALL CAPS followed by — or :
      t = t.replace(
        /^([A-ZÁÉÍÓÚÂÊÔÃÕÇÜ][A-ZÁÉÍÓÚÂÊÔÃÕÇÜ\s,]{4,})\s*[-–—:]\s*/,
        "<strong>$1</strong> — "
      );
      return `<p>${t}</p>`;
    })
    .join("");
}

/**
 * Renderização completa de um artigo. Compartilhada entre /artigos/[slug] (fallback
 * de categorias reservadas) e /[categoria]/[slug] (URL canônica por categoria).
 */
export function ArticleView({
  article,
  related,
  standings,
}: {
  article: Article;
  related: Article[];
  standings: Standings;
}) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://papodebola.com.br";
  const articleUrl = `${siteUrl}${article.url}`;

  const dateFormatted = new Date(article.pubDate).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "America/Sao_Paulo",
  });

  const wordCount = article.rewrittenText.split(/\s+/).filter((w) => w.length > 0).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  const bodyHtml = enhanceBodyImages(
    article.contentHtml?.trim()
      ? sanitizeHtml(article.contentHtml)
      : formatParagraphs(article.rewrittenText),
    article.rewrittenTitle
  );
  const author = article.author || "Redacao Papo de Bola";

  const catSlug = slugifyCategory(article.category);
  const catHref = WP_CATEGORY_BY_SLUG[catSlug] ? `/noticias/${catSlug}` : "/noticias";

  return (
    <>
      <ArticleSchema article={article} />

      {/* Hero */}
      <section className="bg-surface border-b border-border-custom">
        <div className="mx-auto max-w-[800px] px-4 pt-6 pb-8">
          <PageBreadcrumb
            className="mb-4"
            items={[
              { label: "Início", href: "/" },
              { label: "Notícias", href: "/noticias" },
              { label: article.category, href: catHref },
              { label: article.rewrittenTitle },
            ]}
          />

          {/* Imagem destacada NAO e exibida no topo do artigo de proposito:
              ela ja aparece nos cards da home, entao aqui fica so o titulo.
              Continua sendo usada no OG/SEO (generateMetadata) e nos cards
              da home (article.image). */}

          <Link
            href={catHref}
            className="text-xs font-bold uppercase tracking-wider text-green hover:underline"
          >
            {article.category}
          </Link>

          <h1 className="text-2xl sm:text-[34px] font-bold leading-tight text-text-primary mt-4 mb-5">
            {article.rewrittenTitle}
          </h1>

          <div className="flex items-center gap-5 flex-wrap text-sm text-text-muted pt-4 border-t border-border-light">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {dateFormatted}
            </span>
            <span className="flex items-center gap-1.5">
              <Pen className="h-3.5 w-3.5" />
              {article.authorSlug ? (
                <Link
                  href={`/autor/${article.authorSlug}`}
                  className="font-semibold text-text-secondary hover:text-green hover:underline"
                >
                  {author}
                </Link>
              ) : (
                author
              )}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              {readingTime} min de leitura
            </span>
          </div>
        </div>
      </section>

      {/* Content + sidebar de engajamento (sidebar só no desktop) */}
      <div className="mx-auto max-w-[1040px] px-4 py-12 lg:grid lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-10 lg:items-start">
        <div className="mx-auto w-full max-w-[680px] min-w-0 lg:mx-0 lg:max-w-none">
          {article.category === "Casas de Apostas" && <BettingDisclaimer className="mb-6" />}
          <article className="prose-article" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
          {bodyHtml.includes("instagram-media") && <InstagramEmbedLoader />}
          {bodyHtml.includes("twitter-tweet") && <TweetEmbedLoader />}

          {/* Tags */}
          {article.tags && article.tags.length > 0 && (
            <div className="flex gap-2 flex-wrap pt-8">
              {article.tags.map((tag) => (
                <Link
                  key={tag}
                  href={`/noticias?cat=${encodeURIComponent(tag)}`}
                  className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-body border border-border-custom rounded-full text-xs font-semibold text-text-secondary hover:bg-green hover:text-white hover:border-green transition-colors"
                >
                  <Tag className="h-3 w-3" />
                  {tag}
                </Link>
              ))}
              <Link
                href={catHref}
                className="inline-flex items-center gap-1 px-3.5 py-1.5 bg-body border border-border-custom rounded-full text-xs font-semibold text-text-secondary hover:bg-green hover:text-white hover:border-green transition-colors"
              >
                <Trophy className="h-3 w-3" />
                {article.category}
              </Link>
            </div>
          )}

          {/* Share */}
          <div className="mt-8 border-t-2 border-border-custom pt-8">
            <p className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">
              Compartilhar
            </p>
            <ShareButtons url={articleUrl} title={article.rewrittenTitle} />
          </div>
        </div>

        <aside className="mt-10 hidden lg:mt-0 lg:block lg:sticky lg:top-4">
          <ArticleSidebar standings={standings} />
        </aside>
      </div>

      {/* CTAs de engajamento no mobile (a sidebar é só desktop) */}
      <div className="mx-auto max-w-[680px] px-4 pb-2 lg:hidden">
        <div className="flex flex-wrap gap-2">
          {[
            { href: "/jogos-de-hoje", label: "Jogos de hoje" },
            { href: "/futebol/copa-do-mundo", label: "Copa do Mundo" },
            { href: "/ao-vivo", label: "Placar ao vivo" },
          ].map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="inline-flex items-center gap-1 rounded-full bg-green px-3.5 py-1.5 text-xs font-semibold text-white transition-opacity hover:opacity-90"
            >
              {c.label}
            </Link>
          ))}
        </div>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mx-auto max-w-[680px] px-4 py-8 border-t-2 border-border-custom">
          <h2 className="text-base font-bold uppercase text-text-primary mb-5">
            Leia Também
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={r.url}
                className="group block bg-surface border border-border-custom rounded-lg overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                {r.image && (
                  <Image
                    src={r.image}
                    alt={r.rewrittenTitle}
                    width={340}
                    height={120}
                    className="w-full h-[120px] object-cover"
                    unoptimized
                  />
                )}
                <div className="p-3">
                  <div className="text-[10px] font-bold uppercase tracking-wide text-green mb-1">
                    {r.category}
                  </div>
                  <div className="text-sm font-semibold text-text-primary leading-snug line-clamp-2 group-hover:text-green transition-colors">
                    {r.rewrittenTitle}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Estilos do conteudo (compartilhado com as paginas do CMS) */}
      <ProseStyles />
    </>
  );
}
