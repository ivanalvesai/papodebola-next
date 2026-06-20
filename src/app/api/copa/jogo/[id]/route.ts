import { NextRequest, NextResponse } from "next/server";
import { getMatchLive } from "@/lib/data/match-detail";

// Endpoint enxuto consumido pelo polling da página do jogo ao vivo.
// O fetch interno (fetchAllSports) já cacheia ~25s, então N clientes
// compartilham 1 chamada à AllSportsApi — não pesa no rate limit/bandwidth.
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const matchId = Number(id);
  if (!Number.isFinite(matchId) || matchId <= 0) {
    return NextResponse.json({ error: "id inválido" }, { status: 400 });
  }

  // ?ts = timestamp do apito (enviado pelo cliente) -> TTL do match/{id} ciente do horário
  const ts = Number(req.nextUrl.searchParams.get("ts")) || undefined;
  const live = await getMatchLive(matchId, ts);
  if (!live) {
    return NextResponse.json({ error: "jogo não encontrado" }, { status: 404 });
  }

  return NextResponse.json(live, {
    headers: { "Cache-Control": "no-store" },
  });
}
