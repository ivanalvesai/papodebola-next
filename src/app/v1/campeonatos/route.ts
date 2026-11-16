import { TOURNAMENTS } from "@/lib/config";
import { withPublicApi } from "@/lib/public-api/with-public-api";
import { toCampeonatoResumo } from "@/lib/public-api/v1/map-championship";
import { isoBrt } from "@/lib/public-api/envelope";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withPublicApi("campeonatos", async () => ({
  data: Object.values(TOURNAMENTS).filter((t) => t.seasonId).map(toCampeonatoResumo),
  meta: { atualizadoEm: isoBrt(Date.now()), desatualizado: false, proximaAtualizacaoSugerida: 86400 },
  ttl: 3600,
}));
