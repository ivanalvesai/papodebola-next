import { withPublicApi } from "@/lib/public-api/with-public-api";
import { todayStore, isStale } from "@/lib/public-api/v1/sources";
import { toDia } from "@/lib/public-api/v1/map-match";
import { TTL } from "@/lib/public-api/v1/ttl";
import { isoBrt } from "@/lib/public-api/envelope";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withPublicApi("jogos-hoje", async () => {
  const { leagues, updatedAt } = await todayStore();
  return {
    data: toDia(leagues),
    meta: { atualizadoEm: isoBrt(updatedAt || Date.now()), desatualizado: isStale(updatedAt, 300), proximaAtualizacaoSugerida: 30 },
    ttl: TTL.hoje,
  };
});
