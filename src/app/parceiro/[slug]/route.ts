import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { normalizeSponsor, sponsorTarget } from "@/lib/data/sponsor";

// Redirecionador de patrocinador: /parceiro/{slug}?de={origem}
//  1. acha o patrocinador ativo,
//  2. incrementa o contador de cliques,
//  3. redireciona pro link real (site > whatsapp > instagram > facebook) com UTM.
// O card sempre aponta pra cá (link único, rastreável) e sai com rel="sponsored".
export const dynamic = "force-dynamic";

/* eslint-disable @typescript-eslint/no-explicit-any */

export async function GET(req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const de = new URL(req.url).searchParams.get("de") || "site";
  const home = new URL("/", req.url);

  try {
    const payload = await getPayload({ config });
    const res = await payload.find({
      collection: "sponsors",
      where: { slug: { equals: slug }, active: { equals: true } },
      limit: 1,
      depth: 0,
    });
    const doc: any = res.docs[0];
    if (!doc) return NextResponse.redirect(home, { status: 307 });

    const s = normalizeSponsor(doc);
    const target = sponsorTarget(s);
    if (!target) return NextResponse.redirect(home, { status: 307 });

    // conta o clique (não bloqueia o usuário se falhar).
    try {
      await payload.update({
        collection: "sponsors",
        id: doc.id,
        data: { clicks: (Number(doc.clicks) || 0) + 1 },
      });
    } catch {
      /* ignora erro de contagem */
    }

    let dest: URL;
    try {
      dest = new URL(target);
      dest.searchParams.set("utm_source", "papodebola.com.br");
      dest.searchParams.set("utm_medium", "patrocinio");
      dest.searchParams.set("utm_campaign", de);
    } catch {
      return NextResponse.redirect(home, { status: 307 });
    }
    return NextResponse.redirect(dest, { status: 307 });
  } catch {
    return NextResponse.redirect(home, { status: 307 });
  }
}
