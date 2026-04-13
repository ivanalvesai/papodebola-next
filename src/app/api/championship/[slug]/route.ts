import { NextRequest, NextResponse } from "next/server";
import { getChampionshipData } from "@/lib/data/championship";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const data = await getChampionshipData(slug);

  if (!data) {
    return NextResponse.json({ error: "Campeonato não encontrado" }, { status: 404 });
  }

  return NextResponse.json(data);
}
