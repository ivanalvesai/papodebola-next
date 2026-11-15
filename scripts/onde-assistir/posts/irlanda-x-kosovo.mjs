// Irlanda x Kosovo — Liga das Nações, Liga B · Grupo 3, 6ª e última rodada, terça 17/11/2026 16h45. Jogo 15534164.
// Autor: Lucas Lima (2). Canal: Disney+ = FONTE ÚNICA (grade do Goal Brasil, consultada em 15/11,
//   https://www.goal.com/br/listas/futebol-programacao-jogos-tv-aberta-fechada-onde-assistir-online-app/bltc0a7361374657315)
//   → canalConfirmado:false. Rever na segunda (16) com mantosdofutebol.com.br/jogos-de-amanha-tv.
// Árbitro: não divulgado (omitido).
// Estádio: Aviva Stadium, Dublin — snapshot da API + Sky Sports (austria-1-0-republic-of-ireland...) + Irish News.
// Contas (simultâneo com Israel x Áustria): AUT 11 (já campeã), KOS 6 (-1), IRL 5 (+1), ISR 3 (-5).
//   IRL vence → IRL 2º (8). Empate → KOS 2º (7), IRL 3º garantido (se Israel vencer e chegar a 6, IRL leva no confronto direto: 3x0 e 1x1).
//   KOS vence → KOS 2º (9); IRL cai a 4º se Israel vencer a Áustria (6 x 5).
//   Se IRL vencer e Israel também, KOS e ISR empatam em 6; confronto direto 0x0 e 0x0 → saldo geral (KOS começa com 4 de vantagem).
// Desfalques (2 fontes): Veldin Hodža (Kosovo) expulso com o 2º amarelo aos 67' do 0 a 0 com Israel — Goal (en-in) + FotMob.
//   Swap Hodža -> Elvis Rexhbecaj (volta à lista de novembro, post da Kosovo Football no X; escolha nossa).
// Fora por fonte única: Nathan Collins (exame no joelho, só numa nota da PA) — não entra.
// Gol da Áustria: Sasa Kalajdzic, que saiu do banco, aos 79' — Sky Sports + vol.at/Eurosport.
import { B, P } from "../lexical.mjs";
import { watchPostV2, TER17 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: TER17, matchId: 15534164, authorId: 2, A: "Irlanda", Bn: "Kosovo", hora: "16h45",
  canal: "Disney+", canalConfirmado: false, canalLongo: "Disney+ (streaming), segundo a programação; confirme perto do jogo", canalCapaAlt: "no Disney+",
  competicaoLinha: "Liga das Nações 2026/27, Liga B, Grupo 3, 6ª e última rodada",
  localCurto: "Aviva Stadium, em Dublin (Irlanda)", ondeFrase: "no Aviva Stadium, em Dublin, na Irlanda",
  swapAway: [["Veldin Hodža", { name: "Elvis Rexhbecaj", number: "", id: "" }]],
  lead: P("A ", B("Irlanda"), " recebe o ", B("Kosovo"), " nesta terça-feira (17/11), às ", B("16h45 (de Brasília)"), ", em Dublin, numa final pelo 2º lugar do Grupo 3 da Liga B da ", B("Liga das Nações"), ", que leva ao play-off de acesso. Os irlandeses precisam vencer; o empate serve ao Kosovo. A programação indica transmissão do ", B("Disney+"), "."),
  comoChegam: [
    "A Irlanda de Heimir Hallgrímsson perdeu por 1 a 0 para a Áustria, em Linz, no sábado (14), com gol de Sasa Kalajdzic, que tinha saído do banco, aos 34 minutos do 2º tempo. O time criou chances, mas não marcou e ficou com 5 pontos, um a menos que o Kosovo. Troy Parrott é a principal arma: fez 4 dos 6 gols irlandeses na campanha, dois deles no 2 a 2 com a Áustria em Dublin.",
    "O Kosovo do alemão Franco Foda empatou por 0 a 0 com Israel em Pristina, também no sábado, e jogou com um a menos desde os 22 minutos do 2º tempo, quando Veldin Hodža recebeu o segundo amarelo. A defesa é o ponto forte: o time sofreu só 4 gols em cinco jogos. No 1º turno, em Pristina, o Kosovo venceu a Irlanda por 1 a 0, com gol do capitão Vedat Muriqi.",
  ],
  cardTitulo: "Situação no Grupo 3 da Liga B", cardSub: "Antes da 6ª e última rodada",
  extraRows: [["Irlanda", "precisa vencer para ficar com o 2º lugar"], ["Kosovo", "fica em 2º com vitória ou empate"]],
  tabelaTitulo: "Classificação do Grupo 3 da Liga B",
  emJogo: [
    "A Áustria, com 11 pontos, já é campeã do grupo e subiu para a Liga A. O 2º colocado disputa em março um play-off contra uma seleção da Liga A. Se a Irlanda vencer, chega a 8 pontos e fica com a vaga. Com empate, o Kosovo vai a 7 e termina em 2º, e a Irlanda, com 6, garante ao menos o 3º lugar: mesmo que Israel vença a Áustria e também chegue a 6, os irlandeses levam vantagem no confronto direto (3 a 0 e 1 a 1).",
    "A derrota é o cenário de risco para a Irlanda. Se o Kosovo vencer e Israel bater a Áustria, em Debrecen, no mesmo horário, os irlandeses caem para o 4º lugar e vão ao play-off contra um 2º colocado da Liga C. Já o Kosovo, se perder, só deixa o 3º lugar se Israel vencer e superar o saldo de gols kosovar; no confronto direto, as duas seleções empataram duas vezes por 0 a 0.",
  ],
  desfalques: [
    P(B("Kosovo: "), "Veldin Hodža, expulso contra Israel, cumpre suspensão. Elvis Rexhbecaj, que voltou à lista de Foda em novembro, é uma opção para o meio-campo."),
  ],
  local: [
    "O Aviva Stadium foi erguido no mesmo terreno da antiga Lansdowne Road, um dos campos de rúgbi e futebol mais antigos do mundo, e reabriu com o nome atual em 2010. É a casa das seleções irlandesas de futebol e de rúgbi. A bola rola às 19h45 no horário local.",
  ],
  faqCanal: "A programação indica transmissão do Disney+, no streaming, às 16h45 de Brasília. Como só um guia confirmou o canal até agora, vale conferir perto do jogo.",
  faqExtra: [
    ["O empate serve para quem em Irlanda x Kosovo?", "Para o Kosovo. Com empate, o Kosovo termina com 7 pontos e fica com o 2º lugar do Grupo 3, que leva ao play-off de acesso à Liga A. A Irlanda precisa vencer."],
    ["A Irlanda pode terminar em 4º lugar?", "Pode. Se perder para o Kosovo e Israel vencer a Áustria, a Irlanda fica com 5 pontos, contra 6 de Israel, e vai ao play-off contra um 2º colocado da Liga C."],
  ],
  excerpt: "Irlanda e Kosovo decidem o 2º lugar do Grupo 3 nesta terça (17/11), às 16h45, em Dublin, pela Liga das Nações. Veja onde assistir e as prováveis escalações.",
  metaDescription: "Saiba onde assistir a Irlanda x Kosovo nesta terça (17/11), às 16h45, em Dublin, pela Liga das Nações. Canal, cenários do 2º lugar e prováveis escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
