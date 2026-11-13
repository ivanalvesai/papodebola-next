// Criciúma x Novorizontino — Série B, 38ª e última rodada, sábado 14/11/2026 16h30. Jogo 15526388.
// Autor: Ivan Alves (1). ESPN/Disney+ (tabela da CBF). Fontes: criciuma.com.br, gremionovorizontino.com.br,
// Engeplus, escala da CBF.
import { B, P } from "../lexical.mjs";
import { watchPostV2, SAB14 } from "../template-v2.mjs";

export const opts = {
  comp: "b", data: SAB14, matchId: 15526388, authorId: 1, A: "Criciúma", Bn: "Novorizontino", hora: "16h30",
  canal: "ESPN e Disney+", canalLongo: "ESPN (TV fechada) e Disney+ (streaming)", canalCapaAlt: "na ESPN e no Disney+",
  competicaoLinha: "Brasileirão Série B 2026, 38ª e última rodada",
  localCurto: "Estádio Heriberto Hülse, em Criciúma (SC)", ondeFrase: "no Estádio Heriberto Hülse, em Criciúma, Santa Catarina",
  arbitro: "Wilton Pereira Sampaio (GO); VAR: Rodrigo Nunes de Sá (RJ)",
  lead: P("O ", B("Novorizontino"), ", que já garantiu o primeiro acesso da sua história à Série A, decide o título da ", B("Série B"), " neste sábado (14/11), às ", B("16h30 (de Brasília)"), ", contra o ", B("Criciúma"), ", no Heriberto Hülse. O jogo da última rodada tem transmissão da ", B("ESPN"), " e do ", B("Disney+"), "."),
  comoChegam: [
    "O Novorizontino lidera com 70 pontos e garantiu o acesso inédito na rodada passada, com uma virada por 2 a 1 sobre o Fortaleza jogando com um a menos desde os 7 minutos, com gols de Matheus Bianqui e Luís Oyama. O time de Enderson Moreira vem de quatro vitórias seguidas e seis jogos sem perder, e coroa uma trajetória de quase: em 2023, ficou fora do acesso por um ponto, e em 2024, no critério de desempate. O artilheiro é Robson, com 17 gols na competição. \"Nada mais justo e bonito que entregar um título para coroar\", disse o atacante ao site oficial do clube.",
    "O Criciúma é o 4º, com 62 pontos, e já está no playoff de acesso. O time de Umberto Louzer perdeu para o Vila Nova por 1 a 0 na rodada passada, mas tem a vantagem de jogar em casa, onde venceu América-MG e Ponte Preta nas últimas semanas. No 1º turno, o Tigre ganhou do Novorizontino por 1 a 0, no Jorjão.",
  ],
  cardTitulo: "Situação na Série B", cardSub: "Antes da 38ª e última rodada",
  extraRows: [["Vice-líder", "Juventude, 68 pontos"], ["Rival no playoff", "Criciúma x Fortaleza, em 21 e 28/11"]],
  tabela: [1, 8], tabelaTitulo: "Classificação da Série B (1º ao 8º)",
  emJogo: [
    "O Novorizontino é campeão se vencer ou empatar. Mesmo com derrota, fica com a taça se o Juventude, que tem 68 pontos, não vencer o Botafogo-SP no mesmo horário.",
    "O Criciúma joga pelo 4º lugar. Pelo regulamento de 2026, 1º e 2º sobem direto e do 3º ao 6º há playoffs de ida e volta (3º x 6º e 4º x 5º), com uma vaga em cada confronto; o time de melhor campanha decide em casa e avança com empate no agregado. Criciúma e Fortaleza, ambos com 62 pontos, já estão travados entre o 4º e o 5º lugar e vão se enfrentar no mata-mata. O Tigre leva vantagem nas vitórias (18 a 16): com uma vitória, garante o 4º lugar; com empate ou derrota, depende de o Fortaleza não somar mais pontos contra o Vila Nova.",
  ],
  desfalques: [
    P(B("Criciúma: "), "o clube não divulgou desfalques. A semana teve reapresentação na segunda, treinos táticos e de finalização no CT Antenor Angeloni e o último treino na sexta-feira (13)."),
    P(B("Novorizontino: "), "Nicolas Careca, expulso aos 7 minutos contra o Fortaleza, deve cumprir suspensão automática. O elenco fez o último treino em Novo Horizonte na quinta-feira (12) e os ajustes finais em Florianópolis. \"Temos um jogo dificílimo no sábado, temos nossa história pra ser escrita ainda\", disse o zagueiro Eduardo Brock."),
  ],
  labelHome: "Base do último jogo", labelAway: "Base do último jogo",
  lineupNote: "Nenhum dos dois clubes adiantou a escalação. Os campinhos mostram a base do último jogo de cada time; no Novorizontino, Nicolas Careca, que deve cumprir suspensão, precisa ser substituído. A lista oficial sai cerca de uma hora antes da bola rolar.",
  local: [
    "A arbitragem é de Wilton Pereira Sampaio (GO), que apitou na Copa do Mundo de 2026, com Rodrigo Figueiredo Henrique Correa (RJ) e Jordana Pereira Batista (GO) como assistentes. No VAR, Rodrigo Nunes de Sá (RJ). Com Wilton, o Criciúma tem três vitórias, quatro empates e seis derrotas.",
    "O Criciúma montou uma programação para lotar o estádio: o evento \"Hoje Tem Tigre\" no pátio, com telão e shows, e a promoção Sócio +1. Os portões abrem às 14h30. A arquibancada custa R$ 120 (meia R$ 60), cadeiras e camarotes estão esgotados e a torcida visitante tem 1.922 ingressos, com entrada pelo portão 8. Crianças até 12 anos não pagam na arquibancada, acompanhadas de um adulto.",
  ],
  faqCanal: "A partida tem transmissão da ESPN, na TV fechada, e do Disney+, no streaming, às 16h30 de Brasília.",
  faqExtra: [
    ["O Novorizontino precisa de quê para ser campeão da Série B?", "De uma vitória ou um empate contra o Criciúma. Mesmo perdendo, é campeão se o Juventude não vencer o Botafogo-SP."],
    ["O Novorizontino já está na Série A?", "Sim. O acesso, o primeiro da história do clube, foi garantido na vitória por 2 a 1 sobre o Fortaleza, na 37ª rodada."],
  ],
  excerpt: "Criciúma e Novorizontino se enfrentam às 16h30 deste sábado (14/11), em Criciúma, na rodada que define o campeão da Série B. Veja onde assistir e as escalações.",
  metaDescription: "Saiba onde assistir a Criciúma x Novorizontino neste sábado (14/11), às 16h30, pela última rodada da Série B. Título em jogo, transmissão da ESPN e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
