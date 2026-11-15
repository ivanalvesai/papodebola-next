// Ucrânia x Geórgia — Liga das Nações, Liga B · Grupo 2, 6ª e última rodada, terça 17/11/2026 16h45. Jogo 15534134.
// Autor: Lucas Lima (2). Canal: canal da ESPN Brasil no YouTube + Disney+ = FONTE ÚNICA (grade do Goal Brasil, consultada em 15/11,
//   https://www.goal.com/br/listas/futebol-programacao-jogos-tv-aberta-fechada-onde-assistir-online-app/bltc0a7361374657315)
//   → canalConfirmado:false. Rever na segunda (16) com mantosdofutebol.com.br/jogos-de-amanha-tv.
// Árbitro: não divulgado (omitido).
// Estádio: Košická futbalová aréna, Košice (Eslováquia) — snapshot da API + unn.ua
//   (https://unn.ua/en/news/the-ukrainian-national-team-will-host-georgia-in-kosice-in-the-nations-league) + 112.ua.
// Contas: UCR 4 x GEO 2. Ucrânia fica em 3º com vitória ou empate (5 x 3); Geórgia só sobe ao 3º vencendo (5 x 4).
//   Não há empate em pontos possível; o 0 a 0 de Tbilisi (1º turno) não entra. 1º/2º fora de alcance (HUN 10, NI 11).
// Resultados da 5ª: Irlanda do Norte 1 x 0 Ucrânia (Terry Devlin, 68') — lovebelfast.co.uk + 112.ua;
//   Geórgia 0 x 2 Hungria (gol contra de Lasha Dvali 73', Barnabás Varga 85') — ESPN + FotMob.
// Desfalques: nenhum confirmado por 2 fontes (seção omitida). Técnicos: Andrea Maldera (UCR), Ramaz Svanadze (GEO) — guias anteriores.
import { B, P } from "../lexical.mjs";
import { watchPostV2, TER17 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: TER17, matchId: 15534134, authorId: 2, A: "Ucrânia", Bn: "Geórgia", hora: "16h45",
  canal: "ESPN Brasil (YouTube) e Disney+", canalConfirmado: false, canalLongo: "canal da ESPN Brasil no YouTube e Disney+ (streaming), segundo a programação; confirme perto do jogo", canalCapaAlt: "no YouTube da ESPN Brasil e no Disney+",
  competicaoLinha: "Liga das Nações 2026/27, Liga B, Grupo 2, 6ª e última rodada",
  localCurto: "Košická futbalová aréna, em Košice (Eslováquia)", ondeFrase: "na Košická futbalová aréna, em Košice, na Eslováquia",
  lead: P("A ", B("Ucrânia"), " enfrenta a ", B("Geórgia"), " nesta terça-feira (17/11), às ", B("16h45 (de Brasília)"), ", em Košice, na Eslováquia, num confronto direto para fugir do 4º lugar do Grupo 2 da Liga B da ", B("Liga das Nações"), ". Um empate basta aos ucranianos. A programação indica transmissão no canal da ", B("ESPN Brasil no YouTube"), " e no ", B("Disney+"), "."),
  comoChegam: [
    "A Ucrânia do italiano Andrea Maldera soma 4 pontos e perdeu os dois jogos de novembro. No sábado (14), caiu por 1 a 0 diante da Irlanda do Norte, em Belfast, com um chute de Terry Devlin no ângulo de Anatoliy Trubin no 2º tempo. O ataque é o problema: foram só 2 gols em cinco rodadas, ambos contra a Hungria. Como não pode jogar em casa por causa da guerra, a seleção usa a Eslováquia como sede.",
    "A Geórgia de Ramaz Svanadze é a lanterna, com 2 pontos, e ainda não marcou gol nesta Liga das Nações. No sábado, segurou o 0 a 0 com a Hungria até os 28 minutos do 2º tempo, quando Lasha Dvali desviou contra a própria rede; Barnabás Varga fechou o 2 a 0 no fim. Os dois pontos georgianos vieram de empates sem gols, um deles contra a própria Ucrânia, em Tbilisi.",
  ],
  cardTitulo: "Situação no Grupo 2 da Liga B", cardSub: "Antes da 6ª e última rodada",
  extraRows: [["Ucrânia", "fica em 3º com vitória ou empate"], ["Geórgia", "precisa vencer para escapar do 4º lugar"]],
  tabelaTitulo: "Classificação do Grupo 2 da Liga B",
  emJogo: [
    "Na Liga B, o 3º colocado permanece na divisão e o 4º disputa em março um play-off de ida e volta contra um 2º colocado da Liga C, com risco de rebaixamento. A Ucrânia tem dois pontos de vantagem: vitória ou empate garante o 3º lugar. A Geórgia só passa à frente se vencer, porque chegaria a 5 pontos contra 4. Como as duas não podem terminar empatadas em pontos, o 0 a 0 do 1º turno não serve de critério.",
    "O topo do grupo está fora de alcance para as duas. Irlanda do Norte, com 11 pontos, e Hungria, com 10, decidem o acesso à Liga A no mesmo horário, em Budapeste.",
  ],
  local: [
    "Košice, no leste da Eslováquia, fica perto da fronteira com a Ucrânia, e a arena da cidade virou a casa da seleção nesta edição da Liga das Nações. A bola rola às 20h45 no horário local.",
  ],
  faqCanal: "A programação indica transmissão no canal da ESPN Brasil no YouTube e no Disney+, às 16h45 de Brasília. Como só um guia confirmou o canal até agora, vale conferir perto do jogo.",
  faqExtra: [
    ["O empate serve para a Ucrânia?", "Sim. Com empate, a Ucrânia termina com 5 pontos, contra 3 da Geórgia, e fica com o 3º lugar, que garante a permanência na Liga B."],
    ["A Geórgia já marcou gol nesta Liga das Nações?", "Não. Em cinco jogos, a Geórgia empatou dois por 0 a 0 e perdeu três, sem marcar nenhum gol."],
  ],
  excerpt: "Ucrânia e Geórgia brigam para fugir do 4º lugar nesta terça (17/11), às 16h45, em Košice, pela Liga das Nações. Veja onde assistir e as prováveis escalações.",
  metaDescription: "Saiba onde assistir a Ucrânia x Geórgia nesta terça (17/11), às 16h45, em Košice, pela Liga das Nações. Canal, o que está em jogo e prováveis escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
