import { withPublicApi } from "@/lib/public-api/with-public-api";
import { parseId } from "@/lib/public-api/v1/sources";
import { fromTeamMatch, teamRef } from "@/lib/public-api/v1/map-match";
import { V1ErrorLike } from "@/lib/public-api/v1/v1-error";
import { TTL } from "@/lib/public-api/v1/ttl";
import { getTeamNextEvents, getTeamPreviousEvents } from "@/lib/data/team";
import { isoBrt } from "@/lib/public-api/envelope";
export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const GET = withPublicApi<{ id: string }>("time", async (_req, { id }) => {
  const tid = parseId(id);
  const [next, prev] = await Promise.all([getTeamNextEvents(tid), getTeamPreviousEvents(tid)]);
  const any = next[0] ?? prev[0];
  if (!any) throw new V1ErrorLike(404, "nao_encontrado", "Time não encontrado ou sem jogos.");
  const nome = any.homeId === tid ? any.home : any.away;
  return {
    data: { ...teamRef(tid, nome), proximos: next.map(fromTeamMatch), ultimos: prev.map(fromTeamMatch) },
    meta: { atualizadoEm: isoBrt(Date.now()), desatualizado: false, proximaAtualizacaoSugerida: 600 },
    ttl: TTL.time,
  };
});
