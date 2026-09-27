import { NextResponse } from "next/server";
import { getMunicipalChampionships } from "@/lib/data/sisgel";

// Campeonatos municipais: dado vivo do scraper + arquivo congelado das temporadas passadas.
export async function GET() {
  return NextResponse.json(await getMunicipalChampionships());
}
