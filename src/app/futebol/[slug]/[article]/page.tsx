import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getArticleBySlug, getRelatedArticles } from "@/lib/data/articles";
import { getBrasileiraoStandings } from "@/lib/data/standings";
import { ArticleView } from "@/components/article/article-view";

// Notícia de futebol aninhada sob /futebol/{torneio|bucket}/{slug} (estilo ge.globo).
// O 1º segmento ([slug]) é o torneio/bucket (brasileirao, libertadores, mercado-da-bola...);
// o 2º ([article]) é o slug do post. A URL canônica vem de articleHref/CATEGORY_HUB; aqui só
// validamos e renderizamos. Copa do Mundo e Seleção têm rota própria (pasta estática).
export const revalidate = 1800;

function plain(text: string, max: number): string {
  return (text || "").replace(/\s+/g, " ").trim().slice(0, max);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; article: string }>;
}): Promise<Metadata> {
  const { slug, article } = await params;
  const a = await getArticleBySlug(article);
  if (!a || a.url !== `/futebol/${slug}/${article}`) return {};

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://papodebola.com.br";
  const desc = plain(a.rewrittenText, 155);

  return {
    title: a.rewrittenTitle,
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

export default async function FutebolArticlePage({
  params,
}: {
  params: Promise<{ slug: string; article: string }>;
}) {
  const { slug, article } = await params;
  const a = await getArticleBySlug(article);
  if (!a) notFound();
  // Se a URL canônica do artigo não bate com esse caminho, manda pra certa (308).
  if (a.url !== `/futebol/${slug}/${article}`) permanentRedirect(a.url);

  const [related, standings] = await Promise.all([
    getRelatedArticles(a.category, a.slug, 4).catch(() => []),
    getBrasileiraoStandings().catch(() => []),
  ]);

  return <ArticleView article={a} related={related} standings={standings} />;
}
