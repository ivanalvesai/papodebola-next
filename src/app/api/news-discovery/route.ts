import { NextRequest, NextResponse } from "next/server";
import { discoverPautas } from "@/lib/services/news-discovery";

// Descoberta de pautas (Google News RSS → dedup/cluster). NÃO publica nada — só
// sugere. Protegido por ?secret=REVALIDATION_SECRET pra evitar abuso (bate em RSS
// externo). Buscas padrão de futebol BR/mundo; ?q= sobrescreve (vírgula separa).
const DEFAULT_QUERIES = [
  "futebol Brasil seleção",
  "Brasileirão",
  "Copa do Mundo seleção brasileira",
  "futebol Europa Champions League",
  "mercado da bola transferências",
];

export async function GET(request: NextRequest) {
  const sp = request.nextUrl.searchParams;
  if (sp.get("secret") !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "Token inválido" }, { status: 401 });
  }

  const qParam = sp.get("q");
  const queries = qParam
    ? qParam.split(",").map((s) => s.trim()).filter(Boolean)
    : DEFAULT_QUERIES;
  const lang = sp.get("lang") === "en" ? "en" : "pt-BR";
  const max = Math.min(50, Math.max(1, parseInt(sp.get("max") || "30", 10)));

  const pautas = await discoverPautas(queries, lang, max);

  return NextResponse.json(
    { queries, count: pautas.length, pautas, generatedAt: new Date().toISOString() },
    { headers: { "Cache-Control": "no-store" } }
  );
}
