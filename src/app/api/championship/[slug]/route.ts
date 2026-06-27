import { NextRequest, NextResponse } from "next/server";
import { getChampionshipData } from "@/lib/data/championship";
import { getPayloadTeamSlugMap } from "@/lib/data/payload-teams";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const data = await getChampionshipData(slug);

  if (!data) {
    return NextResponse.json({ error: "Campeonato não encontrado" }, { status: 404 });
  }

  // Mapa id→slug dos times do Payload (Série B) → a tabela linka esses times pro hub
  // mesmo não estando no config. Cacheado; vazio pros outros campeonatos.
  const payloadTeamSlugs = await getPayloadTeamSlugMap().catch(() => ({}));

  return NextResponse.json({ ...data, payloadTeamSlugs });
}
