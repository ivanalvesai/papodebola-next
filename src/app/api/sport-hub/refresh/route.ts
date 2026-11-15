import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { refreshSportHubs } from "@/lib/data/sport-hub";
import { SPORT_HUBS } from "@/lib/sport-hub-config";

// Atualiza os campeonatos dos outros esportes (eSports, tênis, UFC...) no volume
// (data/snapshots/sport-hub/). Só o DEV chama (cron # sport-hub-refresh, a cada 3 min);
// as páginas apenas leem do disco. Protegido por REVALIDATION_SECRET.
//   GET /api/sport-hub/refresh?secret=XXX[&force=1][&only=esports]
export const dynamic = "force-dynamic";
export const maxDuration = 300;

const PAGE: Record<string, string> = { esports: "/esports", tenis: "/tenis", combate: "/combate", volei: "/volei", futsal: "/futsal", "basquete-nba": "/nba" };

async function handle(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("secret") !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const only = url.searchParams.get("only") || undefined;
  const result = await refreshSportHubs({ force: url.searchParams.get("force") === "1", only });
  try {
    for (const key of Object.keys(SPORT_HUBS)) if (!only || only === key) revalidatePath(PAGE[key] || `/${key}`);
  } catch {
    /* fora de contexto de request */
  }
  return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
}

export const GET = handle;
export const POST = handle;
