import { notFound } from "next/navigation";
import { headers } from "next/headers";
import { getPayload } from "payload";
import config from "@payload-config";
import { ArticleView } from "@/components/article/article-view";
import { getArticleBySlug } from "@/lib/data/articles";

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

  // Acesso: secret válido OU usuário logado no /cms (cookie payload-token).
  let allowed = !!process.env.CRON_SECRET && previewSecret === process.env.CRON_SECRET;
  if (!allowed) {
    try {
      const payload = await getPayload({ config });
      const { user } = await payload.auth({ headers: await headers() });
      allowed = !!user;
    } catch {
      /* sem sessão */
    }
  }
  if (!allowed) notFound();

  const article = await getArticleBySlug(slug, true, true); // noCache + draft
  if (!article) notFound();

  return (
    <>
      <div className="bg-green px-4 py-2 text-center text-sm font-semibold text-white">
        Pré-visualização do CMS &middot; rascunho &middot; esta página é privada e ainda NÃO está
        publicada
      </div>
      <ArticleView article={article} related={[]} standings={[]} />
    </>
  );
}
