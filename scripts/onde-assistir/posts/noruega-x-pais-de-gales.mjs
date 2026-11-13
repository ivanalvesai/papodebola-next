// Noruega x País de Gales — Liga das Nações, Liga A · Grupo 4, 5ª rodada, sábado 14/11/2026 14h. Jogo 15534103.
// Autor: Ivan Alves (1). ESPN (um guia cita também Disney+). Árbitro: Oleksiy Derevinskyi.
import { B, P } from "../lexical.mjs";
import { watchPostV2, SAB14 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: SAB14, matchId: 15534103, authorId: 1, A: "Noruega", Bn: "País de Gales", hora: "14h",
  canal: "ESPN e Disney+", canalLongo: "ESPN (TV fechada) e Disney+ (streaming)", canalCapaAlt: "na ESPN e no Disney+",
  competicaoLinha: "Liga das Nações 2026/27, Liga A, Grupo 4, 5ª rodada",
  localCurto: "Ullevaal Stadion, em Oslo (Noruega)", ondeFrase: "no Ullevaal Stadion, em Oslo, na Noruega",
  arbitro: "Oleksiy Derevinskyi (Ucrânia)",
  lead: P("A ", B("Noruega"), " de Erling Haaland recebe o ", B("País de Gales"), " neste sábado (14/11), às ", B("14h (de Brasília)"), ", no Ullevaal, em Oslo, num duelo de seleções com 3 pontos no Grupo 4 da Liga A da ", B("Liga das Nações"), ". O jogo tem transmissão da ", B("ESPN"), " e do ", B("Disney+"), "."),
  comoChegam: [
    "A Noruega estreou com vitória por 3 a 2 sobre a Dinamarca e depois perdeu três jogos seguidos, todos por 2 a 1: dois para Portugal e um para o País de Gales. Haaland, com 3 gols, e Martin Ødegaard ficaram fora de um treino na terça-feira (10), mas voltaram no dia seguinte; o técnico Ståle Solbakken chamou os problemas de leves. O atacante Jørgen Strand Larsen foi cortado com uma lesão no tornozelo, e Erik Botheim, do Viking, entrou no lugar.",
    "O País de Gales de Craig Bellamy venceu justamente a Noruega por 2 a 1, em Cardiff, no 1º turno, a primeira vitória da história galesa na Liga A. Perdeu os outros três jogos, para Portugal (1 a 0) e Dinamarca (2 a 0 e 1 a 0). Harry Wilson, Joe Rodon e o goleiro Karl Darlow voltam à lista depois de perder as datas de setembro e outubro; o meia Jordan James foi cortado por lesão.",
  ],
  cardTitulo: "Situação no Grupo 4 da Liga A", cardSub: "Antes da 5ª rodada",
  extraRows: [["Líder", "Portugal, 12 pontos (já nas quartas)"], ["2º lugar (quartas)", "Dinamarca, 6 pontos"]],
  tabelaTitulo: "Classificação do Grupo 4 da Liga A",
  emJogo: [
    "Na Liga A, os dois primeiros de cada grupo vão às quartas de final, em março. Entre os 3º colocados dos quatro grupos, os dois piores jogam um playoff contra o rebaixamento; entre os 4º, os dois piores caem direto para a Liga B e os outros dois vão ao playoff.",
    "Quem vencer em Oslo chega a 6 pontos, encosta na Dinamarca e segue sonhando com a vaga nas quartas. Quem perder fica perto da zona de rebaixamento. Depois deste jogo, a Noruega visita a Dinamarca em Copenhague, e o País de Gales recebe Portugal em Cardiff, com ingressos esgotados.",
  ],
  local: [
    "A arbitragem é do ucraniano Oleksiy Derevinskyi.",
    "O Ullevaal Stadion, em Oslo, é o estádio nacional da Noruega.",
  ],
  faqCanal: "A partida tem transmissão da ESPN, na TV fechada, às 14h de Brasília; um dos guias de programação aponta também o Disney+, no streaming.",
  faqExtra: [
    ["Haaland joga contra o País de Gales?", "Haaland ficou fora de um treino na terça-feira (10), mas voltou a treinar no dia seguinte, e o técnico Ståle Solbakken tratou o problema como leve. A tendência é que jogue."],
    ["Como está o Grupo 4 da Liga A da Liga das Nações?", "Antes da 5ª rodada: Portugal com 12 pontos, Dinamarca com 6, e País de Gales e Noruega com 3."],
  ],
  excerpt: "Noruega e País de Gales se enfrentam às 14h deste sábado (14/11), em Oslo, pela Liga das Nações. Veja onde assistir, as prováveis escalações e a tabela do Grupo 4.",
  metaDescription: "Saiba onde assistir a Noruega x País de Gales neste sábado (14/11), às 14h, em Oslo, pela Liga das Nações. Transmissão da ESPN, escalações e a tabela do grupo.",
};
export default (ctx) => watchPostV2(opts, ctx);
