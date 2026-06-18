import { NextRequest, NextResponse } from "next/server";
import { getTennisDraw, TENNIS_TOURNAMENTS, type TennisTournamentSlug } from "@/lib/data/tennis";

// Polling do chaveamento ao vivo (placar/set por jogo). Público, sem cache no
// edge — o cache real está no fetchAllSports (TTL por jogo).
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  if (!(slug in TENNIS_TOURNAMENTS)) {
    return NextResponse.json({ error: "not found" }, { status: 404 });
  }
  const draw = await getTennisDraw(slug as TennisTournamentSlug);
  if (!draw) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
  return NextResponse.json(draw, {
    headers: { "Cache-Control": "no-store" },
  });
}
