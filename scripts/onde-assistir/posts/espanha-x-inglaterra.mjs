// Espanha x Inglaterra — Liga das Nações, Liga A · Grupo 3, 6ª rodada, domingo 15/11/2026 16h45. Jogo 15534083.
// Autor: Ivan Alves (1). SporTV (Mantos do Futebol + Guia de TV); Somos Fanáticos diverge (ESPN/Disney+). Árbitro: Clément Turpin (RFEF; Infobae/EFE).
// Desempate (Art. 15.01, sem gol fora no confronto direto): qualquer vitória inglesa dá o 1º lugar à Inglaterra (conta conferida).
import { B, P } from "../lexical.mjs";
import { watchPostV2, DOM15 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: DOM15, matchId: 15534083, authorId: 1, A: "Espanha", Bn: "Inglaterra", hora: "16h45",
  canal: "SporTV", canalLongo: "SporTV (TV fechada)", canalCapaAlt: "no SporTV",
  competicaoLinha: "Liga das Nações 2026/27, Liga A, Grupo 3, 6ª e última rodada",
  localCurto: "Estádio Metropolitano, em Madri (Espanha)", ondeFrase: "no Estádio Metropolitano, casa do Atlético de Madrid, em Madri",
  arbitro: "Clément Turpin (França); VAR: Jérôme Brisard",
  swapHome: [
    ["Yéremy Pino", { name: "Lamine Yamal", number: "", id: "" }],
    ["Fabián Ruiz", { name: "Pedri", number: "", id: "" }],
    ["Ferran Torres", { name: "Mikel Oyarzabal", number: "", id: "" }],
  ],
  lead: P("Reencontro da final da Euro 2024, agora com a ", B("Espanha"), " campeã do mundo. Espanha e ", B("Inglaterra"), " decidem o 1º lugar do Grupo 3 da ", B("Liga das Nações"), " neste domingo (15/11), às ", B("16h45 (de Brasília)"), ", no Estádio Metropolitano, em Madri. A transmissão é do ", B("SporTV"), "."),
  comoChegam: [
    "A Espanha de Luis de la Fuente é a única seleção da chave com 100% de aproveitamento: cinco vitórias em cinco jogos. Na quinta-feira (12), venceu a Tchéquia por 2 a 0 em Praga, com gol de pênalti de Álex Baena e outro de Marc Pubill nos acréscimos, e não deixou o adversário acertar um chute no gol. Desde julho, o time carrega o bicampeonato mundial, conquistado com o 1 a 0 sobre a Argentina na prorrogação, gol de Ferran Torres. Lamine Yamal ficou fora em Praga com dor no joelho, mas o técnico garante que ele tem condições de jogar os 90 minutos, e Oyarzabal se reapresenta depois de perder a última rodada.",
    "A Inglaterra de Thomas Tuchel perdeu a estreia para a própria Espanha, por 3 a 2 em Wembley, e desde então ganhou quatro seguidas, com só um gol sofrido: 2 a 0 na Tchéquia, 7 a 0 na Croácia, 3 a 0 na Tchéquia e 2 a 1 na Croácia. Na quinta, Morgan Rogers abriu o placar e Harry Kane decidiu de pênalti. O jogo marcou a 126ª partida de Kane pela seleção, recorde que era de Peter Shilton, e o gol foi o 92º dele pelos ingleses. Com 7 gols, Kane é o artilheiro da Liga das Nações. \"Queríamos muito essa vitória e acho que merecemos\", disse Tuchel.",
  ],
  cardTitulo: "Situação no Grupo 3 da Liga A", cardSub: "Antes da 6ª e última rodada",
  extraRows: [["Espanha e Inglaterra", "já classificadas às quartas"], ["Espanha", "fica em 1º com empate ou vitória"], ["Inglaterra", "fica em 1º com qualquer vitória"]],
  tabelaTitulo: "Classificação do Grupo 3 da Liga A",
  emJogo: [
    "As duas já estão nas quartas de final, que serão disputadas em março. O que está em jogo é o 1º lugar, que dá o direito de fazer o segundo jogo das quartas em casa. A Espanha tem 15 pontos e precisa só de um empate.",
    "A Inglaterra, com 12, precisa vencer, e qualquer vitória serve. Se ganhar, as duas ficam com 15 pontos e 3 pontos cada no confronto direto. Com vitória inglesa por um gol, o saldo e os gols do confronto direto também empatam, e o desempate vai para o saldo geral, em que a Inglaterra leva vantagem. Com vitória por dois gols ou mais, ela já passa no próprio confronto direto. O regulamento desta edição não usa gol fora de casa como critério.",
    "O histórico é equilibrado e cheio de jogos grandes: a Espanha venceu a final da Euro 2024 por 2 a 1, em Berlim, e o 3 a 2 em Wembley, em setembro; a Inglaterra ganhou por 3 a 2 em Sevilha, na Liga das Nações de 2018.",
  ],
  desfalques: [
    P(B("Espanha: "), "Rodri (lesão na coxa), Dani Olmo (adutor), Ander Barrenetxea e Eric García estão fora."),
    P(B("Inglaterra: "), "Bukayo Saka, com lesão no quadríceps, não joga, e o zagueiro Marc Guéhi foi cortado com problema no quadril; Dan Burn foi chamado no lugar. Ninguém está suspenso."),
  ],
  local: [
    "A arbitragem é do francês Clément Turpin, que apitou a final da Champions de 2022 e dois jogos da Inglaterra na Copa de 2026. Os assistentes são Nicolas Danos e Benjamin Pagès, e o VAR fica com Jérôme Brisard. Será o quarto jogo de Turpin com a Espanha.",
    "O Metropolitano, casa do Atlético de Madrid, recebe a seleção espanhola num dos jogos mais aguardados da rodada. A bola rola às 20h45 em Madri, 16h45 em Brasília.",
  ],
  faqCanal: "A partida tem transmissão do SporTV, na TV fechada, às 16h45 de Brasília. Um dos guias de programação aponta ESPN e Disney+; confira a grade perto do jogo.",
  faqExtra: [
    ["O que a Inglaterra precisa para terminar em 1º no grupo?", "Vencer a Espanha por qualquer placar. Com vitória por um gol, as duas empatam no confronto direto e a Inglaterra fica na frente pelo saldo geral."],
    ["Harry Kane joga Espanha x Inglaterra?", "Sim, Kane está à disposição de Tuchel. Ele é o artilheiro da Liga das Nações, com 7 gols, e virou o jogador com mais partidas pela Inglaterra (126)."],
  ],
  excerpt: "Espanha e Inglaterra decidem o 1º lugar do Grupo 3 da Liga das Nações neste domingo (15/11), às 16h45, em Madri. Veja onde assistir, desfalques e escalações.",
  metaDescription: "Saiba onde assistir a Espanha x Inglaterra neste domingo (15/11), às 16h45, em Madri, pela Liga das Nações. Transmissão do SporTV, desfalques e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
