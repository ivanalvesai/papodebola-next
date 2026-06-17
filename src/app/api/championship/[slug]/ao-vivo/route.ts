import { NextRequest, NextResponse } from "next/server";
import { getChampionshipLiveScores } from "@/lib/data/championship";

// Placares ao vivo da rodada atual, consumido pelo polling da tabela do campeonato.
// O fetch interno cacheia ~20s → N clientes = 1 chamada à API.
export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const scores = await getChampionshipLiveScores(slug);
  return NextResponse.json(scores, { headers: { "Cache-Control": "no-store" } });
}
