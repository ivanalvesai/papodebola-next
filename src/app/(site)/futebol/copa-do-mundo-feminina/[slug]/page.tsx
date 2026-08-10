import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getArticleBySlug, getRelatedArticles, articleMetaDescription } from "@/lib/data/articles";
import { getBrasileiraoStandings } from "@/lib/data/standings";
import { ArticleView } from "@/components/article/article-view";

// Notícia da Copa do Mundo Feminina aninhada sob o hub: /futebol/copa-do-mundo-feminina/{slug}
// (a categoria "Copa do Mundo Feminina" mapeia pra cá via CATEGORY_HUB). Precisa existir como
// rota própria porque a pasta estática do hub tem precedência sobre /futebol/[slug]/[article].
export const revalidate = 1800;

const PREFIX = "/futebol/copa-do-mundo-feminina";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || article.url !== `${PREFIX}/${slug}`) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";
  const desc = articleMetaDescription(article);

  return {
    // absolute: sem o sufixo "| Papo de Bola" do template do layout no title do post.
    title: { absolute: article.rewrittenTitle },
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

export default async function CopaFemininaArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();
  // Se o artigo não é da Copa Feminina (URL canônica difere), manda pra URL certa.
  if (article.url !== `${PREFIX}/${slug}`) permanentRedirect(article.url);

  const [related, standings] = await Promise.all([
    getRelatedArticles(article.category, article.slug, 4).catch(() => []),
    getBrasileiraoStandings().catch(() => []),
  ]);

  return <ArticleView article={article} related={related} standings={standings} />;
}
