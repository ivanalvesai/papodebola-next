import { withPublicApi } from "@/lib/public-api/with-public-api";
import { championship, isStale } from "@/lib/public-api/v1/sources";
import { toRodada, hasLiveMatch } from "@/lib/public-api/v1/map-championship";
import { V1ErrorLike } from "@/lib/public-api/v1/v1-error";
import { TTL } from "@/lib/public-api/v1/ttl";
import { isoBrt } from "@/lib/public-api/envelope";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withPublicApi<{ slug: string; chave: string }>("rodada", async (_req, { slug, chave }) => {
  const { d } = await championship(slug);
  const jogos = toRodada(d, decodeURIComponent(chave));
  if (!jogos) throw new V1ErrorLike(404, "nao_encontrado", "Rodada não encontrada.");
  const live = jogos.some((j) => j.status === "ao_vivo" || j.status === "intervalo") || hasLiveMatch(d);
  return {
    data: jogos,
    meta: { atualizadoEm: isoBrt(d.updatedAt), desatualizado: isStale(d.updatedAt, 7200), proximaAtualizacaoSugerida: live ? 60 : 600 },
    ttl: live ? TTL.campeonatoComJogo : TTL.campeonatoParado,
  };
});
