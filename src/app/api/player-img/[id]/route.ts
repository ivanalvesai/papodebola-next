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
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const pid = String(id).replace(/\D/g, "");
  if (!pid) return new NextResponse(null, { status: 400 });

  try {
    const buf = await readFile(join(DIR, `${pid}.webp`));
    return new NextResponse(new Uint8Array(buf), {
      headers: {
        "content-type": "image/webp",
        "cache-control": "public, max-age=31536000, immutable",
      },
    });
  } catch {
    // Não está no arquivo → cai pro proxy do Sofascore (cacheado no nginx).
    return NextResponse.redirect(new URL(`/img/player/${pid}/image`, req.url), 307);
  }
}
