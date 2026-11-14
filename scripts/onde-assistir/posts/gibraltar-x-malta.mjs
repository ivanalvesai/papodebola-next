// Gibraltar x Malta — Liga das Nações, Liga D · Grupo 1, 6ª rodada, segunda 16/11/2026 16h45. Jogo 15537778.
// Autor: Ivan Alves (1). Canal: Disney+ = FONTE ÚNICA (grade do Goal Brasil,
//   https://www.goal.com/br/listas/futebol-programacao-jogos-tv-aberta-fechada-onde-assistir-online-app/bltc0a7361374657315)
//   → canalConfirmado:false. Árbitro: não divulgado (omitido).
// Regulamento (UEFA, https://www.uefa.com/uefanationsleague/news/0298-1d6ef1acfaef-b54fcf1da859-1000--2026-27-uefa-nations-league-all-you-need-to-know):
//   Liga D 2026/27: todas as seleções sobem para a Liga C. Grupos de 3, 4 jogos cada; Gibraltar e Malta fazem aqui o 4º
//   (briefing: 3 jogos cada). Andorra encerrou com 4 pontos.
// Malta 1º lugar garantido após Andorra 2x0 Gibraltar (13/11), primeira vez que lidera um grupo da Liga das Nações:
//   themalteseherald.com + lovinmalta.com (+ maltafootball.com, título). Técnico Emilio De Leo (Maltese Herald + footballwhispers).
// Estádio: Europa Point Stadium (footballwhispers + statz.ai; a API grava "Europa Sports Park"). 19h45 em Londres = 20h45 local.
// Desfalque: Tjay De Barr suspenso (amarelo contra Andorra) — themalteseherald.com + footballwhispers.com.
//   Swap De Barr -> Graeme Torrilla (estava no XI provável da Sports Mole para o jogo com Andorra; substituto é palpite).
// NÃO entrou: suspensão de Satariano (Malta) — só footballwhispers; não está no XI.
import { B, P } from "../lexical.mjs";
import { watchPostV2, SEG16 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: SEG16, matchId: 15537778, authorId: 1, A: "Gibraltar", Bn: "Malta", hora: "16h45",
  canal: "Disney+", canalConfirmado: false, canalLongo: "Disney+ (streaming), segundo a programação; confirme perto do jogo", canalCapaAlt: "no Disney+",
  competicaoLinha: "Liga das Nações 2026/27, Liga D, Grupo 1, 6ª e última rodada",
  localCurto: "Europa Point Stadium, em Gibraltar", ondeFrase: "no Europa Point Stadium, em Gibraltar",
  swapHome: [["Tjay De Barr", { name: "Graeme Torrilla", number: "", id: "" }]],
  lead: P("Campeã do grupo pela primeira vez na história da competição, ", B("Malta"), " visita ", B("Gibraltar"), " nesta segunda-feira (16/11), às ", B("16h45 (de Brasília)"), ", no último jogo do Grupo 1 da Liga D da ", B("Liga das Nações"), ". A programação indica transmissão do ", B("Disney+"), "."),
  comoChegam: [
    "Gibraltar perdeu para Andorra por 2 a 0 em Encamp, na sexta-feira (13), com os dois gols no primeiro tempo. Foi a primeira derrota na campanha, depois dos empates com Andorra (0 a 0, em casa) e com Malta (1 a 1, fora). O time tem 2 pontos e 1 gol marcado em três jogos e não terá o atacante Tjay De Barr, suspenso pelo cartão amarelo recebido em Andorra.",
    "Malta, do técnico italiano Emilio De Leo, é a única seleção invicta do grupo: venceu Andorra duas vezes, por 2 a 1 fora e 1 a 0 em casa, e empatou com Gibraltar. A derrota de Gibraltar em Encamp garantiu aos malteses o 1º lugar com um jogo de antecedência. É a primeira vez que Malta termina na liderança de um grupo da Liga das Nações.",
  ],
  cardTitulo: "Situação no Grupo 1 da Liga D", cardSub: "Antes da 6ª e última rodada",
  extraRows: [["Andorra", "2º lugar, 4 pontos (campanha encerrada)"], ["Liga D", "todas as seleções sobem para a Liga C"]],
  tabelaTitulo: "Classificação do Grupo 1 da Liga D",
  emJogo: [
    "Ninguém tira Malta do topo: Gibraltar chega no máximo a 5 pontos. Como a UEFA vai acabar com a Liga D a partir de 2028/29, as três seleções do grupo já estão na Liga C da próxima edição. Para Gibraltar, o que está em jogo é o 2º lugar: só uma vitória serve, porque leva o time a 5 pontos, um a mais que Andorra. Com empate ou derrota, termina em 3º.",
    "Malta joga pela melhor campanha da divisão. Com uma vitória, chega a 10 pontos e passa o Azerbaijão, líder do Grupo 2, que fechou a fase com 8. Um empate deixa as duas com 8 pontos.",
  ],
  desfalques: [
    P(B("Gibraltar: "), "o atacante Tjay De Barr cumpre suspensão."),
  ],
  local: [
    "O Europa Point Stadium fica na ponta sul de Gibraltar, de frente para o Estreito, com a costa do Marrocos no horizonte. A bola rola às 20h45 no horário local.",
  ],
  faqCanal: "A programação indica transmissão do Disney+, no streaming, às 16h45 de Brasília. Como só um guia confirmou o canal até agora, vale conferir perto do jogo.",
  faqExtra: [
    ["Malta já subiu para a Liga C?", "Sim. Malta garantiu o 1º lugar do Grupo 1 da Liga D, e nesta edição todas as seleções da Liga D sobem para a Liga C, porque a divisão deixa de existir em 2028/29."],
    ["O que Gibraltar precisa para terminar em 2º?", "Vencer Malta. Com a vitória, Gibraltar chega a 5 pontos e passa Andorra, que fechou a campanha com 4."],
  ],
  excerpt: "Já campeã do grupo, Malta visita Gibraltar nesta segunda (16/11), às 16h45, pela Liga das Nações. Veja onde assistir e as prováveis escalações.",
  metaDescription: "Saiba onde assistir a Gibraltar x Malta nesta segunda (16/11), às 16h45, no Europa Point Stadium, pela Liga das Nações. Canal, tabela e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
