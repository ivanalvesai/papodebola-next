import { notFound } from "next/navigation";
import { ArticleView } from "@/components/article/article-view";
import { getArticleBySlug } from "@/lib/data/articles";
import { assertPreviewAccess } from "@/lib/cms-preview-auth";
import { LivePreviewListener } from "@/components/payload/live-preview-listener";
import { WATCH_CATEGORY } from "@/lib/config";
import { getWatchMatch } from "@/lib/data/watch";
import { MatchInfoCard } from "@/components/onde-assistir/match-info-card";

// Preview do Payload: renderiza o RASCUNHO de um post no layout real do site.
// Aberto pelo botão "Preview" do editor (/cms). Protegido por secret OU sessão do
// /cms (cookie payload-token). Sempre dinâmico e noindex.
export const dynamic = "force-dynamic";
export const metadata = { robots: "noindex, nofollow", title: "Preview" };

export default async function CmsPreviewPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ previewSecret?: string }>;
}) {
  const { slug } = await params;
  const { previewSecret } = await searchParams;

  if (!(await assertPreviewAccess(previewSecret))) notFound();

  const article = await getArticleBySlug(slug, true, true); // noCache + draft
  if (!article) notFound();

  // Post "onde assistir": monta a Ficha do jogo como na página pública.
  const isWatch = article.category === WATCH_CATEGORY && !!article.matchId;
  const match = isWatch ? await getWatchMatch(article.matchId!).catch(() => null) : null;

  return (
    <>
      <LivePreviewListener />
      <div className="bg-green px-4 py-2 text-center text-sm font-semibold text-white">
        Pré-visualização do CMS &middot; rascunho &middot; esta página é privada e ainda NÃO está
        publicada
      </div>
      <ArticleView
        article={article}
        related={[]}
        standings={[]}
        hub={isWatch ? { label: "Onde Assistir", href: "/onde-assistir" } : undefined}
        matchCard={
          match ? (
            <MatchInfoCard m={match} channels={article.watch?.channels || "A confirmar"} confirmed={article.watch?.confirmed ?? false} />
          ) : undefined
        }
      />
    </>
  );
}
