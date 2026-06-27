import { NextRequest, NextResponse } from "next/server";
import { getChampionshipData } from "@/lib/data/championship";
import { getWorldCupStandings } from "@/lib/data/standings";
import {
  getWorldCupFixtures,
  getWorldCupKnockoutFixtures,
  getMatchDetail,
} from "@/lib/data/match-detail";

// ⚠️ ROTA TEMPORÁRIA — backfill dos snapshots "do que temos agora": tabelas das ligas
// (incl. Série B), tabela/chaveamento/jogos da Copa, e o LANCE A LANCE de cada jogo da
// Copa já disputado (snapshot via getMatchDetail). Protegida por REVALIDATION_SECRET.
// O volume data/ é compartilhado dev/prod → roda 1x. REMOVER depois.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 600;

const LEAGUES = [
  "brasileirao-serie-a",
  "brasileirao-serie-b",
  "copa-do-brasil",
  "libertadores",
  "sudamericana",
];

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("secret") !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const out: Record<string, unknown> = {};

  // 1) Tabelas + jogos das ligas (snapshot acontece dentro de getChampionshipData)
  const leagues: Record<string, boolean> = {};
  for (const slug of LEAGUES) {
    const d = await getChampionshipData(slug).catch(() => null);
    leagues[slug] = !!d;
  }
  out.leagues = leagues;

  // 2) Copa: tabela dos grupos + fixtures + chaveamento
  const [standings, fixtures, knockout] = await Promise.all([
    getWorldCupStandings().catch(() => []),
    getWorldCupFixtures().catch(() => []),
    getWorldCupKnockoutFixtures().catch(() => []),
  ]);
  out.worldcup = {
    standings: standings.length,
    fixtures: fixtures.length,
    knockout: knockout.length,
  };

  // 3) Lance a lance de cada jogo da Copa (snapshot via getMatchDetail), com throttle
  //    pra não estourar o rate-limit (6 req/s). Jogos já cacheados voltam na hora.
  let ok = 0;
  let fail = 0;
  for (const f of fixtures) {
    try {
      const d = await getMatchDetail(f.id, f.timestamp);
      if (d?.event) ok++;
      else fail++;
    } catch {
      fail++;
    }
    await new Promise((r) => setTimeout(r, 200));
  }
  out.matchDetails = { ok, fail, total: fixtures.length };

  return NextResponse.json({ ok: true, ...out });
}
