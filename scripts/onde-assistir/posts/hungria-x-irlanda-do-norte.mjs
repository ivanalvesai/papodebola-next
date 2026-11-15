// Hungria x Irlanda do Norte — Liga das Nações, Liga B · Grupo 2, 6ª e última rodada, terça 17/11/2026 16h45. Jogo 15534132.
// Autor: Ivan Alves (1). Canal: SporTV 3 = FONTE ÚNICA (grade do Goal Brasil, consultada em 15/11,
//   https://www.goal.com/br/listas/futebol-programacao-jogos-tv-aberta-fechada-onde-assistir-online-app/bltc0a7361374657315)
//   → canalConfirmado:false. Rever na segunda (16) com mantosdofutebol.com.br/jogos-de-amanha-tv; se bater, virar true e tirar a ressalva.
// Árbitro: não divulgado (omitido).
// Estádio: Puskás Aréna, Budapeste — snapshot da API (venue) + lovebelfast.co.uk (convocação) + Irish News.
// Regulamento (UEFA, all-you-need-to-know 2026/27): Liga B 1º sobe; 2º vai ao play-off A/B (março/2027); 3º fica; 4º play-off B/C.
// Contas: NI 11 x HUN 10. Vitória húngara = HUN 13 (1º). Empate = NI 12 x HUN 11 (NI 1º). Não há empate em pontos possível;
//   o confronto direto (0 a 0 em Belfast) não entra. Ucrânia (máx. 7) não alcança: os dois já têm ao menos o 2º lugar.
// Desfalques (2 fontes): Jamie Donley suspenso (amarelo por reclamação no 1 a 0 sobre a Ucrânia) e o técnico Michael O'Neill
//   também suspenso (vê do camarote) — lovebelfast.co.uk/northern-ireland-1-0-ukraine-match-report-devlin/ e
//   irishnews.com (michael-oneill-hails-dream-terry-devlin...). Swap Donley -> Callum Marshall (atacante da lista; escolha nossa).
// Gol de Terry Devlin aos 68' (1º pela seleção), assistência de Galbraith — lovebelfast + 112.ua.
// Hungria 2 x 0 Geórgia: gol contra de Lasha Dvali (73') e Barnabás Varga (85', assistência de Szoboszlai) — ESPN + FotMob.
import { B, P } from "../lexical.mjs";
import { watchPostV2, TER17 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: TER17, matchId: 15534132, authorId: 1, A: "Hungria", Bn: "Irlanda do Norte", hora: "16h45",
  canal: "SporTV 3", canalConfirmado: false, canalLongo: "SporTV 3 (TV fechada), segundo a programação; confirme perto do jogo", canalCapaAlt: "no SporTV 3",
  competicaoLinha: "Liga das Nações 2026/27, Liga B, Grupo 2, 6ª e última rodada",
  localCurto: "Puskás Aréna, em Budapeste (Hungria)", ondeFrase: "na Puskás Aréna, em Budapeste, capital da Hungria",
  swapAway: [["Jamie Donley", { name: "Callum Marshall", number: "", id: "" }]],
  lead: P("A ", B("Hungria"), " recebe a ", B("Irlanda do Norte"), " nesta terça-feira (17/11), às ", B("16h45 (de Brasília)"), ", em Budapeste, num jogo que decide quem sobe para a Liga A da ", B("Liga das Nações"), ". Os norte-irlandeses jogam pelo empate; os húngaros precisam vencer. A programação indica transmissão do ", B("SporTV 3"), "."),
  comoChegam: [
    "A Irlanda do Norte de Michael O'Neill lidera o Grupo 2 com 11 pontos e ainda não sofreu gol na campanha: são 5 marcados e nenhum contra em cinco jogos. No sábado (14), venceu a Ucrânia por 1 a 0 no Windsor Park com um chute de Terry Devlin no ângulo, aos 23 minutos do 2º tempo, o primeiro gol dele pela seleção. O jogo custou caro: o atacante Jamie Donley e o próprio O'Neill levaram amarelo por reclamação e estão suspensos. O técnico vai acompanhar a partida da arquibancada.",
    "A Hungria do italiano Marco Rossi tem 10 pontos e venceu os três últimos jogos. No sábado, ganhou da Geórgia por 2 a 0 em Tbilisi, com um gol contra de Lasha Dvali e outro de Barnabás Varga, a cinco minutos do fim, em passe de Dominik Szoboszlai. O meia do Liverpool participou dos dois lances. A única derrota húngara na campanha foi na estreia, 1 a 0 para a Ucrânia em casa.",
  ],
  cardTitulo: "Situação no Grupo 2 da Liga B", cardSub: "Antes da 6ª e última rodada",
  extraRows: [["Irlanda do Norte", "sobe com vitória ou empate"], ["Hungria", "só sobe se vencer"]],
  tabelaTitulo: "Classificação do Grupo 2 da Liga B",
  emJogo: [
    "O 1º colocado da Liga B sobe direto para a Liga A; o 2º disputa em março um play-off de ida e volta contra uma seleção da Liga A. Com vitória, a Hungria chega a 13 pontos e fica com a vaga. Com empate, a Irlanda do Norte vai a 12, contra 11 dos húngaros, e conquista o acesso inédito. Não há combinação que deixe as duas empatadas em pontos, então o 0 a 0 do 1º turno, em Belfast, não entra na conta.",
    "Quem perder a disputa não cai para o 3º lugar: a Ucrânia, que enfrenta a Geórgia no mesmo horário, chega no máximo a 7 pontos. O 2º colocado do grupo ainda terá a chance de subir pelo play-off.",
  ],
  desfalques: [
    P(B("Irlanda do Norte: "), "Jamie Donley cumpre suspensão por acúmulo de amarelos, e Michael O'Neill também está suspenso. Callum Marshall e Josh Magennis são as opções da lista para o ataque."),
  ],
  local: [
    "A Puskás Aréna, inaugurada em 2019 no lugar do antigo Népstadion, leva o nome do maior jogador da história do futebol húngaro e é a casa da seleção. A bola rola às 20h45 no horário local.",
  ],
  faqCanal: "A programação indica transmissão do SporTV 3, na TV fechada, às 16h45 de Brasília. Como só um guia confirmou o canal até agora, vale conferir perto do jogo.",
  faqExtra: [
    ["O que a Irlanda do Norte precisa para subir para a Liga A?", "Basta um empate. Com 11 pontos, contra 10 da Hungria, a Irlanda do Norte termina em 1º com qualquer resultado que não seja derrota em Budapeste."],
    ["O que acontece com quem terminar em 2º no Grupo 2?", "O 2º colocado da Liga B disputa em março de 2027 um play-off de ida e volta contra uma seleção da Liga A, valendo vaga na primeira divisão da Liga das Nações."],
  ],
  excerpt: "Hungria e Irlanda do Norte decidem o acesso à Liga A nesta terça (17/11), às 16h45, em Budapeste. Veja onde assistir, desfalques e prováveis escalações.",
  metaDescription: "Saiba onde assistir a Hungria x Irlanda do Norte nesta terça (17/11), às 16h45, em Budapeste, pela Liga das Nações. Canal, cenários do acesso e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
