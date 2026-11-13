// Suécia x Bósnia — Liga das Nações, Liga B · Grupo 4, 5ª rodada, sábado 14/11/2026 16h45. Jogo 15534176.
// Autor: Lucas Lima (2). ESPN 3 e Disney+ (guias de programação). Árbitro: Simone Sozza.
import { B, P } from "../lexical.mjs";
import { watchPostV2, SAB14 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: SAB14, matchId: 15534176, authorId: 2, A: "Suécia", Bn: "Bósnia", hora: "16h45",
  canal: "ESPN 3 e Disney+", canalLongo: "ESPN 3 (TV fechada) e Disney+ (streaming)", canalCapaAlt: "na ESPN 3 e no Disney+",
  competicaoLinha: "Liga das Nações 2026/27, Liga B, Grupo 4, 5ª rodada",
  localCurto: "Strawberry Arena, em Solna (Suécia)", ondeFrase: "na Strawberry Arena, em Solna, na região de Estocolmo, na Suécia",
  arbitro: "Simone Sozza (Itália)",
  swapHome: [["Besfort Zeneli", { name: "Alexander Isak", number: "9", id: "823941" }]],
  lead: P("Líder do grupo, a ", B("Suécia"), " recebe a ", B("Bósnia e Herzegovina"), " neste sábado (14/11), às ", B("16h45 (de Brasília)"), ", em Solna, num confronto direto pelo acesso à Liga A da ", B("Liga das Nações"), ". O jogo do Grupo 4 da Liga B tem transmissão da ", B("ESPN 3"), " e do ", B("Disney+"), "."),
  comoChegam: [
    "A Suécia do técnico inglês Graham Potter lidera com 10 pontos e vive boa fase com Viktor Gyökeres, que divide a artilharia da Liga B com o irlandês Troy Parrott, com 4 gols. O atacante foi poupado do treino de quinta-feira (12) por precaução. As prévias suecas apontam a volta de Alexander Isak e Dejan Kulusevski; Besfort Zeneli foi cortado. O zagueiro Victor Lindelöf é o capitão.",
    "A Bósnia de Sergej Barbarez é a 2ª, com 8 pontos, e faz a primeira Data Fifa sem Edin Džeko, que se despediu da seleção no 1 a 1 com a Suécia, em Zenica, em 2 de outubro. Sem o maior artilheiro de sua história, o time aposta em Ermedin Demirović no ataque, com o lateral Amar Dedić e o jovem Kerim Alajbegović pelos lados.",
  ],
  cardTitulo: "Situação no Grupo 4 da Liga B", cardSub: "Antes da 5ª rodada",
  extraRows: [["Acesso à Liga A", "1º sobe direto; 2º vai ao playoff"], ["Artilheiros da Liga B", "Gyökeres (Suécia) e Parrott (Irlanda), 4 gols"]],
  tabelaTitulo: "Classificação do Grupo 4 da Liga B",
  emJogo: [
    "Na Liga B, o 1º colocado sobe direto para a Liga A e o 2º disputa um playoff de acesso. Se vencer, a Suécia chega a 13 pontos e garante o 1º lugar e o acesso com uma rodada de antecedência.",
    "Se a Bósnia vencer em Solna, ultrapassa os suecos e assume a liderança, com 11 pontos, a uma rodada do fim. Um empate deixa tudo para a última rodada, quando a Suécia visita a Polônia em Wrocław e a Bósnia recebe a Romênia em Zenica.",
  ],
  lineupNote: "Potter e Barbarez não divulgaram a escalação. Os campinhos usam a base recente de cada seleção; na Suécia, Isak aparece no lugar de Besfort Zeneli, cortado. A lista oficial sai cerca de uma hora antes da bola rolar.",
  local: [
    "A arbitragem é do italiano Simone Sozza.",
    "A Strawberry Arena, em Solna, é o estádio nacional da Suécia e a casa do AIK.",
  ],
  faqCanal: "A partida tem transmissão da ESPN 3, na TV fechada, e do Disney+, no streaming, às 16h45 de Brasília.",
  faqExtra: [
    ["Džeko joga Suécia x Bósnia?", "Não. Edin Džeko se despediu da seleção da Bósnia e Herzegovina no jogo de 2 de outubro, contra a própria Suécia."],
    ["A Suécia pode subir para a Liga A neste sábado?", "Sim. Com uma vitória sobre a Bósnia, a Suécia garante o 1º lugar do Grupo 4 e o acesso à Liga A."],
  ],
  excerpt: "Suécia e Bósnia se enfrentam às 16h45 deste sábado (14/11), em Solna, num duelo direto pelo acesso na Liga das Nações. Veja onde assistir e as escalações.",
  metaDescription: "Saiba onde assistir a Suécia x Bósnia neste sábado (14/11), às 16h45, em Solna, pela Liga das Nações. Transmissão da ESPN 3 e Disney+, escalações e tabela.",
};
export default (ctx) => watchPostV2(opts, ctx);
