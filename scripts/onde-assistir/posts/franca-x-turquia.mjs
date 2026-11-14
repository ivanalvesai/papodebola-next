// França x Turquia — Liga das Nações, Liga A · Grupo 1, 6ª rodada, domingo 15/11/2026 16h45. Jogo 15534029.
// Autor: Lucas Lima (2). SporTV 3 (Mantos do Futebol + Guia de TV); ge tv no YouTube só no Mantos. Árbitro ainda não divulgado.
// Cenários do grupo conferidos: o empate basta à França; ela só cai fora se perder E a Bélgica vencer.
import { B, P } from "../lexical.mjs";
import { watchPostV2, DOM15 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: DOM15, matchId: 15534029, authorId: 2, A: "França", Bn: "Turquia", hora: "16h45",
  canal: "SporTV 3", canalLongo: "SporTV 3 (TV fechada); um dos guias aponta também o canal ge tv no YouTube", canalCapaAlt: "no SporTV 3",
  competicaoLinha: "Liga das Nações 2026/27, Liga A, Grupo 1, 6ª e última rodada",
  localCurto: "Matmut Atlantique, em Bordeaux (França)", ondeFrase: "no Matmut Atlantique, em Bordeaux, na França",
  swapHome: [["Lucas Da Cunha", { name: "Eduardo Camavinga", number: "", id: "" }]],
  lead: P("Um empate basta. A ", B("França"), " de Zinédine Zidane recebe a ", B("Turquia"), " neste domingo (15/11), às ", B("16h45 (de Brasília)"), ", em Bordeaux, pela última rodada do Grupo 1 da ", B("Liga das Nações"), ", precisando de pelo menos um ponto para ir às quartas de final. A transmissão é do ", B("SporTV 3"), "."),
  comoChegam: [
    "A França perdeu a liderança na quinta-feira (12), ao levar a virada da Itália por 3 a 1 no San Siro, depois de Michael Olise abrir o placar. Olise é o grande nome da campanha: marcou 5 dos 8 gols franceses e balançou a rede em 4 dos 5 jogos. Kylian Mbappé, autor do gol da vitória por 1 a 0 sobre a Turquia em Kocaeli, desfalcou o time em Milão com um incômodo muscular e é dúvida. Com Zidane, que assumiu depois da Copa de 2026, a seleção soma três vitórias, um empate e uma derrota.",
    "A Turquia perdeu os cinco jogos, com 3 gols marcados e 13 sofridos, e já não sai do 4º lugar. Na quinta, Arda Güler abriu o placar de falta contra a Bélgica, em casa, mas De Bruyne e De Ketelaere viraram em quatro minutos. Sergen Yalçın, contratado em outubro no lugar de Vincenzo Montella, fez ali o primeiro jogo no comando.",
  ],
  cardTitulo: "Situação no Grupo 1 da Liga A", cardSub: "Antes da 6ª e última rodada",
  extraRows: [["Classificação às quartas", "1º e 2º colocados"], ["França", "vai às quartas com um empate"], ["Turquia", "termina em 4º"]],
  tabelaTitulo: "Classificação do Grupo 1 da Liga A",
  emJogo: [
    "Os dois jogos do grupo são no mesmo horário, e Itália (10 pontos), França (10) e Bélgica (9) brigam por duas vagas. Para a França, o empate garante as quartas em qualquer cenário. Ela só fica fora se perder e a Bélgica vencer a Itália em Bruxelas: aí as três terminariam com Bélgica 12, Itália 10 e França 10, e a Itália passaria pelo confronto direto (1 a 1 e 3 a 1).",
    "Se a França vencer, termina em 1º caso a Itália não ganhe da Bélgica, e em 2º se a Itália também vencer. A Turquia, sem pontos, termina em último. Se ela cai direto para a Liga B ou vai ao play-off de março depende dos 4º colocados dos outros grupos.",
    "O retrospecto favorece os franceses: em sete jogos, foram cinco vitórias da França, um empate e uma vitória turca, um 2 a 0 em Konya pelas Eliminatórias da Euro 2020.",
  ],
  desfalques: [
    P(B("França: "), "a lista de baixas é longa. Pierre Kalulu, Marcus Thuram, Aurélien Tchouaméni, Ousmane Dembélé, William Saliba, Jules Koundé, Maghnes Akliouche e Maxence Lacroix estão lesionados, e Dayot Upamecano deixou a concentração por motivos pessoais. Mbappé (panturrilha) e Désiré Doué são dúvidas."),
    P(B("Turquia: "), "o zagueiro Ozan Kabak cumpre suspensão por cartões amarelos. Kenan Yıldız, lesionado no pé, nem foi convocado, e Aral Şimşir foi cortado."),
  ],
  local: [
    "A arbitragem ainda não tinha sido divulgada pela UEFA até sexta-feira (13).",
    "É o primeiro jogo da França em Bordeaux desde junho de 2024, contra o Canadá, e tem um sabor especial para Zidane: ex-jogador do Girondins, ele estreou pela seleção na cidade, em agosto de 1994. A bola rola às 20h45 no horário local.",
  ],
  faqCanal: "A partida tem transmissão do SporTV 3, na TV fechada, às 16h45 de Brasília. Um dos guias de programação aponta também o canal ge tv, no YouTube.",
  faqExtra: [
    ["Do que a França precisa para ir às quartas da Liga das Nações?", "De um empate contra a Turquia. Mesmo perdendo, a França se classifica se a Bélgica não vencer a Itália."],
    ["Mbappé joga França x Turquia?", "É dúvida. Ele ficou fora da derrota para a Itália com um incômodo muscular na panturrilha, e Zidane espera recuperá-lo para domingo."],
  ],
  excerpt: "França e Turquia se enfrentam neste domingo (15/11), às 16h45, em Bordeaux, pela Liga das Nações. Um empate leva os franceses às quartas. Veja onde assistir.",
  metaDescription: "Saiba onde assistir a França x Turquia neste domingo (15/11), às 16h45, em Bordeaux, pela Liga das Nações. Transmissão do SporTV 3, desfalques e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
