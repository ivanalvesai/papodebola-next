// Grêmio x Bahia — Brasileirão Série A, 35ª rodada, quarta 18/11/2026 21h30. Jogo 15235657.
// Autor: Ivan Alves (1). Premiere (Máquina do Esporte 11/11; MKT Esportivo 11/11). Arbitragem: Lance, VAVEL e Futebol Baiano (escala CBF 13/11).
// Desfalques: bahia.ba (13/11), Futebol Baiano (11/11), ecbahia; time provável: Portal do Gremista (12/11) e Leouve (13/11);
// Kike Olivera: A Tarde (10/11) e bahia.ba; treinos: portal oficial do Grêmio (15/11). Final da Copa do Brasil: Tribuna de Jundiaí.
import { B, P } from "../lexical.mjs";
import { watchPostV2, QUA18 } from "../template-v2.mjs";

export const opts = {
  comp: "a", data: QUA18, matchId: 15235657, authorId: 1, A: "Grêmio", Bn: "Bahia", hora: "21h30",
  canal: "Premiere", canalLongo: "Premiere (pay-per-view)", canalCapaAlt: "no Premiere",
  competicaoLinha: "Brasileirão Série A 2026, 35ª rodada",
  localCurto: "Arena do Grêmio, em Porto Alegre (RS)",
  ondeFrase: "na Arena do Grêmio, em Porto Alegre, no Rio Grande do Sul",
  arbitro: "Davi de Oliveira Lacerda (ES); VAR: Rafael Traci (SC)",
  // Kannemann e Villasanti suspensos (3º amarelo contra o Flamengo). O time provável publicado na semana
  // (Portal do Gremista e Leouve) traz Gustavo Martins na zaga, Dodi no meio e Pavón no ataque, no lugar de Enamorado.
  swapHome: [
    ["Walter Kannemann", { name: "Gustavo Martins", number: "6", id: "1105796" }],
    ["Mathias Villasanti", { name: "Dodi", number: "17", id: "870804" }],
    ["José Enamorado", { name: "Cristian Pavón", number: "7", id: "358956" }],
  ],
  lead: P("O ", B("Grêmio"), " recebe o ", B("Bahia"), " nesta quarta-feira (18/11), às ", B("21h30 (de Brasília)"), ", na Arena do Grêmio, pela 35ª rodada do ", B("Brasileirão Série A"), ". A transmissão é exclusiva do ", B("Premiere"), ", no pay-per-view. O jogo junta as duas pontas da tabela: o Grêmio, finalista da Copa do Brasil, está na zona de rebaixamento; o Bahia briga por vaga na Libertadores de 2027."),
  comoChegam: [
    "O Grêmio é o 18º colocado, com 37 pontos, nove vitórias, dez empates e 15 derrotas. Tem os mesmos pontos e as mesmas vitórias do Corinthians, 17º, e fica atrás pelo saldo de gols (-9 contra -6). O Internacional, primeiro time fora da zona, tem 38. O time de Renato Portaluppi venceu Coritiba (1 a 0, fora) e Athletico-PR (2 a 0, em casa) antes de perder para o Flamengo por 3 a 1, no Maracanã, na última rodada antes da data Fifa. Na Arena, a campanha é bem melhor do que fora: oito vitórias, cinco empates e quatro derrotas.",
    "Na Copa do Brasil, a temporada já tem um ponto alto garantido. O Grêmio eliminou o Atlético-MG na semifinal e decide o título com o Palmeiras em jogo único, marcado para 6 de dezembro, quatro dias depois da última rodada do Brasileirão.",
    "O Bahia é o 6º, com 53 pontos, 14 vitórias e saldo de +5. Vem de derrota por 3 a 2 para o Cruzeiro, em Belo Horizonte, depois de ganhar do São Paulo pelo mesmo placar em Salvador. Fora de casa, o time de Rogério Ceni tem seis vitórias, cinco empates e seis derrotas, mas não vence como visitante desde 5 de setembro, quando bateu o Red Bull Bragantino por 3 a 2: desde então, perdeu para Athletico-PR, Palmeiras e Cruzeiro e empatou com o Santos.",
  ],
  cardTitulo: "Situação no Brasileirão", cardSub: "Antes dos jogos desta quarta-feira",
  extraRows: [["Zona de rebaixamento", "Corinthians e Grêmio, 37 pontos; Remo, 29; Chapecoense, 21"], ["1º turno", "Bahia 1 x 1 Grêmio, em Salvador"]],
  tabelaTitulo: "Classificação do Brasileirão",
  emJogo: [
    "Para o Grêmio, vencer significa chegar a 40 pontos e sair da zona, ao menos até quinta-feira, quando Internacional e Vitória, ambos com 38, jogam contra Vasco e Red Bull Bragantino. O Corinthians, que divide a pontuação com o time gaúcho, joga no mesmo horário contra o Botafogo, em São Paulo. Depois do Bahia, o Grêmio visita Santos e Corinthians e encerra o campeonato em casa, contra o Mirassol.",
    "O Bahia, com uma vitória, chega a 56 pontos. Fica a um do Fluminense, 4º com 57, que só joga na quinta-feira, e pode passar o Athletico-PR, 5º com 54, que enfrenta o Flamengo no Maracanã na mesma noite. Uma derrota abre espaço para o Atlético-MG, 7º com 51. Na rodada seguinte, o time baiano recebe o Coritiba na Fonte Nova, no sábado (21/11).",
  ],
  desfalques: [
    P(B("Grêmio: "), "o zagueiro Walter Kannemann e o volante Mathías Villasanti cumprem suspensão pelo terceiro cartão amarelo, recebido na derrota para o Flamengo. Villasanti já estaria fora de qualquer forma: foi convocado pelo Paraguai, que joga em Singapura no dia 17. Em compensação, Renato tem de volta o zagueiro Gustavo Martins, que cumpriu suspensão, o volante Danilo Barbosa, liberado pelo departamento médico, e o atacante Cristian Pavón, recuperado de lesão muscular. Dodi e Danilo Barbosa disputam a vaga de Villasanti ao lado de Erick Noriega."),
    P(B("Bahia: "), "Rogério Ceni não tem suspensos nem lesões novas. O único em tratamento no departamento médico é Léo Vieira. O atacante uruguaio Kike Olivera, que pertence ao Grêmio e está emprestado ao Bahia até o fim da temporada, pode jogar. No 1º turno, ele ficou fora por uma restrição do contrato; agora, segundo a imprensa baiana, uma cláusula do empréstimo libera a participação dele em Porto Alegre."),
  ],
  lineupNote: "Os técnicos só confirmam os titulares perto do jogo. Os campinhos abaixo partem da última formação de cada time, com as mudanças apontadas nos treinos da semana; a lista oficial sai cerca de uma hora antes da bola rolar.",
  provHome: "Weverton; Wallace, Fabián Balbuena e Gustavo Martins; João Pedro (Diego Caito), Erick Noriega, Dodi (Danilo Barbosa) e Marlon; Cristian Pavón, Carlos Vinícius e Francis Amuzu",
  provAway: "Ronaldo; Marcos Victor, David Duarte, Kanu e Luciano Juba; Erick e Nicolás Acevedo; Kike Olivera, Everton Ribeiro e Rodrigo Nestor; Alejo Véliz. Nos jogos contra Flamengo e São Paulo, em Salvador, Ceni montou um 5-3-2, com Marco Moreno na zaga e Jean Lucas e Erick Pulga entre os titulares",
  local: [
    "A arbitragem é do Espírito Santo: Davi de Oliveira Lacerda apita, com Thiaggo Americano Labes (SC) e Douglas Pagung (ES) como assistentes. No VAR, Rafael Traci (SC).",
    "O jogo é na Arena do Grêmio, no bairro Humaitá, na zona norte de Porto Alegre. É um dos dois últimos jogos do time como mandante no Brasileirão; o outro é contra o Mirassol, na rodada final.",
  ],
  faqCanal: "A partida tem transmissão exclusiva do Premiere, no pay-per-view, às 21h30 de Brasília. Não passa na TV aberta.",
  faqExtra: [
    ["Kike Olivera pode jogar contra o Grêmio?", "Sim. O atacante pertence ao Grêmio e está emprestado ao Bahia, mas uma cláusula do contrato libera a participação dele neste jogo. No 1º turno, ele ficou fora."],
    ["Quem está suspenso no Grêmio contra o Bahia?", "O zagueiro Walter Kannemann e o volante Mathías Villasanti, pelo terceiro cartão amarelo, recebido contra o Flamengo."],
  ],
  excerpt: "Grêmio e Bahia se enfrentam às 21h30 desta quarta-feira (18/11), na Arena do Grêmio, pela 35ª rodada do Brasileirão. Veja onde assistir, desfalques e prováveis escalações.",
  metaDescription: "Saiba onde assistir a Grêmio x Bahia nesta quarta (18/11), às 21h30, na Arena do Grêmio, pelo Brasileirão. Transmissão do Premiere, desfalques e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
