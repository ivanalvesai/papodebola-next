import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, Pen, BookOpen, Tag, Trophy } from "lucide-react";
import { getArticleBySlug, getRelatedArticles } from "@/lib/data/articles";
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

  const paragraphsHtml = formatParagraphs(article.rewrittenText);
  const author = article.author || "Redacao Papo de Bola";

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
              { label: article.category, href: `/noticias?cat=${encodeURIComponent(article.category)}` },
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
            href={`/noticias?cat=${encodeURIComponent(article.category)}`}
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
          dangerouslySetInnerHTML={{ __html: paragraphsHtml }}
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
              href={`/noticias?cat=${encodeURIComponent(article.category)}`}
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
        .prose-article p strong {
          font-weight: 700;
          color: #1A1D23;
          font-size: 17px;
          letter-spacing: 0.02em;
        }
        @media (max-width: 768px) {
          .prose-article p {
            font-size: 17px;
            line-height: 1.9;
            margin-bottom: 28px;
          }
        }
      `}</style>
    </>
  );
}
