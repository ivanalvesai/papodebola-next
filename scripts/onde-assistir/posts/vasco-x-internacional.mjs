// Vasco x Internacional — Brasileirão Série A, 35ª rodada, quinta 19/11/2026 19h30. Jogo 15238240.
// Autor: Lucas Lima (2). SporTV e Premiere (Máquina do Esporte, MKT Esportivo e ficha oficial da CBF, jogo 342).
// Fontes: CBF (horário, São Januário, escala de arbitragem), SuperVasco (árbitro), Terra/Jogada10, Vascaíno.net e
// SuperVasco (retornos de Thiago Mendes, Sosa e Nuno Moreira), SCInter, Zona Mista e Piranot (suspensão de Maripán,
// Thiago Maia dúvida, testes com Ronaldo), Somos Colorados/GZH (Thiago Maia), Portal de Prefeitura/iMirante
// (chegada de Eduardo Baptista em 23/09), Folha do Leste e Bem Paraná (Chapecoense 0 x 2 Vasco).
import { B, P } from "../lexical.mjs";
import { watchPostV2, QUI19 } from "../template-v2.mjs";

export const opts = {
  comp: "a", data: QUI19, matchId: 15238240, authorId: 2, A: "Vasco", Bn: "Internacional", hora: "19h30",
  canal: "SporTV e Premiere", canalLongo: "SporTV (TV fechada) e Premiere (pay-per-view)", canalCapaAlt: "no SporTV e no Premiere",
  competicaoLinha: "Brasileirão Série A 2026, 35ª rodada",
  localCurto: "São Januário, no Rio de Janeiro (RJ)",
  ondeFrase: "no Estádio de São Januário, no Rio de Janeiro",
  arbitro: "Paulo César Zanovelli da Silva (MG); VAR: Emerson de Almeida Ferreira (MG)",
  lead: P("O ", B("Vasco"), " recebe o ", B("Internacional"), " nesta quinta-feira (19/11), às ", B("19h30 (de Brasília)"), ", em São Januário, pela 35ª rodada do ", B("Brasileirão Série A"), ". A transmissão é do ", B("SporTV"), ", na TV fechada, e do ", B("Premiere"), ", no pay-per-view. O Vasco, 11º colocado, quer se afastar de vez da parte de baixo e segurar a vaga na Sul-Americana; o Internacional, 16º, joga com um ponto de vantagem sobre a zona de rebaixamento."),
  comoChegam: [
    "O Vasco de Pedro Emanuel chega embalado. No sábado (14/11), venceu a Chapecoense por 2 a 0 na Arena Condá, em jogo atrasado da 21ª rodada, com os dois gols de Bruno Duarte. Foi a segunda vitória seguida fora de casa, depois do 3 a 1 sobre o Athletico-PR em Curitiba, no dia 4. Com 44 pontos, o time subiu para o 11º lugar e abriu sete pontos sobre o Z4. Em São Januário, são oito vitórias, três empates e seis derrotas no campeonato, mas o último jogo lá terminou em goleada sofrida: 4 a 1 para o Flamengo, em 29 de outubro.",
    "O Internacional trocou de técnico em setembro, quando estava em 18º com 28 pontos. Eduardo Baptista foi anunciado no dia 23 e, em seis jogos, somou 10 pontos: três vitórias, um empate e duas derrotas. Todas as vitórias vieram no Beira-Rio (Corinthians, Botafogo e Coritiba). Longe de Porto Alegre, a campanha no campeonato tem três vitórias, seis empates e oito derrotas, e o time não vence fora desde 12 de setembro, quando bateu a Chapecoense por 2 a 1. Sob Baptista, empatou o Gre-Nal por 1 a 1 e perdeu para Mirassol (2 a 0) e Fluminense (2 a 1).",
  ],
  cardTitulo: "Situação no Brasileirão", cardSub: "Antes da 35ª rodada",
  extraRows: [["Primeiro do Z4", "Corinthians, 37 pontos (17º)"], ["1º turno", "Internacional 4 x 1 Vasco, no Beira-Rio"]],
  tabela: [8, 18], tabelaTitulo: "Classificação do Brasileirão (8º ao 18º)",
  emJogo: [
    "A rodada começa na quarta-feira (18/11), e o Internacional pode entrar em campo já dentro do Z4. Corinthians e Grêmio, com 37 pontos, jogam na quarta: o Corinthians recebe o Botafogo e o Grêmio enfrenta o Bahia, ambos às 21h30. Se um deles vencer, chega a 40 e passa o Inter. O Vitória, que também tem 38, joga no mesmo horário de quinta contra o Bragantino. Por isso, a posição do colorado antes da bola rolar em São Januário depende do que acontecer na véspera.",
    "Uma vitória leva o Internacional a 41 pontos, e aí a conta muda: o time fica à frente de Corinthians e Grêmio, que no máximo chegam a 40 nesta rodada, com três jogos por fazer. Depois de São Januário, o Inter recebe o Vitória no domingo (23/11), em outro confronto direto, e ainda enfrenta Bragantino e Cruzeiro.",
    "Para o Vasco, os 44 pontos ainda não são garantia matemática de permanência, já que Corinthians e Grêmio podem chegar a 49. Uma vitória leva o time a 47, igualado em pontos com Bragantino e Santos, e deixa a permanência a um passo. O Vasco divide o 10º e o 11º lugar com o São Paulo (ambos com 44 pontos e 12 vitórias, o São Paulo à frente no saldo) e é hoje o último time dentro da faixa da Sul-Americana; Botafogo e Coritiba, com 42, vêm logo atrás. Na 36ª rodada, o time visita o Bragantino.",
    "No primeiro turno, em 16 de maio, o Internacional goleou por 4 a 1 no Beira-Rio, num jogo em que o Vasco não teve Thiago Mendes e Johan Rojas, suspensos.",
  ],
  desfalques: [
    P(B("Vasco: "), "não há suspensos. Os volantes Thiago Mendes, que teve dorsalgia, e Santiago Sosa, com dores no adutor da coxa esquerda, ficaram fora do jogo em Chapecó, mas treinaram normalmente na segunda-feira (16/11) no CT Moacyr Barbosa e devem voltar a ser relacionados. Sosa segue em acompanhamento do departamento médico. O atacante Nuno Moreira, que também desfalcou o time no sábado por dores na coxa direita, voltou às atividades de campo."),
    P(B("Internacional: "), "o zagueiro chileno Guillermo Maripán está suspenso: foi expulso no banco de reservas na confusão depois da vitória sobre o Coritiba. Ele não era titular, mas era a principal opção para a linha de três zagueiros. O volante Thiago Maia é dúvida por um problema físico; ficou fora do treino de sexta (13/11) e do jogo-treino de sábado (14/11). Na data Fifa, Eduardo Baptista testou Ronaldo tanto no meio quanto na zaga. O capitão Alan Patrick, recuperado de lesão na coxa direita sofrida contra o Fluminense, voltou no jogo-treino e é opção. Bruno Gomes está pendurado."),
  ],
  provHome: "Léo Jardim; Puma Rodríguez, Alan Saldivia, Robert Renan e Lucas Piton; Jair; Marino Hinestroza, Alan Lescano, Andrés Gómez e Facundo Colidio; Bruno Duarte (Thiago Mendes e Sosa, se liberados, podem voltar ao meio-campo, e Nuno Moreira briga por vaga no ataque)",
  provAway: "Kauan; Bruno Gomes, Gabriel Mercado e Juninho; Braian Aguirre, Rodrigo Villagra, Thiago Maia e Matheus Bahia; Vitinho e Johan Carbonero; Alerrandro (se Thiago Maia não tiver condições, Ronaldo entra no meio; Alan Patrick pode voltar ao time no lugar de um dos meias, e Sanabria foi testado ao lado de Alerrandro)",
  local: [
    "A CBF escalou o mineiro Paulo César Zanovelli da Silva. Os assistentes são Fernanda Nandrea Gomes Antunes e Felipe Alan Costa de Oliveira, ambos de Minas Gerais, e o VAR fica com Emerson de Almeida Ferreira (MG).",
    "O jogo é em São Januário, na Zona Norte do Rio, onde o Vasco fez 27 dos seus 44 pontos no campeonato. As informações de ingressos para as duas torcidas saem nos canais oficiais do clube.",
  ],
  faqCanal: "A partida tem transmissão do SporTV, na TV fechada, e do Premiere, no pay-per-view, às 19h30 de Brasília. Não passa na TV aberta.",
  faqExtra: [
    ["O Internacional pode entrar na zona de rebaixamento?", "Pode. Corinthians e Grêmio, com 37 pontos, jogam na quarta-feira (18/11). Se um deles vencer, passa o Internacional, que tem 38, e o colorado entra em campo em São Januário dentro do Z4. Uma vitória sobre o Vasco leva o time a 41 pontos."],
    ["Quem é o técnico do Internacional?", "Eduardo Baptista, anunciado em 23 de setembro de 2026, com contrato até o fim da temporada. Em seis jogos no comando, ganhou três, empatou um e perdeu dois."],
  ],
  excerpt: "Vasco e Internacional jogam às 19h30 desta quinta (19/11), em São Januário, pela 35ª rodada do Brasileirão. Veja onde assistir, desfalques e prováveis escalações.",
  metaDescription: "Saiba onde assistir a Vasco x Internacional nesta quinta (19/11), às 19h30, em São Januário, pelo Brasileirão. Transmissão do SporTV e Premiere e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
