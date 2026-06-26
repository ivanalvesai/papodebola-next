import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { convertHTMLToLexical, editorConfigFactory } from "@payloadcms/richtext-lexical";
import { JSDOM } from "jsdom";

// ROTA TEMPORÁRIA — preenche o estádio (NRG Stadium, Houston) no post 403. Remover depois.
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "nao autorizado" }, { status: 401 });
  }
  try {
    const payload = await getPayload({ config });
    const post = await payload.findByID({ collection: "posts", id: 403, draft: true });
    let body = String((post as { body?: string }).body || "");
    body = body.replace(
      "<li><strong>Local:</strong> a confirmar pela Fifa</li>",
      "<li><strong>Local:</strong> NRG Stadium, Houston (EUA)</li>"
    );
    body = body.replace(
      "O estádio e a arbitragem serão confirmados pela Fifa à medida que o chaveamento do mata-mata for fechado.",
      "O jogo acontece no NRG Stadium, em Houston, casa do Houston Texans (NFL). A arbitragem — árbitro e assistentes — será confirmada pela Fifa nos dias que antecedem a partida."
    );
    const content = convertHTMLToLexical({
      editorConfig: await editorConfigFactory.default({ config: payload.config }),
      html: body,
      JSDOM,
    });
    await payload.update({ collection: "posts", id: 403, data: { body, content }, draft: true });
    return NextResponse.json({ ok: true, hasNRG: body.includes("NRG Stadium") });
  } catch (e) {
    return NextResponse.json({ error: String((e as Error)?.message) }, { status: 500 });
  }
}
