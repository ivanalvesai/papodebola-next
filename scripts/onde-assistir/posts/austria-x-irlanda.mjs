// Áustria x Irlanda — Liga das Nações, Liga B · Grupo 3, 5ª rodada, sábado 14/11/2026 16h45. Jogo 15534160.
// Autor: Ivan Alves (1). Disney+ (guias de programação). Árbitro: Irfan Peljto.
import { B, P } from "../lexical.mjs";
import { watchPostV2, SAB14 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: SAB14, matchId: 15534160, authorId: 1, A: "Áustria", Bn: "Irlanda", hora: "16h45",
  canal: "Disney+", canalLongo: "Disney+ (streaming)", canalCapaAlt: "no Disney+",
  competicaoLinha: "Liga das Nações 2026/27, Liga B, Grupo 3, 5ª rodada",
  localCurto: "Raiffeisen Arena, em Linz (Áustria)", ondeFrase: "na Raiffeisen Arena, em Linz, na Áustria",
  arbitro: "Irfan Peljto (Bósnia e Herzegovina)",
  lead: P("Líder do grupo, a ", B("Áustria"), " de Ralf Rangnick recebe a ", B("Irlanda"), " neste sábado (14/11), às ", B("16h45 (de Brasília)"), ", em Linz, podendo garantir o acesso à Liga A da ", B("Liga das Nações"), ". O jogo do Grupo 3 da Liga B tem transmissão do ", B("Disney+"), "."),
  comoChegam: [
    "A Áustria lidera com 8 pontos e tem o melhor ataque do grupo, com 9 gols marcados por nove jogadores diferentes, retrato do coletivo montado por Rangnick. Venceu Kosovo e Israel, ambos por 3 a 1, e empatou com Irlanda (2 a 2) e Kosovo (1 a 1). O capitão David Alaba está fora, com uma lesão na panturrilha, mas Christoph Baumgartner volta à lista, que traz ainda a primeira convocação de Luca Weinhandl, de 17 anos.",
    "A Irlanda de Heimir Hallgrímsson soma 5 pontos e briga com o Kosovo pela 2ª vaga. Troy Parrott é o artilheiro da Liga B, com 4 gols, dois deles no 2 a 2 com a Áustria em Dublin, no 1º turno. O zagueiro Nathan Collins volta ao grupo, e o goleiro Gavin Bazunu, lesionado, está fora. O veterano Seamus Coleman segue na lista.",
  ],
  cardTitulo: "Situação no Grupo 3 da Liga B", cardSub: "Antes da 5ª rodada",
  extraRows: [["Acesso à Liga A", "1º sobe direto; 2º vai ao playoff"], ["Artilheiro da Liga B", "Troy Parrott (Irlanda), 4 gols"]],
  tabelaTitulo: "Classificação do Grupo 3 da Liga B",
  emJogo: [
    "Na Liga B, o 1º colocado sobe direto para a Liga A, o 2º disputa um playoff de acesso, o 3º permanece e o 4º joga um playoff contra o rebaixamento. Uma vitória em Linz garante à Áustria o 1º lugar e o acesso com uma rodada de antecedência.",
    "A Irlanda, empatada com o Kosovo em 5 pontos, precisa pontuar para seguir na briga pela 2ª posição. Na última rodada, os irlandeses recebem o Kosovo em Dublin, num confronto que pode valer essa vaga.",
  ],
  lineupNote: "Os técnicos não divulgaram a escalação. Os campinhos usam a base recente de cada seleção. A lista oficial sai cerca de uma hora antes da bola rolar.",
  local: [
    "A arbitragem é do bósnio Irfan Peljto.",
    "A Raiffeisen Arena, em Linz, é a casa do LASK.",
  ],
  faqCanal: "A partida tem transmissão do Disney+, no streaming, às 16h45 de Brasília.",
  faqExtra: [
    ["A Áustria pode subir para a Liga A neste sábado?", "Sim. Com uma vitória sobre a Irlanda, a Áustria garante o 1º lugar do Grupo 3 e o acesso à Liga A com uma rodada de antecedência."],
    ["Alaba joga Áustria x Irlanda?", "Não. O capitão David Alaba está fora por uma lesão na panturrilha."],
  ],
  excerpt: "Áustria e Irlanda se enfrentam às 16h45 deste sábado (14/11), em Linz, pela Liga das Nações. Austríacos podem garantir o acesso. Veja onde assistir e escalações.",
  metaDescription: "Saiba onde assistir a Áustria x Irlanda neste sábado (14/11), às 16h45, em Linz, pela Liga das Nações. Transmissão do Disney+, escalações e a tabela do grupo.",
};
export default (ctx) => watchPostV2(opts, ctx);
