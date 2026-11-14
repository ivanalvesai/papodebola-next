// Chipre x Montenegro — Liga das Nações, Liga C · Grupo 2, 6ª rodada, domingo 15/11/2026 11h. Jogo 15534184.
// Autor: Lucas Lima (2). ESPN (futebolnatv + futebolplus); Disney+ só no futebolplus. Árbitro: Sander van der Eijk (fonte única).
import { B, P } from "../lexical.mjs";
import { watchPostV2, DOM15 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: DOM15, matchId: 15534184, authorId: 2, A: "Chipre", Bn: "Montenegro", hora: "11h",
  canal: "ESPN", canalLongo: "ESPN (TV fechada); um dos guias de programação aponta também o Disney+", canalCapaAlt: "na ESPN",
  competicaoLinha: "Liga das Nações 2026/27, Liga C, Grupo 2, 6ª e última rodada",
  localCurto: "Alphamega Stadium, em Kolossi (Chipre)", ondeFrase: "no Alphamega Stadium, em Kolossi, na região de Limassol, no Chipre",
  arbitro: "Sander van der Eijk (Holanda)",
  lead: P("Com as duas vagas do Grupo 2 já resolvidas, ", B("Chipre"), " e ", B("Montenegro"), " fazem neste domingo (15/11), às ", B("11h (de Brasília)"), ", o último jogo da fase de grupos da ", B("Liga das Nações"), ", em Kolossi. Montenegro já subiu para a Liga B, e o Chipre já garantiu o play-off de acesso. A transmissão é da ", B("ESPN"), "."),
  comoChegam: [
    "O Chipre de Akis Mantzios empatou por 1 a 1 com a Armênia, em Yerevan, na quinta-feira (12). Iasonas Pikis abriu o placar aos 9 minutos, na estreia pela seleção, e Malekkidis ainda acertou a trave antes do intervalo. O ponto bastou para travar o 2º lugar e levar o país pela primeira vez aos play-offs de acesso da Liga das Nações. \"Esta equipe merece aplausos\", resumiu o técnico. Marcus Edwards é o artilheiro cipriota na campanha, com 2 gols.",
    "Montenegro, de Mirko Vučinić, fez 2 a 1 na Letônia em Podgorica, com gol de Nikola Krstović aos 25 do segundo tempo e de Aleksa Maraš nos acréscimos, e confirmou o título do grupo com uma rodada de antecedência. Krstović é o goleador do time, com 3 gols. O meia Vasilije Adžić, de 20 anos, também vive boa fase: fez os dois gols da vitória por 2 a 1 em Riga, no 1º turno.",
  ],
  cardTitulo: "Situação no Grupo 2 da Liga C", cardSub: "Antes da 6ª e última rodada",
  extraRows: [["Montenegro", "campeão do grupo, sobe para a Liga B"], ["Chipre", "2º garantido, vai ao play-off de março"]],
  tabelaTitulo: "Classificação do Grupo 2 da Liga C",
  emJogo: [
    "Na tabela, nada muda. Montenegro tem 13 pontos e não pode mais ser alcançado, e o Chipre, com 8, também não perde o 2º lugar: a Armênia chegaria no máximo a 8, mas o Chipre leva a melhor no confronto direto (2 a 0 em casa e 1 a 1 fora).",
    "O jogo vale ranking e confiança. O Chipre vai disputar em março o play-off contra um 4º colocado da Liga B, com sorteio marcado para o dia 20 de novembro, e quer chegar embalado. Há também um tabu para quebrar: os cipriotas nunca venceram Montenegro, com três empates e três derrotas nos seis últimos duelos. No 1º turno, em Podgorica, Montenegro ganhou por 2 a 1.",
  ],
  desfalques: [
    P(B("Montenegro: "), "o capitão e zagueiro Stefan Savić foi expulso com o segundo amarelo contra a Letônia e cumpre suspensão. O lateral Adam Marušić e o meia Sead Hakšabanović voltaram a ser convocados nesta data FIFA."),
  ],
  local: [
    "O árbitro é o holandês Sander van der Eijk. A partida começa às 16h no horário local, 11h em Brasília.",
    "O Alphamega Stadium, em Kolossi, perto de Limassol, é um dos estádios mais novos do país e virou a casa da seleção cipriota nos últimos anos.",
  ],
  faqCanal: "A partida tem transmissão da ESPN, na TV fechada, às 11h de Brasília. Um dos guias de programação aponta também o Disney+.",
  faqExtra: [
    ["Montenegro já subiu para a Liga B?", "Sim. Com 13 pontos, Montenegro garantiu o 1º lugar do Grupo 2 da Liga C e o acesso à Liga B ao vencer a Letônia na 5ª rodada."],
    ["Contra quem o Chipre joga o play-off?", "Contra um dos 4º colocados da Liga B, em ida e volta, em março de 2027. O sorteio está marcado para 20 de novembro."],
  ],
  excerpt: "Chipre e Montenegro fecham o Grupo 2 da Liga C neste domingo (15/11), às 11h, em Kolossi. Veja onde assistir, o que está em jogo e as prováveis escalações.",
  metaDescription: "Saiba onde assistir a Chipre x Montenegro neste domingo (15/11), às 11h, pela Liga das Nações. Transmissão da ESPN, situação do grupo e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
