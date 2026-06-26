import { NextResponse } from "next/server";
import { getPayload } from "payload";
import config from "@payload-config";
import { convertHTMLToLexical, editorConfigFactory } from "@payloadcms/richtext-lexical";
import { JSDOM } from "jsdom";

// ROTA TEMPORÁRIA — cria o rascunho "Brasil enfrenta o Japão na próxima fase".
// Protegida por secret. Remover depois de criar.
export const dynamic = "force-dynamic";

const TITLE = "Brasil enfrenta o Japão na próxima fase";
const SLUG = "brasil-x-japao-proxima-fase-copa-do-mundo";
const EXCERPT =
  "Brasil avança como líder do Grupo C e encara o Japão na próxima fase da Copa do Mundo. Veja a classificação, os últimos confrontos, as chances e onde assistir.";

const BODY = `<p>O Brasil avançou na Copa do Mundo como líder do Grupo C e já se prepara para o próximo desafio na fase de mata-mata: o Japão. É um confronto que coloca frente a frente o talento e a história da Seleção Brasileira contra a organização e a intensidade de uma das equipes mais disciplinadas do mundo. Antes de qualquer análise, vale lembrar que mata-mata de Copa não perdoa: não existe "corrigimos na próxima rodada". Quem vacila, vai pra casa. E é exatamente por isso que esse Brasil x Japão merece atenção total, mesmo com o favoritismo claramente do lado canarinho.</p>

<div style="background:#f8f9fa;border:1px solid #e2e5e9;border-radius:8px;padding:16px 20px;margin:20px 0">
  <strong>Neste artigo:</strong>
  <ul style="margin:8px 0 0;padding-left:20px">
    <li><a href="#section-0">Como o Brasil garantiu a vaga</a></li>
    <li><a href="#section-1">Japão x Suécia: o jogo que definiu o adversário</a></li>
    <li><a href="#section-2">Os últimos confrontos entre Brasil e Japão</a></li>
    <li><a href="#section-3">As chances de cada time</a></li>
    <li><a href="#section-4">Onde assistir ao Brasil x Japão</a></li>
    <li><a href="#section-5">O que esperar do confronto</a></li>
  </ul>
</div>

<p>A torcida brasileira já respira clima de decisão. Tem gente querendo saber onde assistir ao Brasil x Japão, outros relembrando os confrontos históricos entre as duas seleções, e muitos avaliando o real tamanho do perigo japonês. Vamos por partes, com a análise honesta que esse momento da Copa do Mundo exige.</p>

<h2 id="section-0">COMO O BRASIL GARANTIU A VAGA</h2>

<p>O Brasil chegou ao mata-mata como primeiro colocado do Grupo C, com 7 pontos somados em três jogos. A campanha teve de tudo: o empate em 1 a 1 na estreia contra o Marrocos, que acendeu o sinal de alerta, e a recuperação nas rodadas seguintes, que devolveu a liderança e a confiança ao grupo. Terminar em primeiro não é detalhe. Em Copa do Mundo, a posição final no grupo desenha todo o caminho no mata-mata, e ficar na ponta costuma significar um chaveamento mais favorável nas fases seguintes.</p>

<p>Mais do que os números, o que ficou da fase de grupos foi a sensação de que essa Seleção ainda tem margem para crescer. O empate com o Marrocos expôs vulnerabilidades — desatenção em alguns momentos e dificuldade para furar defesas bem postadas — mas também mostrou capacidade de reação. Para o duelo com o Japão, a expectativa é de um Brasil mais ligado desde o apito inicial, porque agora cada erro pode ser o último. Não há mais espaço para começar devagar.</p>

<h2 id="section-1">JAPÃO X SUÉCIA: O JOGO QUE DEFINIU O ADVERSÁRIO</h2>

<p>O nome do adversário brasileiro saiu da última rodada do Grupo F, no confronto direto entre Japão e Suécia. Com o placar em 1 a 1, o Japão garantiu a segunda colocação do grupo, atrás apenas da Holanda, que terminou na liderança. A classificação final ficou assim: Holanda com 7 pontos, Japão com 5 e Suécia com 4 — uma diferença mínima que mostra como o Grupo F foi equilibrado até o último minuto.</p>

<p>É esse resultado que coloca o Japão no caminho do Brasil. Vale registrar, no entanto, que o cenário só se confirma com os japoneses mantendo a segunda posição: se a Suécia tivesse vencido o confronto direto, ela ultrapassaria o Japão e assumiria a vaga — e o adversário brasileiro seria outro. Por isso, Japão x Suécia foi acompanhado de perto não só na Ásia e na Europa, mas também no Brasil, por quem já projetava o mata-mata e queria saber quem cruzaria o caminho da Seleção.</p>

<h2 id="section-2">OS ÚLTIMOS CONFRONTOS ENTRE BRASIL E JAPÃO</h2>

<p>A história entre Brasil e Japão é amplamente dominada pela Seleção Brasileira. Nos confrontos entre as duas seleções principais, o Japão nunca conseguiu uma vitória — seus melhores resultados foram empates, como o 2 a 2 na Copa das Confederações de 2005. Quando o assunto é jogo grande, o Brasil sempre levou a melhor.</p>

<p>Na Copa do Mundo de 2006, na Alemanha, as seleções se enfrentaram na fase de grupos e o Brasil venceu por 4 a 1, com dois gols de Ronaldo, além de Juninho Pernambucano e Gilberto. Já na abertura da Copa das Confederações de 2013, em Brasília, foi 3 a 0 para o Brasil, com Neymar abrindo o placar logo aos 3 minutos, seguido por Paulinho e Jô. O encontro mais recente foi um amistoso em junho de 2022, em Tóquio: vitória brasileira por 1 a 0, com gol de Neymar de pênalti.</p>

<p>Esse retrospecto pesa no imaginário, mas serve tanto de conforto quanto de alerta. O Japão de hoje é muito diferente do que perdeu por 4 a 1 em 2006: é uma seleção com vários atletas atuando na Europa, taticamente disciplinada e que já provou ser capaz de assustar gigantes em Copas recentes. Histórico é importante, mas não entra em campo.</p>

<h2 id="section-3">AS CHANCES DE CADA TIME</h2>

<p>No papel, o Brasil é favorito, e não é por pouco. A diferença de talento individual, a profundidade do elenco e a experiência em mata-matas de Copa colocam a Seleção Brasileira como franca candidata a avançar. Vinicius Júnior, Rodrygo, Raphinha e companhia formam um setor ofensivo capaz de decidir o jogo num lance isolado, algo que o Japão dificilmente consegue neutralizar por completo durante os 90 minutos.</p>

<p>Mas as chances japonesas não são desprezíveis. O Japão construiu sua reputação recente justamente em cima da organização defensiva e da intensidade — é uma equipe que corre muito, marca em conjunto e aproveita bem as transições. Em jogo único de mata-mata, onde um detalhe decide tudo, esse perfil é perigoso. Se o Brasil entrar relaxado, achando que a vaga está garantida pelo retrospecto, o Japão tem repertório para transformar a partida num pesadelo. A chave, mais uma vez, será a postura brasileira nos primeiros minutos.</p>

<h2 id="section-4">ONDE ASSISTIR AO BRASIL X JAPÃO</h2>

<p>A transmissão do Brasil x Japão está garantida na TV aberta pela Band, detentora dos direitos da Copa do Mundo no sinal aberto, o que assegura acesso gratuito para quem tem televisão em casa. Para quem prefere acompanhar pelo celular ou computador, o streaming da própria Band transmite o jogo ao vivo, além das plataformas parceiras que exibem a competição.</p>

<p>Como em todo jogo do Brasil em Copa do Mundo, a recomendação é checar a sua plataforma de streaming com antecedência para não correr o risco de uma tela de paywall bem na hora do apito. Bares, restaurantes e praças de alimentação devem lotar para o confronto, que mais uma vez tem tudo para parar o país. A data e o horário exatos da partida serão confirmados pela Fifa após o fechamento da fase de grupos e a definição do chaveamento.</p>

<h2 id="section-5">O QUE ESPERAR DO CONFRONTO</h2>

<p>O que se espera do Brasil contra o Japão é maturidade. Não precisa ser um show de bola desde o primeiro minuto, mas precisa ter seriedade, concentração e respeito ao adversário — exatamente o que costuma faltar quando a Seleção entra em campo se sentindo superior. O Japão vai propor um jogo truncado, vai tentar tirar o Brasil do seu ritmo e vai apostar nas transições e nas bolas paradas. Cabe ao Brasil impor seu jogo com paciência e capricho.</p>

<p>Se a Seleção controlar a ansiedade, valorizar a posse de bola e for eficiente nas finalizações, o favoritismo tende a se confirmar. Mas mata-mata de Copa do Mundo já ensinou, mais de uma vez, que favoritismo não joga. O Brasil tem tudo para avançar — só precisa entrar em campo lembrando que, a partir de agora, qualquer descuido é o fim da linha.</p>

<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;padding:16px 20px;margin:24px 0">
  <strong>Leia também:</strong>
  <ul style="margin:8px 0 0;padding-left:20px">
    <li><a href="https://papodebola.com.br/futebol/copa-do-mundo/brasil-x-escocia-copa-do-mundo-onde-assistir">Brasil x Escócia na Copa do Mundo: onde assistir e o que esperar</a></li>
    <li><a href="https://papodebola.com.br/futebol/copa-do-mundo/selecoes-classificadas-mata-mata-copa-do-mundo">Quantas Seleções se Classificam para o Mata-Mata da Copa do Mundo?</a></li>
    <li><a href="https://papodebola.com.br/futebol/copa-do-mundo/selecoes-eliminadas-copa-do-mundo-quem-ja-deu-adeus">Seleções Eliminadas da Copa do Mundo: Quem Já Deu Adeus</a></li>
  </ul>
</div>`;

export async function GET(request: Request) {
  const secret = new URL(request.url).searchParams.get("secret");
  if (secret !== process.env.REVALIDATION_SECRET) {
    return NextResponse.json({ error: "nao autorizado" }, { status: 401 });
  }

  try {
    const payload = await getPayload({ config });

    let content: unknown = null;
    try {
      content = convertHTMLToLexical({
        editorConfig: await editorConfigFactory.default({ config: payload.config }),
        html: BODY,
        JSDOM,
      });
    } catch (e) {
      return NextResponse.json({ error: "lexical: " + String((e as Error)?.message) }, { status: 500 });
    }

    const data: Record<string, unknown> = {
      title: TITLE,
      slug: SLUG,
      category: "Copa do Mundo",
      tags: [
        { tag: "Brasil x Japão" },
        { tag: "Copa do Mundo" },
        { tag: "Seleção Brasileira" },
        { tag: "Japão" },
      ],
      excerpt: EXCERPT,
      body: BODY,
      content,
      author: "admin",
      publishedDate: new Date().toISOString(),
      seo: { metaTitle: TITLE.slice(0, 60), metaDescription: EXCERPT.slice(0, 155) },
      _status: "draft",
    };

    const doc = await payload.create({ collection: "posts", data });
    return NextResponse.json({ ok: true, id: doc.id, slug: SLUG, status: "draft" });
  } catch (e) {
    return NextResponse.json({ error: String((e as Error)?.message) }, { status: 500 });
  }
}
