// CRB x Ceará — Série B, 38ª e última rodada, sábado 14/11/2026 16h30. Jogo 15526390.
// Autor: Lucas Lima (2). RedeTV!, ESPN/Disney+ e SportyNet (tabela da CBF). Fontes: TNH1, Diário do
// Nordeste, O Povo, meuvozao, escala da CBF.
import { B, P } from "../lexical.mjs";
import { watchPostV2, SAB14 } from "../template-v2.mjs";

export const opts = {
  comp: "b", data: SAB14, matchId: 15526390, authorId: 2, A: "CRB", Bn: "Ceará", hora: "16h30",
  canal: "RedeTV!, ESPN, Disney+ e SportyNet", canalLongo: "RedeTV! (TV aberta), ESPN (TV fechada), Disney+ (streaming) e SportyNet", canalCapaAlt: "na RedeTV!, ESPN e Disney+",
  competicaoLinha: "Brasileirão Série B 2026, 38ª e última rodada",
  localCurto: "Estádio Rei Pelé, em Maceió (AL)", ondeFrase: "no Estádio Rei Pelé, em Maceió, Alagoas",
  arbitro: "Paulo César Zanovelli (MG); VAR: Paulo Renato Coelho (RJ)",
  // CRB: Pedro Castro suspenso; Patrick de Lucca na vaga (provável do Diário do Nordeste, 12/11).
  swapHome: [["Pedro Castro", { name: "Patrick de Lucca", number: "", id: "" }]],
  lead: P(B("CRB"), " e ", B("Ceará"), " fazem um jogo de dupla decisão neste sábado (14/11), às ", B("16h30 (de Brasília)"), ", no Rei Pelé, pela última rodada da ", B("Série B"), ": o time alagoano defende a vaga no playoff de acesso, e o cearense tenta evitar o primeiro rebaixamento da sua história para a Série C. A partida passa na ", B("RedeTV!"), ", na TV aberta, na ", B("ESPN"), ", no ", B("Disney+"), " e na SportyNet."),
  comoChegam: [
    "O CRB ocupa o 6º lugar, o último que dá vaga no playoff, com 58 pontos e 17 vitórias. O time de Fábio Matias vem de vitória por 3 a 0 sobre o Náutico, fora de casa, e venceu também Atlético-GO e Londrina nas últimas seis rodadas. A torcida respondeu: mais de 9 mil ingressos foram vendidos antecipadamente até quarta-feira (11). No 1º turno, o Galo venceu o Ceará por 1 a 0, no Castelão.",
    "O Ceará é o 16º, com 43 pontos, três acima do Avaí, primeiro time da zona de rebaixamento. A equipe desperdiçou duas chances de garantir a permanência ao perder para o Athletic (2 a 1) e para o América-MG (1 a 0, em pleno Castelão). Depois da última derrota, Daniel Paulista deixou o cargo, e o coordenador técnico Anderson Batatais comanda o time neste sábado, com o auxiliar Alisson Henry no banco. Na quinta-feira (12), a torcida lotou o treino em Porangabuçu para apoiar os jogadores e protestar contra a diretoria. \"Para mim, pessoalmente, é uma vergonha estar passando por isso\", disse o volante Vinícius Zanocelo.",
  ],
  cardTitulo: "Situação na Série B", cardSub: "Antes da 38ª e última rodada",
  extraRows: [["Briga pelo 6º lugar", "Goiás e Atlético-GO, 58 pontos"], ["17º lugar (rebaixamento)", "Avaí, 40 pontos"]],
  emJogo: [
    "Pelo regulamento de 2026, 1º e 2º sobem direto, do 3º ao 6º há playoffs de ida e volta, em 21 e 28 de novembro, e os quatro últimos caem. O CRB, com uma vitória, garante na prática a 6ª vaga: só perderia o lugar se o Goiás também vencesse e tirasse uma diferença de nove gols no saldo. Com empate, precisa que Goiás e Atlético-GO não vençam; com derrota, que os dois percam. Classificado, enfrenta o 3º colocado, Vila Nova ou Juventude.",
    "O Ceará fica na Série B com um empate. Mesmo perdendo, só cai se o Avaí vencer o América-MG em Belo Horizonte; nesse caso, os dois terminariam com 43 pontos e o Avaí ficaria à frente pelo número de vitórias (12 a 11).",
  ],
  desfalques: [
    P(B("CRB: "), "o volante Pedro Castro cumpre suspensão automática. Segundo a imprensa, o time deve ter Patrick de Lucca na vaga."),
    P(B("Ceará: "), "o volante Vinícius Zanocelo e o zagueiro Éder cumpriram suspensão contra o América-MG e estão liberados. O atacante Saulo Mineiro, com dores musculares, ficou fora do último jogo, e o zagueiro Luizão tratava uma tendinite no joelho; a situação dos dois para sábado não foi confirmada."),
  ],
  provHome: "Vitor Caetano; Hereda, Bressan, Lyncon e Reverson; Patrick de Lucca, Crystopher e Danielzinho; Dadá Belmonte, Thiaguinho e Mikael, segundo o Diário do Nordeste",
  labelAway: "Base do último jogo",
  lineupNote: "Os técnicos só confirmam os titulares perto do jogo. No CRB, o campinho mostra a escalação provável segundo a imprensa; no Ceará, que terá técnico interino, a base do último jogo. A lista oficial sai cerca de uma hora antes da bola rolar.",
  tabela: [13, 20], tabelaTitulo: "Classificação da Série B (13º ao 20º)",
  local: [
    "A arbitragem é de Paulo César Zanovelli (MG), com Luiz Cláudio Regazone (RJ) e Rafael Trombeta (PR) como assistentes. No VAR, Paulo Renato Coelho (RJ).",
    "O Rei Pelé, o Trapichão, tem capacidade para cerca de 15,4 mil pessoas. A arquibancada baixa custa R$ 40 (meia R$ 20) e a alta, R$ 120 (meia R$ 60); os ingressos estão nas lojas Regatas, na Poly Sport Centro, no site crbtickets.com.br e na bilheteria do estádio a partir das 14h de sábado. A torcida do Ceará só compra pela internet, sem bilheteria no dia.",
  ],
  faqCanal: "A partida tem transmissão da RedeTV!, na TV aberta, da ESPN, na TV fechada, do Disney+, no streaming, e da SportyNet, às 16h30 de Brasília.",
  faqExtra: [
    ["O Ceará pode ser rebaixado para a Série C?", "Sim, mas só se perder para o CRB e o Avaí vencer o América-MG. Com empate ou vitória em Maceió, o Ceará fica na Série B."],
    ["O que o CRB precisa para ir ao playoff da Série B?", "Uma vitória garante a vaga na prática. Com empate, precisa que Goiás e Atlético-GO não vençam seus jogos; com derrota, que os dois percam."],
  ],
  excerpt: "CRB e Ceará se enfrentam às 16h30 deste sábado (14/11), no Rei Pelé, em jogo que vale vaga no playoff e a permanência na Série B. Veja onde assistir e as escalações.",
  metaDescription: "Saiba onde assistir a CRB x Ceará neste sábado (14/11), às 16h30, em Maceió, pela Série B. Playoff e rebaixamento em jogo; passa na RedeTV!, ESPN e Disney+.",
};
export default (ctx) => watchPostV2(opts, ctx);
