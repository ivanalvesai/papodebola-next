import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getArticleBySlug, getRelatedArticles, articleMetaDescription } from "@/lib/data/articles";
import { getBrasileiraoStandings } from "@/lib/data/standings";
import { ArticleView } from "@/components/article/article-view";

// Notícia da Seleção Brasileira aninhada sob o hub: /futebol/selecao-brasileira/{slug}.
// (selecao-brasileira é pasta estática, então precisa da rota [slug] própria — como a Copa.)
export const revalidate = 1800;

const PREFIX = "/futebol/selecao-brasileira";

function plain(text: string, max: number): string {
  return (text || "").replace(/\s+/g, " ").trim().slice(0, max);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const a = await getArticleBySlug(slug);
  if (!a || a.url !== `${PREFIX}/${slug}`) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://papodebola.com.br";
  const desc = articleMetaDescription(a);

  return {
    // absolute: sem o sufixo "| Papo de Bola" do template do layout no title do post.
    title: { absolute: a.rewrittenTitle },
    description: desc,
    alternates: { canonical: a.url },
    openGraph: {
      title: a.rewrittenTitle,
      description: desc,
      type: "article",
      url: `${siteUrl}${a.url}`,
      siteName: "Papo de Bola",
      locale: "pt_BR",
      ...(a.image && {
        images: [{ url: a.image.startsWith("http") ? a.image : `${siteUrl}${a.image}` }],
      }),
    },
    twitter: {
      card: "summary_large_image",
      title: a.rewrittenTitle,
      description: desc,
    },
  };
}

export default async function SelecaoArticlePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const a = await getArticleBySlug(slug);
  if (!a) notFound();
  if (a.url !== `${PREFIX}/${slug}`) permanentRedirect(a.url);

  const [related, standings] = await Promise.all([
    getRelatedArticles(a.category, a.slug, 4).catch(() => []),
    getBrasileiraoStandings().catch(() => []),
  ]);

  return <ArticleView article={a} related={related} standings={standings} />;
}
