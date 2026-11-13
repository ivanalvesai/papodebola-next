// Holanda x Grécia — Liga A · Grupo 2, 5ª rodada, 13/11/2026 16h45. Jogo 15534069. Autor: Ivan Alves (1).
// Árbitro: Rohit Saggi (Noruega); VAR Guillermo Cuadra Fernández (Espanha) — spec 12/11. Transmissão: ESPN + Disney+ (decisão do Ivan).
import { B, P } from "../lexical.mjs";
import { watchPost } from "../template.mjs";
export default (ctx) => watchPost({
  matchId: 15534069, authorId: 1, A: "Holanda", Bn: "Grécia", hora: "16h45",
  canal: "ESPN e Disney+", canalLongo: "ESPN (TV fechada) e Disney+ (streaming)", canalCapaAlt: "na ESPN e no Disney+",
  competicao: "Liga A, Grupo 2", grupoNome: "Grupo 2 da Liga A",
  localCurto: "Johan Cruijff Arena, em Amsterdã (Holanda)", ondeFrase: "na Johan Cruijff Arena, em Amsterdã, na Holanda",
  arbitro: "Rohit Saggi (Noruega); no VAR, Guillermo Cuadra Fernández (Espanha)",
  lead: P(B("Holanda"), " e ", B("Grécia"), " decidem a liderança do Grupo 2 da Liga A nesta sexta-feira (13/11), às ", B("16h45 (de Brasília)"), ", na Johan Cruijff Arena, em Amsterdã. As duas seleções têm 8 pontos e estão invictas na ", B("Liga das Nações"), ". O jogo passa na ", B("ESPN"), ", na TV fechada, e no ", B("Disney+"), ", no streaming."),
  comoChegam: [
    "A Holanda lidera pelo saldo de gols. Venceu a Sérvia duas vezes, ambas por 2 a 1, e empatou com a Alemanha (1 a 1) e com a própria Grécia (2 a 2, em Atenas, na 3ª rodada). São 7 gols marcados e 5 sofridos: o ataque funciona, mas a defesa ainda não conseguiu passar um jogo sem levar gol.",
    "A Grécia é a surpresa do grupo. Bateu a Sérvia por 2 a 1 fora de casa e a Alemanha por 1 a 0 em território alemão, além dos empates com Holanda (2 a 2) e Alemanha (0 a 0). Tem a melhor defesa da chave, com 3 gols sofridos em quatro jogos, e um ataque comandado por Vangelis Pavlidis.",
  ],
  extraRows: [["Perseguidor", "Alemanha, 5 pontos"], ["Vaga nas quartas de final", "os dois primeiros do grupo"]],
  emJogo: [
    "Os dois primeiros do grupo vão às quartas de final da Liga das Nações. A Alemanha, 3ª com 5 pontos, joga ao mesmo tempo em Belgrado e ainda recebe a Holanda na última rodada, então ninguém está garantido. Quem vencer em Amsterdã chega a 11 pontos e dá um passo enorme rumo ao mata-mata; um empate mantém as duas à frente, mas deixa a Alemanha a uma vitória de encostar.",
    "Na rodada final, a Holanda visita a Alemanha e a Grécia recebe a lanterna Sérvia, o que dá aos gregos um calendário mais tranquilo para fechar a fase.",
  ],
  local: [
    "O jogo é na Johan Cruijff Arena, em Amsterdã, a casa do Ajax. O árbitro é o norueguês Rohit Saggi, com o espanhol Guillermo Cuadra Fernández no comando do VAR.",
  ],
  faqCanal: "A partida tem transmissão da ESPN, na TV fechada, e do Disney+, no streaming, às 16h45 de Brasília.",
  faqExtra: [
    ["Quem apita Holanda x Grécia?", "O árbitro é o norueguês Rohit Saggi. O VAR fica com o espanhol Guillermo Cuadra Fernández."],
    ["Como está o Grupo 2 da Liga A da Liga das Nações?", "Antes da 5ª rodada: Holanda e Grécia com 8 pontos, Alemanha com 5 e Sérvia com 0. Os dois primeiros vão às quartas de final."],
  ],
  excerpt: "Holanda e Grécia, ambas com 8 pontos, se enfrentam às 16h45 desta sexta (13/11), em Amsterdã, pela Liga das Nações. Veja onde assistir e as prováveis escalações.",
  metaDescription: "Saiba onde assistir a Holanda x Grécia pela Liga das Nações nesta sexta (13/11), às 16h45, na Johan Cruijff Arena. Veja canal, prováveis escalações e arbitragem.",
}, ctx);
