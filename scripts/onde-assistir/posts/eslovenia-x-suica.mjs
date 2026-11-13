// Eslovênia x Suíça — Liga B · Grupo 1, 5ª rodada, 13/11/2026 16h45. Jogo 15534113. Autor: Lucas Lima (2). ESPN 4 + Disney+.
import { B, P } from "../lexical.mjs";
import { watchPost } from "../template.mjs";
export default (ctx) => watchPost({
  matchId: 15534113, authorId: 2, A: "Eslovênia", Bn: "Suíça", hora: "16h45",
  canal: "ESPN 4 e Disney+", canalLongo: "ESPN 4 (TV fechada) e Disney+ (streaming)", canalCapaAlt: "na ESPN 4 e no Disney+",
  competicao: "Liga B, Grupo 1", grupoNome: "Grupo 1 da Liga B",
  localCurto: "Estádio Ljudski vrt, em Maribor (Eslovênia)", ondeFrase: "no Estádio Ljudski vrt, em Maribor, na Eslovênia",
  lead: P("A ", B("Suíça"), " pode carimbar o acesso à Liga A nesta sexta-feira (13/11), às ", B("16h45 (de Brasília)"), ", contra a ", B("Eslovênia"), ", no Estádio Ljudski vrt, em Maribor. O confronto entre o 1º e o 2º do Grupo 1 da Liga B da ", B("Liga das Nações"), " passa na ", B("ESPN 4"), ", na TV fechada, e no ", B("Disney+"), ", no streaming."),
  comoChegam: [
    "A Suíça tem 100% de aproveitamento: quatro vitórias em quatro jogos, 11 gols marcados e apenas 1 sofrido. Fez 3 a 0 na Macedônia do Norte duas vezes, 3 a 0 na Escócia em Glasgow e 2 a 1 na própria Eslovênia, em casa, na 3ª rodada. O único gol que a defesa levou na competição foi justamente dos eslovenos.",
    "A Eslovênia é a vice-líder, com 7 pontos. Venceu a Macedônia do Norte por 2 a 0 e a Escócia por 2 a 1, fora de casa, empatou sem gols com os escoceses na estreia e perdeu só para a Suíça. Tem no gol Jan Oblak, um dos goleiros mais experientes da Europa, e uma defesa que sofreu 3 gols em quatro jogos.",
  ],
  extraRows: [["3º lugar", "Escócia, 4 pontos"], ["Acesso direto à Liga A", "só o 1º colocado; o 2º vai ao playoff"]],
  emJogo: [
    "Só o líder do grupo sobe direto para a Liga A; o 2º disputa um playoff de acesso. A conta é simples para a Suíça: um empate já basta. Com 13 pontos, os suíços ficariam fora do alcance da Eslovênia, que chegaria no máximo a 11 vencendo a Macedônia do Norte na última rodada.",
    "A Eslovênia precisa vencer para levar a briga pelo 1º lugar até o fim. Com 10 pontos, ficaria a dois da Suíça antes da rodada final, quando os suíços recebem a Escócia e os eslovenos visitam a Macedônia do Norte. O 2º lugar também não está garantido: a Escócia, com 4, joga em casa contra os macedônios no mesmo horário.",
  ],
  local: [
    "O jogo é no Estádio Ljudski vrt, em Maribor, a segunda maior cidade da Eslovênia e casa do NK Maribor.",
  ],
  faqCanal: "A partida tem transmissão da ESPN 4, na TV fechada, e do Disney+, no streaming, às 16h45 de Brasília.",
  faqExtra: [
    ["A Suíça já está classificada na Liga das Nações?", "Ainda não. Um empate contra a Eslovênia garante a Suíça no 1º lugar do Grupo 1 da Liga B e o acesso direto à Liga A."],
    ["Como está o Grupo 1 da Liga B da Liga das Nações?", "Antes da 5ª rodada: Suíça com 12 pontos, Eslovênia com 7, Escócia com 4 e Macedônia do Norte com 0."],
  ],
  excerpt: "Suíça, com 100% de aproveitamento, visita a vice-líder Eslovênia às 16h45 desta sexta (13/11), em Maribor, pela Liga das Nações. Veja onde assistir e as prováveis escalações.",
  metaDescription: "Saiba onde assistir a Eslovênia x Suíça pela Liga das Nações nesta sexta (13/11), às 16h45, em Maribor. Veja canal, prováveis escalações e a tabela do grupo.",
}, ctx);
