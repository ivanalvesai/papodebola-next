import { withPublicApi } from "@/lib/public-api/with-public-api";
import { parseDay, dayFromSnapshots, isTodayBrt, todayStore, isStale } from "@/lib/public-api/v1/sources";
import { toDia } from "@/lib/public-api/v1/map-match";
import { TTL } from "@/lib/public-api/v1/ttl";
import { isoBrt } from "@/lib/public-api/envelope";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// Hoje = store ao vivo (o mesmo de /v1/jogos/hoje). Outros dias = tabelas/rodadas salvas no disco
// (getFootballAgendaForDay só enxerga a rodada atual e a seguinte, então não serve para qualquer data).
export const GET = withPublicApi("jogos-data", async (req) => {
  const day = parseDay(new URL(req.url).searchParams.get("data"));
  if (isTodayBrt(day)) {
    const { leagues, updatedAt } = await todayStore();
    return {
      data: toDia(leagues),
      meta: { atualizadoEm: isoBrt(updatedAt || Date.now()), desatualizado: isStale(updatedAt, 300), proximaAtualizacaoSugerida: 30 },
      ttl: TTL.hoje,
    };
  }
  const past = day.getTime() < Date.now();
  return {
    data: await dayFromSnapshots(day),
    meta: { atualizadoEm: isoBrt(Date.now()), desatualizado: false, proximaAtualizacaoSugerida: past ? 3600 : 600 },
    ttl: TTL.diaFuturo,
  };
});
