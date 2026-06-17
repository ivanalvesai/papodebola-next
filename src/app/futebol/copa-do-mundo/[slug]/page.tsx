import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getArticleBySlug, getRelatedArticles, articleMetaDescription } from "@/lib/data/articles";
import { getBrasileiraoStandings } from "@/lib/data/standings";
import { ArticleView } from "@/components/article/article-view";

// Notícia da Copa do Mundo aninhada sob o hub do torneio: /futebol/copa-do-mundo/{slug}
// (a categoria "Copa do Mundo" mapeia pra cá via CATEGORY_HUB). O /copa-do-mundo/{slug} da
// raiz e o /artigos/{slug} antigo redirecionam pra cá (article.url != path → 308).
export const revalidate = 1800;

const PREFIX = "/futebol/copa-do-mundo";

function plain(text: string, max: number): string {
  return (text || "").replace(/\s+/g, " ").trim().slice(0, max);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || article.url !== `${PREFIX}/${slug}`) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://papodebola.com.br";
  const desc = articleMetaDescription(article);

  return {
    title: article.rewrittenTitle,
    description: desc,
    alternates: { canonical: article.url },
    openGraph: {
      title: article.rewrittenTitle,
      description: desc,
      type: "article",
      url: `${siteUrl}${article.url}`,
      siteName: "Papo de Bola",
      locale: "pt_BR",
      ...(article.image && {
        images: [{ url: article.image.startsWith("http") ? article.image : `${siteUrl}${article.image}` }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: article.rewrittenTitle,
      description: desc,
    },
  };
}

export default async function CopaArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();
  // Se o artigo não é Copa do Mundo (URL canônica difere), manda pra URL certa.
  if (article.url !== `${PREFIX}/${slug}`) permanentRedirect(article.url);

  const [related, standings] = await Promise.all([
    getRelatedArticles(article.category, article.slug, 4).catch(() => []),
    getBrasileiraoStandings().catch(() => []),
  ]);

  return <ArticleView article={article} related={related} standings={standings} />;
}
