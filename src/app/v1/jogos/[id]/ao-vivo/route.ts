import { withPublicApi } from "@/lib/public-api/with-public-api";
import { parseId } from "@/lib/public-api/v1/sources";
import { toJogo } from "@/lib/public-api/v1/map-match";
import { V1ErrorLike } from "@/lib/public-api/v1/v1-error";
import { matchTtl, suggestedRefresh } from "@/lib/public-api/v1/ttl";
import { getMatchLive, getMatchDetail } from "@/lib/data/match-detail";
import { isoBrt } from "@/lib/public-api/envelope";
import { preferSnapshot } from "@/lib/public-api/v1/live-source";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Enxuto para polling. Fornecedor fora → cai para o snapshot do jogo (getMatchDetail) e marca desatualizado.
export const GET = withPublicApi<{ id: string }>("jogo-ao-vivo", async (_req, { id }) => {
  const mid = parseId(id);
  const live = await getMatchLive(mid);
  // Encerrado (ou feed ao vivo falhou): snapshot protegido do getMatchDetail, com o lance a lance completo.
  const src = preferSnapshot(live) ? (await getMatchDetail(mid)) ?? live : live;
  if (!src) throw new V1ErrorLike(404, "nao_encontrado", "Jogo não encontrado.");
  const j = toJogo(src);
  return {
    data: j,
    meta: { atualizadoEm: isoBrt(Date.now()), desatualizado: !live || ("stale" in src && !!src.stale), proximaAtualizacaoSugerida: suggestedRefresh(j.status) },
    ttl: matchTtl(j.status),
  };
});
