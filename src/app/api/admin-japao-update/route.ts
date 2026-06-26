import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { convertHTMLToLexical, editorConfigFactory } from "@payloadcms/richtext-lexical";
import { JSDOM } from "jsdom";

// ROTA TEMPORÁRIA — adiciona a ficha técnica do jogo no post 403 (Brasil x Japão)
// e corrige o "onde assistir". Protegida por secret. Remover depois.
export const dynamic = "force-dynamic";

const NEW_S4 = `<h2 id="section-4">ONDE ASSISTIR AO BRASIL X JAPÃO</h2>

<div style="background:#f8f9fa;border:1px solid #e2e5e9;border-radius:8px;padding:16px 20px;margin:20px 0">
  <strong style="font-size:1.1em">Brasil x Japão</strong><br>
  <span style="color:#00965E;font-weight:600">Copa do Mundo 2026 – 16 avos de final (mata-mata)</span>
  <ul style="list-style:none;margin:12px 0 0;padding:0;line-height:1.9">
    <li><strong>Data e horário:</strong> segunda-feira, 29 de junho de 2026, às 14h (de Brasília)</li>
    <li><strong>Local:</strong> a confirmar pela Fifa</li>
    <li><strong>Onde assistir:</strong> TV Globo e SBT (TV aberta), SporTV, GE TV e N Sports (TV fechada), CazéTV (YouTube) e Globoplay (streaming)</li>
    <li><strong>Árbitro:</strong> a confirmar</li>
    <li><strong>Assistentes:</strong> a confirmar</li>
  </ul>
</div>

<p>A transmissão do Brasil x Japão está garantida na TV aberta pela Globo e pelo SBT, o que assegura acesso gratuito para quem tem televisão em casa. Na TV fechada, o confronto passa no SporTV, na GE TV e na N Sports, enquanto a CazéTV (no YouTube) e o Globoplay levam o jogo para quem prefere acompanhar pelo celular ou computador.</p>

<p>Como em todo jogo do Brasil em Copa do Mundo, a recomendação é deixar tudo pronto com antecedência para não perder nenhum minuto. Bares, restaurantes e praças de alimentação devem lotar para o confronto, que mais uma vez tem tudo para parar o país. O estádio e a arbitragem serão confirmados pela Fifa à medida que o chaveamento do mata-mata for fechado.</p>

`;

export async function GET(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "nao autorizado" }, { status: 401 });
  }
  try {
    const payload = await getPayload({ config });
    const post = await payload.findByID({ collection: "posts", id: 403, draft: true });
    const body0 = String((post as { body?: string }).body || "");
    if (!/<h2 id="section-4">/.test(body0) || !/<h2 id="section-5">/.test(body0)) {
      return NextResponse.json({ error: "marcadores de secao nao encontrados", len: body0.length }, { status: 500 });
    }
    const body = body0.replace(/<h2 id="section-4">[\s\S]*?(?=<h2 id="section-5">)/, NEW_S4);
    const content = convertHTMLToLexical({
      editorConfig: await editorConfigFactory.default({ config: payload.config }),
      html: body,
      JSDOM,
    });
    await payload.update({ collection: "posts", id: 403, data: { body, content }, draft: true });
    return NextResponse.json({ ok: true, id: 403, changed: body !== body0, bodyLen: body.length });
  } catch (e) {
    return NextResponse.json({ error: String((e as Error)?.message) }, { status: 500 });
  }
}
