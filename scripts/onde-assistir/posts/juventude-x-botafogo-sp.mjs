// Juventude x Botafogo-SP — Série B, 38ª e última rodada, sábado 14/11/2026 16h30. Jogo 15526391.
// Autor: Lucas Lima (2). ESPN/Disney+, XSports e GOAT (tabela da CBF). Fontes: juventude.com.br,
// Rádio Caxias, Boa Informação, Portal Mídia Esporte. Árbitro não divulgado até 13/11.
import { B, P } from "../lexical.mjs";
import { watchPostV2, SAB14 } from "../template-v2.mjs";

export const opts = {
  comp: "b", data: SAB14, matchId: 15526391, authorId: 2, A: "Juventude", Bn: "Botafogo-SP", hora: "16h30",
  canal: "ESPN, Disney+, XSports e GOAT", canalLongo: "ESPN (TV fechada), Disney+ (streaming), XSports e Canal GOAT", canalCapaAlt: "na ESPN e no Disney+",
  competicaoLinha: "Brasileirão Série B 2026, 38ª e última rodada",
  localCurto: "Estádio Alfredo Jaconi, em Caxias do Sul (RS)", ondeFrase: "no Estádio Alfredo Jaconi, em Caxias do Sul, no Rio Grande do Sul",
  // Juventude: Messias volta de suspensão no lugar de Gabriel Pinheiro (Rádio Caxias, 12/11).
  swapHome: [["Gabriel Barbosa Pinheiro", { name: "Messias", number: "4", id: "839765" }]],
  lead: P("O ", B("Juventude"), " pode confirmar a volta à Série A neste sábado (14/11), às ", B("16h30 (de Brasília)"), ", contra o ", B("Botafogo-SP"), ", no Alfredo Jaconi, pela última rodada da ", B("Série B"), ". O jogo tem transmissão da ", B("ESPN"), ", do ", B("Disney+"), ", da XSports e do Canal GOAT."),
  comoChegam: [
    "O Juventude é o vice-líder, com 68 pontos, e está invicto há seis rodadas: três vitórias e três empates. Na última, venceu o Cuiabá por 2 a 1 na Arena Pantanal, com um golaço de falta de Gabriel Pires, cobrada do meio-campo, e outro de Juan Christian. Em casa, onde goleou o Náutico por 4 a 0 nesta reta final, o time de Maurício Barbieri espera o Jaconi cheio: o primeiro lote promocional, a R$ 10, esgotou em três horas, e mais de 8,5 mil ingressos já tinham sido vendidos até quarta-feira (11).",
    "O Botafogo-SP é o 12º, com 51 pontos, sem chance de acesso e sem risco de queda, mas vive a melhor fase do ano: cinco vitórias e um empate nos últimos seis jogos, a mais recente uma goleada por 4 a 0 sobre o Londrina. O técnico Cláudio Tencati volta à beira do campo depois de cumprir suspensão e disse que vai usar o jogo para avaliar atletas em fim de contrato. No 1º turno, o Pantera venceu o Juventude por 4 a 2, em Ribeirão Preto.",
  ],
  cardTitulo: "Situação na Série B", cardSub: "Antes da 38ª e última rodada",
  extraRows: [["Líder", "Novorizontino, 70 pontos (já promovido)"], ["3º colocado", "Vila Nova, 66 pontos"]],
  tabela: [1, 8], tabelaTitulo: "Classificação da Série B (1º ao 8º)",
  emJogo: [
    "A conta do Juventude é simples: vencendo, sobe direto para a Série A, sem depender de ninguém. Com empate ou derrota, ainda sobe se o Vila Nova não vencer o Fortaleza no mesmo horário. No pior cenário, termina em 3º e disputa o playoff de acesso com a vantagem do empate.",
    "Há ainda o título. O Novorizontino, com 70 pontos, é campeão se não perder para o Criciúma. Se o líder perder e o Juventude vencer, a taça vai para Caxias do Sul.",
    "Pelo regulamento de 2026, só 1º e 2º sobem direto; do 3º ao 6º, os times fazem playoffs em ida e volta (3º x 6º e 4º x 5º), em 21 e 28 de novembro, com uma vaga em cada confronto.",
  ],
  desfalques: [
    P(B("Juventude: "), "o zagueiro Messias e o volante Lucas Mineiro voltam depois de cumprir suspensão. A dúvida é jurídica: o STJD suspendeu Marcos Paulo, Pedro Rocha e Luan Martins por quatro jogos, por reclamações contra a arbitragem no empate com o Ceará, em outubro. O clube pediu efeito suspensivo, com resposta prevista para sexta-feira (13). Se o pedido for negado, Gabriel Pinheiro entra na zaga no lugar de Marcos Paulo."),
    P(B("Botafogo-SP: "), "o lateral-esquerdo Patrick Brey e o volante Morelli cumprem suspensão pelo terceiro cartão amarelo."),
  ],
  provHome: "Jandrei; Rodrigo Sam, Messias e Marcos Paulo (Gabriel Pinheiro); Aderlan, Gabriel Pires, Raí Silva e Diogo Barbosa; Fábio Lima, Marcos Paulo (MP) e Alisson Safira, segundo a Rádio Caxias",
  labelAway: "Base do último jogo",
  provAway: "Jordan; Jonathan, Vilar e Darlan; Gabriel Inocêncio, Leandro Maciel, Rafael Gava e Patrick Brey; Everton Morelli e Wesley Pinheiro; Hygor (base da goleada sobre o Londrina; Patrick Brey e Morelli estão suspensos)",
  lineupNote: "Os técnicos só confirmam os titulares perto do jogo. No Juventude, o campinho mostra a escalação provável segundo a imprensa de Caxias do Sul; no Botafogo-SP, a base do último jogo, que terá duas mudanças forçadas. A lista oficial sai cerca de uma hora antes da bola rolar.",
  local: [
    "A arbitragem ainda não tinha sido divulgada pela CBF até a véspera.",
    "O Alfredo Jaconi abre os portões às 14h30. O ingresso geral custa R$ 120 (meia R$ 60), crianças até 11 anos não pagam e sócios Jaconero entram de graça. A bilheteria, junto ao Portão 1, na Rua Hércules Galló, funciona até as 17h30 de sábado.",
  ],
  faqCanal: "A partida tem transmissão da ESPN, na TV fechada, do Disney+, no streaming, e também da XSports e do Canal GOAT, às 16h30 de Brasília.",
  faqExtra: [
    ["O Juventude sobe com empate contra o Botafogo-SP?", "Depende do Vila Nova. Com empate, o Juventude sobe se o Vila Nova não vencer o Fortaleza. Com vitória, sobe direto, independentemente dos outros jogos."],
    ["O Juventude ainda pode ser campeão da Série B?", "Sim, se vencer o Botafogo-SP e o Novorizontino perder para o Criciúma."],
  ],
  excerpt: "Juventude e Botafogo-SP se enfrentam às 16h30 deste sábado (14/11), no Jaconi, na última rodada da Série B. Veja onde assistir, as contas do acesso e as escalações.",
  metaDescription: "Saiba onde assistir a Juventude x Botafogo-SP neste sábado (14/11), às 16h30, no Jaconi, pela Série B. Transmissão da ESPN e Disney+, acesso em jogo e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
