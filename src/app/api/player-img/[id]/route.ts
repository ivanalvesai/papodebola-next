import { NextRequest, NextResponse } from "next/server";
import { readFile } from "fs/promises";
import { join } from "path";

// Foto do jogador servida do ARQUIVO LOCAL (volume compartilhado data/player-images),
// baixado 1x via API (player/{id}/image). Vantagens: não depende do Sofascore (que
// bloqueia nosso IP por Cloudflare/challenge) nem da API atual — sobrevive a troca de
// API e a bloqueios. Atualiza ~1x/ano (script de download). Quem não temos no arquivo
// cai pro proxy nginx (/img/player) como fallback.
const DIR = join(process.cwd(), "data", "player-images");

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pid = String(id).replace(/\D/g, "");
  if (!pid) return new NextResponse(null, { status: 400 });

  // 1) Arquivo local (Copa, baixado 1x) — sem custo de API, immutable.
  try {
    const buf = await readFile(join(DIR, `${pid}.webp`));
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "content-type": "image/webp",
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    /* não temos no arquivo — cai pro fallback abaixo */
  }

  // 2) Fallback: busca da API (sportapi7 serve a foto autenticada — sem o bloqueio do
  // Sofascore). Cache de 30 dias (a CDN segura, não bate na API por jogador toda hora).
  try {
    const host = process.env.ALLSPORTS_API_HOST || "sportapi7.p.rapidapi.com";
    const r = await fetch(`https://${host}/api/v1/player/${pid}/image`, {
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
            "content-type": r.headers.get("content-type") || "image/webp",
            "cache-control": "public, max-age=2592000",
          },
        });
      }
    }
  } catch {
    /* sem foto */
  }
  return new NextResponse(null, { status: 404 });
}
