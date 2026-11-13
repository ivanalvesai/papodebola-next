// Sérvia x Alemanha — Liga A · Grupo 2, 5ª rodada, 13/11/2026 16h45. Jogo 15534059. Autor: Lucas Lima (2).
// Árbitro: Javier Alberola Rojas (Espanha), pesquisado em 12/11 (spec). Transmissão: SporTV + geTV.
import { B, P } from "../lexical.mjs";
import { watchPost } from "../template.mjs";
export default (ctx) => watchPost({
  matchId: 15534059, authorId: 2, A: "Sérvia", Bn: "Alemanha", hora: "16h45",
  canal: "SporTV e geTV", canalLongo: "SporTV (TV fechada) e geTV (streaming)", canalCapaAlt: "no SporTV e no geTV",
  competicao: "Liga A, Grupo 2", grupoNome: "Grupo 2 da Liga A",
  localCurto: "Estádio Rajko Mitić, em Belgrado (Sérvia)", ondeFrase: "no Estádio Rajko Mitić, em Belgrado, na Sérvia",
  arbitro: "Javier Alberola Rojas (Espanha)",
  lead: P("A ", B("Alemanha"), " visita a ", B("Sérvia"), " nesta sexta-feira (13/11), às ", B("16h45 (de Brasília)"), ", no Estádio Rajko Mitić, em Belgrado, pela 5ª rodada do Grupo 2 da Liga A da ", B("Liga das Nações"), ". A transmissão é do ", B("SporTV"), ", na TV fechada, e do ", B("geTV"), ", no streaming."),
  comoChegam: [
    "A Alemanha soma 5 pontos e ocupa o 3º lugar, uma campanha abaixo do que se espera de uma das favoritas da competição. Venceu só uma vez, justamente a Sérvia, por 2 a 0 em casa, e empatou com a Holanda (1 a 1) e com a Grécia (0 a 0). A derrota por 1 a 0 para os gregos, em casa, na 2ª rodada, é o que deixa o time atrás dos líderes. A defesa sofreu apenas 2 gols; o problema está no ataque, que fez só 3.",
    "A Sérvia ainda não pontuou. Perdeu os quatro jogos, três deles por um gol de diferença: 2 a 1 para a Grécia em casa e duas vezes 2 a 1 para a Holanda. Marcou 3 gols e sofreu 8, e chega à penúltima rodada na lanterna, precisando vencer para não ver o rebaixamento à Liga B ficar ainda mais perto.",
  ],
  extraRows: [["Líderes (vaga nas quartas)", "Holanda e Grécia, 8 pontos"], ["3º lugar", "vai ao playoff contra o rebaixamento"]],
  emJogo: [
    "Os dois primeiros do grupo avançam às quartas de final; o 3º disputa um playoff para não cair, e o 4º desce direto para a Liga B. A Alemanha está a 3 pontos de Holanda e Grécia, que se enfrentam no mesmo horário em Amsterdã. Uma vitória em Belgrado deixa os alemães com 8 pontos e, dependendo do resultado do outro jogo, colados nos líderes antes da última rodada, quando recebem a Holanda.",
    "Para a Sérvia, só a vitória interessa. Com 0 pontos e dois jogos por fazer, o time pode chegar no máximo a 6, e qualquer tropeço contra a Alemanha praticamente o condena ao último lugar. A rodada final é na Grécia.",
  ],
  local: [
    "O jogo é no Estádio Rajko Mitić, em Belgrado, a casa do Estrela Vermelha, conhecido como Marakana. O árbitro é o espanhol Javier Alberola Rojas.",
  ],
  faqCanal: "A partida passa no SporTV, na TV fechada, e no geTV, no streaming, às 16h45 de Brasília.",
  faqExtra: [
    ["Quem apita Sérvia x Alemanha?", "O árbitro é o espanhol Javier Alberola Rojas."],
    ["Como está o Grupo 2 da Liga A da Liga das Nações?", "Antes da 5ª rodada: Holanda e Grécia com 8 pontos, Alemanha com 5 e Sérvia com 0. Os dois primeiros vão às quartas de final."],
  ],
  excerpt: "Alemanha visita a Sérvia às 16h45 desta sexta (13/11), em Belgrado, pela Liga das Nações. Veja onde assistir, as prováveis escalações e a situação do Grupo 2.",
  metaDescription: "Saiba onde assistir a Sérvia x Alemanha pela Liga das Nações nesta sexta (13/11), às 16h45, em Belgrado. Veja canal, prováveis escalações e arbitragem.",
}, ctx);
