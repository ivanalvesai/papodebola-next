import { NextResponse } from "next/server";
import { getWorldCupLiveScores } from "@/lib/data/match-detail";

// Placares ao vivo da rodada atual da Copa, consumido pelo polling da tabela
// (CopaLiveProvider). O fetch interno cacheia ~30s → N clientes = 1 chamada à API.
export async function GET() {
  // Nunca 500: se a API esportiva falhar (429/timeout sob pico no apito), devolve []
  // em vez de erro — senão o polling do cliente vê !r.ok e o card nunca vira AO VIVO.
  try {
    const scores = await getWorldCupLiveScores();
    return NextResponse.json(scores, { headers: { "Cache-Control": "no-store" } });
  } catch {
    return NextResponse.json([], { headers: { "Cache-Control": "no-store" } });
  }
}
