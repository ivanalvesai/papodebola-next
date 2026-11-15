// Israel x Áustria — Liga das Nações, Liga B · Grupo 3, 6ª e última rodada, terça 17/11/2026 16h45. Jogo 15534154.
// Autor: Ivan Alves (1). Canal: ESPN 4 + Disney+ = FONTE ÚNICA (grade do Goal Brasil, consultada em 15/11,
//   https://www.goal.com/br/listas/futebol-programacao-jogos-tv-aberta-fechada-onde-assistir-online-app/bltc0a7361374657315)
//   → canalConfirmado:false. Rever na segunda (16) com mantosdofutebol.com.br/jogos-de-amanha-tv.
// Árbitro: não divulgado (omitido).
// Estádio (Israel manda fora do país): Nagyerdei Stadion, Debrecen (Hungria) — snapshot da API + Sports Mole
//   (https://www.sportsmole.co.uk/football/israel/uefa-nations-league/preview/israel-vs-austria-prediction-team-news-lineups_609141.html)
//   + FotMob (https://www.fotmob.com/matches/austria-vs-israel/2c8zd0).
// Contas (simultâneo com Irlanda x Kosovo): AUT 11 (já campeã e promovida), KOS 6 (-1), IRL 5 (+1), ISR 3 (-5).
//   Israel sem vitória = 4º certo. Israel vence (6): KOS vence → ISR 3º (IRL 5); empate → ISR 4º (IRL 6, confronto direto IRL 3x0 e 1x1);
//   IRL vence → ISR e KOS com 6, confronto direto 0x0 e 0x0 → saldo geral (KOS começa com 4 gols de vantagem).
// Desfalques (2 fontes): Raz Shlomo suspenso por acúmulo de amarelos — Sports Mole + FotMob. Swap Shlomo -> Ilay Feingold
//   (XI provável do Sports Mole). Fora por fonte única: Orian Goren (muscular), Chukwuemeka e Grüll (Áustria) — não entram.
// Gol da Áustria no sábado: Sasa Kalajdzic (79', saiu do banco) — Sky Sports + vol.at/Eurosport.
// 1º turno, Linz, 3 x 1: Sayed Abu Farchi empatou e foi expulso pelo 2º amarelo na comemoração — Al Jazeera + ABC News (AP).
import { B, P } from "../lexical.mjs";
import { watchPostV2, TER17 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: TER17, matchId: 15534154, authorId: 1, A: "Israel", Bn: "Áustria", hora: "16h45",
  canal: "ESPN 4 e Disney+", canalConfirmado: false, canalLongo: "ESPN 4 (TV fechada) e Disney+ (streaming), segundo a programação; confirme perto do jogo", canalCapaAlt: "na ESPN 4 e no Disney+",
  competicaoLinha: "Liga das Nações 2026/27, Liga B, Grupo 3, 6ª e última rodada",
  localCurto: "Nagyerdei Stadion, em Debrecen (Hungria)", ondeFrase: "no Nagyerdei Stadion, em Debrecen, na Hungria, campo neutro escolhido por Israel",
  swapHome: [["Raz Shlomo", { name: "Ilay Feingold", number: "", id: "" }]],
  lead: P("Lanterna do grupo, ", B("Israel"), " enfrenta a já classificada ", B("Áustria"), " nesta terça-feira (17/11), às ", B("16h45 (de Brasília)"), ", em Debrecen, na Hungria, pela última rodada do Grupo 3 da Liga B da ", B("Liga das Nações"), ". Os israelenses precisam vencer e torcer em Dublin. A programação indica transmissão da ", B("ESPN 4"), " e do ", B("Disney+"), "."),
  comoChegam: [
    "Israel ainda não venceu nesta Liga das Nações: são três empates e duas derrotas, com só 2 gols marcados. No sábado (14), segurou o 0 a 0 com o Kosovo em Pristina, o segundo empate sem gols entre as duas seleções na campanha. O time de Ran Ben Shimon não manda jogos no país e volta a Debrecen, onde já recebeu o Kosovo no 1º turno. O zagueiro Raz Shlomo está suspenso por acúmulo de amarelos.",
    "A Áustria de Ralf Rangnick garantiu o 1º lugar e o acesso à Liga A no sábado, com o 1 a 0 sobre a Irlanda em Linz. O gol saiu aos 34 minutos do 2º tempo, de Sasa Kalajdzic, que tinha entrado no decorrer do jogo, e o goleiro Alexander Schlager segurou a vitória com defesas no fim. Invicta, a seleção tem 11 pontos e o melhor ataque do grupo, com 10 gols. No 1º turno, venceu Israel por 3 a 1 em Linz, num jogo em que Sayed Abu Farchi empatou para os israelenses e foi expulso pela comemoração.",
  ],
  cardTitulo: "Situação no Grupo 3 da Liga B", cardSub: "Antes da 6ª e última rodada",
  extraRows: [["Israel", "precisa vencer e depende de Irlanda x Kosovo"], ["Áustria", "1º lugar e acesso à Liga A garantidos"]],
  tabelaTitulo: "Classificação do Grupo 3 da Liga B",
  emJogo: [
    "Na Liga B, o 4º colocado disputa em março um play-off de ida e volta contra um 2º colocado da Liga C, com risco de rebaixamento, e o 3º permanece na divisão. Israel, com 3 pontos, termina em 4º com qualquer resultado que não seja vitória. Vencendo, chega a 6 e passa a depender de Irlanda x Kosovo, em Dublin, no mesmo horário. Se o Kosovo vencer, Israel fica com o 3º lugar, porque a Irlanda para nos 5 pontos.",
    "Com empate em Dublin, a Irlanda vai a 6 e leva a melhor sobre Israel no confronto direto (3 a 0 e 1 a 1). Se a Irlanda vencer, Israel empata em pontos com o Kosovo; como os dois jogos entre eles terminaram 0 a 0, a decisão vai para o saldo de gols geral, em que os kosovares começam a rodada com quatro gols de vantagem. Para a Áustria, resta fechar a campanha sem derrota.",
  ],
  desfalques: [
    P(B("Israel: "), "Raz Shlomo cumpre suspensão. Ilay Feingold é o candidato a entrar na linha de cinco defensores."),
  ],
  local: [
    "O Nagyerdei Stadion, casa do Debreceni VSC, fica num parque arborizado na região norte de Debrecen, a segunda maior cidade da Hungria. A bola rola às 20h45 no horário local.",
  ],
  faqCanal: "A programação indica transmissão da ESPN 4, na TV fechada, e do Disney+, no streaming, às 16h45 de Brasília. Como só um guia confirmou o canal até agora, vale conferir perto do jogo.",
  faqExtra: [
    ["Por que Israel x Áustria é na Hungria?", "Israel não manda jogos da Liga das Nações no próprio país e usa o Nagyerdei Stadion, em Debrecen, como sede. Foi lá que a seleção recebeu o Kosovo no 1º turno."],
    ["O que Israel precisa para escapar do 4º lugar?", "Vencer a Áustria e torcer pelo Kosovo contra a Irlanda. Se a Irlanda vencer, Israel ainda pode passar o Kosovo no saldo de gols; com empate em Dublin, Israel termina em 4º."],
  ],
  excerpt: "Israel enfrenta a já classificada Áustria nesta terça (17/11), às 16h45, em Debrecen, pela Liga das Nações. Veja onde assistir, cenários e escalações.",
  metaDescription: "Saiba onde assistir a Israel x Áustria nesta terça (17/11), às 16h45, em Debrecen, na Hungria, pela Liga das Nações. Canal, cenários e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
