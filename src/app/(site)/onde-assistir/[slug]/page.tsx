import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { getArticleBySlug, getRelatedArticles, articleMetaDescription } from "@/lib/data/articles";
import { getBrasileiraoStandings } from "@/lib/data/standings";
import { getWatchMatch } from "@/lib/data/watch";
import { ArticleView } from "@/components/article/article-view";
import { MatchInfoCard } from "@/components/onde-assistir/match-info-card";
import { SportsEventSchema } from "@/components/seo/sports-event-schema";
import { buildMetadata } from "@/lib/seo/build-metadata";
import { WATCH_CATEGORY } from "@/lib/config";

// Post "onde assistir": /onde-assistir/{a}-x-{b}-onde-assistir-horario-e-escalacoes.
// URL canônica ÚNICA do post: as outras páginas (hub, /ao-vivo, campeonato, jogo) só
// mostram um card com link pra cá. Ficha do jogo = snapshot do match/{id} (post.matchId).
export const revalidate = 300;

// generateStaticParams vazio = ISR sob demanda (sem ele a rota vira ƒ e remonta a cada acesso).
export async function generateStaticParams() {
  return [];
}

const PREFIX = "/onde-assistir";

async function metadataDefaults({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article || article.url !== `${PREFIX}/${slug}`) return {};
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://papodebola.com.br";
  const desc = articleMetaDescription(article);
  return {
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
      publishedTime: article.pubDate,
      ...(article.image && {
        images: [{ url: article.image.startsWith("http") ? article.image : `${siteUrl}${article.image}`, width: 1200, height: 675 }],
      }),
    },
    twitter: { card: "summary_large_image", title: article.rewrittenTitle, description: desc },
  };
}

export async function generateMetadata(props: Parameters<typeof metadataDefaults>[0]): Promise<Metadata> {
  return buildMetadata("/onde-assistir/:slug", await metadataDefaults(props));
}

export default async function OndeAssistirPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = await getArticleBySlug(slug);
  if (!article) notFound();
  if (article.url !== `${PREFIX}/${slug}`) permanentRedirect(article.url);

  const isWatch = article.category === WATCH_CATEGORY && !!article.matchId;
  const [related, standings, match] = await Promise.all([
    getRelatedArticles(article.category, article.slug, 4).catch(() => []),
    getBrasileiraoStandings().catch(() => []),
    isWatch ? getWatchMatch(article.matchId!).catch(() => null) : Promise.resolve(null),
  ]);

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://www.papodebola.com.br";
  return (
    <ArticleView
      article={article}
      related={related}
      standings={standings}
      hub={{ label: "Onde Assistir", href: PREFIX }}
      matchCard={
        match ? (
          <MatchInfoCard
            m={match}
            channels={article.watch?.channels || "A confirmar"}
            confirmed={article.watch?.confirmed ?? false}
          />
        ) : undefined
      }
      extraSchema={
        match ? (
          <SportsEventSchema
            home={match.home}
            away={match.away}
            homeId={match.homeId}
            awayId={match.awayId}
            startTimestamp={match.timestamp}
            statusType={match.statusType}
            venue={match.venue ? { stadium: match.venue.stadium, city: match.venue.city, country: "" } : null}
            url={match.href ? `${siteUrl}${match.href}` : `${siteUrl}${article.url}`}
            competition={match.tournament}
          />
        ) : undefined
      }
    />
  );
}
