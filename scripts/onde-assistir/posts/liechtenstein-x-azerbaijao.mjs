// Liechtenstein x Azerbaijão — Liga D · Grupo 2, 5ª rodada, 13/11/2026 16h45. Jogo 15534240. Autor: Ivan Alves (1). Disney+.
import { B, P } from "../lexical.mjs";
import { watchPost } from "../template.mjs";
export default (ctx) => watchPost({
  matchId: 15534240, authorId: 1, A: "Liechtenstein", Bn: "Azerbaijão", hora: "16h45",
  canal: "Disney+", canalLongo: "Disney+ (streaming)", canalCapaAlt: "no Disney+",
  competicao: "Liga D, Grupo 2", grupoNome: "Grupo 2 da Liga D",
  localCurto: "Rheinpark Stadion, em Vaduz (Liechtenstein)", ondeFrase: "no Rheinpark Stadion, em Vaduz, em Liechtenstein",
  lead: P("O ", B("Azerbaijão"), " pode garantir o acesso à Liga C nesta sexta-feira (13/11), às ", B("16h45 (de Brasília)"), ", contra ", B("Liechtenstein"), ", no Rheinpark Stadion, em Vaduz. O jogo do Grupo 2 da Liga D da ", B("Liga das Nações"), " tem transmissão do ", B("Disney+"), "."),
  comoChegam: [
    "O Azerbaijão lidera o grupo de três seleções com 5 pontos e ainda não perdeu. Empatou com a Lituânia (1 a 1, fora) e com o próprio Liechtenstein (0 a 0, em Baku) e venceu os lituanos por 1 a 0 em casa, na 4ª rodada. É o último compromisso azeri na fase de liga. Mahir Emreli é a principal referência do ataque.",
    "Liechtenstein somou o único ponto justamente no 0 a 0 com o Azerbaijão. Na estreia, perdeu em casa para a Lituânia por 2 a 0, e ainda não marcou gols na competição. A seleção de um dos menores países da Europa joga com cinco defensores e aposta na resistência.",
  ],
  extraRows: [["Concorrente", "Lituânia, 4 pontos (3 jogos)"], ["Acesso à Liga C", "o líder do grupo sobe"]],
  emJogo: [
    "Só o 1º colocado sobe para a Liga C. O Azerbaijão chega a 8 pontos com uma vitória e fica fora do alcance da Lituânia, que pode somar no máximo 7 na última rodada, contra Liechtenstein. Um empate deixa os azeris com 6 e a decisão nas mãos dos lituanos.",
    "Para Liechtenstein, o objetivo é o primeiro gol e a primeira vitória na competição. Um resultado positivo em Vaduz também ajudaria a Lituânia, adversária do último jogo.",
  ],
  local: [
    "O jogo é no Rheinpark Stadion, em Vaduz, a capital de Liechtenstein, à beira do rio Reno e na fronteira com a Suíça.",
  ],
  faqCanal: "A partida tem transmissão do Disney+, no streaming, às 16h45 de Brasília.",
  faqExtra: [
    ["O Azerbaijão pode subir na Liga das Nações nesta rodada?", "Sim. Com uma vitória sobre Liechtenstein, o Azerbaijão chega a 8 pontos e garante o 1º lugar do Grupo 2 da Liga D e o acesso à Liga C."],
    ["Como está o Grupo 2 da Liga D da Liga das Nações?", "Antes da 5ª rodada: Azerbaijão com 5 pontos em 3 jogos, Lituânia com 4 em 3 e Liechtenstein com 1 em 2."],
  ],
  excerpt: "Azerbaijão visita Liechtenstein às 16h45 desta sexta (13/11), em Vaduz, e pode garantir o acesso na Liga das Nações. Veja onde assistir e as prováveis escalações.",
  metaDescription: "Saiba onde assistir a Liechtenstein x Azerbaijão pela Liga das Nações nesta sexta (13/11), às 16h45, em Vaduz. Veja canal, prováveis escalações e a tabela.",
}, ctx);
