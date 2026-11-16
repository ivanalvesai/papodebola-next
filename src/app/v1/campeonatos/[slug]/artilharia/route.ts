import { withPublicApi } from "@/lib/public-api/with-public-api";
import { championship } from "@/lib/public-api/v1/sources";
import { toArtilharia } from "@/lib/public-api/v1/map-championship";
import { getScorersFor } from "@/lib/data/scorers";
import { isoBrt } from "@/lib/public-api/envelope";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withPublicApi<{ slug: string }>("artilharia", async (_req, { slug }) => {
  const { t, d } = await championship(slug);
  const list = d.topScorers?.length ? d.topScorers : await getScorersFor(t);
  return {
    data: toArtilharia(list || []),
    meta: { atualizadoEm: isoBrt(d.updatedAt), desatualizado: false, proximaAtualizacaoSugerida: 3600 },
    ttl: 1800,
  };
});
