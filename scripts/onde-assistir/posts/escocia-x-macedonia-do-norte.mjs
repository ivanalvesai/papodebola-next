// Escócia x Macedônia do Norte — Liga B · Grupo 1, 5ª rodada, 13/11/2026 16h45. Jogo 15534110. Autor: Ivan Alves (1).
// Transmissão: YouTube da ESPN Brasil + Disney+.
import { B, P } from "../lexical.mjs";
import { watchPost } from "../template.mjs";
export default (ctx) => watchPost({
  matchId: 15534110, authorId: 1, A: "Escócia", Bn: "Macedônia do Norte", hora: "16h45",
  canal: "YouTube da ESPN Brasil e Disney+", canalLongo: "canal da ESPN Brasil no YouTube (grátis) e Disney+ (streaming)", canalCapaAlt: "no YouTube da ESPN Brasil e no Disney+",
  competicao: "Liga B, Grupo 1", grupoNome: "Grupo 1 da Liga B",
  localCurto: "Hampden Park, em Glasgow (Escócia)", ondeFrase: "no Hampden Park, em Glasgow, na Escócia",
  lead: P("A ", B("Escócia"), " recebe a ", B("Macedônia do Norte"), " nesta sexta-feira (13/11), às ", B("16h45 (de Brasília)"), ", no Hampden Park, em Glasgow, pela 5ª rodada do Grupo 1 da Liga B da ", B("Liga das Nações"), ". Dá para assistir de graça no ", B("canal da ESPN Brasil no YouTube"), " e também no ", B("Disney+"), "."),
  comoChegam: [
    "A Escócia tem 4 pontos e ocupa o 3º lugar. A única vitória veio justamente contra os macedônios, por 2 a 0 em Skopje, na 3ª rodada. Empatou sem gols com a Eslovênia na estreia e perdeu em casa para Suíça (3 a 0) e Eslovênia (2 a 1). O time de John McGinn, Scott McTominay e Andy Robertson marcou só 3 gols em quatro jogos.",
    "A Macedônia do Norte vive a pior campanha da Liga B: quatro derrotas, nenhum gol marcado e 10 sofridos. Perdeu duas vezes para a Suíça por 3 a 0, para a Eslovênia por 2 a 0 e para a Escócia por 2 a 0. Eljif Elmas e Enis Bardhi seguem como as principais referências técnicas de um time que ainda procura o primeiro gol na competição.",
  ],
  extraRows: [["Vice-líder (playoff de acesso)", "Eslovênia, 7 pontos"], ["Líder", "Suíça, 12 pontos"]],
  emJogo: [
    "Para a Escócia, vencer resolve um problema e mantém viva uma chance. Com 7 pontos, o time garante que não termina em último, posição que leva ao playoff contra o rebaixamento à Liga C, e iguala a Eslovênia na pontuação antes da rodada final, quando visita a Suíça.",
    "A Macedônia do Norte precisa pontuar para não ver o 4º lugar se confirmar já nesta sexta. Uma derrota em Glasgow encerra qualquer chance de ultrapassar a Escócia.",
  ],
  local: [
    "O jogo é no Hampden Park, em Glasgow, o estádio nacional da Escócia, com capacidade para pouco mais de 50 mil torcedores.",
  ],
  faqCanal: "A partida passa de graça no canal da ESPN Brasil no YouTube e também no Disney+, às 16h45 de Brasília.",
  faqExtra: [
    ["Dá para assistir Escócia x Macedônia do Norte de graça?", "Sim. O jogo tem transmissão aberta no canal da ESPN Brasil no YouTube."],
    ["Como está o Grupo 1 da Liga B da Liga das Nações?", "Antes da 5ª rodada: Suíça com 12 pontos, Eslovênia com 7, Escócia com 4 e Macedônia do Norte com 0."],
  ],
  excerpt: "Escócia recebe a Macedônia do Norte às 16h45 desta sexta (13/11), no Hampden Park, pela Liga das Nações. Veja onde assistir de graça e as prováveis escalações.",
  metaDescription: "Saiba onde assistir a Escócia x Macedônia do Norte pela Liga das Nações nesta sexta (13/11), às 16h45, no Hampden Park. Veja canal, escalações e a tabela.",
}, ctx);
