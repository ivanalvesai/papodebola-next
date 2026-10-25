import type { Metadata } from "next";
import { getPayloadPage } from "@/lib/data/payload-pages";
import { getMunicipalGameKeys } from "@/lib/data/municipal-game";
import { PageBlock } from "@/components/payload/page-blocks";
import { SponsorStrip } from "@/components/sponsors/sponsor-strip";
import MunicipalData from "./municipal-client";
import { getMunicipalChampionships } from "@/lib/data/sisgel";

// A parte de DADOS (classificação, artilheiros, defesa, rodadas) é o client component
// MunicipalData (lê /api/municipal). Abaixo dela renderizamos a área EDITÁVEL no /cms
// (textos, vídeos do YouTube, notícias) — uma "Página" do Payload com este slug.
export const dynamic = "force-dynamic";

const CMS_SLUG = "santana-de-parnaiba-municipal";

// SEO editável no /cms sobrepõe o default do layout.tsx (que mantém o canonical).
export async function generateMetadata(): Promise<Metadata> {
  const page = await getPayloadPage(CMS_SLUG);
  const t = page?.seo?.metaTitle;
  const d = page?.seo?.metaDescription;
  if (!t && !d) return {};
  return {
    ...(t ? { title: t } : {}),
    ...(d ? { description: d } : {}),
    alternates: { canonical: "/sp/santana-de-parnaiba/municipal" },
  };
}

export default async function MunicipalPage() {
  const page = await getPayloadPage(CMS_SLUG);
  const blocks = (page?.layout as any[]) || [];
  const showSponsors = (page as any)?.showSponsors === true;
  // Chaves (data/par) de jogos com página no CMS (vídeo) → viram link na lista mesmo sem placar.
  const videoGameSlugs = await getMunicipalGameKeys();
  // SSR só do campeonato exibido primeiro (o JSON inteiro tem ~430 KB; o resto o cliente
  // busca no /api/municipal). Mesma fonte do endpoint: arquivo local, sem API externa.
  const all = await getMunicipalChampionships().catch(() => []);
  const initialData = all.length ? all.slice(0, 1) : undefined;

  return (
    <>
      <MunicipalData
        videoGameSlugs={videoGameSlugs}
        initialData={initialData as unknown as Parameters<typeof MunicipalData>[0]["initialData"]}
      />

      {showSponsors && (
        <div className="mx-auto max-w-[1240px] px-4 pt-2">
          <SponsorStrip de="municipal" />
        </div>
      )}

      {blocks.length > 0 && (
        <div className="mx-auto max-w-[1240px] px-4 pb-12">
          <div className="space-y-6 leading-relaxed text-text-secondary [&_a]:text-green [&_a:hover]:underline">
            {blocks.map((b, i) => (
              <PageBlock key={i} block={b} />
            ))}
          </div>
        </div>
      )}
    </>
  );
}
