// Letônia x Armênia — Liga das Nações, Liga C · Grupo 2, 6ª rodada, domingo 15/11/2026 11h. Jogo 15537776.
// Autor: Ivan Alves (1). Disney+ (futebolnatv + futebolplus). Árbitro: Vasilios Fotias (fonte única).
import { B, P } from "../lexical.mjs";
import { watchPostV2, DOM15 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: DOM15, matchId: 15537776, authorId: 1, A: "Letônia", Bn: "Armênia", hora: "11h",
  canal: "Disney+", canalLongo: "Disney+ (streaming)", canalCapaAlt: "no Disney+",
  competicaoLinha: "Liga das Nações 2026/27, Liga C, Grupo 2, 6ª e última rodada",
  localCurto: "Estádio Skonto, em Riga (Letônia)", ondeFrase: "no Estádio Skonto, em Riga, na Letônia",
  arbitro: "Vasilios Fotias (Grécia)",
  lead: P("Sem chance de mudar de posição, ", B("Letônia"), " e ", B("Armênia"), " se despedem da fase de grupos da ", B("Liga das Nações"), " neste domingo (15/11), às ", B("11h (de Brasília)"), ", no Estádio Skonto, em Riga. O jogo do Grupo 2 da Liga C tem transmissão do ", B("Disney+"), "."),
  comoChegam: [
    "A Letônia do técnico italiano Paolo Nicolato perdeu para Montenegro por 2 a 1 em Podgorica, na quinta-feira (12), com o gol da derrota nos acréscimos. O zagueiro Deniss Meļņiks marcou o primeiro gol dele pela seleção. O time jogou sem Markuss Strods, doente, e sem Maksims Toņiševs, que ficou em casa para o nascimento do filho. Em cinco rodadas, os letões somaram só 1 ponto, no 0 a 0 com o Chipre.",
    "A Armênia de Yeghishe Melikyan empatou por 1 a 1 com o Chipre em Yerevan. Artur Gharibyan marcou aos 13 do segundo tempo, com passe de Serobyan, e Narek Grigoryan ainda teve um gol anulado por falta. Gharibyan é o artilheiro armênio na campanha, com 2 gols. A delegação viajou para Riga na sexta-feira (13).",
  ],
  cardTitulo: "Situação no Grupo 2 da Liga C", cardSub: "Antes da 6ª e última rodada",
  extraRows: [["Armênia", "3º lugar já garantido"], ["Letônia", "termina em 4º, mas não cai"]],
  tabelaTitulo: "Classificação do Grupo 2 da Liga C",
  emJogo: [
    "A classificação está fechada. A Armênia, com 5 pontos, já é a 3ª colocada, porque a Letônia chega no máximo a 4. Os letões terminam em 4º, mas não serão rebaixados: com a mudança de formato da competição a partir de 2028/29, os 3º e 4º colocados da Liga C continuam na Liga C.",
    "Resta o orgulho. Para a Letônia, seria a primeira vitória nesta edição. A Armênia leva vantagem recente no confronto: venceu 4 dos últimos 5 jogos, incluindo o 2 a 0 do 1º turno, em Yerevan, e o 2 a 1 em Riga pela Liga das Nações de 2024/25.",
  ],
  local: [
    "O árbitro é o grego Vasilios Fotias. A bola rola às 16h no horário de Riga, 11h em Brasília. Na Letônia, o jogo passa na TV aberta, na LTV7.",
  ],
  faqCanal: "A partida tem transmissão do Disney+, no streaming, às 11h de Brasília.",
  faqExtra: [
    ["A Letônia vai ser rebaixada na Liga das Nações?", "Não. Mesmo terminando em 4º no Grupo 2, a Letônia continua na Liga C, porque a competição muda de formato em 2028/29 e ninguém da Liga C cai."],
    ["Quem venceu o primeiro jogo entre Letônia e Armênia nesta Liga das Nações?", "A Armênia, por 2 a 0, em Yerevan, em 25 de setembro."],
  ],
  excerpt: "Letônia e Armênia fazem o último jogo do Grupo 2 da Liga C neste domingo (15/11), às 11h, em Riga. Veja onde assistir e as prováveis escalações.",
  metaDescription: "Saiba onde assistir a Letônia x Armênia neste domingo (15/11), às 11h, em Riga, pela Liga das Nações. Transmissão do Disney+ e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
