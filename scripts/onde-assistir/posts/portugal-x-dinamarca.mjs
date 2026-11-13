// Portugal x Dinamarca — Liga das Nações, Liga A · Grupo 4, 5ª rodada, sábado 14/11/2026 16h45. Jogo 15534093.
// Autor: Lucas Lima (2). SporTV (Trivela + guias). Árbitro: Rade Obrenović.
import { B, P } from "../lexical.mjs";
import { watchPostV2, SAB14 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: SAB14, matchId: 15534093, authorId: 2, A: "Portugal", Bn: "Dinamarca", hora: "16h45",
  canal: "SporTV", canalLongo: "SporTV (TV fechada)", canalCapaAlt: "no SporTV",
  competicaoLinha: "Liga das Nações 2026/27, Liga A, Grupo 4, 5ª rodada",
  localCurto: "Estádio Municipal de Braga (Portugal)", ondeFrase: "no Estádio Municipal de Braga, em Portugal",
  arbitro: "Rade Obrenović (Eslovênia); VAR: Matej Jug",
  lead: P("Líder com 100% de aproveitamento, ", B("Portugal"), " recebe a ", B("Dinamarca"), " neste sábado (14/11), às ", B("16h45 (de Brasília)"), ", em Braga, pela 5ª rodada da ", B("Liga das Nações"), ". O jogo do Grupo 4 da Liga A tem transmissão do ", B("SporTV"), "."),
  comoChegam: [
    "Portugal venceu os quatro jogos do grupo, com 9 gols marcados, e já está garantido nas quartas de final. A lista do técnico Jorge Jesus, sem Cristiano Ronaldo, que deixou a seleção, tem 28 nomes e sete novidades, entre eles os estreantes Alberto Costa, do Porto, e Gustavo Varela, do Monza, além de Rodrigo Mora e Geovany Quenda. João Félix e Gonçalo Ramos dividem a artilharia da campanha, com 3 gols cada.",
    "A Dinamarca de Brian Riemer é a 2ª, com 6 pontos, e vem de vitória por 1 a 0 sobre o País de Gales, com gol de pênalti de Rasmus Højlund, artilheiro do time na competição com 3 gols. No 1º turno, em Copenhague, perdeu para Portugal por 4 a 2. O zagueiro Andreas Christensen, do Barcelona, segue fora com uma lesão na coxa, e Rasmus Nicolaisen foi chamado no lugar.",
  ],
  cardTitulo: "Situação no Grupo 4 da Liga A", cardSub: "Antes da 5ª rodada",
  extraRows: [["Classificação às quartas", "1º e 2º colocados"], ["Portugal", "já garantido nas quartas"]],
  tabelaTitulo: "Classificação do Grupo 4 da Liga A",
  emJogo: [
    "Um empate garante a Portugal o 1º lugar do grupo, que dá o direito de decidir as quartas de final em casa, em março. Bicampeão da Liga das Nações (2018/19 e 2024/25), o time português venceu cinco dos últimos seis jogos contra a Dinamarca.",
    "A Dinamarca ainda não tem a vaga garantida: País de Gales e Noruega, que se enfrentam mais cedo, podem chegar a 9 pontos. Para assegurar o 2º lugar sem depender de ninguém, os dinamarqueses precisam somar 4 pontos nos dois últimos jogos, este e o duelo com a Noruega, em Copenhague, na terça-feira (17).",
  ],
  desfalques: [
    P(B("Portugal: "), "o lateral João Cancelo cumpre suspensão pelo segundo amarelo, e o atacante Francisco Conceição cumpre a segunda de três partidas de suspensão pela expulsão contra a Noruega. O lateral Nuno Mendes está lesionado."),
    P(B("Dinamarca: "), "além de Christensen, a situação do lateral Patrick Dorgu, do Manchester United, é incerta: há relatos de que ficou fora e outros de que foi chamado de última hora. Seis jogadores estão pendurados."),
  ],
  local: [
    "A arbitragem é do esloveno Rade Obrenović, que vai apitar Portugal pela primeira vez, com Jure Praprotnik e Grega Kordež como assistentes. No VAR, Matej Jug.",
    "O Estádio Municipal de Braga, encravado numa antiga pedreira, é um dos cartões-postais do futebol português.",
  ],
  faqCanal: "A partida tem transmissão do SporTV, na TV fechada, às 16h45 de Brasília.",
  faqExtra: [
    ["Cristiano Ronaldo joga Portugal x Dinamarca?", "Não. Cristiano Ronaldo deixou a seleção portuguesa e não está na lista de Jorge Jesus."],
    ["O que Portugal precisa para terminar em 1º no grupo?", "Um empate contra a Dinamarca garante o 1º lugar do Grupo 4 da Liga A e o mando de campo na volta das quartas de final."],
  ],
  excerpt: "Portugal e Dinamarca se enfrentam às 16h45 deste sábado (14/11), em Braga, pela Liga das Nações. Veja onde assistir, desfalques e prováveis escalações.",
  metaDescription: "Saiba onde assistir a Portugal x Dinamarca neste sábado (14/11), às 16h45, em Braga, pela Liga das Nações. Transmissão do SporTV, desfalques e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
