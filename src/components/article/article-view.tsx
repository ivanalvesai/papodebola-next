import Image from "next/image";
import Link from "next/link";
import { Clock, Pen, BookOpen, Tag, Trophy, Radio, CalendarDays, Newspaper } from "lucide-react";
import type { Article } from "@/types/article";
import { slugifyCategory, WP_CATEGORY_BY_SLUG } from "@/lib/config";
import type { getBrasileiraoStandings } from "@/lib/data/standings";
import { ShareButtons } from "@/components/article/share-buttons";
import { InstagramEmbedLoader } from "@/components/article/instagram-embed";
import { TweetEmbedLoader } from "@/components/article/x-embed";
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

      {/* Article content styles */}
      <style>{`
        .prose-article p {
          font-size: 18px;
          font-weight: 400;
          line-height: 2;
          color: #333;
          margin-bottom: 32px;
          text-align: left;
        }
        .prose-article strong { font-weight: 700; color: #1A1D23; }
        .prose-article h2 {
          font-size: 26px;
          font-weight: 700;
          color: #1A1D23;
          line-height: 1.3;
          margin: 48px 0 16px;
          scroll-margin-top: 90px;
        }
        .prose-article h3 {
          font-size: 21px;
          font-weight: 700;
          color: #1A1D23;
          line-height: 1.35;
          margin: 36px 0 12px;
          scroll-margin-top: 90px;
        }
        .prose-article h2:first-child,
        .prose-article h3:first-child { margin-top: 0; }
        .prose-article a {
          color: #00965E;
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .prose-article a:hover { color: #007a4d; }
        .prose-article ul,
        .prose-article ol { margin: 0 0 32px; padding-left: 24px; }
        .prose-article li {
          font-size: 18px;
          line-height: 1.9;
          color: #333;
          margin-bottom: 10px;
        }
        .prose-article ul { list-style: disc; }
        .prose-article ol { list-style: decimal; }
        .prose-article blockquote {
          border-left: 4px solid #00965E;
          padding: 4px 0 4px 18px;
          margin: 0 0 32px;
          color: #555;
          font-style: italic;
        }
        /* Card do Instagram (blockquote.instagram-media): sem a decoração de citação
           do site. Antes do embed.js trocar pelo card, fica um bloco limpo com o link. */
        .prose-article blockquote.instagram-media {
          border-left: 0;
          padding: 0;
          margin: 1px auto 32px;
          color: inherit;
          font-style: normal;
        }
        /* Card do X (blockquote.twitter-tweet): sem a decoração de citação do site.
           Antes do widgets.js trocar pelo card, fica um bloco limpo com o link. */
        .prose-article blockquote.twitter-tweet {
          border-left: 0;
          padding: 0;
          margin: 1px auto 32px;
          color: inherit;
          font-style: normal;
        }
        .prose-article img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 8px 0 32px;
          display: block;
        }
        .prose-article figure { margin: 0 0 32px; }
        /* Escalação no campo (bloco "lineup") — campinho com os titulares por formação. */
        .prose-article figure.pdb-lineup { max-width: 460px; margin: 0 auto 32px; }
        .prose-article .pdb-lineup-head {
          display: flex; align-items: baseline; justify-content: space-between;
          gap: 8px; margin-bottom: 8px; flex-wrap: wrap;
        }
        .prose-article .pdb-lineup-team { font-weight: 700; color: #1A1D23; font-size: 16px; }
        .prose-article .pdb-lineup-meta { font-size: 13px; color: #00965E; font-weight: 700; }
        .prose-article .pdb-pitch {
          display: flex; flex-direction: column-reverse; justify-content: space-between;
          gap: 6px; min-height: 460px; padding: 18px 6px; border-radius: 12px;
          background:
            linear-gradient(90deg, rgba(255,255,255,.18) 0 2px, transparent 2px) center/100% 100%,
            repeating-linear-gradient(0deg, #2f9e52 0 46px, #2b9149 46px 92px);
          box-shadow: inset 0 0 0 2px rgba(255,255,255,.25);
        }
        .prose-article .pdb-pitch-line { display: flex; justify-content: space-around; align-items: center; }
        .prose-article .pdb-player {
          display: flex; flex-direction: column; align-items: center;
          width: 70px; text-align: center; gap: 4px;
        }
        .prose-article .pdb-player-num {
          width: 34px; height: 34px; border-radius: 50%; background: #fff; color: #00965E;
          font-weight: 700; font-size: 14px; display: flex; align-items: center; justify-content: center;
          box-shadow: 0 1px 3px rgba(0,0,0,.4);
        }
        /* Marcador com FOTO do jogador (quando há playerId). Círculo branco + número num selo. */
        .prose-article .pdb-player-photo { position: relative; width: 46px; height: 46px; margin: 0 0 2px; }
        .prose-article .pdb-player-photo img {
          width: 46px; height: 46px; border-radius: 50%; object-fit: cover; object-position: top center;
          background: #fff; box-shadow: 0 1px 3px rgba(0,0,0,.45); display: block; margin: 0;
        }
        .prose-article .pdb-player-badge {
          position: absolute; bottom: -2px; right: -4px; min-width: 18px; height: 18px; padding: 0 4px;
          border-radius: 9px; background: #00965E; color: #fff; font-size: 10px; font-weight: 700;
          display: flex; align-items: center; justify-content: center; box-shadow: 0 1px 2px rgba(0,0,0,.4);
        }
        .prose-article .pdb-player-name {
          font-size: 11px; line-height: 1.2; color: #fff; font-weight: 700;
          text-shadow: 0 1px 2px rgba(0,0,0,.6);
        }
        /* Alinhamento de imagens (classes do editor do WP). Sem isto, imagem menor
           que a coluna fica encostada na esquerda (img e display:block com margem
           lateral 0). Honra aligncenter/alignleft/alignright e o bloco Gutenberg. */
        .prose-article img.aligncenter,
        .prose-article figure.aligncenter,
        .prose-article .wp-block-image.aligncenter,
        .prose-article .aligncenter {
          margin-left: auto;
          margin-right: auto;
        }
        .prose-article .wp-block-image.aligncenter { text-align: center; }
        .prose-article img.alignleft,
        .prose-article figure.alignleft { float: left; margin: 8px 24px 16px 0; }
        .prose-article img.alignright,
        .prose-article figure.alignright { float: right; margin: 8px 0 16px 24px; }
        .prose-article figure.alignleft,
        .prose-article figure.alignright { max-width: 50%; }
        .prose-article::after { content: ""; display: table; clear: both; }
        .prose-article figcaption {
          font-size: 13px;
          color: #777;
          margin-top: 8px;
          text-align: center;
        }
        .prose-article table {
          width: 100%;
          border-collapse: separate;
          border-spacing: 0;
          margin: 0 0 32px;
          font-size: 16px;
          border: 1px solid #e2e5e9;
          border-radius: 12px;
          overflow: hidden;
        }
        .prose-article th,
        .prose-article td {
          padding: 12px 14px;
          text-align: left;
          vertical-align: top;
          border-bottom: 1px solid #eaedf0;
        }
        .prose-article th {
          background: #00965E;
          font-weight: 700;
          color: #fff;
          border-bottom: 0;
        }
        /* O texto da célula do cabeçalho vem dentro de <p>/<strong> (Lexical) e herdava
           a cor escura do parágrafo — força branco pra ler no fundo verde. */
        .prose-article th p,
        .prose-article th strong,
        .prose-article th a { color: #fff; margin: 0; }
        .prose-article tr:nth-child(even) td { background: #f6f9f8; }
        .prose-article tr:last-child td { border-bottom: 0; }
        /* Primeira coluna = cabeçalho verde, MESMO em linhas adicionadas à mão no editor
           (que vêm como célula normal <td>, sem o estado "header"). Assim o redator só
           adiciona a linha e a coluna "Informação" já sai verde — sem marcar header por
           célula. `tr td:first-child` iguala a especificidade da regra de zebra acima e
           vence por ordem de fonte (senão as linhas pares ficariam cinza). */
        .prose-article tr td:first-child {
          background: #00965E;
          color: #fff;
          font-weight: 700;
        }
        .prose-article tr td:first-child p,
        .prose-article tr td:first-child strong,
        .prose-article tr td:first-child a { color: #fff; margin: 0; }
        .prose-article hr { border: 0; border-top: 1px solid #e2e5e9; margin: 40px 0; }
        @media (max-width: 768px) {
          .prose-article p,
          .prose-article li { font-size: 17px; line-height: 1.9; }
          .prose-article p { margin-bottom: 28px; }
          .prose-article h2 { font-size: 23px; margin: 40px 0 14px; }
          .prose-article h3 { font-size: 19px; margin: 32px 0 10px; }
          .prose-article table { font-size: 14px; }
          .prose-article th,
          .prose-article td { padding: 8px 9px; }
        }
        /* Blocos do editor visual */
        .prose-article .pdb-video { margin: 0 0 32px; }
        .prose-article .pdb-video-frame {
          position: relative;
          padding-bottom: 56.25%;
          height: 0;
          border-radius: 8px;
          overflow: hidden;
        }
        .prose-article .pdb-video-frame iframe {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          border: 0;
        }
        .prose-article .pdb-columns { display: grid; gap: 24px; margin: 0 0 32px; }
        .prose-article .pdb-cols-2 { grid-template-columns: 1fr 1fr; }
        .prose-article .pdb-cols-3 { grid-template-columns: 1fr 1fr 1fr; }
        .prose-article .pdb-col > :last-child { margin-bottom: 0; }
        .prose-article .pdb-callout {
          padding: 16px 20px;
          border-radius: 8px;
          margin: 0 0 32px;
          border-left: 4px solid;
        }
        .prose-article .pdb-callout > :last-child { margin-bottom: 0; }
        .prose-article .pdb-callout-info { background: #eff6ff; border-color: #3b82f6; }
        .prose-article .pdb-callout-warning { background: #fffbeb; border-color: #f59e0b; }
        .prose-article .pdb-callout-success { background: #f0fdf4; border-color: #22c55e; }
        .prose-article .pdb-callout-highlight { background: #ecfdf5; border-color: #00965E; }
        /* Comentário / Info em verde — mesmas cores do "Comentário da Redação" do lance a lance. */
        .prose-article .pdb-callout-comment,
        .prose-article .pdb-callout-comment-plain {
          background: rgba(0, 150, 94, 0.05);
          border: 1px solid rgba(0, 150, 94, 0.4);
        }
        .prose-article .pdb-callout-comment::before {
          content: "💬 Comentário da Redação";
          display: block;
          margin-bottom: 8px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.03em;
          text-transform: uppercase;
          color: #00965E;
        }
        .prose-article .pdb-img { margin: 8px 0 32px; }
        .prose-article .pdb-img img { max-width: 100%; height: auto; border-radius: 8px; display: block; }
        .prose-article .pdb-img-center { text-align: center; }
        .prose-article .pdb-img-center img { margin-left: auto; margin-right: auto; }
        .prose-article .pdb-img-right img { margin-left: auto; margin-right: 0; }
        .prose-article .pdb-img-left img { margin-left: 0; margin-right: auto; }
        /* Cards de apostas: previsão/palpite, destaque com dados, botão CTA, prós/contras */
        .prose-article .pdb-prediction {
          border: 1px solid rgba(0,150,94,0.35);
          background: rgba(0,150,94,0.05);
          border-radius: 12px;
          padding: 16px 18px;
          margin: 0 0 32px;
        }
        .prose-article .pdb-pred-head {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; flex-wrap: wrap; margin-bottom: 6px;
        }
        .prose-article .pdb-pred-label {
          font-size: 12px; font-weight: 700; text-transform: uppercase;
          letter-spacing: 0.03em; color: #00965E;
        }
        .prose-article .pdb-pred-odd {
          font-size: 13px; font-weight: 700; color: #1A1D23; background: #fff;
          border: 1px solid rgba(0,150,94,0.4); border-radius: 999px; padding: 3px 12px;
        }
        .prose-article .pdb-pred-text { font-size: 20px; font-weight: 700; color: #1A1D23; line-height: 1.3; margin: 0; }
        .prose-article .pdb-pred-note { font-size: 15px; color: #444; margin: 10px 0 0; line-height: 1.6; }
        .prose-article a.pdb-cta {
          display: inline-block; margin-top: 14px; padding: 11px 22px; border-radius: 8px;
          font-weight: 700; font-size: 15px; text-decoration: none; text-align: center;
        }
        .prose-article a.pdb-cta-primary { background: #00965E; color: #fff !important; }
        .prose-article a.pdb-cta-primary:hover { background: #007a4d; }
        .prose-article a.pdb-cta-outline { border: 2px solid #00965E; color: #00965E !important; }
        .prose-article .pdb-statcard {
          display: flex; gap: 16px; align-items: flex-start;
          border: 1px solid #e2e5e9; border-radius: 12px; padding: 16px 18px; margin: 0 0 32px; background: #fff;
        }
        .prose-article .pdb-statcard-img {
          width: 72px; height: 72px; border-radius: 10px; object-fit: cover; flex-shrink: 0; margin: 0;
        }
        .prose-article .pdb-statcard-title {
          font-size: 13px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.03em; color: #00965E;
        }
        .prose-article .pdb-statcard-sub { font-size: 19px; font-weight: 700; color: #1A1D23; margin-top: 2px; }
        .prose-article .pdb-statcard-list { list-style: none; margin: 12px 0 0; padding: 0; }
        .prose-article .pdb-statcard-list li {
          display: flex; justify-content: space-between; gap: 12px;
          font-size: 15px; padding: 6px 0; border-bottom: 1px solid #f0f2f4; margin: 0; color: #444;
        }
        .prose-article .pdb-statcard-list li:last-child { border-bottom: 0; }
        .prose-article .pdb-statcard-list strong { color: #1A1D23; }
        .prose-article .pdb-proscons { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin: 0 0 32px; }
        .prose-article .pdb-pros, .prose-article .pdb-cons {
          border: 1px solid #e2e5e9; border-radius: 12px; padding: 14px 16px; background: #fff;
        }
        .prose-article .pdb-pc-title { font-weight: 700; color: #1A1D23; margin-bottom: 8px; font-size: 15px; }
        .prose-article .pdb-pros ul, .prose-article .pdb-cons ul { list-style: none; margin: 0; padding: 0; }
        .prose-article .pdb-pros li, .prose-article .pdb-cons li {
          position: relative; padding-left: 26px; margin: 0 0 8px; font-size: 15px; line-height: 1.5; color: #333;
        }
        .prose-article .pdb-pros li::before { content: "✅"; position: absolute; left: 0; }
        .prose-article .pdb-cons li::before { content: "❌"; position: absolute; left: 0; }
        /* --- Temas de cor dos cards (o select "Cor" define a classe pdb-theme-*) --- */
        .prose-article .pdb-theme-verde    { --pdb-accent:#00965E; --pdb-soft:rgba(0,150,94,0.06);   --pdb-ring:rgba(0,150,94,0.35); }
        .prose-article .pdb-theme-azul     { --pdb-accent:#2563eb; --pdb-soft:rgba(37,99,235,0.06);  --pdb-ring:rgba(37,99,235,0.35); }
        .prose-article .pdb-theme-vermelho { --pdb-accent:#dc2626; --pdb-soft:rgba(220,38,38,0.06);  --pdb-ring:rgba(220,38,38,0.35); }
        .prose-article .pdb-theme-dourado  { --pdb-accent:#b8860b; --pdb-soft:rgba(184,134,11,0.09); --pdb-ring:rgba(184,134,11,0.4); }
        .prose-article .pdb-theme-roxo     { --pdb-accent:#7c3aed; --pdb-soft:rgba(124,58,237,0.06); --pdb-ring:rgba(124,58,237,0.35); }
        .prose-article .pdb-theme-escuro   { --pdb-accent:#1A1D23; --pdb-soft:rgba(26,29,35,0.05);   --pdb-ring:rgba(26,29,35,0.3); }
        /* Aplica a cor do tema (var --pdb-accent) nos elementos dos cards. */
        .prose-article .pdb-prediction { border-color: var(--pdb-ring, rgba(0,150,94,0.35)); background: var(--pdb-soft, rgba(0,150,94,0.06)); }
        .prose-article .pdb-pred-label { color: var(--pdb-accent, #00965E); }
        .prose-article .pdb-pred-odd { border-color: var(--pdb-ring, rgba(0,150,94,0.4)); }
        .prose-article a.pdb-cta-primary { background: var(--pdb-accent, #00965E); }
        .prose-article a.pdb-cta-primary:hover { background: var(--pdb-accent, #00965E); filter: brightness(0.92); }
        .prose-article a.pdb-cta-outline { border-color: var(--pdb-accent, #00965E); color: var(--pdb-accent, #00965E) !important; }
        .prose-article .pdb-statcard { border-left: 4px solid var(--pdb-accent, #00965E); }
        .prose-article .pdb-statcard-title { color: var(--pdb-accent, #00965E); }
        .prose-article .pdb-proscons .pdb-pros { border-top: 3px solid var(--pdb-accent, #00965E); }
        @media (max-width: 768px) {
          .prose-article .pdb-columns { grid-template-columns: 1fr; }
          .prose-article .pdb-proscons { grid-template-columns: 1fr; }
        }
      `}</style>
    </>
  );
}
