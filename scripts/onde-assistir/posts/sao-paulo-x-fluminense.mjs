// São Paulo x Fluminense — Brasileirão Série A, 35ª rodada, quinta 19/11/2026 21h30. Jogo 15238241.
// Autor: Ivan Alves (1). TV Globo, ge TV e Premiere (Máquina do Esporte 11/11, Portal da TV 17/11; Trivela 17/11 também).
// Fontes: Gazeta Esportiva 14/11 e Avante Meu Tricolor/OneFootball 16/11 (desfalques e treino do São Paulo),
// Trivela 17/11 (técnicos, desfalques, prováveis), Gávea News/Terra, Bolavip e Mixvale 17/11 (Alisson, pendurados),
// Lance e Bolavip (Savarino e Canobbio na Data Fifa), NETFLU e OneFootball (escala da CBF: Lucas Casagrande).
import { B, P } from "../lexical.mjs";
import { watchPostV2, QUI19 } from "../template-v2.mjs";

export const opts = {
  comp: "a", data: QUI19, matchId: 15238241, authorId: 1, A: "São Paulo", Bn: "Fluminense", hora: "21h30",
  canal: "TV Globo, ge TV e Premiere", canalLongo: "TV Globo (aberta), ge TV e Premiere (pay-per-view)", canalCapaAlt: "na Globo, no ge TV e no Premiere",
  competicaoLinha: "Brasileirão Série A 2026, 35ª rodada",
  localCurto: "MorumBIS, em São Paulo (SP)",
  ondeFrase: "no MorumBIS, em São Paulo",
  arbitro: "Lucas Casagrande (PR)",
  // 3-5-2 da Trivela e do Avante Meu Tricolor: Newton e Luciano (suspensos) saem; Osorio entra na zaga e Calleri no ataque.
  // As trocas abaixo também reordenam o XI do jogo contra o Corinthians para a linha de três zagueiros.
  formation_home: "3-5-2",
  swapHome: [
    ["Pedro Lima", { name: "Luis Osorio", number: "54", id: "1836799" }],
    ["Luciano", { name: "Jonathan Calleri", number: "9", id: "340519" }],
    ["Lucas Moura", { name: "Artur", number: "37", id: "841128" }],
    ["Artur", { name: "Lucas Moura", number: "7", id: "149710" }],
    ["Damián Bobadilla", { name: "Iago Borduchi", number: "12", id: "869644" }],
    ["Iago Borduchi", { name: "Pedro Lima", number: "32", id: "1597270" }],
    ["Newton", { name: "Damián Bobadilla", number: "16", id: "1015261" }],
  ],
  // Savarino (Venezuela) é tratado como improvável; Soteldo é o substituto citado.
  swapAway: [
    ["Jefferson Savarino", { name: "Yeferson Soteldo", number: "30", id: "789960" }],
  ],
  lead: P("O ", B("São Paulo"), " recebe o ", B("Fluminense"), " nesta quinta-feira (19/11), às ", B("21h30 (de Brasília)"), ", no MorumBIS, pela 35ª rodada do ", B("Brasileirão Série A"), ". A partida tem transmissão da ", B("TV Globo"), ", em rede nacional, do ", B("ge TV"), " e do ", B("Premiere"), ", no pay-per-view. O Fluminense, quarto colocado, joga para segurar a vaga direta na fase de grupos da Libertadores de 2027; o São Paulo, décimo, tenta voltar a vencer depois de três rodadas e se aproximar da parte de cima da tabela."),
  comoChegam: [
    "O São Paulo de Dorival Júnior chega com 44 pontos, 12 vitórias, oito empates e 14 derrotas, e não vence há três jogos no Brasileirão: perdeu para o Bahia por 3 a 2, em Salvador, e empatou com o Mirassol (1 a 1) e com o Corinthians (0 a 0), no último jogo antes da Data Fifa. A última vitória foi o 1 a 0 sobre o Vasco, em 18 de outubro. A força do time está em casa: são 10 vitórias, quatro empates e três derrotas como mandante, com só 13 gols sofridos em 17 jogos. O saldo geral é zero, com 39 gols marcados e 39 sofridos.",
    "O Fluminense de Marcão tem 57 pontos, 16 vitórias, nove empates e nove derrotas, e voltou a ganhar depois de um mês ruim. Entre 11 e 24 de outubro, perdeu três vezes seguidas, para Flamengo (1 a 0), Santos (2 a 1, em casa) e Chapecoense (2 a 1, em Chapecó). Na sequência, venceu o Internacional por 2 a 1 e goleou o Vitória por 3 a 0, em Salvador. Com 55 gols, divide com o Cruzeiro o terceiro melhor ataque do campeonato, atrás de Flamengo e Palmeiras, mas fora de casa o rendimento cai: quatro vitórias, seis empates e sete derrotas em 17 jogos.",
  ],
  cardTitulo: "Situação no Brasileirão", cardSub: "Antes da 35ª rodada",
  extraRows: [["3º colocado", "Cruzeiro, 60 pontos"], ["5º colocado", "Athletico-PR, 54 pontos"], ["1º turno", "Fluminense 2 x 1 São Paulo, em 16 de maio"]],
  tabela: [1, 11], tabelaTitulo: "Classificação do Brasileirão (1º ao 11º)",
  emJogo: [
    "A conta do Fluminense passa pelo G4, que leva direto à fase de grupos da Libertadores. O time tem três pontos de vantagem sobre o Athletico-PR (5º, 54) e quatro sobre o Bahia (6º, 53), e está três atrás do Cruzeiro (3º, 60). A rodada começa na quarta-feira, com Flamengo x Athletico-PR, Grêmio x Bahia e Cruzeiro x Palmeiras, então o Fluminense entra em campo já sabendo se a vantagem diminuiu ou se o terceiro lugar ficou mais perto. Com vitória no MorumBIS, chega a 60 pontos; uma derrota, somada a uma vitória do Athletico, deixa os dois empatados em 57 a três rodadas do fim.",
    "Para o São Paulo, a tabela pede menos, mas ainda conta. O time está empatado em pontos com o Vasco (44) e três atrás de Santos e Bragantino (47). Uma vitória leva o São Paulo a 47 pontos, a mesma pontuação de Santos e Bragantino, e ajuda a firmar o time na faixa da tabela que hoje dá vaga na Copa Sul-Americana de 2027. Depois desta rodada, o time visita o Botafogo no Rio; o Fluminense recebe o Mirassol no domingo (22/11), no Maracanã.",
    "No primeiro turno, em 16 de maio, o Fluminense venceu por 2 a 1, no Rio. O Fluminense não terá Alisson, impedido de atuar no MorumBIS por uma cláusula contratual ligada ao próprio São Paulo.",
  ],
  desfalques: [
    P(B("São Paulo: "), "Dorival não terá Newton, Luciano e Ferreirinha, suspensos pelo terceiro cartão amarelo, recebido no 0 a 0 com o Corinthians. No departamento médico estão o lateral Aurélio Buta, operado do menisco do joelho direito, o zagueiro Sabino, que passou por cirurgia no joelho e só deve voltar em 2027, o zagueiro Domingos Duarte, operado depois de romper o ligamento cruzado, e o volante Marcos Antônio, com lesão no tornozelo direito e sem prazo de retorno. Bobadilla, convocado pelo Paraguai, e Djhordney, chamado para a seleção sub-20, desfalcaram os treinos da semana, mas aparecem entre os prováveis titulares; Pablo Maia é a alternativa no meio."),
    P(B("Fluminense: "), "o atacante John Kennedy segue afastado, sem previsão de volta, e o volante Martinelli, ainda em tratamento, já voltou a treinar com bola. Alisson, recuperado de uma lesão no quadril, está vetado por contrato neste jogo. Savarino, com a Venezuela, tem presença considerada improvável por causa da viagem de volta, e Canobbio, com o Uruguai, também retorna em cima da hora. Dez jogadores estão pendurados com dois amarelos, entre eles Hulk, Canobbio, Freytes, Renê e Soteldo: quem levar cartão desfalca o time contra o Mirassol."),
  ],
  provHome: "Rafael; Rafael Tolói, Arboleda e Luis Osorio; Pedro Lima, Djhordney, Bobadilla, Lucas Moura e Iago Borduchi; Artur e Calleri (Pablo Maia entra se Djhordney não tiver condições; sem Newton e Luciano, Dorival deve trocar o 4-1-4-1 do último jogo por uma linha de três zagueiros)",
  provAway: "Fábio; Guga, Thiago Silva, Juan Pablo Freytes e Renê; Hércules e Nonato; Canobbio, Luciano Acosta e Soteldo; Hulk (Guilherme Arana briga pela lateral esquerda; se Canobbio chegar cansado do Uruguai, Kevin Serna é a opção pelo lado do campo)",
  local: [
    "A CBF escalou o paranaense Lucas Casagrande para apitar a partida.",
    "O jogo é no MorumBIS, na zona sul de São Paulo, onde o time de Dorival construiu a maior parte da campanha: dos 44 pontos do São Paulo no campeonato, 34 vieram como mandante. Por causa da transmissão em rede nacional, a TV Globo antecipa o Jornal Nacional para as 20h nesta quinta. Na Globo, a narração é de Gustavo Villani, com comentários de Caio Ribeiro e Roger Flores.",
  ],
  faqCanal: "A partida passa na TV Globo, em rede nacional, no ge TV e no Premiere, no pay-per-view, às 21h30 de Brasília.",
  faqExtra: [
    ["Quem está suspenso no São Paulo contra o Fluminense?", "Newton, Luciano e Ferreirinha, que levaram o terceiro cartão amarelo no empate por 0 a 0 com o Corinthians."],
    ["Por que Alisson não joga São Paulo x Fluminense?", "Por uma cláusula contratual ligada ao São Paulo. Ele já se recuperou de uma lesão no quadril, mas está impedido de jogar esta partida."],
    ["Quanto o Fluminense soma se vencer o São Paulo?", "Chega a 60 pontos, com três rodadas por jogar. Antes da rodada, o time tem 57 e ocupa o 4º lugar, o último que leva direto à fase de grupos da Libertadores."],
  ],
  excerpt: "São Paulo e Fluminense se enfrentam às 21h30 desta quinta-feira (19/11), no MorumBIS, pela 35ª rodada do Brasileirão. Veja onde assistir, desfalques e prováveis escalações.",
  metaDescription: "Saiba onde assistir a São Paulo x Fluminense nesta quinta (19/11), às 21h30, no MorumBIS, pelo Brasileirão. Transmissão na Globo, ge TV e Premiere.",
};
export default (ctx) => watchPostV2(opts, ctx);
