import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

// Clique do banner promocional: /oferta/{slug}
//  1. acha o banner ativo, 2. conta o clique, 3. redireciona pro link de afiliado.
// O link de afiliado vai INTACTO (sem UTM): parâmetro extra pode quebrar o rastreio
// da loja (links curtos tipo amzn.to / mercadolivre.com/sec). Fora do índice (robots).
export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const home = new URL("/", req.url);
  const noindex = { "X-Robots-Tag": "noindex, nofollow" };

  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "promoBanners" as any,
      where: { slug: { equals: slug }, active: { equals: true } },
      limit: 1,
      depth: 0,
    });
    const doc: any = res.docs[0];
    const target = String(doc?.url || "").trim();
    let dest: URL;
    try {
      dest = new URL(target);
      if (dest.protocol !== "https:" && dest.protocol !== "http:") throw new Error("protocolo");
    } catch {
      return NextResponse.redirect(home, { status: 307, headers: noindex });
    }

    try {
      await payload.update({
        collection: "promoBanners" as any,
        id: doc.id,
        data: { clicks: (Number(doc.clicks) || 0) + 1 },
        context: { skipRevalidate: true },
      });
    } catch {
      /* contagem não pode travar o clique */
    }
    return NextResponse.redirect(dest, { status: 307, headers: noindex });
  } catch {
    return NextResponse.redirect(home, { status: 307, headers: noindex });
  }
}
