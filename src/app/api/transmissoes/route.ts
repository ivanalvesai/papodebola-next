import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth/jwt";
import { getBroadcastMap, listUpcomingMatches, setMatchBroadcast } from "@/lib/data/broadcast-store";

// Painel "Transmissões": canal exato de cada jogo (ver src/lib/data/broadcast-store.ts).
// GET  -> jogos dos próximos dias + canal salvo de cada um
// PUT  -> { matchId, channels, home, away, league, timestamp }  (channels vazio = apaga)
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  const days = Math.min(Number(request.nextUrl.searchParams.get("days")) || 10, 30);
  const [matches, map] = await Promise.all([listUpcomingMatches(days), getBroadcastMap()]);
  return NextResponse.json({
    matches: matches.map((m) => ({ ...m, channels: map[String(m.id)]?.channels || "", updatedBy: map[String(m.id)]?.updatedBy || "" })),
  });
}

export async function PUT(request: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: "Nao autorizado" }, { status: 401 });
  try {
    const b = await request.json();
    const matchId = Number(b.matchId);
    if (!matchId) return NextResponse.json({ error: "matchId obrigatório" }, { status: 400 });
    const channels = String(b.channels || "").slice(0, 200);
    await setMatchBroadcast(matchId, {
      channels,
      home: String(b.home || ""),
      away: String(b.away || ""),
      league: String(b.league || ""),
      timestamp: Number(b.timestamp) || 0,
      updatedBy: session.username,
    });
    // A página do jogo revalida a cada 30 s (ISR), então não precisa invalidar nada aqui.
    // As abas dos times atualizam no ISR delas.
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}
