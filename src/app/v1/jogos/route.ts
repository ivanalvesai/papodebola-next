import { withPublicApi } from "@/lib/public-api/with-public-api";
import { parseDay } from "@/lib/public-api/v1/sources";
import { toDia } from "@/lib/public-api/v1/map-match";
import { getFootballAgendaForDay } from "@/lib/data/agenda";
import { TTL } from "@/lib/public-api/v1/ttl";
import { isoBrt } from "@/lib/public-api/envelope";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withPublicApi("jogos-data", async (req) => {
  const day = parseDay(new URL(req.url).searchParams.get("data"));
  const past = day.getTime() < Date.now() - 86400_000;
  const groups = await getFootballAgendaForDay(day);
  return {
    data: toDia(groups),
    meta: { atualizadoEm: isoBrt(Date.now()), desatualizado: false, proximaAtualizacaoSugerida: past ? 86400 : 600 },
    ttl: past ? TTL.diaPassado : TTL.diaFuturo,
  };
});
