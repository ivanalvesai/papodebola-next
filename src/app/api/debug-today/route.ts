import { NextResponse } from "next/server";
import { getTodayMatches } from "@/lib/data/matches";
import { fetchAllSports } from "@/lib/api/allsports";

export const dynamic = "force-dynamic";

// DEBUG TEMPORÁRIO — diagnóstico do /ao-vivo vazio. Remover depois.
export async function GET() {
  const out: Record<string, unknown> = {};
  try {
    const live = await fetchAllSports<{ events?: unknown[] }>("matches/live", 0);
    out.liveRaw = (live?.events || []).length;
  } catch (e) {
    out.liveErr = String((e as Error)?.message);
  }
  try {
    const t = await getTodayMatches();
    out.todayCount = t.length;
    out.todaySample = t.slice(0, 4).map((m) => ({ h: m.homeTeam, a: m.awayTeam, st: m.status, ts: m.timestamp, lg: m.league }));
  } catch (e) {
    out.todayErr = String((e as Error)?.message);
    out.todayStack = String((e as Error)?.stack).slice(0, 500);
  }
  return NextResponse.json(out);
}
