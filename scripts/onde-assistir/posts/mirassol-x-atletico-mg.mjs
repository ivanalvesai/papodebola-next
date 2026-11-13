// Mirassol x Atlético-MG — Brasileirão Série A, 35ª rodada, sábado 14/11/2026 18h30. Jogo 15238244.
// Autor: Lucas Lima (2). Amazon Prime Video (ficha da CBF). Fontes: mirassolfc.com.br, Itatiaia, O Tempo, CBF.
import { B, P } from "../lexical.mjs";
import { watchPostV2, SAB14 } from "../template-v2.mjs";

export const opts = {
  comp: "a", data: SAB14, matchId: 15238244, authorId: 2, A: "Mirassol", Bn: "Atlético-MG", hora: "18h30",
  canal: "Amazon Prime Video", canalLongo: "Amazon Prime Video (streaming, exclusivo)", canalCapaAlt: "no Prime Video",
  competicaoLinha: "Brasileirão Série A 2026, 35ª rodada",
  localCurto: "Estádio José Maria de Campos Maia (Maião), em Mirassol (SP)",
  ondeFrase: "no Estádio José Maria de Campos Maia, o Maião, em Mirassol, no interior de São Paulo",
  arbitro: "Savio Pereira Sampaio (DF); VAR: Caio Max Augusto Vieira (GO)",
  lead: P("O ", B("Mirassol"), " recebe o ", B("Atlético-MG"), " neste sábado (14/11), às ", B("18h30 (de Brasília)"), ", no Maião, pela 35ª rodada do ", B("Brasileirão Série A"), ". O jogo tem transmissão exclusiva do ", B("Amazon Prime Video"), ". De um lado, um time que quer encerrar de vez a conta do rebaixamento; do outro, o Galo no último compromisso antes da final da Copa Sul-Americana."),
  comoChegam: [
    "O Mirassol é o 14º colocado, com 40 pontos, três acima da zona de rebaixamento. Na rodada passada, venceu a Chapecoense de virada por 2 a 1 na Arena Condá, com gols de Reinaldo, de pênalti, e Shaylon, num resultado que confirmou a queda dos catarinenses. Antes, havia perdido para o Corinthians (2 a 0) e empatado com o São Paulo (1 a 1) no Maião, onde também bateu o Internacional por 2 a 0 em outubro. O técnico é Rafael Guanaes.",
    "O Atlético-MG ocupa o 7º lugar, com 50 pontos, na faixa de classificação para a Sul-Americana, mas vive a pior fase do segundo semestre. Perdeu os três últimos jogos no Brasileirão, para Flamengo (3 a 2), Cruzeiro (1 a 0, no clássico) e Botafogo (1 a 0), e foi eliminado pelo Grêmio na semifinal da Copa do Brasil, com derrota por 2 a 0 em Porto Alegre e empate por 1 a 1 na Arena MRV. O time de Eduardo Domínguez vira a chave para a decisão contra o Boca Juniors no próximo sábado (21/11), em Barranquilla, na Colômbia.",
  ],
  cardTitulo: "Situação no Brasileirão", cardSub: "Antes da 35ª rodada",
  extraRows: [["Zona de rebaixamento", "Corinthians e Grêmio, 37 pontos"], ["Retrospecto na Série A", "Atlético 2 vitórias e 1 empate"]],
  tabela: [5, 18], tabelaTitulo: "Classificação do Brasileirão (5º ao 18º)",
  emJogo: [
    "Para o Mirassol, vencer significa chegar a 43 pontos e abrir seis de vantagem sobre Corinthians e Grêmio, que ainda jogam na rodada. Com três jogos restantes depois deste (Fluminense fora, Athletico-PR em casa e Grêmio fora), seria um passo enorme para garantir mais um ano na elite. O time do interior paulista nunca venceu o Atlético na Série A: perdeu duas vezes e empatou uma.",
    "O Atlético está a quatro pontos do Athletico-PR, 5º colocado, e tem Bragantino e Santos, ambos com 47, logo atrás. Uma vitória mantém o Galo na briga por uma posição melhor na tabela, mas a prioridade da semana é clara: este é o último jogo antes da final da Sul-Americana, e a comissão técnica precisa equilibrar o resultado com o desgaste do elenco.",
  ],
  desfalques: [
    P(B("Mirassol: "), "não há desfalques divulgados. Edson Carioca e Bruno Santos voltam depois de cumprir suspensão, e o atacante Aldo Filho, que ficou cerca de 100 dias se recuperando de lesão muscular, voltou contra a Chapecoense e deu a assistência do gol da virada. O elenco tem 11 jogadores pendurados com dois cartões amarelos, entre eles Reinaldo, Neto Moura, Shaylon e Eduardo."),
    P(B("Atlético-MG: "), "o volante Tomás Pérez cumpre suspensão pelo terceiro amarelo. Victor Hugo, Thiago Borbas e Reinier tratam lesões na parte posterior da coxa, e Alan Franco e Alan Minda foram cortados da seleção do Equador por lesão muscular. Vitão e Kauã Pascini estão com a Seleção Brasileira Sub-20, e Ángelo Preciado, com o Equador. Fred foi liberado pelo departamento médico, mas ainda não tem condição de jogar os 90 minutos; Maycon, que teve fadiga muscular, voltou a treinar com o grupo. O atacante Mateo Cassierra retorna depois de quase um mês parado."),
  ],
  local: [
    "A arbitragem é do Distrito Federal: Savio Pereira Sampaio apita, com Bruno Raphael Pires (GO) e Daniel Henrique da Silva Andrade (DF) como assistentes. No VAR, Caio Max Augusto Vieira (GO).",
    "O jogo é no Maião, o Estádio José Maria de Campos Maia, casa do Mirassol. Para esta partida, o clube lançou uma promoção para quem tem o Passaporte, o programa de sócios: o titular pode levar um amigo pagando R$ 20 pelo ingresso do acompanhante.",
  ],
  faqCanal: "A partida tem transmissão exclusiva do Amazon Prime Video, no streaming, às 18h30 de Brasília. Não passa na TV aberta, na TV fechada nem no Premiere.",
  faqExtra: [
    ["O Mirassol já venceu o Atlético-MG na Série A?", "Não. Em três jogos pela Série A, o Atlético venceu dois (1 a 0 em 2025 e 3 a 1 no 1º turno de 2026) e houve um empate, por 2 a 2, em Mirassol, em 2025."],
    ["Quando é a final da Sul-Americana do Atlético-MG?", "No sábado seguinte, 21 de novembro, contra o Boca Juniors, no Estádio Metropolitano Roberto Meléndez, em Barranquilla, na Colômbia."],
  ],
  excerpt: "Mirassol e Atlético-MG se enfrentam às 18h30 deste sábado (14/11), no Maião, pela 35ª rodada do Brasileirão. Veja onde assistir, desfalques e prováveis escalações.",
  metaDescription: "Saiba onde assistir a Mirassol x Atlético-MG neste sábado (14/11), às 18h30, no Maião, pelo Brasileirão. Transmissão do Prime Video, desfalques e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
