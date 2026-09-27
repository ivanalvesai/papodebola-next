import { NextRequest, NextResponse } from "next/server";
import { archiveFinishedMatches } from "@/lib/data/tournament-archive";
import { pruneApiCache } from "@/lib/api/api-cache";
import { shouldDiskCache } from "@/lib/api/cache-policy";

// Rotina de arquivamento permanente (cron da madrugada no DEV):
//   GET /api/archive/run?secret=<REVALIDATION_SECRET>&max=60
// Só o container do dev consulta a API esportiva: na prod (SPORTS_PROXY_URL setado)
// responde 204 sem fazer nada. Execução longa de propósito (4s entre jogos).
export const dynamic = "force-dynamic";
export const maxDuration = 900;

let running = false;

export async function GET(request: NextRequest) {
  const params = request.nextUrl.searchParams;
  if (!process.env.REVALIDATION_SECRET || params.get("secret") !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }
  if (process.env.SPORTS_PROXY_URL) {
    return new NextResponse(null, { status: 204 });
  }
  if (running) {
    return NextResponse.json({ error: "Arquivamento já em execução" }, { status: 409 });
  }

  const raw = parseInt(params.get("max") || "", 10);
  const max = Number.isFinite(raw) && raw >= 0 ? Math.min(raw, 500) : 60;

  running = true;
  try {
    // Limpeza do data/api-cache antes de arquivar: arquivos sem uso há 45+ dias e os de
    // endpoints que saíram do cache (sub-endpoints de jogo, feeds /live).
    const { pruned } = await pruneApiCache({ isExcluded: (e) => !shouldDiskCache(e) });
    const result = await archiveFinishedMatches({ maxMatches: max });
    return NextResponse.json({ ...result, pruned });
  } catch (err) {
    return NextResponse.json(
      { error: "Falha no arquivamento", detail: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  } finally {
    running = false;
  }
}
