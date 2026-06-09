import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Pen, BookOpen, Tag, Trophy } from "lucide-react";
import { getArticleBySlug, getRelatedArticles } from "@/lib/data/articles";
import { slugifyCategory, WP_CATEGORY_BY_SLUG } from "@/lib/config";
import { ShareButtons } from "@/components/article/share-buttons";
import { ArticleSchema } from "@/components/seo/article-schema";
import { PageBreadcrumb } from "@/components/seo/page-breadcrumb";

export const revalidate = 1800;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://papodebola.com.br";
  const desc = article.rewrittenText.substring(0, 155).replace(/\n/g, " ");

  return {
    title: article.rewrittenTitle,
    description: desc,
    openGraph: {
      title: article.rewrittenTitle,
      description: desc,
      type: "article",
      url: `${siteUrl}/artigos/${article.slug}`,
      siteName: "Papo de Bola",
      locale: "pt_BR",
      ...(article.image && {
        images: [
          {
            url: article.image.startsWith("http")
              ? article.image
              : `${siteUrl}${article.image}`,
          },
        ],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: article.rewrittenTitle,
      description: desc,
    },
  };
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

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  const related = await getRelatedArticles(
    article.category,
    article.slug,
    4
  ).catch(() => []);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://papodebola.com.br";
  const articleUrl = `${siteUrl}/artigos/${article.slug}`;

  const dateFormatted = new Date(article.pubDate).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  const wordCount = article.rewrittenText
    .split(/\s+/)
    .filter((w) => w.length > 0).length;
  const readingTime = Math.max(1, Math.ceil(wordCount / 200));

  // Preferimos o HTML real do WordPress (h2/h3/listas/links com espacamento);
  // fallback para o texto puro embrulhado em <p> caso o post nao traga HTML.
  const bodyHtml = article.contentHtml?.trim()
    ? sanitizeHtml(article.contentHtml)
    : formatParagraphs(article.rewrittenText);
  const author = article.author || "Redacao Papo de Bola";

  // Link da categoria em URL limpa; se nao for uma das categorias conhecidas,
  // cai pra /noticias (evita 404 numa categoria fora da lista).
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

          {/* Image */}
          {article.image && (
            <div className="rounded-md overflow-hidden mb-7">
              <Image
                src={article.image}
                alt={article.rewrittenTitle}
                width={800}
                height={480}
                className="w-full max-h-[480px] object-cover"
                priority
                unoptimized
              />
            </div>
          )}

          {/* Category */}
          <Link
            href={catHref}
            className="text-xs font-bold uppercase tracking-wider text-green hover:underline"
          >
            {article.category}
          </Link>

          {/* Title */}
          <h1 className="text-2xl sm:text-[34px] font-bold leading-tight text-text-primary mt-4 mb-5">
            {article.rewrittenTitle}
          </h1>

          {/* Meta */}
          <div className="flex items-center gap-5 flex-wrap text-sm text-text-muted pt-4 border-t border-border-light">
            <span className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {dateFormatted}
            </span>
            <span className="flex items-center gap-1.5">
              <Pen className="h-3.5 w-3.5" />
              {author}
            </span>
            <span className="flex items-center gap-1.5">
              <BookOpen className="h-3.5 w-3.5" />
              {readingTime} min de leitura
            </span>
          </div>
        </div>
      </section>

      {/* Content */}
      <div className="mx-auto max-w-[680px] px-4 py-12">
        <article
          className="prose-article"
          dangerouslySetInnerHTML={{ __html: bodyHtml }}
        />
      </div>

      {/* Tags */}
      {article.tags && article.tags.length > 0 && (
        <div className="mx-auto max-w-[680px] px-4 pb-6">
          <div className="flex gap-2 flex-wrap">
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
        </div>
      )}

      {/* Share */}
      <div className="mx-auto max-w-[680px] px-4 py-8 border-t-2 border-border-custom">
        <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-4">
          Compartilhar
        </h4>
        <ShareButtons url={articleUrl} title={article.rewrittenTitle} />
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mx-auto max-w-[680px] px-4 py-8 border-t-2 border-border-custom">
          <h3 className="text-base font-bold uppercase text-text-primary mb-5">
            Leia Tambem
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {related.map((r) => (
              <Link
                key={r.slug}
                href={`/artigos/${r.slug}`}
                className="group block bg-surface border border-border-custom rounded-lg overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition-all"
              >
                {r.image && (
                  <Image
                    src={r.image}
                    alt=""
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
        .prose-article strong {
          font-weight: 700;
          color: #1A1D23;
        }
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
        .prose-article h3:first-child {
          margin-top: 0;
        }
        .prose-article a {
          color: #00965E;
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 2px;
        }
        .prose-article a:hover {
          color: #007a4d;
        }
        .prose-article ul,
        .prose-article ol {
          margin: 0 0 32px;
          padding-left: 24px;
        }
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
        .prose-article img {
          max-width: 100%;
          height: auto;
          border-radius: 8px;
          margin: 8px 0 32px;
          display: block;
        }
        .prose-article figure { margin: 0 0 32px; }
        .prose-article figcaption {
          font-size: 13px;
          color: #777;
          margin-top: 8px;
          text-align: center;
        }
        .prose-article table {
          width: 100%;
          border-collapse: collapse;
          margin: 0 0 32px;
          font-size: 16px;
        }
        .prose-article th,
        .prose-article td {
          border: 1px solid #e2e5e9;
          padding: 10px 12px;
          text-align: left;
          vertical-align: top;
        }
        .prose-article th {
          background: #f8f9fa;
          font-weight: 700;
          color: #1A1D23;
        }
        .prose-article hr {
          border: 0;
          border-top: 1px solid #e2e5e9;
          margin: 40px 0;
        }
        @media (max-width: 768px) {
          .prose-article p,
          .prose-article li {
            font-size: 17px;
            line-height: 1.9;
          }
          .prose-article p { margin-bottom: 28px; }
          .prose-article h2 { font-size: 23px; margin: 40px 0 14px; }
          .prose-article h3 { font-size: 19px; margin: 32px 0 10px; }
          .prose-article table { font-size: 14px; }
          .prose-article th,
          .prose-article td { padding: 8px 9px; }
        }
      `}</style>
    </>
  );
}
