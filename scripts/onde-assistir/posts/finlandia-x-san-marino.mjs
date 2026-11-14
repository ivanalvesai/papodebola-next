// Finlândia x San Marino — Liga das Nações, Liga C · Grupo 1, 6ª rodada, domingo 15/11/2026 14h. Jogo 15534151.
// Autor: Lucas Lima (2). SporTV (futebolnatv + futebolplus); GE TV e Disney+ só no futebolplus. Árbitro: Georgi Kabakov (fonte única).
// XI provável: Markhiev (suspensão só no Sports Mole) sai, entra Kairinen; Fabbri (suspenso, segundo a federação de San Marino) sai, entra Riggioni.
import { B, P } from "../lexical.mjs";
import { watchPostV2, DOM15 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: DOM15, matchId: 15534151, authorId: 2, A: "Finlândia", Bn: "San Marino", hora: "14h",
  canal: "SporTV", canalLongo: "SporTV (TV fechada); um dos guias aponta também GE TV e Disney+", canalCapaAlt: "no SporTV",
  competicaoLinha: "Liga das Nações 2026/27, Liga C, Grupo 1, 6ª e última rodada",
  localCurto: "Bolt Arena, em Helsinque (Finlândia)", ondeFrase: "na Bolt Arena, em Helsinque, na Finlândia",
  arbitro: "Georgi Kabakov (Bulgária)",
  swapHome: [["Adam Markhiev", { name: "Kaan Kairinen", number: "", id: "" }]],
  swapAway: [["Filippo Fabbri", { name: "Bartolomeo Riggioni", number: "", id: "" }]],
  lead: P("A ", B("Finlândia"), " recebe ", B("San Marino"), " neste domingo (15/11), às ", B("14h (de Brasília)"), ", em Helsinque, na despedida das duas seleções da fase de grupos da ", B("Liga das Nações"), ". O jogo do Grupo 1 da Liga C tem transmissão do ", B("SporTV"), "."),
  comoChegam: [
    "A Finlândia de Jacob Friis perdeu para a Albânia por 2 a 0 em Tirana, na quinta-feira (12), e ficou sem chance de brigar pelo grupo. Hrádecký fez duas boas defesas, Leo Walta acertou a trave e o zagueiro Miro Tenho levou vermelho direto aos 22 do segundo tempo. Walta é o artilheiro finlandês na campanha, com 4 gols. Teemu Pohjanpalo tem 3, todos no 7 a 0 sobre San Marino, no 1º turno.",
    "San Marino, de Roberto Cevoli, perdeu por 2 a 0 para Belarus em Serravalle, diante de 365 torcedores, com os dois gols no primeiro tempo. O único gol sanmarinense na campanha foi de Lorenzo Lazzari, na derrota por 2 a 1 para a Albânia. A seleção está há 20 jogos sem vencer e perdeu os últimos 10 fora de casa. O atacante Nicolas Giacopetti volta de suspensão, e Nicola Nanni, com 5 gols em 59 jogos, é o maior goleador do elenco.",
  ],
  cardTitulo: "Situação no Grupo 1 da Liga C", cardSub: "Antes da 6ª e última rodada",
  extraRows: [["Finlândia", "termina em 3º"], ["San Marino", "termina em 4º, mas não cai"]],
  tabelaTitulo: "Classificação do Grupo 1 da Liga C",
  emJogo: [
    "As posições das duas seleções já estão definidas. A Finlândia, com 7 pontos, termina em 3º: mesmo chegando a 10, perderia o desempate para Belarus no confronto direto. San Marino, sem pontos, fica em 4º, mas não cai, porque a partir de 2028/29 os 3º e 4º colocados da Liga C permanecem na Liga C.",
    "Para os finlandeses, é a chance de fechar o ano com vitória diante da torcida, no primeiro jogo da seleção na Bolt Arena desde novembro de 2019, quando a vitória sobre Liechtenstein garantiu a vaga na Euro. O retrospecto é todo deles: uma nova derrota seria a 8ª seguida de San Marino para a Finlândia.",
  ],
  desfalques: [
    P(B("Finlândia: "), "o zagueiro Miro Tenho, expulso contra a Albânia, cumpre suspensão."),
    P(B("San Marino: "), "segundo a federação sanmarinense, o defensor Filippo Fabbri está suspenso pelo segundo amarelo, recebido contra Belarus, e Dante Rossi foi cortado por não estar em plenas condições. O zagueiro Bartolomeo Riggioni foi chamado."),
  ],
  local: [
    "O árbitro é o búlgaro Georgi Kabakov. A partida começa às 19h em Helsinque, 14h em Brasília.",
    "A Bolt Arena, no bairro de Töölö, é um estádio de grama sintética com capacidade para cerca de 10 mil pessoas e casa do HJK, o clube mais vitorioso do país.",
  ],
  faqCanal: "A partida tem transmissão do SporTV, na TV fechada, às 14h de Brasília. Um dos guias de programação aponta também GE TV e Disney+.",
  faqExtra: [
    ["Quanto foi o primeiro jogo entre Finlândia e San Marino nesta Liga das Nações?", "A Finlândia venceu por 7 a 0, em Serravalle, em 26 de setembro, com três gols de Pohjanpalo, dois de Walta, um de Svanbäck e um de Källman."],
    ["San Marino pode ser rebaixado?", "Não. Mesmo em último no Grupo 1, San Marino continua na Liga C, porque a competição muda de formato em 2028/29 e os 3º e 4º colocados da Liga C não caem."],
  ],
  excerpt: "Finlândia e San Marino se enfrentam neste domingo (15/11), às 14h, em Helsinque, pela Liga das Nações. Veja onde assistir, desfalques e prováveis escalações.",
  metaDescription: "Saiba onde assistir a Finlândia x San Marino neste domingo (15/11), às 14h, em Helsinque, pela Liga das Nações. Transmissão do SporTV e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
