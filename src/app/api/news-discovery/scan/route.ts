import { NextRequest, NextResponse } from "next/server";
import { discoverPautas, DEFAULT_QUERIES } from "@/lib/services/news-discovery";
import { mergeHotNews } from "@/lib/data/hot-news-store";

// Scan automático (chamado pelo cron a cada 30min, no dev). Descobre as pautas
// quentes de futebol BR/mundo e mescla no histórico rolante de 2 dias. NÃO publica
// nada. Protegido por ?secret=REVALIDATION_SECRET.
export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  if (request.nextUrl.searchParams.get("secret") !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const clusters = await discoverPautas(DEFAULT_QUERIES, "pt-BR", 40);
  const stats = await mergeHotNews(clusters, Date.now());

  return NextResponse.json(
    { scannedClusters: clusters.length, ...stats, at: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
