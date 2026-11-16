// Remo x Chapecoense — Brasileirão Série A, 35ª rodada, quarta 18/11/2026 20h. Jogo 15235659.
// Autor: Lucas Lima (2). Premiere (Máquina do Esporte, Beira do Campo). Fontes: O Liberal (ingressos, Carpini,
// João Lucas), Remo 100%, Romanews, chapecoense.com (apresentação de Bergantin e programação), Oeste Mais,
// Portal Democrata, VAVEL e Lance (escala da CBF).
import { B, P } from "../lexical.mjs";
import { watchPostV2, QUA18 } from "../template-v2.mjs";

export const opts = {
  comp: "a", data: QUA18, matchId: 15235659, authorId: 2, A: "Remo", Bn: "Chapecoense", hora: "20h",
  canal: "Premiere", canalLongo: "Premiere (pay-per-view)", canalCapaAlt: "no Premiere",
  competicaoLinha: "Brasileirão Série A 2026, 35ª rodada",
  localCurto: "Mangueirão, em Belém (PA)",
  ondeFrase: "no Estádio Mangueirão, em Belém, no Pará",
  arbitro: "Alex Gomes Stefano (RJ); VAR: Paulo Renato Moreira da Silva Coelho (RJ)",
  lead: P("O ", B("Remo"), " recebe a ", B("Chapecoense"), " nesta quarta-feira (18/11), às ", B("20h (de Brasília)"), ", no Mangueirão, em Belém, pela 35ª rodada do ", B("Brasileirão Série A"), ". A transmissão é exclusiva do ", B("Premiere"), ", no pay-per-view. É o encontro dos dois últimos colocados: a Chapecoense já está rebaixada, e o Remo precisa vencer para não ver a queda ser confirmada."),
  comoChegam: [
    "O Remo é o 19º colocado, com 29 pontos, seis vitórias, 11 empates e 17 derrotas. O técnico Thiago Carpini conseguiu a primeira vitória no cargo na 33ª rodada, 2 a 1 sobre o Botafogo no Mangueirão, resultado que encerrou uma série de 12 jogos sem vencer. Na rodada seguinte, porém, o time levou 6 a 1 do Palmeiras em São Paulo, a maior goleada do campeonato. \"Nós facilitamos o jogo para o adversário e hoje nada funcionou\", disse o treinador depois da partida. Em casa, o Remo tem quatro vitórias, sete empates e seis derrotas.",
    "A Chapecoense é a lanterna, com 21 pontos, e teve o rebaixamento confirmado em 3 de novembro, na derrota por 2 a 1 para o Mirassol. Desde então, trocou de técnico: Rafael Lacerda saiu, os interinos Rodrigo Chipp e Ricardo Chuva comandaram o time na derrota por 2 a 0 para o Vasco, no sábado (14/11), e o clube apresentou no domingo (15/11) Vinicius Bergantin, de 46 anos, contratado até novembro de 2027. O jogo em Belém deve ser a estreia dele. Longe de Chapecó, a Chape venceu uma vez em 17 jogos, e tem o pior ataque (33 gols) e a pior defesa (70 gols sofridos) da Série A.",
  ],
  cardTitulo: "Situação no Brasileirão", cardSub: "Antes da 35ª rodada",
  extraRows: [["Primeiro fora da zona", "Internacional, 38 pontos (16º)"], ["1º turno", "Chapecoense 2 x 3 Remo, na Arena Condá"]],
  tabela: [13, 20], tabelaTitulo: "Classificação do Brasileirão (13º ao 20º)",
  emJogo: [
    "A conta do Remo é curta. Com quatro jogos por fazer, o time pode chegar no máximo a 41 pontos e está nove atrás do Internacional, o 16º. Uma vitória leva o Remo a 32 e mantém a chance matemática viva, mas ainda depende de tropeços seguidos de Vitória e Internacional (38 pontos), Corinthians e Grêmio (37). Se não vencer, o teto cai para 39 pontos (com empate) ou 38 (com derrota), e a queda pode ser confirmada ainda nesta quarta, conforme os resultados dos rivais. Carpini disse ao O Liberal que acredita em um \"milagre\" e que o grupo vai brigar enquanto houver chance.",
    "Depois da Chapecoense, o Remo visita o Athletico-PR no domingo (22/11) e ainda enfrenta São Paulo e Corinthians. A Chapecoense, sem nada em jogo na tabela, recebe o Cruzeiro no sábado (21/11), na Arena Condá, e usa as rodadas finais para o novo técnico conhecer o elenco de 2027.",
    "Os dois times subiram juntos da Série B em 2025. No primeiro turno, em maio, o Remo venceu por 3 a 2 em Chapecó, com o gol da vitória no fim do jogo.",
  ],
  desfalques: [
    P(B("Remo: "), "não há desfalques divulgados. A novidade é o lateral-direito João Lucas, emprestado pelo Grêmio, que rompeu o ligamento cruzado do joelho direito em março, contra o Coritiba, e foi liberado pelo departamento médico. Ele volta a ser opção depois de oito meses, mas o clube não confirmou se será relacionado."),
    P(B("Chapecoense: "), "o clube não divulgou lesionados nem suspensos. Nas últimas semanas, deixaram o elenco o lateral Dudu, o goleiro Rafael Santos e o atacante Yannick Bolasie. A delegação viaja na terça (17/11), com chegada prevista a Belém no fim da tarde, e volta a Chapecó logo depois do jogo."),
  ],
  local: [
    "A CBF escalou o carioca Alex Gomes Stefano. Os assistentes são Thiago Henrique Correa (RJ) e Joverton Wesley Lima (RO), e o VAR fica com Paulo Renato Moreira da Silva Coelho (RJ).",
    "O Remo lançou uma promoção para encher o Mangueirão: o ingresso da arquibancada do Lado A custa R$ 20, com compra mínima de dois. A torcida da Chapecoense fica nas cadeiras do Lado B, a R$ 60, com cerca de 10% da carga. Os ingressos são digitais, vendidos pela Tickzi e nas lojas oficiais do clube, e a entrada é por reconhecimento facial, com cadastro prévio da biometria.",
  ],
  faqCanal: "A partida tem transmissão exclusiva do Premiere, no pay-per-view, às 20h de Brasília. Não passa na TV aberta nem na TV fechada.",
  faqExtra: [
    ["O Remo pode ser rebaixado contra a Chapecoense?", "Pode. Se não vencer, o Remo fica com no máximo 38 ou 39 pontos ao fim do campeonato, e a queda pode ser confirmada já nesta rodada, conforme os resultados de Vitória, Internacional, Corinthians e Grêmio."],
    ["Quem é o técnico da Chapecoense?", "Vinicius Bergantin, apresentado em 15 de novembro com contrato até novembro de 2027. Ele substitui Rafael Lacerda, que deixou o clube depois do rebaixamento."],
  ],
  excerpt: "Remo e Chapecoense jogam às 20h desta quarta (18/11), no Mangueirão, pela 35ª rodada do Brasileirão. Veja onde assistir, desfalques e prováveis escalações.",
  metaDescription: "Saiba onde assistir a Remo x Chapecoense nesta quarta (18/11), às 20h, no Mangueirão, pelo Brasileirão. Transmissão do Premiere, desfalques e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
