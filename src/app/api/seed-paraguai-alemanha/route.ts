import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import {
  convertHTMLToLexical,
  editorConfigFactory,
  EXPERIMENTAL_TableFeature,
} from "@payloadcms/richtext-lexical";
import { JSDOM } from "jsdom";

// TEMPORÁRIA: cria (ou atualiza) o post-recap "Paraguai x Alemanha" como RASCUNHO no
// Payload (collection posts), com o corpo no editor visual (Lexical, via convertHTMLToLexical
// — inclui a tabela das cobranças). Idempotente por slug. Protegida por REVALIDATION_SECRET.
// Nasce em _status: draft (não vai pro ar) — o Ivan revisa/edita no /cms e publica.
//   POST/GET /api/seed-paraguai-alemanha?secret=XXX
// REMOVER esta rota depois de rodar.
export const dynamic = "force-dynamic";

const SLUG = "paraguai-x-alemanha-penaltis-copa-do-mundo-2026";
const TITLE = "Paraguai derrota a Alemanha e avança na Copa do Mundo";
const EXCERPT =
  "O Paraguai segurou o 1 a 1 no tempo normal e bateu a Alemanha por 4 a 3 na disputa de " +
  "pênaltis, com duas defesas de Orlando Gill, e avançou às oitavas de final da Copa do Mundo 2026.";

const HTML = `
<p><strong>O Paraguai está nas oitavas de final da Copa do Mundo 2026.</strong> Em um jogo dramático pelos 16-avos de final, a Albirroja segurou o empate por 1 a 1 no tempo normal e bateu a Alemanha por 4 a 3 na disputa de pênaltis, com duas defesas decisivas do goleiro Orlando Gill.</p>

<h2>Como foi o jogo</h2>
<p>O Paraguai abriu o placar ainda no primeiro tempo, aos 41 minutos, com Julio Enciso, que cabeceou após cruzamento de Matías Galarza. A Alemanha voltou melhor para o segundo tempo e chegou ao empate com Kai Havertz, também de cabeça, em jogada iniciada por Florian Wirtz.</p>
<p>Na prorrogação, a Alemanha ainda balançou as redes com Tah, mas o árbitro anulou o gol após revisão do VAR, marcando falta de Anton sobre o goleiro paraguaio. O 1 a 1 se manteve e a classificação foi decidida nas penalidades.</p>

<h2>A disputa de pênaltis: 4 x 3 para o Paraguai</h2>
<p>O grande nome da decisão foi o goleiro <strong>Orlando Gill</strong>, que defendeu duas cobranças alemãs e carimbou a vaga paraguaia. Pela Alemanha, Kai Havertz e Woltemade pararam no goleiro; pelo Paraguai, Balbuena e Sanabria desperdiçaram, mas as conversões decisivas garantiram o 4 a 3.</p>
<table>
<thead><tr><th>Cobrança</th><th>Seleção</th><th>Resultado</th></tr></thead>
<tbody>
<tr><td>Kai Havertz</td><td>Alemanha</td><td>❌ Defesa de Gill</td></tr>
<tr><td>Woltemade</td><td>Alemanha</td><td>❌ Defesa de Gill</td></tr>
<tr><td>Balbuena</td><td>Paraguai</td><td>❌ Perdeu a cobrança</td></tr>
<tr><td>Sanabria</td><td>Paraguai</td><td>❌ Mandou para fora</td></tr>
</tbody>
</table>
<p><em>A sequência completa das cobranças, batedor por batedor (⚽ para o acerto e ❌ para o erro), fica atualizada no lance a lance da <a href="/futebol/copa-do-mundo">página do jogo</a>.</em></p>

<h2>Próximo jogo do Paraguai</h2>
<p>Classificado, o Paraguai volta a campo pelas oitavas de final contra o vencedor de França x Suécia.</p>
<table>
<tbody>
<tr><th>Fase</th><td>Oitavas de final</td></tr>
<tr><th>Adversário</th><td>Vencedor de França x Suécia</td></tr>
<tr><th>Data</th><td>Terça-feira, 30 de junho de 2026</td></tr>
<tr><th>Horário</th><td>18h (horário de Brasília)</td></tr>
<tr><th>Local</th><td>MetLife Stadium — Estados Unidos</td></tr>
<tr><th>Onde assistir</th><td>Globo e SBT (TV aberta) · CazéTV (YouTube, grátis) · Globoplay (streaming) · SporTV (TV fechada)</td></tr>
</tbody>
</table>
<p>Acompanhe tudo sobre a competição na nossa cobertura da <a href="/futebol/copa-do-mundo">Copa do Mundo 2026</a>.</p>
`.trim();

/* eslint-disable @typescript-eslint/no-explicit-any */
async function handle(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  if (searchParams.get("secret") !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const payload = await getPayload({ config });

  // HTML -> Lexical (mesmas features do editor de `content`: defaultFeatures + tabela).
  const editorConfig = await editorConfigFactory.fromFeatures({
    config: payload.config,
    features: ({ defaultFeatures }: any) => [...defaultFeatures, EXPERIMENTAL_TableFeature()],
  });
  const content = convertHTMLToLexical({ editorConfig, html: HTML, JSDOM });

  const data: any = {
    title: TITLE,
    slug: SLUG,
    category: "Copa do Mundo",
    excerpt: EXCERPT,
    author: "Redação",
    content,
    body: "",
    publishedDate: "2026-06-29T21:00:00.000-03:00",
    seo: { metaTitle: TITLE, metaDescription: EXCERPT },
    _status: "draft", // RASCUNHO — não vai pro ar; Ivan revisa e publica no /cms
  };

  const existing = await payload.find({
    collection: "posts",
    where: { slug: { equals: SLUG } },
    limit: 1,
    draft: true,
  });

  let result;
  if (existing.docs[0]) {
    result = await payload.update({
      collection: "posts",
      id: existing.docs[0].id,
      draft: true,
      data,
    });
  } else {
    result = await payload.create({ collection: "posts", data, draft: true });
  }

  return NextResponse.json(
    {
      ok: true,
      action: existing.docs[0] ? "updated" : "created",
      id: result.id,
      slug: result.slug,
      status: (result as any)._status,
      nodes: (content as any)?.root?.children?.length ?? 0,
      previewPath: `/cms-preview/${result.slug}`,
      cmsEdit: `/cms/collections/posts/${result.id}`,
    },
    { headers: { "Cache-Control": "no-store" } }
  );
}

export const POST = handle;
export const GET = handle;
