import { notFound } from "next/navigation";
import { assertPreviewAccess } from "@/lib/cms-preview-auth";
import { getTeamDraft } from "@/lib/data/payload-teams";
import { TeamCmsView } from "@/components/payload/team-cms-page";
import { LivePreviewListener, PreviewBanner } from "@/components/payload/live-preview-listener";
import type { TeamNarrativePage } from "@/lib/team-narrative";

export const dynamic = "force-dynamic";
export const metadata = { robots: "noindex, nofollow", title: "Preview" };

const ABA: Record<string, TeamNarrativePage> = {
  hub: "hub",
  "jogo-hoje": "jogoHoje",
  "onde-assistir": "ondeAssistir",
  escalacao: "escalacao",
  "proximos-jogos": "proximos",
  estatisticas: "estatisticas",
};

export default async function PreviewTime({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; aba: string }>;
  searchParams: Promise<{ previewSecret?: string }>;
}) {
  const { slug, aba } = await params;
  const { previewSecret } = await searchParams;
  if (!(await assertPreviewAccess(previewSecret))) notFound();
  const page = ABA[aba];
  if (!page) notFound();
  const doc = await getTeamDraft(slug);
  if (!doc) notFound();
  return (
    <>
      <LivePreviewListener />
      <PreviewBanner />
      <TeamCmsView doc={doc} page={page} />
    </>
  );
}
