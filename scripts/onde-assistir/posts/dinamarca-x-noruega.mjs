// Dinamarca x Noruega — Liga das Nações, Liga A · Grupo 4, 6ª e última rodada, terça 17/11/2026 16h45. Jogo 15534099.
// Autor: Lucas Lima (2). Canal: ESPN e Disney+ = FONTE ÚNICA (grade do Goal Brasil, terça 17/11:
//   https://www.goal.com/br/listas/futebol-programacao-jogos-tv-aberta-fechada-onde-assistir-online-app/bltc0a7361374657315)
//   → canalConfirmado:false + ressalva. Mantos do Futebol/futebolnatv ainda sem a grade de terça em 15/11.
// Árbitro: Halil Umut Meler (Turquia) só na Wikipedia → omitido.
// Cenários: UEFA, "Nations League: latest on quarter-final qualification" (Dinamarca nas quartas se não perder; 1º se vencer e
//   Portugal perder; derrota pode levar ao play-off A/B conforme outros grupos; Noruega nas quartas só vencendo, senão play-off A/B):
//   https://www.uefa.com/uefanationsleague/news/02ab-2209792f2fda-6a523d4500bb-1000--nations-league-latest-on-quarter-final-qualification-prom/
//   Contas à mão conferem (confronto direto: Noruega 3x2 no 1º turno; Dinamarca 4x1 e 2x4 com Portugal).
// Gols do sábado (14) e do 1º turno: API (lance a lance do snapshot) + Wikipedia. Joachim Andersen saiu lesionado aos 82' em Braga
//   (API, fonte única: citado só como fato do jogo, condição para terça "não confirmada"; sem swap).
// Haaland 4 gols na campanha (2 x Dinamarca, 1 x Portugal, 1 x Gales); Højlund 5 (Wikipedia R1–R4 + API R5).
// Estádio: Parken, Copenhague (API + Wikipedia).
import { B, P } from "../lexical.mjs";
import { watchPostV2, TER17 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: TER17, matchId: 15534099, authorId: 2, A: "Dinamarca", Bn: "Noruega", hora: "16h45",
  canal: "ESPN e Disney+", canalConfirmado: false, canalLongo: "ESPN (TV fechada) e Disney+ (streaming), segundo a programação; confirme perto do jogo", canalCapaAlt: "ao vivo na ESPN e no Disney+",
  competicaoLinha: "Liga das Nações 2026/27, Liga A, Grupo 4, 6ª e última rodada",
  localCurto: "Parken, em Copenhague (Dinamarca)", ondeFrase: "no Parken, em Copenhague, na Dinamarca",
  lead: P("A ", B("Dinamarca"), " recebe a ", B("Noruega"), " nesta terça-feira (17/11), às ", B("16h45 (de Brasília)"), ", no Parken, em Copenhague, num clássico escandinavo que vale vaga nas quartas de final da ", B("Liga das Nações"), ". Um empate basta aos dinamarqueses; Erling Haaland e companhia precisam vencer. A programação indica transmissão da ", B("ESPN"), " e do ", B("Disney+"), "."),
  comoChegam: [
    "A Dinamarca de Brian Riemer conseguiu sua maior vitória na competição no sábado (14): goleou Portugal por 4 a 1 em Braga, com gols de Pierre-Emile Højbjerg, de pênalti, Joachim Andersen e dois de Rasmus Højlund. O atacante chegou a 5 gols na campanha e é o artilheiro do time. Andersen deixou o campo machucado a oito minutos do fim, e a condição dele para terça não foi confirmada.",
    "A Noruega de Ståle Solbakken chega embalada pelos 3 a 1 sobre o País de Gales, em Oslo, também no sábado, com gols de Antonio Nusa, Andreas Schjelderup e Haaland, de pênalti. Foi a segunda vitória do time no grupo; a primeira foi justamente contra a Dinamarca, por 3 a 2, na estreia, em setembro, com dois gols de Haaland e um de Oscar Bobb. O camisa 9 soma 4 gols nesta Liga das Nações.",
  ],
  cardTitulo: "Situação no Grupo 4 da Liga A", cardSub: "Antes da 6ª e última rodada",
  extraRows: [["Dinamarca", "nas quartas com empate ou vitória"], ["Noruega", "precisa vencer para ir às quartas"], ["Portugal", "já classificado às quartas"]],
  tabelaTitulo: "Classificação do Grupo 4 da Liga A",
  emJogo: [
    "Portugal, com 12 pontos, já está nas quartas, que serão disputadas em março. A outra vaga fica entre Dinamarca (9) e Noruega (6). Um empate garante os dinamarqueses. Se a Noruega vencer, as duas terminam com 9 pontos e os noruegueses passam pelo confronto direto, com duas vitórias. Se a Dinamarca vencer e Portugal perder para o País de Gales em Cardiff, no mesmo horário, os dinamarqueses ainda tomam o 1º lugar: ficariam com 12 pontos, como Portugal, e levam vantagem no confronto direto (perderam por 4 a 2 em casa e ganharam por 4 a 1 fora).",
    "Quem ficar com o 3º lugar não cai, mas pode ir a um play-off contra uma seleção da Liga B em março. Na Liga A, só os dois melhores 3º colocados dos quatro grupos ficam livres desse play-off. Para a Noruega, sem a vitória, o caminho é o play-off, segundo a UEFA. Se a Dinamarca perder e cair para 3º, com 9 pontos, a vaga direta na Liga A passa a depender dos 3º colocados dos outros grupos.",
  ],
  local: [
    "O Parken, o estádio nacional dinamarquês, também é a casa do Copenhague. O 3 a 2 norueguês em Oslo foi a única derrota da Dinamarca para um adversário que não fosse Portugal nesta edição. A bola rola às 20h45 no horário local.",
  ],
  faqCanal: "A programação indica transmissão da ESPN, na TV fechada, e do Disney+, no streaming, às 16h45 de Brasília. Como só um guia confirmou o canal até agora, vale conferir perto do jogo.",
  faqExtra: [
    ["O que a Noruega precisa para ir às quartas da Liga das Nações?", "Vencer a Dinamarca por qualquer placar. Com 9 pontos para cada, a Noruega fica em 2º pelo confronto direto, porque também ganhou o jogo de ida, por 3 a 2."],
    ["Haaland joga Dinamarca x Noruega?", "A tendência é que sim. Haaland jogou e marcou de pênalti contra o País de Gales no sábado (14) e tem 4 gols nesta Liga das Nações. A escalação oficial sai cerca de uma hora antes do jogo."],
  ],
  excerpt: "Dinamarca e Noruega decidem uma vaga nas quartas da Liga das Nações nesta terça (17/11), às 16h45, em Copenhague. Veja onde assistir e escalações.",
  metaDescription: "Saiba onde assistir a Dinamarca x Noruega nesta terça (17/11), às 16h45, em Copenhague, pela Liga das Nações. Canal, cenários e prováveis escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
