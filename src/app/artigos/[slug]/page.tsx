import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getArticleBySlug, getRelatedArticles, articleMetaDescription } from "@/lib/data/articles";
import { getBrasileiraoStandings } from "@/lib/data/standings";
import { ArticleView } from "@/components/article/article-view";
import { CRAQUE_SLUGS } from "@/lib/data/craques";

// /artigos/[slug] é o FALLBACK: só renderiza notícias de categorias que colidem com
// rotas existentes (formula-1, tenis, esports...). As demais têm URL canônica
// /{categoria}/{slug} e são redirecionadas (308). Craques vão pra /futebol/craque/[slug].
export const revalidate = 1800;

function plain(text: string, max: number): string {
  return (text || "").replace(/\s+/g, " ").trim().slice(0, max);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  if (CRAQUE_SLUGS.includes(slug)) return {};
  const article = await getArticleBySlug(slug);
  // Se a canônica não é /artigos (categoria não reservada), a rota redireciona; aqui
  // só geramos metadata pro caso de fallback real.
  if (!article || article.url !== `/artigos/${slug}`) return {};

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

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  // Craque NÃO é artigo: vai pra página canônica do craque.
  if (CRAQUE_SLUGS.includes(slug)) permanentRedirect(`/futebol/craque/${slug}`);

  const article = await getArticleBySlug(slug);
  if (!article) notFound();

  // Categoria não reservada → URL canônica é /{categoria}/{slug}: consolida (308).
  if (article.url !== `/artigos/${slug}`) permanentRedirect(article.url);

  const [related, standings] = await Promise.all([
    getRelatedArticles(article.category, article.slug, 4).catch(() => []),
    getBrasileiraoStandings().catch(() => []),
  ]);

  return <ArticleView article={article} related={related} standings={standings} />;
}
