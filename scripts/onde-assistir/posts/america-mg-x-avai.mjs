// América-MG x Avaí — Série B, 38ª e última rodada, sábado 14/11/2026 16h30. Jogo 15526384.
// Autor: Lucas Lima (2). ESPN/Disney+, SportyNet e XSports (tabela da CBF). Fontes: avai.com.br,
// O Tempo, Diário do Nordeste, Engeplus, Tudo Aqui SC, escala da CBF.
import { B, P } from "../lexical.mjs";
import { watchPostV2, SAB14 } from "../template-v2.mjs";

export const opts = {
  comp: "b", data: SAB14, matchId: 15526384, authorId: 2, A: "América-MG", Bn: "Avaí", hora: "16h30",
  canal: "ESPN, Disney+, SportyNet e XSports", canalLongo: "ESPN (TV fechada), Disney+ (streaming), SportyNet e XSports", canalCapaAlt: "na ESPN e no Disney+",
  competicaoLinha: "Brasileirão Série B 2026, 38ª e última rodada",
  localCurto: "Arena Independência, em Belo Horizonte (MG)", ondeFrase: "na Arena Independência, em Belo Horizonte, Minas Gerais",
  arbitro: "Matheus Delgado Candançan (SP)",
  lead: P("O ", B("Avaí"), " joga a vida na ", B("Série B"), " neste sábado (14/11), às ", B("16h30 (de Brasília)"), ", contra o ", B("América-MG"), ", na Arena Independência. Para escapar do rebaixamento, o time catarinense precisa vencer e torcer contra o Ceará. O jogo tem transmissão da ", B("ESPN"), ", do ", B("Disney+"), ", da SportyNet e da XSports."),
  comoChegam: [
    "O Avaí é o 17º, com 40 pontos, o primeiro dentro da zona de rebaixamento. Adiou a queda na rodada passada, ao vencer o São Bernardo por 2 a 1 na Ressacada, com gols de Walison e Gaspar. O técnico Marquinhos Santos deve manter as mudanças feitas para aquele jogo, com o goleiro Bruno Ferreira no banco depois de falhas recentes, e afastou o zagueiro Jefferson Maciel: \"Eu não conto mais com ele esse ano\". A torcida se mobilizou: a associação Todos Pelo Avaí abriu uma vaquinha para pagar uma premiação aos jogadores em caso de vitória, que passou de R$ 10 mil e recebeu até doações de torcedores do Fortaleza, rival do Ceará.",
    "O América-MG já está rebaixado, em 19º com 29 pontos, mas vive a melhor sequência do ano: quatro vitórias seguidas desde a chegada do técnico Moacir Júnior, a última por 1 a 0 sobre o próprio Ceará, no Castelão. \"O grupo trabalhou muito forte para resgatar a dignidade\", disse o treinador. No 1º turno, o Avaí venceu por 2 a 1, em Florianópolis.",
  ],
  cardTitulo: "Situação na Série B", cardSub: "Antes da 38ª e última rodada",
  extraRows: [["16º lugar (fora do Z-4)", "Ceará, 43 pontos (11 vitórias)"], ["Rebaixados", "Ponte Preta, Londrina e América-MG"]],
  tabela: [13, 20], tabelaTitulo: "Classificação da Série B (13º ao 20º)",
  emJogo: [
    "Os quatro últimos caem para a Série C, e três vagas já estão definidas: Ponte Preta, Londrina e o próprio América-MG. A última fica entre Avaí e Ceará, que joga contra o CRB em Maceió, no mesmo horário.",
    "O Avaí só escapa se vencer e o Ceará perder. Nesse cenário, os dois terminam com 43 pontos e o Avaí fica à frente pelo número de vitórias, primeiro critério de desempate (12 a 11). Qualquer outra combinação rebaixa o time catarinense, que foi campeão da Série C em 1998 e desde então só disputou as Séries A e B.",
  ],
  desfalques: [
    P(B("América-MG: "), "o lateral-esquerdo Luidy cumpre suspensão pelo terceiro amarelo, e o departamento médico tem oito jogadores: Gabriel Domingos, Alê e Mastriani, operados no joelho, Heitor, Alex Silva, Kaique Zizero, Fábio e Luca Sosa. O zagueiro Rafa Barcelos, que vinha jogando na lateral direita, volta de suspensão."),
    P(B("Avaí: "), "além do zagueiro Jefferson Maciel, afastado, o clube não divulgou desfalques por lesão ou suspensão."),
  ],
  labelHome: "Base do último jogo", labelAway: "Base do último jogo",
  lineupNote: "Nenhum dos dois clubes adiantou a escalação. Os campinhos mostram a base do último jogo de cada time; no Avaí, a tendência é repetir a formação que venceu o São Bernardo. A lista oficial sai cerca de uma hora antes da bola rolar.",
  local: [
    "A arbitragem é de Matheus Delgado Candançan (SP).",
    "O jogo é na Arena Independência, o Estádio Raimundo Sampaio, no bairro do Horto, em Belo Horizonte.",
  ],
  faqCanal: "A partida tem transmissão da ESPN, na TV fechada, do Disney+, no streaming, e também da SportyNet e da XSports, às 16h30 de Brasília.",
  faqExtra: [
    ["O que o Avaí precisa para não cair para a Série C?", "Vencer o América-MG e torcer para o Ceará perder para o CRB. Com 43 pontos, o Avaí ficaria à frente do Ceará pelo número de vitórias (12 a 11)."],
    ["O América-MG já está rebaixado?", "Sim. Com 29 pontos, o América-MG não alcança mais o 16º colocado e vai disputar a Série C em 2027."],
  ],
  excerpt: "América-MG e Avaí se enfrentam às 16h30 deste sábado (14/11), no Independência. O Avaí precisa vencer e torcer contra o Ceará para não cair. Veja onde assistir.",
  metaDescription: "Saiba onde assistir a América-MG x Avaí neste sábado (14/11), às 16h30, no Independência, pela Série B. Avaí luta contra a queda; passa na ESPN e no Disney+.",
};
export default (ctx) => watchPostV2(opts, ctx);
