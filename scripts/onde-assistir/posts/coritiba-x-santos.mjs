// Coritiba x Santos — Brasileirão Série A, 35ª rodada, quarta 18/11/2026 19h30. Jogo 15235658.
// Autor: Lucas Lima (2). Record, CazéTV e Premiere (Máquina do Esporte; Tribuna de Jundiaí/escala CBF).
// Fontes: Placar e Portal do Gremista (Pedro Morisco na Seleção), Terra e UmDois Esportes (interino Guila Bossle),
// Gazeta Esportiva, Terra e Bolavip (desfalques do Santos), CNN Brasil, SBT e Terra (pena de Neymar reduzida),
// VAVEL e 365Scores (árbitro).
import { B, P } from "../lexical.mjs";
import { watchPostV2, QUA18 } from "../template-v2.mjs";

export const opts = {
  comp: "a", data: QUA18, matchId: 15235658, authorId: 2, A: "Coritiba", Bn: "Santos", hora: "19h30",
  canal: "Record, CazéTV e Premiere", canalLongo: "Record (TV aberta), CazéTV (YouTube) e Premiere (pay-per-view)", canalCapaAlt: "na Record, na CazéTV e no Premiere",
  competicaoLinha: "Brasileirão Série A 2026, 35ª rodada",
  localCurto: "Estádio Couto Pereira, em Curitiba (PR)",
  ondeFrase: "no Estádio Couto Pereira, em Curitiba, no Paraná",
  arbitro: "Bráulio da Silva Machado (SC)",
  // Pedro Morisco está com a Seleção em Singapura (jogo em 17/11): Pedro Rangel no gol.
  swapHome: [["Pedro Morisco", { name: "Pedro Rangel", number: "22", id: "1092614" }]],
  // Barreal (lesão grau 3 na coxa) e Bontempo (seleção) saem; Escobar volta de lesão e Neymar, de suspensão.
  swapAway: [
    ["Álvaro Barreal", { name: "Gonzalo Escobar", number: "31", id: "840500" }],
    ["Gabriel Bontempo", { name: "Neymar", number: "10", id: "124712" }],
  ],
  lead: P("O ", B("Coritiba"), " recebe o ", B("Santos"), " nesta quarta-feira (18/11), às ", B("19h30 (de Brasília)"), ", no Couto Pereira, abrindo a rodada do meio de semana da 35ª rodada do ", B("Brasileirão Série A"), ". O jogo passa na ", B("Record"), ", na TV aberta, na ", B("CazéTV"), ", no YouTube, e no ", B("Premiere"), ". O Coxa quer se afastar de vez da zona de rebaixamento; o Santos, com Neymar de volta, tenta encostar no grupo que briga por vaga na Libertadores."),
  comoChegam: [
    "O Coritiba é o 13º colocado, com 42 pontos, cinco acima de Corinthians e Grêmio, que abrem a zona de rebaixamento. A campanha de volta à Série A perdeu força no segundo turno: o time venceu só uma vez nos últimos oito jogos, 2 a 0 sobre o Vitória, no Couto Pereira, em 31 de outubro. Antes disso, foram sete partidas sem vitória, sequência que derrubou o técnico Fernando Seabra no fim de outubro. Desde então, o time é comandado pelo interino Guilherme Bossle, o Guila, coordenador da base. Na última rodada, perdeu para o Internacional por 1 a 0, em Porto Alegre.",
    "O Santos, de Cuca, é o 9º, com 47 pontos, empatado com o Red Bull Bragantino. Vem de três jogos sem vencer: empatou em casa com o Bahia (1 a 1) e com o Palmeiras (0 a 0) e perdeu para o Bragantino por 2 a 1, fora. Fora de casa, a campanha é irregular, com seis vitórias, quatro empates e sete derrotas, mas o time ganhou cinco jogos seguidos como visitante entre agosto e outubro, contra Vasco, Corinthians, Internacional, Remo e São Paulo.",
  ],
  cardTitulo: "Situação no Brasileirão", cardSub: "Antes da 35ª rodada",
  extraRows: [["Zona de rebaixamento", "Corinthians e Grêmio, 37 pontos"], ["1º turno", "Santos 0 x 3 Coritiba"]],
  tabela: [6, 18], tabelaTitulo: "Classificação do Brasileirão (6º ao 18º)",
  emJogo: [
    "Para o Coritiba, uma vitória leva o time a 45 pontos. Como Corinthians e Grêmio podem chegar no máximo a 40 nesta rodada, o Coxa terminaria a 35ª com pelo menos cinco pontos de vantagem sobre o Z4, a três rodadas do fim. Depois do Santos, o próximo compromisso é fora de casa, contra o Bahia, no sábado (21/11).",
    "O Santos está a quatro pontos do Atlético-MG, 7º colocado com 51 (e um jogo a mais), e a seis do Bahia, 6º. Dependendo de quem vencer a Libertadores, a Sul-Americana e a Copa do Brasil, novas vagas na Libertadores podem se abrir para quem terminar logo abaixo do G6, e por isso cada ponto conta. Depois do Coritiba, o time recebe o Grêmio na segunda-feira seguinte (23/11) e ainda enfrenta Vitória e Botafogo.",
    "No 1º turno, em maio, o Coritiba venceu o Santos por 3 a 0, fora de casa.",
  ],
  desfalques: [
    P(B("Coritiba: "), "o goleiro Pedro Morisco está com a Seleção Brasileira, que enfrenta Singapura na terça-feira (17/11), em Singapura, e não chega a tempo. Pedro Rangel deve assumir o gol. Não há outros desfalques confirmados pelo clube."),
    P(B("Santos: "), "Neymar está de volta. Expulso contra o Bahia, em 24 de outubro, ele teve a pena reduzida de dois jogos para um no STJD e já cumpriu a suspensão. Em compensação, Cuca não terá Álvaro Barreal, que vinha jogando na lateral esquerda, com lesão muscular de grau 3 na coxa direita, nem o zagueiro Lucas Veríssimo, também lesionado na coxa. O goleiro Gabriel Brazão passou por cirurgia no ombro esquerdo e não deve jogar mais em 2026, e Vinícius Lira segue em transição física. Gabriel Bontempo, Gustavo Caballero (Paraguai) e Miguelito (Bolívia) estão com as seleções. Willian Arão e Escobar se recuperaram de problemas na coxa e voltaram a treinar."),
  ],
  provAway: "Diogenes; Rodinei, João Alencar, Luan Peres e Escobar; Gustavinho e Christian Oliva; Everton Cebolinha, Neymar e Philippe Coutinho; Gabriel Barbosa (Willian Arão pode voltar à zaga)",
  local: [
    "O árbitro é o catarinense Bráulio da Silva Machado, escalado pela CBF.",
    "O jogo é no Couto Pereira, no bairro Alto da Glória, em Curitiba. Em casa, o Coritiba tem seis vitórias, cinco empates e seis derrotas neste Brasileirão.",
  ],
  faqCanal: "A partida passa na Record, na TV aberta, na CazéTV, no YouTube, e no Premiere, no pay-per-view, às 19h30 de Brasília.",
  faqExtra: [
    ["Neymar joga contra o Coritiba?", "Sim. Expulso contra o Bahia, ele teve a pena reduzida pelo STJD de dois jogos para um, já cumprida, e está liberado para enfrentar o Coritiba."],
    ["Quem é o técnico do Coritiba?", "O time é comandado interinamente por Guilherme Bossle, o Guila, desde a demissão de Fernando Seabra, no fim de outubro."],
  ],
  excerpt: "Coritiba e Santos se enfrentam às 19h30 desta quarta-feira (18/11), no Couto Pereira, pela 35ª rodada do Brasileirão. Veja onde assistir, desfalques e prováveis escalações.",
  metaDescription: "Saiba onde assistir a Coritiba x Santos nesta quarta (18/11), às 19h30, no Couto Pereira, pelo Brasileirão. Record, CazéTV e Premiere, desfalques e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
