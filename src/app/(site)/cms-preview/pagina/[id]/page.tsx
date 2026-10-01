import { notFound } from "next/navigation";
import { assertPreviewAccess } from "@/lib/cms-preview-auth";
import { getPayloadPageById } from "@/lib/data/payload-pages";
import { PageBlocks } from "@/components/payload/page-blocks";
import { LivePreviewListener, PreviewBanner } from "@/components/payload/live-preview-listener";

export const dynamic = "force-dynamic";
export const metadata = { robots: "noindex, nofollow", title: "Preview" };

export default async function PreviewPagina({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ previewSecret?: string }>;
}) {
  const { id } = await params;
  const { previewSecret } = await searchParams;
  if (!(await assertPreviewAccess(previewSecret))) notFound();
  if (id === "novo") {
    return (
      <>
        <PreviewBanner />
        <p className="mx-auto max-w-[720px] px-4 py-16 text-center text-text-muted">
          Salve a página uma vez (rascunho) pra ver o preview.
        </p>
      </>
    );
  }
  const page = await getPayloadPageById(id, true);
  if (!page) notFound();
  return (
    <>
      <LivePreviewListener />
      <PreviewBanner />
      <PageBlocks page={page} />
    </>
  );
}
