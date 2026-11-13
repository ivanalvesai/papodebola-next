// Eslováquia x Ilhas Faroé — Liga C · Grupo 3, 5ª rodada, 13/11/2026 16h45. Jogo 15534192. Autor: Lucas Lima (2). Disney+.
import { B, P } from "../lexical.mjs";
import { watchPost } from "../template.mjs";
export default (ctx) => watchPost({
  matchId: 15534192, authorId: 2, A: "Eslováquia", Bn: "Ilhas Faroé", hora: "16h45",
  canal: "Disney+", canalLongo: "Disney+ (streaming)", canalCapaAlt: "no Disney+",
  competicao: "Liga C, Grupo 3", grupoNome: "Grupo 3 da Liga C",
  localCurto: "Košická futbalová aréna, em Košice (Eslováquia)", ondeFrase: "na Košická futbalová aréna, em Košice, na Eslováquia",
  lead: P("A ", B("Eslováquia"), " recebe as ", B("Ilhas Faroé"), " nesta sexta-feira (13/11), às ", B("16h45 (de Brasília)"), ", em Košice, com a chance de garantir o acesso à Liga B da ", B("Liga das Nações"), " já nesta rodada. O jogo do Grupo 3 da Liga C tem transmissão do ", B("Disney+"), "."),
  comoChegam: [
    "A Eslováquia lidera com folga: 10 pontos, três vitórias e um empate. Bateu a Moldávia duas vezes (2 a 0 e 4 a 0) e o Cazaquistão por 2 a 1. O único tropeço foi justamente contra as Ilhas Faroé, um 1 a 1 fora de casa na 3ª rodada. A defesa de Milan Škriniar e Dávid Hancko sofreu só 2 gols.",
    "As Ilhas Faroé são as únicas invictas do grupo além da líder, mas ainda não venceram: foram quatro empates. Além do 1 a 1 com a Eslováquia, empataram com o Cazaquistão (1 a 1 e 2 a 2) e com a Moldávia (1 a 1). Os 4 pontos colocam o arquipélago em 2º, na vaga do playoff de acesso, à frente da Moldávia só no saldo.",
  ],
  extraRows: [["Concorrente pelo 2º lugar", "Moldávia, 4 pontos (joga às 14h)"], ["Acesso à Liga B", "1º sobe direto; 2º vai ao playoff"]],
  emJogo: [
    "A Eslováquia depende só de si e precisa de pouco. Com uma vitória ou mesmo um empate, chega a 13 ou 11 pontos e fica fora do alcance de todos os rivais, garantindo o 1º lugar e o acesso direto à Liga B com uma rodada de antecedência.",
    "Para as Ilhas Faroé, o jogo é sobre o 2º lugar. A Moldávia, que tem os mesmos 4 pontos, joga mais cedo, às 14h, contra o Cazaquistão. Se os moldávios vencerem, os faroenses entram em campo precisando pontuar em Košice para não perder a vaga do playoff antes do confronto direto da última rodada, contra a própria Moldávia.",
  ],
  local: [
    "O jogo é na Košická futbalová aréna, em Košice, no leste da Eslováquia.",
  ],
  faqCanal: "A partida tem transmissão do Disney+, no streaming, às 16h45 de Brasília.",
  faqExtra: [
    ["A Eslováquia pode subir para a Liga B nesta rodada?", "Sim. Com vitória ou empate contra as Ilhas Faroé, a Eslováquia garante o 1º lugar do Grupo 3 da Liga C e o acesso direto."],
    ["Como está o Grupo 3 da Liga C da Liga das Nações?", "Antes da 5ª rodada: Eslováquia com 10 pontos, Ilhas Faroé com 4, Moldávia com 4 e Cazaquistão com 2."],
  ],
  excerpt: "Eslováquia recebe as Ilhas Faroé às 16h45 desta sexta (13/11), em Košice, e pode garantir o acesso na Liga das Nações. Veja onde assistir e as prováveis escalações.",
  metaDescription: "Saiba onde assistir a Eslováquia x Ilhas Faroé pela Liga das Nações nesta sexta (13/11), às 16h45, em Košice. Veja canal, prováveis escalações e a tabela.",
}, ctx);
