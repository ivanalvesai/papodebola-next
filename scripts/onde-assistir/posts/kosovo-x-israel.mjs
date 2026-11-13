// Kosovo x Israel — Liga das Nações, Liga B · Grupo 3, 5ª rodada, sábado 14/11/2026 11h. Jogo 15534159.
// Autor: Lucas Lima (2). ESPN e Disney+ (guias de programação). Árbitro: Ivan Kružliak.
import { B, P } from "../lexical.mjs";
import { watchPostV2, SAB14 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: SAB14, matchId: 15534159, authorId: 2, A: "Kosovo", Bn: "Israel", hora: "11h",
  canal: "ESPN e Disney+", canalLongo: "ESPN (TV fechada) e Disney+ (streaming)", canalCapaAlt: "na ESPN e no Disney+",
  competicaoLinha: "Liga das Nações 2026/27, Liga B, Grupo 3, 5ª rodada",
  localCurto: "Stadiumi Fadil Vokrri, em Pristina (Kosovo)", ondeFrase: "no Stadiumi Fadil Vokrri, em Pristina, capital do Kosovo",
  arbitro: "Ivan Kružliak (Eslováquia)",
  lead: P("O ", B("Kosovo"), " recebe ", B("Israel"), " neste sábado (14/11), às ", B("11h (de Brasília)"), ", em Pristina, abrindo a 5ª rodada da ", B("Liga das Nações"), ". O jogo do Grupo 3 da Liga B tem transmissão da ", B("ESPN"), " e do ", B("Disney+"), "."),
  comoChegam: [
    "O Kosovo é o 2º colocado, com 5 pontos, empatado com a Irlanda e à frente no saldo. A campanha começou com vitória por 1 a 0 sobre os irlandeses, gol do capitão Vedat Muriqi, e teve ainda derrota para a Áustria (3 a 1) e empates com Israel (0 a 0) e com a própria Áustria (1 a 1). O técnico alemão Franco Foda aposta num ataque com Muriqi, Edon Zhegrova e Baton Zabergja.",
    "Israel é o lanterna, com 2 pontos e nenhuma vitória em quatro jogos. A equipe de Ran Ben Shimon manda suas partidas fora do país: o 0 a 0 com o Kosovo, no 1º turno, foi em Debrecen, na Hungria. O capitão Dor Peretz e o meia Oscar Gloukh são as referências de um time que marcou só dois gols na campanha.",
  ],
  cardTitulo: "Situação no Grupo 3 da Liga B", cardSub: "Antes da 5ª rodada",
  extraRows: [["Líder", "Áustria, 8 pontos"], ["Acesso à Liga A", "1º sobe direto; 2º vai ao playoff"]],
  tabelaTitulo: "Classificação do Grupo 3 da Liga B",
  emJogo: [
    "Na Liga B, o 1º colocado sobe direto para a Liga A, o 2º disputa um playoff de acesso em março, o 3º permanece e o 4º joga um playoff contra o rebaixamento para a Liga C. O Kosovo defende a 2ª posição e, com uma vitória, chega a 8 pontos, igualando a Áustria antes da rodada final, quando visita a Irlanda.",
    "Israel precisa vencer para deixar a lanterna e escapar da zona do playoff de rebaixamento. Um tropeço deixa a equipe na dependência da última rodada, contra a líder Áustria. Israel nunca venceu o Kosovo: em três jogos, foram uma derrota e dois empates.",
  ],
  local: [
    "A arbitragem é do eslovaco Ivan Kružliak.",
    "O Stadiumi Fadil Vokrri, em Pristina, leva o nome de um dos maiores jogadores da história do Kosovo e é a casa da seleção.",
  ],
  faqCanal: "A partida tem transmissão da ESPN, na TV fechada, e do Disney+, no streaming, às 11h de Brasília.",
  faqExtra: [
    ["Como está o Grupo 3 da Liga B da Liga das Nações?", "Antes da 5ª rodada: Áustria com 8 pontos, Kosovo e Irlanda com 5 e Israel com 2."],
  ],
  excerpt: "Kosovo e Israel se enfrentam às 11h deste sábado (14/11), em Pristina, pela Liga das Nações. Veja onde assistir, as prováveis escalações e a tabela do Grupo 3 da Liga B.",
  metaDescription: "Saiba onde assistir a Kosovo x Israel neste sábado (14/11), às 11h, em Pristina, pela Liga das Nações. Transmissão da ESPN e Disney+, escalações e tabela.",
};
export default (ctx) => watchPostV2(opts, ctx);
