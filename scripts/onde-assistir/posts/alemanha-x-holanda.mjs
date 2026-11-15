// Alemanha x Holanda — Liga das Nações, Liga A · Grupo 2, 6ª rodada, segunda 16/11/2026 16h45. Jogo 15534056.
// Autor: Ivan Alves (1). ESPN: Mantos do Futebol (https://mantosdofutebol.com.br/jogos-de-amanha-tv/, "ESPN e Disney+"),
//   meuguia.tv (https://meuguia.tv/programacao/canal/ESP, seg 16/11 16h30 "Alemanha x Holanda - Ao Vivo") e
//   Guia de TV (https://www.guiadetv.com/canal/espn). Disney+ só no Mantos → citado como "um dos guias".
// Local: Olympiastadion, Berlim (snapshot da API + bundesliga.com + khelnow). Árbitro: não divulgado (omitido).
// Desfalque: Frenkie de Jong cortado (costas), KNVB via NOS (https://nos.nl/artikel/2639482) + soccernews.nl + khelnow → swap por Koopmeiners (XI provável do khelnow).
// Belgrado 13/11: Sérvia 1x3 Alemanha, gol contra de Babić, Wirtz, Gruda; Babić descontou; Sérvia com 9 (Vavel + TNT Sports).
// Amsterdã 13/11: Holanda 7x0 Grécia — Summerville, Reijnders 3, Timber 2, Malen (sport24.gr; khelnow confirma hat-trick de Reijnders).
// Cenários (Art. 15, confronto direto: pontos, saldo, gols; sem gol fora) conferidos à mão, coerentes com grecia-x-servia.mjs:
//   GER vence + GRE não vence → GER 1º, NED 2º. GER vence + GRE vence → tríplice a 11: minitorneio todos com 5 pts;
//   saldo GRE -6 (3º); NED 7-m x GER m-1 (m = margem alemã) → GER 1º só com m >= 5 (m = 4 empata no saldo, NED tem mais gols).
//   Empate em Berlim: NED 1º; GER 2º só se GRE perder (9x9 → GRE pelo confronto direto). NED vence: GRE 2º com qualquer resultado.
//   → Holanda matematicamente garantida no top 2 (o texto da UEFA de 13/11 só diz "avoid defeat" / "Greece do not beat Serbia").
import { B, P } from "../lexical.mjs";
import { watchPostV2, SEG16 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: SEG16, matchId: 15534056, authorId: 1, A: "Alemanha", Bn: "Holanda", hora: "16h45",
  canal: "ESPN", canalLongo: "ESPN (TV fechada); um dos guias aponta também o Disney+", canalCapaAlt: "na ESPN",
  competicaoLinha: "Liga das Nações 2026/27, Liga A, Grupo 2, 6ª e última rodada",
  localCurto: "Estádio Olímpico de Berlim (Alemanha)", ondeFrase: "no Estádio Olímpico de Berlim, na Alemanha",
  swapAway: [["Frenkie de Jong", { name: "Teun Koopmeiners", number: "", id: "" }]],
  lead: P("Com vaga nas quartas de final em jogo, a ", B("Alemanha"), " recebe a ", B("Holanda"), " nesta segunda-feira (16/11), às ", B("16h45 (de Brasília)"), ", no Estádio Olímpico de Berlim, pela 6ª e última rodada do Grupo 2 da Liga A da ", B("Liga das Nações"), ". A transmissão é da ", B("ESPN"), ", na TV fechada."),
  comoChegam: [
    "A Alemanha de Jürgen Klopp venceu a Sérvia por 3 a 1 em Belgrado, na sexta-feira (13), contra um adversário que terminou com nove jogadores. Um gol contra de Srđan Babić abriu o placar logo no começo, Florian Wirtz ampliou e Brajan Gruda, em sua primeira partida como titular, fez o terceiro. A vitória levou o time a 8 pontos, mas não o tirou do 3º lugar: a derrota por 1 a 0 para a Grécia em casa, na 2ª rodada, e o 0 a 0 na Grécia deixam os gregos à frente no confronto direto.",
    "A Holanda de Xavi lidera invicta, com 11 pontos e 14 gols marcados, o melhor ataque do grupo. Na sexta, atropelou a Grécia por 7 a 0 em Amsterdã, com três gols de Tijjani Reijnders ainda no primeiro tempo, dois de Jurriën Timber além de um de Crysencio Summerville e outro de Donyell Malen. No 1º turno, também em Amsterdã, as duas seleções empataram por 1 a 1: Felix Nmecha marcou para a Alemanha, e Cody Gakpo empatou nos acréscimos.",
  ],
  cardTitulo: "Situação no Grupo 2 da Liga A", cardSub: "Antes da 6ª e última rodada",
  extraRows: [["Classificação às quartas", "1º e 2º colocados"], ["Holanda", "já garantida entre os dois primeiros"], ["Jogo no mesmo horário", "Grécia x Sérvia, em Volos"]],
  tabelaTitulo: "Classificação do Grupo 2 da Liga A",
  emJogo: [
    "Para a Alemanha, só a vitória resolve sem depender de ninguém. Vencendo, os alemães vão às quartas com qualquer resultado em Volos. Se a Grécia não ganhar da Sérvia, a Alemanha termina em 1º, porque leva a melhor sobre a Holanda no confronto direto. Se os gregos também vencerem, as três seleções empatam com 11 pontos e o desempate sai dos jogos entre elas: a Grécia, que levou 7 a 0 da Holanda, fica em 3º, e a Holanda só perde a liderança se a Alemanha ganhar por cinco gols de diferença ou mais. Um empate em Berlim só classifica a Alemanha se a Grécia perder. Com derrota, os alemães terminam em 3º.",
    "A Holanda já não sai dos dois primeiros. Mesmo perdendo, só ficaria fora se fosse superada por Alemanha e Grécia ao mesmo tempo, o que exigiria vitória das duas, e nesse empate triplo quem fica para trás são os gregos. Um empate ou uma vitória garantem o 1º lugar e o direito de decidir as quartas em casa, em março. Quem terminar em 3º não cai direto: os terceiros das quatro chaves da Liga A são comparados por pontos e saldo, os dois melhores continuam na elite e os dois piores disputam em março um play-off contra os vice-líderes da Liga B.",
  ],
  desfalques: [
    P(B("Holanda: "), "Frenkie de Jong saiu no intervalo contra a Grécia com dores nas costas e foi cortado da viagem a Berlim por precaução, segundo a federação holandesa. Ele voltou ao Barcelona, e Xavi não chamou substituto. Teun Koopmeiners é o nome mais provável para jogar ao lado de Joey Veerman."),
    P(B("Alemanha: "), "Klopp não tem desfalques confirmados. Gruda, que marcou em Belgrado, briga pela vaga no meio-campo ofensivo com Saïd El Mala e Lennart Karl."),
  ],
  local: [
    "O Estádio Olímpico de Berlim, com capacidade para cerca de 74 mil torcedores, foi erguido para os Jogos Olímpicos de 1936 e recebeu as finais da Copa do Mundo de 2006 e da Eurocopa de 2024. A UEFA ainda não divulgou a arbitragem. A bola rola às 20h45 no horário local.",
  ],
  faqCanal: "A partida tem transmissão da ESPN, na TV fechada, às 16h45 de Brasília. Um dos guias de programação indica também o Disney+.",
  faqExtra: [
    ["O que a Alemanha precisa para ir às quartas da Liga das Nações?", "Vencer a Holanda garante a vaga, seja qual for o resultado de Grécia x Sérvia. Com empate, a Alemanha só passa se a Grécia perder; com derrota, termina em 3º no grupo."],
    ["Frenkie de Jong joga Alemanha x Holanda?", "Não. O meia sentiu dores nas costas contra a Grécia e foi cortado da viagem a Berlim por precaução, segundo a federação holandesa."],
  ],
  excerpt: "Alemanha e Holanda se enfrentam nesta segunda (16/11), às 16h45, em Berlim, com vaga nas quartas da Liga das Nações em jogo. Veja onde assistir e as escalações.",
  metaDescription: "Saiba onde assistir a Alemanha x Holanda nesta segunda (16/11), às 16h45, em Berlim, pela Liga das Nações. Transmissão da ESPN, cenários e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
