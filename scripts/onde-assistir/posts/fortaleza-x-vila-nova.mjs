// Fortaleza x Vila Nova — Série B, 38ª e última rodada, sábado 14/11/2026 16h30. Jogo 15526386.
// Autor: Ivan Alves (1). ESPN/Disney+ (tabela detalhada da CBF). Fontes: Diário do Nordeste, O Povo,
// Esporte Goiano, Futebol Interior, O Popular, escala da CBF.
import { B, P } from "../lexical.mjs";
import { watchPostV2, SAB14 } from "../template-v2.mjs";

export const opts = {
  comp: "b", data: SAB14, matchId: 15526386, authorId: 1, A: "Fortaleza", Bn: "Vila Nova", hora: "16h30",
  canal: "ESPN e Disney+", canalLongo: "ESPN (TV fechada) e Disney+ (streaming)", canalCapaAlt: "na ESPN e no Disney+",
  competicaoLinha: "Brasileirão Série B 2026, 38ª e última rodada",
  localCurto: "Arena Castelão, em Fortaleza (CE)", ondeFrase: "na Arena Castelão (Estádio Governador Plácido Castelo), em Fortaleza, no Ceará",
  arbitro: "Raphael Claus (SP/Fifa); VAR: Rodolpho Toski Marques (PR)",
  // Vila Nova: André Luís (lombar) fora; tendência é Dellatorre na vaga (Esporte Goiano, 12/11).
  swapAway: [["André Luís", { name: "Dellatorre", number: "", id: "" }]],
  lead: P("O ", B("Fortaleza"), " recebe o ", B("Vila Nova"), " neste sábado (14/11), às ", B("16h30 (de Brasília)"), ", na Arena Castelão, pela 38ª e última rodada da ", B("Série B"), ". O jogo tem transmissão da ", B("ESPN"), " e do ", B("Disney+"), ". O Vila Nova ainda sonha com o acesso direto, e o Fortaleza marca a volta de Juan Pablo Vojvoda ao comando, diante de mais de 29 mil torcedores."),
  comoChegam: [
    "O Fortaleza já tem vaga garantida no playoff de acesso e trocou de técnico na reta final. Paulo Autuori foi demitido depois da derrota por 2 a 1 para o Novorizontino, e o clube trouxe de volta Juan Pablo Vojvoda, ídolo recente da torcida. O argentino e toda a comissão aceitaram trabalhar sem salário nos três jogos que restam em 2026, este e os dois do mata-mata, sem acerto para 2027. \"Eu quero que o Fortaleza esteja na Série A\", disse Vojvoda na chegada. Seis jogadores do elenco já trabalharam com ele, entre eles João Ricardo, Tomás Cardona, Lucas Sasha e Lucas Crispim. Nas seis últimas rodadas, o Tricolor somou uma vitória, quatro empates e uma derrota.",
    "O Vila Nova é o 3º colocado, com 66 pontos, e já tem pelo menos essa posição garantida. O time de Guto Ferreira vem de vitória por 1 a 0 sobre o Criciúma, em Goiânia, e não perdeu para nenhum dos quatro primeiros colocados nas últimas semanas: empatou com Novorizontino e Juventude, ambos por 2 a 2. No 1º turno, venceu o Fortaleza por 2 a 1, em Goiânia.",
  ],
  cardTitulo: "Situação na Série B", cardSub: "Antes da 38ª e última rodada",
  extraRows: [["Acesso direto", "1º e 2º colocados"], ["Playoff", "3º x 6º e 4º x 5º, em ida e volta"]],
  tabela: [1, 8], tabelaTitulo: "Classificação da Série B (1º ao 8º)",
  emJogo: [
    "Pelo regulamento de 2026, só os dois primeiros sobem direto. Do 3º ao 6º, os times disputam playoffs em ida e volta (3º x 6º e 4º x 5º), nos dias 21 e 28 de novembro, e cada confronto vale uma vaga na Série A. O time de melhor campanha decide em casa e avança com empate no placar agregado.",
    "O Vila Nova precisa vencer e torcer para o Juventude, que tem 68 pontos, não ganhar do Botafogo-SP. Nesse cenário, os dois terminam com 69, e o time goiano fica com a vaga pelo número de vitórias (20 a 19). Em qualquer outro resultado, o Vila Nova termina em 3º e vai ao playoff contra o 6º colocado, com a vantagem do empate.",
    "O Fortaleza não tem mais chance de subir direto e já sabe que vai enfrentar o Criciúma no playoff. O que se decide é a ordem: o Tricolor só termina em 4º, e faz a volta em casa, se somar mais pontos que o catarinense nesta rodada. Os dois têm 62, mas o Criciúma leva vantagem nas vitórias (18 a 16).",
  ],
  desfalques: [
    P(B("Fortaleza: "), "o clube não divulgou lista de lesionados ou suspensos. Segundo a imprensa cearense, a comissão de Vojvoda usou os dois treinos da semana para definir o time-base, já pensando nos dois jogos contra o Criciúma."),
    P(B("Vila Nova: "), "o atacante André Luís, vice-artilheiro do time com 9 gols, tem dores na lombar e não viajou; a tendência é a entrada de Dellatorre, com Lincoln como opção. O lateral Hayner cumpre suspensão de dois jogos imposta pelo STJD, e Rafa Silva também ficou em Goiânia por problema físico. Bruno Xavier foi relacionado. O time tem 12 pendurados, e quem levar o terceiro amarelo desfalca o jogo de ida do playoff."),
  ],
  provAway: "Helton Leite; Igor Cariús, Jonathan Costa, Douglas Mendes e Higor; Dudu dos Santos e Dodô; Everton Galdino, Marquinhos Gabriel e Janderson; Dellatorre",
  labelHome: "Base do último jogo",
  lineupNote: "Os técnicos só confirmam os titulares perto do jogo. No Fortaleza, que estreia o novo técnico, o campinho mostra a base do último jogo; no Vila Nova, a escalação provável segundo a imprensa goiana. A lista oficial sai cerca de uma hora antes da bola rolar.",
  local: [
    "A CBF escalou um árbitro Fifa para o jogo: Raphael Claus (SP) apita, com Danilo Ricardo Simon Manis e Evandro de Melo Lima, ambos de São Paulo, como assistentes. No VAR, Rodolpho Toski Marques (PR).",
    "A Arena Castelão deve receber grande público: até quinta-feira (12), 29.065 torcedores já tinham ingresso, vendido pela plataforma Fortaleza Ingresse.",
  ],
  faqCanal: "A partida tem transmissão da ESPN, na TV fechada, e do Disney+, no streaming, às 16h30 de Brasília.",
  faqExtra: [
    ["O que o Vila Nova precisa para subir direto para a Série A?", "Vencer o Fortaleza e torcer para o Juventude não vencer o Botafogo-SP. Com qualquer outro resultado, o Vila Nova termina em 3º e disputa o playoff de acesso contra o 6º colocado."],
    ["Quem o Fortaleza enfrenta no playoff da Série B?", "O Criciúma. Os dois já estão travados entre o 4º e o 5º lugar; a última rodada define quem decide a volta em casa. Os jogos são em 21 e 28 de novembro."],
  ],
  excerpt: "Fortaleza e Vila Nova se enfrentam às 16h30 deste sábado (14/11), no Castelão, na última rodada da Série B. Veja onde assistir, o que cada um precisa e as escalações.",
  metaDescription: "Saiba onde assistir a Fortaleza x Vila Nova neste sábado (14/11), às 16h30, no Castelão, pela Série B. Transmissão da ESPN e Disney+, contas do acesso e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
