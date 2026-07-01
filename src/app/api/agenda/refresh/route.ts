import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { refreshTodayFootballStore } from "@/lib/data/agenda";

// Atualiza o STORE de "jogos de hoje" (futebol) no volume compartilhado. Só o DEV chama
// isto (cron 1/min ou similar) → só o dev consulta a API; prod/páginas apenas LEEM o store.
// Econômico: congela jogos encerrados e usa feed curto só p/ ligas com jogo ao vivo/próximo.
// Protegido por REVALIDATION_SECRET.
//   GET/POST /api/agenda/refresh?secret=XXX
export const dynamic = "force-dynamic";

async function handle(req: Request) {
  const url = new URL(req.url);
  if (url.searchParams.get("secret") !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const result = await refreshTodayFootballStore();
    // Regenera as páginas que leem o store (a leitura é barata; só reflete o novo store).
    try {
      revalidatePath("/jogos-de-hoje");
      revalidatePath("/jogos-de-hoje/futebol");
    } catch {
      /* fora de contexto de request */
    }
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (e) {
    return NextResponse.json({ error: String(e) }, { status: 500 });
  }
}

export const POST = handle;
export const GET = handle;
