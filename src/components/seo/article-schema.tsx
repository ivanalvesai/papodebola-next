import type { Article } from "@/types/article";

interface ArticleSchemaProps {
  article: Article;
}

export function ArticleSchema({ article }: ArticleSchemaProps) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://papodebola.com.br";
  const articleUrl = `${siteUrl}/artigos/${article.slug}`;
  const imageUrl = article.image?.startsWith("http")
    ? article.image
    : article.image
      ? `${siteUrl}${article.image}`
      : undefined;

  const schema = {
    "@context": "https://schema.org",
    "@type": "NewsArticle",
    headline: article.rewrittenTitle,
    description: article.rewrittenText.substring(0, 155).replace(/\n/g, " "),
    ...(imageUrl && { image: imageUrl }),
    datePublished: article.pubDate,
    dateModified: article.updatedAt || article.pubDate,
    author: {
      "@type": "Organization",
      name: article.author || "Redacao Papo de Bola",
    },
    publisher: {
      "@type": "Organization",
      name: "Papo de Bola",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/favicon.svg`,
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
