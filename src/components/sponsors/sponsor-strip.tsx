import { getActiveSponsors, sponsorStripHtml } from "@/lib/data/sponsor";

// Faixa de patrocinadores (rótulo "Patrocínio" + grid de cards). Server component:
// lê os patrocinadores ATIVOS e emite o HTML da fonte única (sponsor.ts). Não renderiza
// nada se não houver patrocinador ativo. `de` vira UTM no clique (/parceiro?de=...).
export async function SponsorStrip({ de = "site", className = "" }: { de?: string; className?: string }) {
  const sponsors = await getActiveSponsors();
  const html = sponsorStripHtml(sponsors, de);
  if (!html) return null;
  return <div className={className} dangerouslySetInnerHTML={{ __html: html }} />;
}
