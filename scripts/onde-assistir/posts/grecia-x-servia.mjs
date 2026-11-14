// Grécia x Sérvia — Liga das Nações, Liga A · Grupo 2, 6ª rodada, segunda 16/11/2026 16h45. Jogo 15534072.
// Autor: Lucas Lima (2). SporTV: Mantos do Futebol (https://mantosdofutebol.com.br/jogos-de-amanha-tv/),
//   meuguia.tv (https://meuguia.tv/programacao/canal/SPO, seg 16/11 16h15 "Grécia x Sérvia - Ao Vivo") e
//   Guia de TV (https://www.guiadetv.com/canal/sportv, "no Panthessaliko, em Vólos").
// Local: Panthessaliko, Volos (snapshot da API + Guia de TV + Wikipedia + metrosport.gr). Árbitro: não divulgado (omitido).
// Desfalques Sérvia: Živković e Dragojević expulsos em Belgrado (Vavel + TNT Sports; suspensão de Živković em gazzetta.gr e metrosport.gr).
//   Vlahović e Kostić fora da lista (athletiko.gr + alphatv.gr). Stanković (lesão, só athletiko.gr) NÃO entra. Nenhum dos dois expulsos está no XI provável.
// Grécia: Zafeiris e Saliakas cumpriram suspensão em Amsterdã e voltam (protinews.com.gr + gazzetta.gr).
// 7x0: gol de Ioannidis anulado por mão (sport24.gr). Virada no 1º turno em Belgrado (goal.com + Vavel).
// Cenários conferidos à mão, coerentes com alemanha-x-holanda.mjs (ver conta completa lá):
//   GRE 2º se: NED vence (qualquer resultado da Grécia) OU empate em Berlim e Grécia vence/empata.
//   GRE 3º se: Alemanha vence (inclusive com vitória grega: tríplice a 11, saldo do minitorneio GRE -6) OU empate em Berlim e Grécia perde.
import { B, P } from "../lexical.mjs";
import { watchPostV2, SEG16 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: SEG16, matchId: 15534072, authorId: 2, A: "Grécia", Bn: "Sérvia", hora: "16h45",
  canal: "SporTV", canalLongo: "SporTV (TV fechada)", canalCapaAlt: "no SporTV",
  competicaoLinha: "Liga das Nações 2026/27, Liga A, Grupo 2, 6ª e última rodada",
  localCurto: "Estádio Panthessaliko, em Volos (Grécia)", ondeFrase: "no Estádio Panthessaliko, em Volos, na Grécia",
  lead: P("A ", B("Grécia"), " recebe a ", B("Sérvia"), " nesta segunda-feira (16/11), às ", B("16h45 (de Brasília)"), ", no Estádio Panthessaliko, em Volos, de olho também em Berlim, onde se decide se os gregos vão às quartas de final da ", B("Liga das Nações"), ". O jogo da última rodada do Grupo 2 da Liga A tem transmissão do ", B("SporTV"), ", na TV fechada."),
  comoChegam: [
    "A Grécia de Ivan Jovanović estava invicta até a sexta-feira (13), quando levou 7 a 0 da Holanda em Amsterdã. Tijjani Reijnders fez três gols no primeiro tempo, e os gregos ainda tiveram um gol de Fotis Ioannidis anulado pelo VAR, por toque de mão. Mesmo assim, seguem em 2º, com 8 pontos, à frente da Alemanha pelo confronto direto: venceram por 1 a 0 em território alemão e empataram por 0 a 0 em casa. A goleada, porém, deixou o saldo em -5.",
    "A Sérvia de Veljko Paunović perdeu os cinco jogos e já está definida em 4º. Na sexta, caiu por 3 a 1 para a Alemanha em Belgrado: Srđan Babić marcou contra logo no início e depois descontou, e o time terminou com nove jogadores. No 1º turno, também em Belgrado, a Grécia ganhou por 2 a 1, de virada.",
  ],
  cardTitulo: "Situação no Grupo 2 da Liga A", cardSub: "Antes da 6ª e última rodada",
  extraRows: [["Classificação às quartas", "1º e 2º colocados"], ["Sérvia", "4º lugar já definido"], ["Jogo no mesmo horário", "Alemanha x Holanda, em Berlim"]],
  tabelaTitulo: "Classificação do Grupo 2 da Liga A",
  emJogo: [
    "A vaga grega depende do que acontecer em Berlim, no mesmo horário. Se a Holanda vencer a Alemanha, a Grécia passa até perdendo, porque um empate em pontos com os alemães se resolve pelo confronto direto, favorável aos gregos. Se Alemanha e Holanda empatarem, basta à Grécia não perder. O cenário ruim é a vitória alemã: aí a Grécia termina em 3º mesmo goleando a Sérvia, já que o empate triplo com 11 pontos se decide nos jogos entre as três seleções, e o 7 a 0 em Amsterdã deixa os gregos com o pior saldo nesse recorte.",
    "O 3º lugar não significa queda. Os terceiros das quatro chaves da Liga A são comparados por pontos e saldo: os dois melhores continuam na elite, e os dois piores disputam em março um play-off contra os vice-líderes da Liga B. Para a Sérvia, vale a comparação entre os últimos colocados: os dois melhores vão a esse play-off, e os dois piores caem direto para a Liga B. Antes da rodada final, o saldo sérvio (-7) era melhor que os de Turquia e Tchéquia (-10 cada), também sem pontos.",
  ],
  desfalques: [
    P(B("Sérvia: "), "Andrija Živković e Vanja Dragojević foram expulsos contra a Alemanha e cumprem suspensão. O atacante Dušan Vlahović e o ala Filip Kostić também estão fora da lista."),
    P(B("Grécia: "), "o meia Christos Zafeiris e o lateral Manolis Saliakas, suspensos contra a Holanda, voltam a ficar à disposição de Jovanović."),
  ],
  local: [
    "O Panthessaliko, em Volos, foi construído para os Jogos Olímpicos de Atenas, em 2004, e recebeu partidas do torneio de futebol. A UEFA ainda não divulgou a arbitragem. A bola rola às 21h45 no horário grego.",
  ],
  faqCanal: "A partida tem transmissão do SporTV, na TV fechada, às 16h45 de Brasília.",
  faqExtra: [
    ["A Grécia se classifica com um empate contra a Sérvia?", "Sim, desde que a Alemanha não vença a Holanda no mesmo horário. Se os alemães vencerem, a Grécia termina em 3º com qualquer resultado em Volos."],
    ["A Sérvia pode ser rebaixada na Liga das Nações?", "A Sérvia já é a 4ª do Grupo 2. Os dois melhores quartos colocados da Liga A vão a um play-off em março contra seleções da Liga B; os dois piores caem direto para a Liga B."],
  ],
  excerpt: "Grécia e Sérvia jogam nesta segunda (16/11), às 16h45, em Volos. Os gregos dependem também de Alemanha x Holanda. Veja onde assistir e as escalações.",
  metaDescription: "Saiba onde assistir a Grécia x Sérvia nesta segunda (16/11), às 16h45, em Volos, pela Liga das Nações. Transmissão do SporTV, cenários e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
