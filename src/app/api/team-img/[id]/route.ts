import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

// Escudo do time servido do ARQUIVO LOCAL (volume compartilhado data/team-images),
// baixado 1x via API autenticada (team/{id}/image). Por quê: o proxy /img/team bate no
// Sofascore, que BLOQUEIA o IP do servidor nas imagens (403) → escudos quebram. A API
// autenticada (sportapi7) serve a imagem sem bloqueio. Servindo do nosso volume, não
// depende mais do Sofascore nem da API atual (sobrevive a troca de API e a bloqueios).
// Quem não temos no arquivo cai pro fallback da API (cacheado).
const DIR = join(process.cwd(), "data", "team-images");

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const tid = String(id).replace(/\D/g, "");
  if (!tid) return new NextResponse(null, { status: 400 });

  // 1) Arquivo local (baixado 1x) — sem custo de API, immutable.
  try {
    const buf = await readFile(join(DIR, `${tid}.png`));
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "content-type": "image/png",
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    /* não temos no arquivo — cai pro fallback abaixo */
  }

  // 2) Fallback: API autenticada (allsportsapi2 serve o escudo em /api/team/{id}/image,
  //    SEM /v1 — sem o bloqueio do Sofascore). Cache 30 dias na CDN.
  try {
    const host = process.env.ALLSPORTS_API_HOST || "allsportsapi2.p.rapidapi.com";
    const r = await fetch(`https://${host}/api/team/${tid}/image`, {
      headers: {
        "x-rapidapi-key": process.env.ALLSPORTS_API_KEY || "",
        "x-rapidapi-host": host,
      },
    });
    if (r.ok) {
      const buf = Buffer.from(await r.arrayBuffer());
      if (buf.length > 500) {
        return new NextResponse(new Uint8Array(buf), {
          headers: {
            "content-type": r.headers.get("content-type") || "image/png",
            "cache-control": "public, max-age=2592000",
          },
        });
      }
    }
  } catch {
    /* cai pro redirect abaixo */
  }

  // 3) Último recurso: o proxy nginx /img/team (cacheado + stale-on-403). Garante que o
  //    escudo NUNCA fica pior que hoje, mesmo sem arquivo local nem resposta da API.
  return NextResponse.redirect(new URL(`/img/team/${tid}/image`, req.url), 307);
}
