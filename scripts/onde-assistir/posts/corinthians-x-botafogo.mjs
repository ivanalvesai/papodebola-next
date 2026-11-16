// Corinthians x Botafogo — Brasileirão Série A, 35ª rodada, quarta 18/11/2026 21h30. Jogo 15238243.
// Autor: Lucas Lima (2). Premiere (Máquina do Esporte 11/11; Brasil 247 12/11). Arbitragem: Lance e VAVEL (escala CBF 13/11).
// Desfalques: Lance (05/11 e 12/11), Gazeta Esportiva (09/11 e 13/11), CNN Brasil/Itatiaia (05/11), Terra (14/11), TMC (09/11), Super Rádio Tupi.
import { B, P } from "../lexical.mjs";
import { watchPostV2, QUA18 } from "../template-v2.mjs";

export const opts = {
  comp: "a", data: QUA18, matchId: 15238243, authorId: 2, A: "Corinthians", Bn: "Botafogo", hora: "21h30",
  canal: "Premiere", canalLongo: "Premiere (pay-per-view)", canalCapaAlt: "no Premiere",
  competicaoLinha: "Brasileirão Série A 2026, 35ª rodada",
  localCurto: "Neo Química Arena, em São Paulo (SP)",
  ondeFrase: "na Neo Química Arena, em Itaquera, na zona leste de São Paulo",
  arbitro: "Wilton Pereira Sampaio (GO); VAR: Wagner Reway (SC)",
  // XI do último jogo (0 x 0 com o São Paulo) com as baixas confirmadas: Yuri Alberto e André Ramalho (suspensos),
  // André (Seleção) e Garro (joelho). Matheuzinho volta de suspensão. Substitutos = opções citadas pela imprensa.
  swapHome: [
    ["Pedro Milans", { name: "Matheuzinho", number: "2", id: "931540" }],
    ["André Ramalho", { name: "João Pedro Tchoca", number: "4", id: "1411150" }],
    ["André Luiz", { name: "André Carrillo", number: "19", id: "115182" }],
    ["Rodrigo Garro", { name: "Vitinho", number: "11", id: "242054" }],
    ["Yuri Alberto", { name: "Gui Negão", number: "56", id: "1922597" }],
  ],
  // Ferraresi está com a Venezuela (joga na Rússia no dia 17); Arthur Chaves, que voltou a treinar, é a opção para a zaga.
  swapAway: [["Nahuel Ferraresi", { name: "Arthur Chaves", number: "3", id: "1122806" }]],
  lead: P("O ", B("Corinthians"), " recebe o ", B("Botafogo"), " nesta quarta-feira (18/11), às ", B("21h30 (de Brasília)"), ", na Neo Química Arena, pela 35ª rodada do ", B("Brasileirão Série A"), ". A transmissão é exclusiva do ", B("Premiere"), ", no pay-per-view. O time de Clarence Seedorf entra em campo dentro da zona de rebaixamento e com uma lista longa de desfalques; o de Tite tenta abrir distância da parte de baixo da tabela."),
  comoChegam: [
    "O Corinthians é o 17º colocado, com 37 pontos, nove vitórias, dez empates e 15 derrotas. Está empatado em pontos e em vitórias com o Grêmio, 18º, e fica à frente só pelo saldo de gols (-6 contra -9). O primeiro time fora da zona é o Internacional, com 38. A reação começou tarde: depois de dez jogos sem vencer, com nove derrotas, o time bateu o Mirassol por 2 a 0 em Itaquera, em 30 de outubro, e na rodada seguinte empatou sem gols com o São Paulo. Como mandante, soma seis vitórias, quatro empates e sete derrotas no campeonato.",
    "O Botafogo está em 12º, com 42 pontos, cinco acima da zona de rebaixamento. Na última rodada, antes da data Fifa, venceu o Atlético-MG por 1 a 0 no Nilton Santos. Antes disso, havia perdido para Internacional (3 a 0) e Remo (2 a 1), ambos fora de casa. Longe do Rio, o time de Tite não vence desde 26 de julho, quando ganhou do Cruzeiro por 1 a 0, em Belo Horizonte: são seis jogos como visitante com cinco derrotas e um empate.",
  ],
  cardTitulo: "Situação no Brasileirão", cardSub: "Antes dos jogos desta quarta-feira",
  extraRows: [["Primeiro fora da zona", "Internacional, 16º, com 38 pontos"], ["1º turno", "Botafogo 3 x 1 Corinthians, no Nilton Santos"]],
  tabela: [10, 20], tabelaTitulo: "Classificação do Brasileirão (10º ao 20º)",
  emJogo: [
    "Para o Corinthians, vencer significa chegar a 40 pontos e passar, ao menos até quinta-feira, Internacional e Vitória, que têm 38 e jogam na rodada um dia depois (Vasco x Internacional e Vitória x Red Bull Bragantino). O Grêmio, rival direto, joga no mesmo horário contra o Bahia, em Porto Alegre. Depois do Botafogo, o Corinthians visita o Atlético-MG, recebe o próprio Grêmio e fecha o campeonato contra o Remo, em Belém.",
    "O Botafogo, com uma vitória, vai a 45 pontos e fica oito à frente do Corinthians, a três rodadas do fim. Se perder, vê o Corinthians encostar, a dois pontos. Na rodada seguinte, o Botafogo recebe o São Paulo no Nilton Santos.",
  ],
  desfalques: [
    P(B("Corinthians: "), "Yuri Alberto, expulso no clássico com o São Paulo depois de revisão do VAR, e Matheus Pereira, expulso no banco de reservas, cumprem suspensão automática. O zagueiro André Ramalho também está fora, pelo terceiro cartão amarelo. O volante André está com a Seleção Brasileira, que jogou contra o Japão no dia 14 e enfrenta Singapura no dia 17, e dificilmente terá condições de jogar. Rodrigo Garro trata uma lesão no ligamento colateral medial do joelho direito e não deve estar disponível. Jesse Lingard, recuperado de uma fratura na costela, pode voltar; Gabriel Paulista, com estiramento no adutor da perna esquerda, e Raniele, que fez artroscopia no joelho em outubro, seguem como dúvidas. Matheuzinho volta depois de cumprir suspensão."),
    P(B("Botafogo: "), "o meia Danilo trata uma lesão na coxa direita, a mesma que o tirou da Seleção na data Fifa, e não deve jogar. O zagueiro Nahuel Ferraresi está com a Venezuela, que enfrenta a Rússia no dia 17, em Krasnodar, e o volante Domingos Andrade está com a seleção de Angola. O jovem Huguinho, convocado para a Seleção Sub-20, era esperado em São Paulo no dia 17 para ficar à disposição. Os zagueiros Kaio Pantaleão, que voltou de cirurgia no joelho, e Arthur Chaves já treinam com o elenco e são opções para a defesa."),
  ],
  lineupNote: "Os técnicos só confirmam os titulares perto do jogo. Os campinhos abaixo partem da última escalação de cada time e trocam os desfalques confirmados pelas opções mais citadas na semana; a lista oficial sai cerca de uma hora antes da bola rolar.",
  provHome: "Hugo Souza; Matheuzinho, João Pedro Tchoca, Gustavo Henrique e Fabrizio Angileri; Breno Bidon e André Carrillo; Kaio César, Vitinho e Matheus Bidu; Gui Negão. Para o lugar de Yuri Alberto, Seedorf também tem Pedro Raul e Memphis Depay; Iago Machado é a outra opção para a zaga, e Allan e Charles disputam o meio",
  provAway: "Gabriel Batista; Arthur Chaves, Gabriel Justino e Marçal; Vitinho, Edenilson, Huguinho, Cristian Medina e Paulinho; Danilo Pereira e Tiquinho Soares. Arthur Chaves aparece na vaga de Ferraresi, mas a presença dele depende da liberação do departamento médico; Kaio Pantaleão é a alternativa",
  local: [
    "A arbitragem é de Goiás: Wilton Pereira Sampaio, do quadro da Fifa, apita, com Bruno Raphael Pires (GO) e Leone Carvalho Rocha (GO) como assistentes. No VAR, Wagner Reway (SC).",
    "O jogo é na Neo Química Arena, em Itaquera. A entrada no estádio é feita só por reconhecimento facial, e o torcedor precisa cadastrar a biometria no momento da compra do ingresso, inclusive no setor visitante.",
  ],
  faqCanal: "A partida tem transmissão exclusiva do Premiere, no pay-per-view, às 21h30 de Brasília. Não passa na TV aberta.",
  faqExtra: [
    ["Quem está suspenso no Corinthians contra o Botafogo?", "Yuri Alberto e Matheus Pereira, expulsos no 0 a 0 com o São Paulo, e André Ramalho, pelo terceiro cartão amarelo."],
    ["Como foi Botafogo x Corinthians no 1º turno?", "O Botafogo venceu por 3 a 1, no Nilton Santos, em 17 de maio, pela 16ª rodada."],
  ],
  excerpt: "Corinthians e Botafogo se enfrentam às 21h30 desta quarta-feira (18/11), na Neo Química Arena, pela 35ª rodada do Brasileirão. Veja onde assistir, desfalques e prováveis escalações.",
  metaDescription: "Saiba onde assistir a Corinthians x Botafogo nesta quarta (18/11), às 21h30, na Neo Química Arena, pelo Brasileirão. Transmissão do Premiere, desfalques e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
