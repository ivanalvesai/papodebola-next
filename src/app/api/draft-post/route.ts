import { NextRequest, NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";

// ⚠️ ROTA TEMPORÁRIA — cria/atualiza UM post como RASCUNHO (_status: draft) no Payload.
// Protegida por REVALIDATION_SECRET. Idempotente pelo slug. REMOVER após revisão/publicação.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const BODY = `
<p><strong>Cabo Verde entrou para a história do futebol mundial.</strong> Na primeira participação da seleção em uma Copa do Mundo, os Tubarões Azuis garantiram vaga nos 16 avos de final ao empatar por 0 a 0 com a Arábia Saudita nesta sexta-feira (26 de junho), em Houston. No mesmo Grupo H, o Uruguai se despediu mais cedo: perdeu por 1 a 0 para a Espanha e ficou fora do mata-mata.</p>

<p>O empate bastou para um feito que parecia improvável no começo do torneio. Com pouco mais de meio milhão de habitantes, Cabo Verde se tornou o terceiro menor país em população a chegar à fase eliminatória de uma Copa — e conseguiu isso sem vencer nenhum jogo, somando três empates na fase de grupos.</p>

<h2>O empate que valeu uma vaga inédita</h2>
<p>Diante da Arábia Saudita, Cabo Verde controlou a ansiedade e segurou o 0 a 0 que precisava. Com o ponto, chegou aos 3 e fechou o grupo na segunda posição, atrás apenas da Espanha. Foi o desfecho de uma campanha de resistência, em que a seleção africana se agarrou a cada resultado para seguir viva. <a href="/futebol/copa-do-mundo/jogo/26-06-2026/cabo-verde-arabia-saudita">Veja o lance a lance de Cabo Verde x Arábia Saudita</a>.</p>

<h2>A queda do Uruguai</h2>
<p>Enquanto Cabo Verde celebrava, o Uruguai amargava a eliminação. A Celeste precisava vencer a Espanha para avançar, mas parou na campeã do Grupo H e perdeu por 1 a 0. É a segunda Copa seguida em que os uruguaios caem ainda na fase de grupos, um retrocesso para uma das seleções mais tradicionais da América do Sul. <a href="/futebol/copa-do-mundo/jogo/26-06-2026/uruguai-espanha">Confira como foi Uruguai x Espanha</a>.</p>

<h2>Como ficou o Grupo H</h2>
<table>
  <thead>
    <tr><th>Pos</th><th>Seleção</th><th>P</th><th>J</th><th>V</th><th>E</th><th>D</th><th>SG</th></tr>
  </thead>
  <tbody>
    <tr><td>1º</td><td>Espanha</td><td>7</td><td>3</td><td>2</td><td>1</td><td>0</td><td>+5</td></tr>
    <tr><td>2º</td><td>Cabo Verde</td><td>3</td><td>3</td><td>0</td><td>3</td><td>0</td><td>0</td></tr>
    <tr><td>3º</td><td>Uruguai</td><td>2</td><td>3</td><td>0</td><td>2</td><td>1</td><td>-1</td></tr>
    <tr><td>4º</td><td>Arábia Saudita</td><td>2</td><td>3</td><td>0</td><td>2</td><td>1</td><td>-4</td></tr>
  </tbody>
</table>
<p>Espanha e Cabo Verde avançaram; Uruguai e Arábia Saudita foram eliminados.</p>

<h2>Um feito inédito desde o Chile de 1998</h2>
<p>Cabo Verde se tornou a primeira seleção desde o Chile, na Copa de 1998, a passar de fase sem vencer uma partida. Foram três empates que valeram ouro: o 0 a 0 na estreia diante da favorita Espanha, o emocionante 2 a 2 com o Uruguai e o 0 a 0 decisivo contra a Arábia Saudita.</p>
<p>O nome que ficou marcado foi o de Kevin Pina, autor do primeiro gol da história de Cabo Verde em Copas do Mundo, em uma cobrança de falta no duelo com o Uruguai. Naquela partida, Hélio Varela completou a virada do placar e deixou tudo igual, num jogo que já dava sinais de que os Tubarões Azuis não eram coadjuvantes.</p>

<h2>Próximo desafio: a Argentina de Messi</h2>
<p>A recompensa pela classificação é um adversário de respeito. Como segundo colocado do Grupo H, Cabo Verde enfrentará o vencedor do Grupo J nos 16 avos de final — a Argentina, atual campeã do mundo e comandada por Lionel Messi. Será o maior jogo da história da seleção cabo-verdiana. <a href="/futebol/copa-do-mundo">Acompanhe o chaveamento e os jogos da Copa do Mundo</a>.</p>

<h2>Data e horário de Cabo Verde x Argentina e onde assistir</h2>
<div style="border:1px solid #d9dbe0;border-radius:8px;padding:16px 20px;background:#f7f8fa;margin:12px 0">
<p style="margin:4px 0"><strong>Jogo:</strong> Cabo Verde x Argentina</p>
<p style="margin:4px 0"><strong>Competição:</strong> segunda fase (16 avos de final) da Copa do Mundo de 2026</p>
<p style="margin:4px 0"><strong>Data:</strong> sexta-feira, 3 de julho</p>
<p style="margin:4px 0"><strong>Horário:</strong> 19h (de Brasília)</p>
<p style="margin:4px 0"><strong>Local:</strong> Hard Rock Stadium, em Miami (Flórida, EUA)</p>
<p style="margin:4px 0"><strong>Onde assistir:</strong> TV Globo, SporTV, SBT, CazéTV, N Sports e Globoplay</p>
</div>

<h2>A festa de um país inteiro</h2>
<p>Em Cabo Verde, o clima é de euforia. A imprensa local vinha tratando a campanha como um momento histórico mesmo antes da confirmação, com o país acompanhando cada rodada na expectativa do apuramento inédito. Para um arquipélago de dez ilhas no Atlântico, chegar ao mata-mata de uma Copa de 48 seleções é a maior conquista esportiva de sua história.</p>

<h2>Perguntas frequentes</h2>
<p><strong>Cabo Verde se classificou para o mata-mata da Copa do Mundo 2026?</strong><br>Sim. Cabo Verde terminou o Grupo H na segunda posição, com 3 pontos, e avançou aos 16 avos de final na sua primeira participação em Copas.</p>
<p><strong>Por que o Uruguai foi eliminado?</strong><br>O Uruguai perdeu por 1 a 0 para a Espanha na última rodada e ficou em terceiro no grupo, fora da zona de classificação.</p>
<p><strong>Quem Cabo Verde enfrenta nos 16 avos?</strong><br>Como segundo do Grupo H, Cabo Verde pega o primeiro do Grupo J, a Argentina de Lionel Messi.</p>

<p><em>Fontes: <a href="https://www.fifa.com/pt/tournaments/mens/worldcup/canadamexicousa2026" target="_blank" rel="noopener">FIFA</a>, <a href="https://www.espn.com/soccer/story/_/id/49139293/cape-verde-uruguay-2026-world-cup-upset" target="_blank" rel="noopener">ESPN</a>, <a href="https://www.aljazeera.com/sports/2026/6/22/cape-verde-fight-back-for-second-world-cup-draw-2-2-against-uruguay" target="_blank" rel="noopener">Al Jazeera</a> e <a href="https://expressodasilhas.cv" target="_blank" rel="noopener">Expresso das Ilhas</a>.</em></p>
`.trim();

const POST_DATA: Record<string, unknown> = {
  title: "Cabo Verde faz história na Copa do Mundo 2026 e elimina o Uruguai",
  slug: "cabo-verde-classificado-copa-do-mundo-2026-uruguai-eliminado",
  category: "Copa do Mundo",
  author: "Redação",
  excerpt:
    "Na estreia em Copas, Cabo Verde empatou com a Arábia Saudita e garantiu vaga nos 16 avos de final. No mesmo grupo, o Uruguai perdeu para a Espanha e foi eliminado.",
  body: BODY,
  publishedDate: "2026-06-26T21:00:00.000Z",
  seo: {
    metaTitle: "Cabo Verde na Copa 2026: classificado; Uruguai eliminado",
    metaDescription:
      "Cabo Verde se classificou pela 1ª vez no Mundial após empatar com a Arábia Saudita, enquanto o Uruguai caiu na fase de grupos ao perder para a Espanha.",
  },
  _status: "draft",
};

export async function GET(req: NextRequest) {
  if (req.nextUrl.searchParams.get("secret") !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  try {
    const payload = await getPayload({ config });
    const existing = await payload.find({
      collection: "posts",
      where: { slug: { equals: POST_DATA.slug as string } },
      limit: 1,
    });
    let doc: { id: number | string; slug?: string; _status?: string };
    if (existing.docs[0]) {
      doc = (await payload.update({ collection: "posts", id: existing.docs[0].id, data: POST_DATA })) as typeof doc;
    } else {
      doc = (await payload.create({ collection: "posts", data: POST_DATA })) as typeof doc;
    }
    return NextResponse.json({ ok: true, id: doc.id, slug: doc.slug, status: doc._status });
  } catch (e) {
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
