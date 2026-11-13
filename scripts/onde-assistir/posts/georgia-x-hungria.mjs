// Geórgia x Hungria — Liga das Nações, Liga B · Grupo 2, 5ª rodada, sábado 14/11/2026 14h. Jogo 15534131.
// Autor: Ivan Alves (1). SporTV (guias de programação). Árbitro: Ondřej Berka.
import { B, P } from "../lexical.mjs";
import { watchPostV2, SAB14 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: SAB14, matchId: 15534131, authorId: 1, A: "Geórgia", Bn: "Hungria", hora: "14h",
  canal: "SporTV", canalLongo: "SporTV (TV fechada)", canalCapaAlt: "no SporTV",
  competicaoLinha: "Liga das Nações 2026/27, Liga B, Grupo 2, 5ª rodada",
  localCurto: "Boris Paichadze Dinamo Arena, em Tbilisi (Geórgia)", ondeFrase: "na Boris Paichadze Dinamo Arena, em Tbilisi, capital da Geórgia",
  arbitro: "Ondřej Berka (República Tcheca)",
  lead: P("A ", B("Hungria"), " de Dominik Szoboszlai visita a ", B("Geórgia"), " neste sábado (14/11), às ", B("14h (de Brasília)"), ", em Tbilisi, pelo Grupo 2 da Liga B da ", B("Liga das Nações"), ". O jogo tem transmissão do ", B("SporTV"), "."),
  comoChegam: [
    "A Geórgia vive um jejum raro: ainda não marcou gol nesta Liga das Nações. Em quatro jogos, perdeu para Irlanda do Norte e Hungria por 1 a 0 e empatou sem gols com Ucrânia e Irlanda do Norte. O time tem novo técnico, Ramaz Svanadze, promovido do sub-21 no lugar do francês Willy Sagnol, e conta com Georges Mikautadze, artilheiro com 23 gols pela seleção, para acabar com a seca. O volante Giorgi Kochorashvili está suspenso.",
    "A Hungria do técnico italiano Marco Rossi é a 2ª colocada, com 7 pontos, um a menos que a líder Irlanda do Norte, e venceu os dois últimos jogos: 1 a 0 sobre a própria Geórgia e 2 a 1 sobre a Ucrânia, fora de casa. O lateral Milos Kerkez volta depois de cumprir suspensão, e Szoboszlai segue como o cérebro do time.",
  ],
  cardTitulo: "Situação no Grupo 2 da Liga B", cardSub: "Antes da 5ª rodada",
  extraRows: [["Líder", "Irlanda do Norte, 8 pontos"], ["Acesso à Liga A", "1º sobe direto; 2º vai ao playoff"]],
  tabelaTitulo: "Classificação do Grupo 2 da Liga B",
  emJogo: [
    "Na Liga B, o 1º colocado sobe direto para a Liga A, o 2º disputa um playoff de acesso, o 3º permanece e o 4º joga um playoff contra o rebaixamento para a Liga C. A Hungria quer vencer em Tbilisi para chegar à última rodada, contra a Irlanda do Norte em Budapeste, em condições de brigar pelo 1º lugar.",
    "A Geórgia, lanterna com 2 pontos, está na zona do playoff de rebaixamento e precisa vencer para alcançar a Ucrânia, que tem 4 e será a adversária na rodada final.",
  ],
  local: [
    "A arbitragem é do tcheco Ondřej Berka.",
    "A Boris Paichadze Dinamo Arena, em Tbilisi, é o maior estádio da Geórgia e a casa da seleção.",
  ],
  faqCanal: "A partida tem transmissão do SporTV, na TV fechada, às 14h de Brasília.",
  faqExtra: [
    ["A Geórgia já marcou gol nesta Liga das Nações?", "Não. Em quatro jogos, a Geórgia perdeu duas vezes por 1 a 0 e empatou duas vezes por 0 a 0."],
    ["Como está o Grupo 2 da Liga B da Liga das Nações?", "Antes da 5ª rodada: Irlanda do Norte com 8 pontos, Hungria com 7, Ucrânia com 4 e Geórgia com 2."],
  ],
  excerpt: "Geórgia e Hungria se enfrentam às 14h deste sábado (14/11), em Tbilisi, pela Liga das Nações. Veja onde assistir, as prováveis escalações e a tabela do Grupo 2.",
  metaDescription: "Saiba onde assistir a Geórgia x Hungria neste sábado (14/11), às 14h, em Tbilisi, pela Liga das Nações. Transmissão do SporTV, escalações e a tabela do grupo.",
};
export default (ctx) => watchPostV2(opts, ctx);
