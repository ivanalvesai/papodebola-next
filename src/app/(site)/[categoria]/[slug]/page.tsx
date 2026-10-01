import type { Metadata } from "next";
import { permanentRedirect } from "next/navigation";
import { getArticleBySlug, getRelatedArticles, articleMetaDescription } from "@/lib/data/articles";
import { getBrasileiraoStandings } from "@/lib/data/standings";
import { ArticleView } from "@/components/article/article-view";
import { CmsPage, cmsPageMetadata } from "@/components/payload/cms-page-route";
import { getPayloadPageByPath } from "@/lib/data/payload-pages";

// URL canônica de notícia por categoria (estilo ge.globo): /{categoria}/{slug}.
// O segmento [categoria] no root só é alcançado quando o 1º segmento NÃO é uma rota
// estática (futebol, basquete, noticias, sp...). Para esses casos a notícia mora em
// /artigos/{slug} (ver RESERVED_TOP_LEVEL/articleHref em config).
export const revalidate = 1800;

function plain(text: string, max: number): string {
  return (text || "").replace(/\s+/g, " ").trim().slice(0, max);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ categoria: string; slug: string }>;
}): Promise<Metadata> {
  const { categoria, slug } = await params;
  const article = await getArticleBySlug(slug);
  // Só responde metadata se a URL bate com a canônica do artigo (senão a rota
  // redireciona pra URL certa no componente).
  const path = `/${categoria}/${slug}`;
  if (!article) return (await cmsPageMetadata(path)) || {};
  if (article.url !== path) {
    // Post com o mesmo slug não pode sequestrar uma página do CMS desse caminho.
    return (await cmsPageMetadata(path)) || {};
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://papodebola.com.br";
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

export default async function CategoryArticlePage({
  params,
}: {
  params: Promise<{ categoria: string; slug: string }>;
}) {
  const { categoria, slug } = await params;
  const article = await getArticleBySlug(slug);
  const path = `/${categoria}/${slug}`;
  if (!article) return <CmsPage path={path} />;

  // Se a categoria na URL não bate com a canônica do artigo (ex: categoria mudou,
  // ou é categoria reservada que mora em /artigos), redireciona pra URL certa —
  // a não ser que exista uma página do CMS nesse caminho (ela ganha do post).
  if (article.url !== path) {
    const cmsPage = await getPayloadPageByPath(path);
    if (cmsPage) return <CmsPage path={path} />;
    permanentRedirect(article.url);
  }

  const [related, standings] = await Promise.all([
    getRelatedArticles(article.category, article.slug, 4).catch(() => []),
    getBrasileiraoStandings().catch(() => []),
  ]);

  return <ArticleView article={article} related={related} standings={standings} />;
}
