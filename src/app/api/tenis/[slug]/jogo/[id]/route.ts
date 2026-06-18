import { NextRequest, NextResponse } from "next/server";
import { getTennisMatchById } from "@/lib/data/tennis";

// Polling do detalhe de um jogo de tênis (placar/sets/estatísticas/enquete).
// Público; o cache real está no fetchAllSports (TTL por status).
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string; id: string }> }
) {
  const { id } = await params;
  const eventId = parseInt(id, 10);
  if (!Number.isFinite(eventId)) {
    return NextResponse.json({ error: "bad id" }, { status: 400 });
  }
  const detail = await getTennisMatchById(eventId);
  if (!detail) {
    return NextResponse.json({ error: "unavailable" }, { status: 503 });
  }
  return NextResponse.json(detail, { headers: { "Cache-Control": "no-store" } });
}
