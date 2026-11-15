import { NextResponse } from "next/server";
import { getSportHubLive } from "@/lib/data/sport-hub";

// Jogos AO VIVO de um esporte (carrossel das páginas de eSports, tênis, UFC...).
// Lê só do disco (o cron do dev grava); nunca bate na API.
//   GET /api/sport-hub/live?sport=esports
export const dynamic = "force-dynamic";

export async function GET(req: Request) {
  const sport = new URL(req.url).searchParams.get("sport") || "";
  const live = await getSportHubLive(sport).catch(() => []);
  return NextResponse.json(
    { live },
    { headers: { "Cache-Control": "public, max-age=20, s-maxage=20" } }
  );
}
