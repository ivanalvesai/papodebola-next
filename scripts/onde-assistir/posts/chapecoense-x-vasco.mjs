// Chapecoense x Vasco — Brasileirão Série A, jogo adiado da 21ª rodada, sábado 14/11/2026 20h30.
// Jogo 17449066. Autor: Ivan Alves (1). Premiere. Fontes: chapecoense.com (comunicados e ingressos),
// Máquina do Esporte, Papo na Colina, SuperVasco, Lance, CNN Brasil, NetVasco (escala CBF).
import { B, P } from "../lexical.mjs";
import { watchPostV2, SAB14 } from "../template-v2.mjs";

export const opts = {
  comp: "a", data: SAB14, matchId: 17449066, authorId: 1, A: "Chapecoense", Bn: "Vasco", hora: "20h30",
  canal: "Premiere", canalLongo: "Premiere (pay-per-view)", canalCapaAlt: "no Premiere",
  competicaoLinha: "Brasileirão Série A 2026, jogo adiado da 21ª rodada",
  localCurto: "Arena Condá, em Chapecó (SC)", ondeFrase: "na Arena Condá, em Chapecó, Santa Catarina",
  arbitro: "Rodrigo José Pereira de Lima (PE); VAR: Gilberto Rodrigues Castro Junior (PE)",
  // Bolasie deixou a Chapecoense em 12/11: a vaga dele no XI do jogo anterior vai para Maurício Garcez (opção do elenco).
  swapHome: [["Yannick Bolasie", { name: "Maurício Garcez", number: "31", id: "1050353" }]],
  lead: P("A ", B("Chapecoense"), " recebe o ", B("Vasco"), " neste sábado (14/11), às ", B("20h30 (de Brasília)"), ", na Arena Condá, no último jogo atrasado do ", B("Brasileirão Série A"), " 2026, válido pela 21ª rodada. A transmissão é do ", B("Premiere"), ". O Vasco tenta se afastar da zona de rebaixamento no mesmo dia em que o clube elege o novo presidente."),
  comoChegam: [
    "A Chapecoense chega rebaixada e em reconstrução. A queda foi confirmada em 3 de novembro, na derrota por 2 a 1 para o Mirassol, em casa, e nos dias seguintes o clube anunciou a saída do técnico Rafael Lacerda e do lateral Dudu, do goleiro Rafael Santos e do atacante Yannick Bolasie. O interino Rodrigo Chipp, que fez carreira nas categorias de base, comanda o time com o auxiliar Ricardo Chuva. Lanterna, com 21 pontos e quatro vitórias em 33 jogos, a Chape tem o pior ataque e a pior defesa do campeonato.",
    "O Vasco é o 13º, com 41 pontos e um jogo a menos que a maioria dos rivais. Chega depois de uma semana dura: foi eliminado pelo Palmeiras na semifinal da Copa do Brasil, nos pênaltis (5 a 4), em São Januário. No Brasileirão, porém, vem de vitória por 3 a 1 sobre o Athletico-PR, fora de casa. O técnico Pedro Emanuel treinou o time com força máxima durante a semana, segundo relatos da imprensa ligada ao clube.",
    "A semana também foi marcada pelo tornado que atingiu Chapecó em 4 de novembro, com ventos de 126 km/h, mais de 2.400 casas danificadas e o aeroporto da cidade fechado por três dias. Chegou-se a cogitar a mudança de local, mas o aeroporto reabriu e a partida foi mantida na Arena Condá.",
  ],
  cardTitulo: "Situação no Brasileirão", cardSub: "Antes do jogo adiado da 21ª rodada",
  extraRows: [["Zona de rebaixamento", "Corinthians e Grêmio, 37 pontos"], ["1º turno", "Vasco 1 x 1 Chapecoense, em São Januário"]],
  tabela: [9, 20], tabelaTitulo: "Classificação do Brasileirão (9º ao 20º)",
  emJogo: [
    "Para o Vasco, os três pontos valem muito: com uma vitória, o time chega a 44 e abre sete de vantagem sobre a zona de rebaixamento, ficando muito perto de garantir a permanência. É o primeiro de cinco jogos em 18 dias, uma sequência que tem ainda Internacional (19/11, em São Januário), Red Bull Bragantino (22/11, fora), Atlético-MG (29/11, fora) e Vitória (2/12, em casa).",
    "A Chapecoense, sem chance de escapar, joga pela honra diante da torcida e para dar minutos a quem pode ficar para 2027. Depois do Vasco, o time visita o Remo (18/11) e recebe o Cruzeiro (21/11).",
    "O jogo foi adiado por conflito com a agenda do Vasco nas copas, quando o clube disputava a Sul-Americana e a Copa do Brasil ao mesmo tempo, e a CBF o remarcou para a data Fifa de novembro, semana sem rodada do Brasileirão.",
  ],
  desfalques: [
    P(B("Chapecoense: "), "o clube oficializou nesta semana o fim dos contratos de Dudu, Rafael Santos e Bolasie, que somou 34 jogos, três gols e três assistências em 2026. A imprensa catarinense também aponta as saídas do zagueiro Rafael Thyere e do meia Bruno Matias, ainda sem comunicado do clube. Não há lista de lesionados ou suspensos divulgada."),
    P(B("Vasco: "), "não há desfalques confirmados para o jogo. Andrés Gómez, que teve um problema no pé, e Marino, que tratou o tornozelo, eram dúvidas no começo do mês, mas tinham previsão de voltar. A delegação viajou na sexta-feira e foi autorizada a pousar no aeroporto de Chapecó, reaberto depois do tornado."),
  ],
  provHome: "Anderson; Heitor, Kauan, Eduardo Doma e Bruno Pacheco; Camilo e Yago Felipe; Marcinho, Giovanni Augusto e Maurício Garcez; Tulio Eduardo (no campinho, Maurício Garcez aparece na vaga de Bolasie, que deixou o clube)",
  local: [
    "A arbitragem é pernambucana: Rodrigo José Pereira de Lima apita, com Brígida Cirilo Ferreira (AL) e Schumacher Marques Gomes (PB) como assistentes. No VAR, Gilberto Rodrigues Castro Junior (PE).",
    "Os ingressos estão à venda no site da Chapecoense e na bilheteria da Arena Condá, aberta no sábado das 10h às 21h. O 1º lote custa de R$ 120 a R$ 160 a inteira; no setor visitante (Sul, portão 1), R$ 120 a inteira e R$ 60 a meia. A bilheteria do visitante abre só no dia do jogo, das 17h às 21h.",
  ],
  faqCanal: "A partida tem transmissão exclusiva do Premiere, no pay-per-view, às 20h30 de Brasília. Não passa na TV aberta.",
  faqExtra: [
    ["Por que Chapecoense x Vasco foi adiado?", "O jogo da 21ª rodada, previsto para 30 de julho, foi adiado por conflito com a agenda do Vasco nas copas. A CBF o remarcou para a data Fifa de novembro."],
    ["A Chapecoense já está rebaixada?", "Sim. A queda para a Série B foi confirmada em 3 de novembro, na derrota por 2 a 1 para o Mirassol, na Arena Condá."],
  ],
  excerpt: "Chapecoense e Vasco fazem às 20h30 deste sábado (14/11), na Arena Condá, o último jogo atrasado do Brasileirão. Veja onde assistir, desfalques e prováveis escalações.",
  metaDescription: "Saiba onde assistir a Chapecoense x Vasco neste sábado (14/11), às 20h30, na Arena Condá, pelo Brasileirão. Transmissão do Premiere, desfalques e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
