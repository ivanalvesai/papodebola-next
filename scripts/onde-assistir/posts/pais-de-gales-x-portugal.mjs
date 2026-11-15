// País de Gales x Portugal — Liga das Nações, Liga A · Grupo 4, 6ª e última rodada, terça 17/11/2026 16h45. Jogo 15534098.
// Autor: Ivan Alves (1). Canal: SporTV = FONTE ÚNICA (grade do Goal Brasil, terça 17/11:
//   https://www.goal.com/br/listas/futebol-programacao-jogos-tv-aberta-fechada-onde-assistir-online-app/bltc0a7361374657315)
//   → canalConfirmado:false + ressalva. Mantos do Futebol/futebolnatv ainda sem a grade de terça em 15/11.
// Árbitro: Sven Jablonski (Alemanha) só na Wikipedia → omitido.
// Cenários: UEFA, "Nations League: latest on quarter-final qualification" (Portugal 1º se não perder ou se a Dinamarca não vencer;
//   Gales confirmado em 4º, vai ao play-off A/B se não perder):
//   https://www.uefa.com/uefanationsleague/news/02ab-2209792f2fda-6a523d4500bb-1000--nations-league-latest-on-quarter-final-qualification-prom/
//   Formato (2 piores 4º caem, 2 melhores vão ao play-off): https://www.uefa.com/uefanationsleague/news/0298-1d6ef1acfaef-b54fcf1da859-1000--2026-27-uefa-nations-league-all-you-need-to-know
//   Ranking dos 4º antes da rodada (Gales 3 pts; Sérvia, Turquia e Tchéquia 0): Wikipedia 2026–27 UEFA Nations League A + tabela da API.
//   Critérios entre grupos (pontos, saldo, gols...): Regulamento art. 19.01 (documents.uefa.com).
// Gols do sábado (14): API (lance a lance do nosso snapshot) + Wikipedia. Neco Williams saiu lesionado (API, fonte única: só citado como fato do jogo).
// Desfalque: Francisco Conceição, 3 jogos de suspensão pela expulsão contra a Noruega (RTP, dnoticias.pt, Flashscore).
// Estádio: Cardiff City Stadium (API + FAW "venues confirmed" + Wikipedia).
import { B, P } from "../lexical.mjs";
import { watchPostV2, TER17 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: TER17, matchId: 15534098, authorId: 1, A: "País de Gales", Bn: "Portugal", hora: "16h45",
  canal: "SporTV", canalConfirmado: false, canalLongo: "SporTV (TV fechada), segundo a programação; confirme perto do jogo", canalCapaAlt: "no SporTV",
  competicaoLinha: "Liga das Nações 2026/27, Liga A, Grupo 4, 6ª e última rodada",
  localCurto: "Cardiff City Stadium, em Cardiff (País de Gales)", ondeFrase: "no Cardiff City Stadium, em Cardiff, no País de Gales",
  lead: P("O ", B("País de Gales"), " recebe ", B("Portugal"), " nesta terça-feira (17/11), às ", B("16h45 (de Brasília)"), ", em Cardiff, na última rodada do Grupo 4 da Liga A da ", B("Liga das Nações"), ". Os portugueses jogam pelo 1º lugar; os galeses, para escapar da queda direta. A programação indica transmissão do ", B("SporTV"), "."),
  comoChegam: [
    "O País de Gales de Craig Bellamy perdeu para a Noruega por 3 a 1 em Oslo, no sábado (14). Antonio Nusa, Andreas Schjelderup e Erling Haaland, de pênalti, marcaram para os noruegueses; David Brooks descontou. O lateral Neco Williams, autor do gol da vitória sobre a própria Noruega em Cardiff, em outubro, saiu machucado no segundo tempo. Com 3 pontos e só 3 gols marcados em cinco jogos, Gales já não sai do 4º lugar.",
    "Portugal, de Jorge Jesus, chegou ao sábado com quatro vitórias em quatro jogos e saiu de Braga goleado: 4 a 1 para a Dinamarca, com dois gols de Rasmus Højlund. Bernardo Silva fez o gol de honra nos acréscimos. A derrota não muda a vaga nas quartas de final, garantida antes, mas deixou o 1º lugar em aberto. No 1º turno, em Lisboa, os portugueses venceram Gales por 1 a 0, gol de João Félix.",
  ],
  cardTitulo: "Situação no Grupo 4 da Liga A", cardSub: "Antes da 6ª e última rodada",
  extraRows: [["Portugal", "1º com empate ou vitória"], ["País de Gales", "4º garantido; empate evita a queda direta"]],
  tabelaTitulo: "Classificação do Grupo 4 da Liga A",
  emJogo: [
    "Portugal tem 12 pontos e a Dinamarca, 9. Um empate em Cardiff garante o 1º lugar português, que dá o direito de jogar a volta das quartas de final em casa, em março. Se Portugal perder e a Dinamarca vencer a Noruega em Copenhague, no mesmo horário, as duas empatam em 12 pontos e os dinamarqueses ficam com a liderança pelo confronto direto: Portugal ganhou por 4 a 2 lá e perdeu por 4 a 1 em casa.",
    "Na Liga A, os dois piores 4º colocados dos quatro grupos caem direto para a Liga B, e os dois melhores disputam um play-off contra o rebaixamento em março. O País de Gales é o único 4º com pontos. Sérvia, Turquia e Tchéquia perderam todos os jogos e fecham a campanha no domingo (15) e na segunda-feira (16). Como elas podem chegar no máximo a 3 pontos, um empate leva Gales ao play-off. Se perder, o time fica na dependência desses resultados: o ranking entre grupos vai por pontos, saldo de gols e gols marcados.",
  ],
  desfalques: [
    P(B("Portugal: "), "o atacante Francisco Conceição segue suspenso. A UEFA deu a ele três jogos de gancho pela expulsão contra a Noruega, em outubro."),
  ],
  local: [
    "O Cardiff City Stadium, casa do Cardiff City, é o palco dos jogos de Gales nesta Liga das Nações. Foi lá que os galeses bateram a Noruega por 2 a 1, em outubro, na única vitória deles nesta edição. A bola rola às 19h45 no horário local.",
  ],
  faqCanal: "A programação indica transmissão do SporTV, na TV fechada, às 16h45 de Brasília. Como só um guia confirmou o canal até agora, vale conferir perto do jogo.",
  faqExtra: [
    ["O que Portugal precisa para terminar em 1º no grupo?", "Basta não perder para o País de Gales. Se perder, Portugal ainda fica em 1º caso a Dinamarca não vença a Noruega."],
    ["O País de Gales pode ser rebaixado na Liga das Nações?", "Pode. Gales já terminou em 4º no grupo. Com empate ou vitória, vai ao play-off de março contra uma seleção da Liga B. Se perder, pode cair direto, dependendo dos resultados de Sérvia, Turquia e Tchéquia."],
  ],
  excerpt: "País de Gales e Portugal fecham o Grupo 4 da Liga das Nações nesta terça (17/11), às 16h45, em Cardiff. Veja onde assistir, cenários e escalações.",
  metaDescription: "Saiba onde assistir a País de Gales x Portugal nesta terça (17/11), às 16h45, em Cardiff, pela Liga das Nações. Canal, cenários do grupo e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
