import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { convertHTMLToLexical, editorConfigFactory } from "@payloadcms/richtext-lexical";
import { JSDOM } from "jsdom";

// ROTA TEMPORÁRIA — adiciona o chaveamento (classificados A–F) no post 395. Remover depois.
export const dynamic = "force-dynamic";

const MARK = "Seleções já classificadas para o mata-mata";

const BRACKET = `<h2>${MARK} (atualizado)</h2>

<p>Com os Grupos A a F encerrados, <strong>12 seleções já garantiram vaga</strong> na próxima fase da Copa do Mundo 2026. Os Grupos G a L ainda disputam a 3ª rodada, então a lista é completada nos próximos dias.</p>

<div style="background:#f8f9fa;border:1px solid #e2e5e9;border-radius:8px;padding:16px 20px;margin:20px 0">
  <strong>Classificados — Grupos A–F (1º e 2º lugar):</strong>
  <ul style="margin:8px 0 0;padding-left:20px;line-height:1.9">
    <li><strong>Grupo A:</strong> México e África do Sul</li>
    <li><strong>Grupo B:</strong> Suíça e Canadá</li>
    <li><strong>Grupo C:</strong> Brasil e Marrocos</li>
    <li><strong>Grupo D:</strong> Estados Unidos e Austrália</li>
    <li><strong>Grupo E:</strong> Alemanha e Costa do Marfim</li>
    <li><strong>Grupo F:</strong> Holanda e Japão</li>
  </ul>
</div>

<p>Os confrontos do mata-mata já 100% definidos (com os dois times confirmados):</p>

<ul style="line-height:1.9">
  <li><a href="/futebol/copa-do-mundo/jogo/28-06-2026/africa-do-sul-canada"><strong>África do Sul x Canadá</strong></a> — 28/06</li>
  <li><a href="/futebol/copa-do-mundo/jogo/29-06-2026/brasil-japao"><strong>Brasil x Japão</strong></a> — 29/06, NRG Stadium (Houston)</li>
  <li><a href="/futebol/copa-do-mundo/jogo/29-06-2026/holanda-marrocos"><strong>Holanda x Marrocos</strong></a> — 29/06</li>
</ul>

<p>Os demais confrontos dependem das vagas que ainda serão definidas nos Grupos G a L e do ranking dos melhores terceiros colocados.</p>`;

export async function GET(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "nao autorizado" }, { status: 401 });
  }
  try {
    const payload = await getPayload({ config });
    const post = await payload.findByID({ collection: "posts", id: 395 });
    let body = String((post as { body?: string }).body || "");
    if (body.includes(MARK)) {
      return NextResponse.json({ ok: true, alreadyDone: true });
    }
    // Insere antes da caixa "Leia também" (verde) se existir; senão, ao final.
    const greenBox = '<div style="background:#f0fdf4';
    if (body.includes(greenBox)) {
      body = body.replace(greenBox, `${BRACKET}\n\n${greenBox}`);
    } else {
      body = `${body}\n\n${BRACKET}`;
    }
    const content = convertHTMLToLexical({
      editorConfig: await editorConfigFactory.default({ config: payload.config }),
      html: body,
      JSDOM,
    });
    await payload.update({ collection: "posts", id: 395, data: { body, content } });
    return NextResponse.json({ ok: true, bodyLen: body.length });
  } catch (e) {
    return NextResponse.json({ error: String((e as Error)?.message) }, { status: 500 });
  }
}
