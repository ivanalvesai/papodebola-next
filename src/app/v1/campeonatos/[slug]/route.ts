import { withPublicApi } from "@/lib/public-api/with-public-api";
import { championship, isStale } from "@/lib/public-api/v1/sources";
import { toCampeonato, hasLiveMatch } from "@/lib/public-api/v1/map-championship";
import { TTL } from "@/lib/public-api/v1/ttl";
import { isoBrt } from "@/lib/public-api/envelope";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withPublicApi<{ slug: string }>("campeonato", async (_req, { slug }) => {
  const { t, d } = await championship(slug);
  const live = hasLiveMatch(d);
  const ttl = live ? TTL.campeonatoComJogo : TTL.campeonatoParado;
  return {
    data: toCampeonato(t, d),
    meta: { atualizadoEm: isoBrt(d.updatedAt), desatualizado: isStale(d.updatedAt, 7200), proximaAtualizacaoSugerida: live ? 60 : 600 },
    ttl,
  };
});
