// Irlanda do Norte x Ucrânia — Liga das Nações, Liga B · Grupo 2, 5ª rodada, sábado 14/11/2026 16h45. Jogo 15534137.
// Autor: Lucas Lima (2). Disney+ (guias de programação). Árbitro: François Letexier.
import { B, P } from "../lexical.mjs";
import { watchPostV2, SAB14 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: SAB14, matchId: 15534137, authorId: 2, A: "Irlanda do Norte", Bn: "Ucrânia", hora: "16h45",
  canal: "Disney+", canalLongo: "Disney+ (streaming)", canalCapaAlt: "no Disney+",
  competicaoLinha: "Liga das Nações 2026/27, Liga B, Grupo 2, 5ª rodada",
  localCurto: "Windsor Park, em Belfast (Irlanda do Norte)", ondeFrase: "no Windsor Park, em Belfast, na Irlanda do Norte",
  arbitro: "François Letexier (França)",
  lead: P("Líder invicta e sem gols sofridos, a ", B("Irlanda do Norte"), " recebe a ", B("Ucrânia"), " neste sábado (14/11), às ", B("16h45 (de Brasília)"), ", no Windsor Park, em Belfast, pelo Grupo 2 da Liga B da ", B("Liga das Nações"), ". O jogo tem transmissão do ", B("Disney+"), "."),
  comoChegam: [
    "A Irlanda do Norte de Michael O'Neill é a surpresa do grupo: lidera com 8 pontos, não perdeu e não levou gol em quatro jogos. O curioso é que todos os gols saíram fora de casa; em Belfast, foram dois empates por 0 a 0, com Hungria e Geórgia. O zagueiro Ciaron Brown é o artilheiro da campanha, com 2 gols. A lista tem as primeiras convocações de Dermot Mee e Eoin Kenny, mas uma série de baixas: Daniel Ballard, Conor Bradley, Eoin Toal, Jamie McDonnell e Ali McCann estão fora, e Ceadach O'Neill foi cortado.",
    "A Ucrânia do técnico italiano Andrea Maldera é a 3ª, com 4 pontos, e vem de derrota em casa para a Hungria por 2 a 1. No 1º turno, perdeu para a Irlanda do Norte por 3 a 0, em Trnava, na Eslováquia, com dois gols de Brown e um de Isaac Price. Oleksandr Zubkov e Taras Ponomarenko foram cortados; Artem Dovbyk, Mykola Shaparenko e Vladyslav Vanat estão na lista.",
  ],
  cardTitulo: "Situação no Grupo 2 da Liga B", cardSub: "Antes da 5ª rodada",
  extraRows: [["Acesso à Liga A", "1º sobe direto; 2º vai ao playoff"], ["Zona de risco", "4º joga playoff de rebaixamento"]],
  tabelaTitulo: "Classificação do Grupo 2 da Liga B",
  emJogo: [
    "Na Liga B, o 1º colocado sobe direto para a Liga A, o 2º disputa um playoff de acesso, o 3º permanece e o 4º joga um playoff contra o rebaixamento para a Liga C. Com uma vitória, a Irlanda do Norte chega a 11 pontos e vai à última rodada, contra a Hungria em Budapeste, podendo subir com um empate.",
    "A Ucrânia precisa pontuar para não ser alcançada pela lanterna Geórgia, que joga mais cedo contra a Hungria. Na rodada final, os ucranianos recebem a Geórgia em Košice, na Eslováquia.",
  ],
  local: [
    "A arbitragem é do francês François Letexier.",
    "O Windsor Park, em Belfast, é a casa da seleção norte-irlandesa, e os ingressos para o jogo estão esgotados.",
  ],
  faqCanal: "A partida tem transmissão do Disney+, no streaming, às 16h45 de Brasília.",
  faqExtra: [
    ["A Irlanda do Norte já sofreu gol nesta Liga das Nações?", "Não. Em quatro jogos, a Irlanda do Norte venceu dois e empatou dois sem sofrer gols."],
    ["Como está o Grupo 2 da Liga B da Liga das Nações?", "Antes da 5ª rodada: Irlanda do Norte com 8 pontos, Hungria com 7, Ucrânia com 4 e Geórgia com 2."],
  ],
  excerpt: "Irlanda do Norte e Ucrânia se enfrentam às 16h45 deste sábado (14/11), em Belfast, pela Liga das Nações. Veja onde assistir, desfalques e prováveis escalações.",
  metaDescription: "Saiba onde assistir a Irlanda do Norte x Ucrânia neste sábado (14/11), às 16h45, em Belfast, pela Liga das Nações. Transmissão do Disney+ e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
