import { notFound } from "next/navigation";
import { getPosts } from "@/lib/data/kanban-store";
import { ArticleView } from "@/components/article/article-view";
import type { Article } from "@/types/article";

// Pré-visualização full-page de um card do Studio (kanban), renderizado no MESMO
// layout do artigo publicado → mostra exatamente como vai ficar no site. Fica sob
// /studio-pdb, então é protegida pelo JWT do painel e é noindex (layout do Studio).
export const dynamic = "force-dynamic";

export default async function StudioPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const posts = await getPosts();
  const kp = posts.find((p) => p.id === id);
  if (!kp) notFound();

  // Mapeia o card do kanban pro formato Article (mesmo componente do artigo real).
  const now = kp.createdAt || new Date().toISOString();
  const article: Article = {
    originalTitle: kp.title,
    rewrittenTitle: kp.title,
    rewrittenText: kp.text || "",
    excerpt: kp.excerpt,
    contentHtml: kp.htmlContent,
    slug: kp.slug || kp.id,
    source: "Manual",
    image: kp.image || "",
    category: kp.category || "Notícias",
    tags: kp.tags || [],
    team: null,
    author: "Redação",
    pubDate: now,
    createdAt: now,
    url: "#",
  };

  return (
    <>
      <div className="bg-green px-4 py-2 text-center text-sm font-semibold text-white">
        Pré-visualização do Studio &middot; coluna: {kp.column} &middot; esta página é privada e
        ainda NÃO está publicada
      </div>
      <ArticleView article={article} related={[]} standings={[]} />
    </>
  );
}
