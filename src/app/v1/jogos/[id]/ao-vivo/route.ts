import { withPublicApi } from "@/lib/public-api/with-public-api";
import { parseId } from "@/lib/public-api/v1/sources";
import { toJogo } from "@/lib/public-api/v1/map-match";
import { V1ErrorLike } from "@/lib/public-api/v1/v1-error";
import { matchTtl, suggestedRefresh } from "@/lib/public-api/v1/ttl";
import { getMatchLive, getMatchDetail } from "@/lib/data/match-detail";
import { isoBrt } from "@/lib/public-api/envelope";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Enxuto para polling. Fornecedor fora → cai para o snapshot do jogo (getMatchDetail) e marca desatualizado.
export const GET = withPublicApi<{ id: string }>("jogo-ao-vivo", async (_req, { id }) => {
  const mid = parseId(id);
  const live = await getMatchLive(mid);
  const src = live ?? (await getMatchDetail(mid));
  if (!src) throw new V1ErrorLike(404, "nao_encontrado", "Jogo não encontrado.");
  const j = toJogo(src);
  return {
    data: j,
    meta: { atualizadoEm: isoBrt(Date.now()), desatualizado: !live, proximaAtualizacaoSugerida: suggestedRefresh(j.status) },
    ttl: matchTtl(j.status),
  };
});
