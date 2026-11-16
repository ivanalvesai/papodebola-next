import { withPublicApi } from "@/lib/public-api/with-public-api";
import { parseId } from "@/lib/public-api/v1/sources";
import { toJogoCompleto } from "@/lib/public-api/v1/map-match";
import { V1ErrorLike } from "@/lib/public-api/v1/v1-error";
import { matchTtl, suggestedRefresh } from "@/lib/public-api/v1/ttl";
import { getMatchDetail } from "@/lib/data/match-detail";
import { isoBrt } from "@/lib/public-api/envelope";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withPublicApi<{ id: string }>("jogo", async (_req, { id }) => {
  const d = await getMatchDetail(parseId(id));
  if (!d) throw new V1ErrorLike(404, "nao_encontrado", "Jogo não encontrado.");
  const j = toJogoCompleto(d);
  return {
    data: j,
    meta: { atualizadoEm: isoBrt(Date.now()), desatualizado: !!d.stale, proximaAtualizacaoSugerida: suggestedRefresh(j.status) },
    ttl: matchTtl(j.status),
  };
});
