import type { Article } from "@/types/article";

interface ArticleSchemaProps {
  article: Article;
}

// Datas do WordPress vêm sem timezone (ex: "2026-06-13T11:23:20"). O conteúdo é
// gerado no fuso de Brasília, então acrescenta o offset -03:00 pra virar ISO 8601
// completo (exigência de NewsArticle/Google).
function withTz(date: string): string {
  if (!date) return date;
  // já tem timezone (Z ou ±hh:mm)?
  if (/[zZ]$|[+-]\d{2}:?\d{2}$/.test(date)) return date;
  return `${date}-03:00`;
}

export function ArticleSchema({ article }: ArticleSchemaProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";
  const articleUrl = `${siteUrl}${article.url}`;
  const imageUrl = article.image?.startsWith("http")
    ? article.image
    : article.image
      ? `${siteUrl}${article.image}`
      : undefined;

  // Autor como Person quando há nome real; cai pra Organization se for genérico.
  const authorName = article.author?.trim();
  const isRealPerson = !!authorName && !/reda[cç]/i.test(authorName);

  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.rewrittenTitle,
    description: article.rewrittenText.substring(0, 155).replace(/\n/g, " "),
    ...(imageUrl && { image: imageUrl }),
    datePublished: withTz(article.pubDate),
    dateModified: withTz(article.updatedAt || article.pubDate),
    author: {
      "@type": isRealPerson ? "Person" : "Organization",
      name: authorName || "Redação Papo de Bola",
    },
    publisher: {
      "@type": "Organization",
      "@id": `${siteUrl}/#org`,
      name: "Papo de Bola",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/logotipo-papo-de-bola.png`,
      },
    },
    mainEntityOfPage: articleUrl,
    articleSection: article.category,
  };

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
    />
  );
}
