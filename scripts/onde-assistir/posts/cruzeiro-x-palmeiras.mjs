// Cruzeiro x Palmeiras — Brasileirão Série A, 35ª rodada, quarta 18/11/2026 20h30. Jogo 15235656.
// Autor: Ivan Alves (1). Premiere (Portal do Palestra, MKT Esportivo, Tribuna de Jundiaí/escala CBF).
// Fontes: Central da Toca (tabu, treino 14/11), O Tempo (ingressos, treino), Diário Celeste e Coluna do Fla
// (desfalques do Cruzeiro), Lance e Itatiaia (desfalques do Palmeiras), Terra, VAVEL e 365Scores (árbitro),
// Gazeta Esportiva e Lance (finais da Libertadores e da Copa do Brasil).
import { B, P } from "../lexical.mjs";
import { watchPostV2, QUA18 } from "../template-v2.mjs";

export const opts = {
  comp: "a", data: QUA18, matchId: 15235656, authorId: 1, A: "Cruzeiro", Bn: "Palmeiras", hora: "20h30",
  canal: "Premiere", canalLongo: "Premiere (pay-per-view, exclusivo)", canalCapaAlt: "no Premiere",
  competicaoLinha: "Brasileirão Série A 2026, 35ª rodada",
  localCurto: "Mineirão, em Belo Horizonte (MG)",
  ondeFrase: "no Mineirão, em Belo Horizonte, Minas Gerais",
  arbitro: "Anderson Daronco (RS)",
  // Jonathan Jesus (suspenso), Bruno Rodrigues (cláusula de empréstimo) e Keny Arroyo (Equador joga em 17/11) saem do XI do jogo contra o Bahia.
  swapHome: [
    ["Jonathan Jesus", { name: "Matías Viña", number: "6", id: "875295" }],
    ["Keny Arroyo", { name: "Marquinhos", number: "11", id: "1116954" }],
    ["Bruno Rodrigues", { name: "Matheus Pereira", number: "10", id: "377238" }],
  ],
  // Murilo e Paulinho lesionados, Gustavo Gómez e Mauricio com o Paraguai, Piquerez com lesão na coxa; Giay, Arias e Flaco voltam em cima da hora.
  swapAway: [
    ["Murilo", { name: "Bruno Fuchs", number: "3", id: "973737" }],
    ["Gustavo Gómez", { name: "Luis Benedetti", number: "43", id: "1485284" }],
    ["Agustín Giay", { name: "Khellven", number: "12", id: "984896" }],
    ["Joaquín Piquerez", { name: "Arthur Gabriel", number: "56", id: "1633501" }],
    ["Mauricio", { name: "Andreas Pereira", number: "8", id: "285949" }],
    ["Jhon Arias", { name: "Felipe Anderson", number: "7", id: "152276" }],
    ["José Manuel López", { name: "Vitor Roque", number: "9", id: "1150391" }],
  ],
  lead: P("O ", B("Cruzeiro"), " recebe o ", B("Palmeiras"), " nesta quarta-feira (18/11), às ", B("20h30 (de Brasília)"), ", no Mineirão, pela 35ª rodada do ", B("Brasileirão Série A"), ". A transmissão é exclusiva do ", B("Premiere"), ", no pay-per-view. O Palmeiras, segundo colocado, não pode perder pontos na perseguição ao Flamengo; o Cruzeiro, terceiro, pode garantir já nesta rodada a vaga direta na fase de grupos da Libertadores de 2027."),
  comoChegam: [
    "O Cruzeiro de Artur Jorge vive a melhor fase do ano. São quatro vitórias seguidas no Brasileirão: 4 a 2 no Grêmio, em Porto Alegre, 1 a 0 no Remo, 1 a 0 no Atlético-MG, no clássico, e 3 a 2 no Bahia, no último jogo antes da data Fifa. Em casa, o time ganhou os seis últimos jogos pelo campeonato; a última derrota no Mineirão foi para o Botafogo, por 1 a 0, em 26 de julho. Com 60 pontos, já tem vaga matemática na Libertadores e agora mira o G4, que leva direto à fase de grupos.",
    "O Palmeiras de Abel Ferreira está há 11 rodadas sem perder no Brasileirão, com sete vitórias e quatro empates desde a derrota por 3 a 2 para o Fluminense, em 15 de agosto. Na última rodada, goleou o Remo por 6 a 1. Tem a melhor defesa do campeonato, com 23 gols sofridos em 34 jogos, e perdeu só três vezes. Fora de casa, são oito vitórias, sete empates e duas derrotas. O calendário é pesado: o time decide a Libertadores contra o Estudiantes em 28 de novembro, em Montevidéu, e a Copa do Brasil contra o Grêmio em 6 de dezembro, em Brasília.",
  ],
  cardTitulo: "Situação no Brasileirão", cardSub: "Antes da 35ª rodada",
  extraRows: [["Líder", "Flamengo, 76 pontos e 23 vitórias"], ["1º turno", "Palmeiras 1 x 1 Cruzeiro, em Barueri"]],
  tabela: [1, 7], tabelaTitulo: "Classificação do Brasileirão (1º ao 7º)",
  emJogo: [
    "Para o Palmeiras, a conta é simples: está três pontos atrás do Flamengo, que no mesmo horário recebe o Athletico-PR no Maracanã. Se vencer e o Flamengo tropeçar, empata em pontos com o líder, que leva vantagem no primeiro critério de desempate, o número de vitórias (23 a 22, nesse cenário). Uma derrota no Mineirão somada a uma vitória do Flamengo abriria seis pontos de diferença a três rodadas do fim, e aí o rubro-negro poderia ser campeão já no sábado (21/11), no confronto direto em São Paulo.",
    "O Cruzeiro não alcança mais o título, mas pode fechar a vaga direta na Libertadores nesta quarta. Para isso, precisa vencer e torcer por uma derrota do Athletico-PR (5º, 54 pontos) para o Flamengo e por um tropeço do Bahia (6º, 53) contra o Grêmio. Nesse caso, chegaria a 63 pontos, o máximo que os dois ainda poderiam somar, e levaria vantagem no número de vitórias.",
    "Há um tabu a favor dos mineiros: o Cruzeiro não perde para o Palmeiras desde 4 de dezembro de 2024, quando foi derrotado por 2 a 1 no Mineirão. Depois disso, venceu por 2 a 1 em casa, em junho de 2025, e empatou duas vezes: 0 a 0 no Allianz Parque, em outubro de 2025, e 1 a 1 em Barueri, no 1º turno deste ano, com gols de Keny Arroyo e Felipe Anderson.",
  ],
  desfalques: [
    P(B("Cruzeiro: "), "o zagueiro Jonathan Jesus e o lateral Kauã Moraes cumprem suspensão pelo terceiro cartão amarelo, e o atacante Wesley foi suspenso por um jogo pelo STJD. Bruno Rodrigues, emprestado pelo Palmeiras, não pode jogar por cláusula de contrato. Keny Arroyo enfrenta a Bolívia pelo Equador na terça-feira (17/11) e dificilmente chega a tempo. João Marcelo, Gabriel Pec e Sinisterra seguem lesionados. Fabrício Bruno, que saiu com dores contra o Bahia, voltou a treinar com o grupo no sábado e é dúvida. Matheus Pereira e William voltam depois de cumprir suspensão."),
    P(B("Palmeiras: "), "Abel terá de remontar a defesa. Murilo, com lesão na coxa esquerda, e Paulinho, com trauma na panturrilha, estão fora. Gustavo Gómez e Mauricio defendem o Paraguai em Singapura e não voltam a tempo. Piquerez sentiu a coxa direita no amistoso do Uruguai e tende a desfalcar o time. Flaco López, Giay e Jhon Arias estão com as seleções de Argentina e Colômbia e terão logística especial de volta; a tendência é que comecem no banco. Bruno Fuchs é o substituto natural na zaga, e o jovem Luis Benedetti aparece como opção para completar a linha de três."),
  ],
  provHome: "Otávio Costa; Fagner, Matías Viña, Fabrício Bruno e Gabriel Rojas; Lucas Romero e Zé Lucas; Marquinhos, Matheus Pereira e Gerson; Kaio Jorge (William, que volta de suspensão, pode reassumir a lateral direita; Villalba é opção para a zaga, e Wanderson ou Luciano Rodríguez disputam a vaga de Arroyo)",
  provAway: "Carlos Miguel; Bruno Fuchs, Luis Benedetti e Alexander Barboza; Khellven, Marlon Freitas, Lucas Evangelista e Arthur Gabriel; Andreas Pereira e Felipe Anderson; Vitor Roque (Abel pode trocar a linha de três zagueiros por uma dupla, com Barboza e Fuchs; Ramón Sosa também briga por vaga no ataque)",
  local: [
    "O árbitro é o gaúcho Anderson Daronco, escalado pela CBF. Ele apitou a semifinal da Copa do Brasil entre Vasco e Palmeiras, em que não marcou um pênalti reclamado em lance de Alexander Barboza.",
    "O jogo é no Mineirão, em Belo Horizonte, e é o penúltimo do Cruzeiro em casa na temporada. Até domingo (15/11), o clube havia vendido mais de 32 mil ingressos. A venda para a torcida celeste é só pela internet, no site do clube e no aplicativo Nação Azul; a torcida do Palmeiras compra pela BaladApp.",
  ],
  faqCanal: "A partida tem transmissão exclusiva do Premiere, no pay-per-view, às 20h30 de Brasília. Não passa na TV aberta, no SporTV nem em streaming gratuito.",
  faqExtra: [
    ["O Palmeiras pode ser campeão nesta rodada?", "Não. O Palmeiras está três pontos atrás do Flamengo e, mesmo vencendo, no máximo empata em pontos com o líder. As duas equipes se enfrentam no sábado (21/11), pela 36ª rodada."],
    ["Quando o Cruzeiro perdeu para o Palmeiras pela última vez?", "Em 4 de dezembro de 2024, por 2 a 1, no Mineirão. Desde então são três jogos sem derrota para o Cruzeiro: uma vitória e dois empates."],
  ],
  excerpt: "Cruzeiro e Palmeiras se enfrentam às 20h30 desta quarta-feira (18/11), no Mineirão, pela 35ª rodada do Brasileirão. Veja onde assistir, desfalques e prováveis escalações.",
  metaDescription: "Saiba onde assistir a Cruzeiro x Palmeiras nesta quarta (18/11), às 20h30, no Mineirão, pelo Brasileirão. Transmissão do Premiere, desfalques e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
