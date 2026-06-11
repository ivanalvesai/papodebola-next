import { NextResponse } from "next/server";
import { getWorldCupLiveScores } from "@/lib/data/match-detail";

// Placares ao vivo da rodada atual da Copa, consumido pelo polling da tabela
// (CopaLiveProvider). O fetch interno cacheia ~30s → N clientes = 1 chamada à API.
export async function GET() {
  const scores = await getWorldCupLiveScores();
  return NextResponse.json(scores, { headers: { "Cache-Control": "no-store" } });
}
