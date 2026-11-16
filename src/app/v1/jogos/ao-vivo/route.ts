import { withPublicApi } from "@/lib/public-api/with-public-api";
import { todayStore, isStale } from "@/lib/public-api/v1/sources";
import { toDia } from "@/lib/public-api/v1/map-match";
import { TTL } from "@/lib/public-api/v1/ttl";
import { isoBrt } from "@/lib/public-api/envelope";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withPublicApi("jogos-ao-vivo", async () => {
  const { leagues, updatedAt } = await todayStore();
  return {
    data: toDia(leagues, true),
    meta: { atualizadoEm: isoBrt(updatedAt || Date.now()), desatualizado: isStale(updatedAt, 300), proximaAtualizacaoSugerida: 10 },
    ttl: TTL.aoVivo,
  };
});
