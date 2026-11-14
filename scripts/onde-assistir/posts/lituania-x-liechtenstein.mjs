// Lituânia x Liechtenstein — Liga das Nações, Liga D · Grupo 2, 6ª rodada, segunda 16/11/2026 14h. Jogo 15534243.
// Autor: Lucas Lima (2). Canal: Disney+ = FONTE ÚNICA (grade do Goal Brasil,
//   https://www.goal.com/br/listas/futebol-programacao-jogos-tv-aberta-fechada-onde-assistir-online-app/bltc0a7361374657315)
//   → canalConfirmado:false. Árbitro: não divulgado (omitido).
// Regulamento (UEFA, https://www.uefa.com/uefanationsleague/news/0298-1d6ef1acfaef-b54fcf1da859-1000--2026-27-uefa-nations-league-all-you-need-to-know):
//   Liga D 2026/27: "All teams are promoted to League C" (a Liga D deixa de existir em 2028/29). Grupos de 3, 4 jogos cada.
//   Lituânia e Liechtenstein fazem aqui o 4º jogo (briefing: 3 jogos cada). Azerbaijão já encerrou com 8 pontos (1º).
// Estádio: Dariaus ir Girėno, Kaunas, 19h local (lrt.lt + kakava.lt/allevents.lt). Na Lituânia, LRT PLIUS (lrt.lt).
// Técnico: Mindaugas Čepas, interino desde 21/10, estreou no amistoso com o Suriname (12/11) — lrt.lt (2 matérias).
// Desfalques: nenhum com 2 fontes. Kučys suspenso para este jogo (só lrt.lt) — não entra; não está no XI.
// Desempate (notas internas): confronto direto (pontos, saldo, gols), depois saldo geral e gols marcados.
//   Liechtenstein só fica em 2º vencendo por 3+ gols (1º turno: Liechtenstein 0x2 Lituânia).
import { B, P } from "../lexical.mjs";
import { watchPostV2, SEG16 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: SEG16, matchId: 15534243, authorId: 2, A: "Lituânia", Bn: "Liechtenstein", hora: "14h",
  canal: "Disney+", canalConfirmado: false, canalLongo: "Disney+ (streaming), segundo a programação; confirme perto do jogo", canalCapaAlt: "no Disney+",
  competicaoLinha: "Liga das Nações 2026/27, Liga D, Grupo 2, 6ª e última rodada",
  localCurto: "Estádio Darius e Girėnas, em Kaunas (Lituânia)", ondeFrase: "no Estádio Darius e Girėnas, em Kaunas, na Lituânia",
  lead: P(B("Lituânia"), " e ", B("Liechtenstein"), " fecham o Grupo 2 da Liga D da ", B("Liga das Nações"), " nesta segunda-feira (16/11), às ", B("14h (de Brasília)"), ", em Kaunas. As duas já sabem que vão jogar a Liga C na próxima edição. A programação indica transmissão do ", B("Disney+"), "."),
  comoChegam: [
    "A Lituânia tem 4 pontos e faz o último dos seus quatro jogos. Venceu Liechtenstein por 2 a 0 em Vaduz, na estreia, empatou com o Azerbaijão por 1 a 1 em casa e perdeu a revanche fora de casa por 1 a 0, resultado que tirou dela a chance de terminar em 1º. O time agora é dirigido por Mindaugas Čepas, técnico interino desde outubro, que estreou no amistoso contra o Suriname, na quinta-feira (12), também em Kaunas.",
    "Liechtenstein somou só 1 ponto, no 0 a 0 com o Azerbaijão fora de casa, e ainda não marcou nesta Liga das Nações. Na sexta-feira (13), perdeu em Vaduz para os azeris por 1 a 0, gol de Mahir Emreli no primeiro tempo. Foi o resultado que deu ao Azerbaijão o 1º lugar do grupo.",
  ],
  cardTitulo: "Situação no Grupo 2 da Liga D", cardSub: "Antes da 6ª e última rodada",
  extraRows: [["Azerbaijão", "1º lugar garantido, 8 pontos (campanha encerrada)"], ["Liga D", "todas as seleções sobem para a Liga C"]],
  tabelaTitulo: "Classificação do Grupo 2 da Liga D",
  emJogo: [
    "Não há acesso em disputa. A UEFA vai acabar com a Liga D a partir de 2028/29, e por isso todas as seleções da divisão sobem para a Liga C, não só os líderes de grupo. Em Kaunas, vale o 2º lugar. A Lituânia o garante com vitória ou empate, e até perdendo por até dois gols de diferença, porque venceu o confronto do 1º turno por 2 a 0 e leva vantagem nos critérios de desempate.",
    "Liechtenstein precisa de uma vitória por três gols de diferença ou mais para passar a Lituânia, uma tarefa grande para quem não marcou em três jogos. O objetivo mais próximo é o primeiro gol na competição.",
  ],
  local: [
    "O Estádio Darius e Girėnas, em Kaunas, leva o nome dos pilotos Steponas Darius e Stasys Girėnas, que morreram em 1933 ao tentar voar sem escalas de Nova York a Kaunas. A bola rola às 19h no horário local. Na Lituânia, o jogo passa na TV pública, a LRT.",
  ],
  faqCanal: "A programação indica transmissão do Disney+, no streaming, às 14h de Brasília. Como só um guia confirmou o canal até agora, vale conferir perto do jogo.",
  faqExtra: [
    ["Quem sobe da Liga D da Liga das Nações 2026/27?", "Todas as seleções. Como a Liga D deixa de existir em 2028/29, Lituânia, Liechtenstein e as outras quatro seleções da divisão jogam a Liga C na próxima edição."],
    ["Quem venceu o primeiro jogo entre Lituânia e Liechtenstein nesta Liga das Nações?", "A Lituânia, por 2 a 0, em Vaduz, na 1ª rodada, em setembro."],
  ],
  excerpt: "Lituânia e Liechtenstein fecham o Grupo 2 da Liga D nesta segunda (16/11), às 14h, em Kaunas. Veja onde assistir e as prováveis escalações.",
  metaDescription: "Saiba onde assistir a Lituânia x Liechtenstein nesta segunda (16/11), às 14h, em Kaunas, pela Liga das Nações. Canal, tabela e prováveis escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
