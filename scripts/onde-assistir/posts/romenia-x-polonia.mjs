// Romênia x Polônia — Liga das Nações, Liga B · Grupo 4, 5ª rodada, sábado 14/11/2026 16h45. Jogo 15534170.
// Autor: Ivan Alves (1). Disney+ (guias de programação). Árbitro: Sebastian Gishamer.
import { B, P } from "../lexical.mjs";
import { watchPostV2, SAB14 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: SAB14, matchId: 15534170, authorId: 1, A: "Romênia", Bn: "Polônia", hora: "16h45",
  canal: "Disney+", canalLongo: "Disney+ (streaming)", canalCapaAlt: "no Disney+",
  competicaoLinha: "Liga das Nações 2026/27, Liga B, Grupo 4, 5ª rodada",
  localCurto: "Arena Națională, em Bucareste (Romênia)", ondeFrase: "na Arena Națională, em Bucareste, capital da Romênia",
  arbitro: "Sebastian Gishamer (Áustria)",
  swapAway: [["Mateusz Żukowski", { name: "Robert Lewandowski", number: "9", id: "41789" }]],
  lead: P("A ", B("Romênia"), " de Gheorghe Hagi recebe a ", B("Polônia"), " de Robert Lewandowski neste sábado (14/11), às ", B("16h45 (de Brasília)"), ", em Bucareste, pelo Grupo 4 da Liga B da ", B("Liga das Nações"), ". O jogo tem transmissão do ", B("Disney+"), "."),
  comoChegam: [
    "A Romênia vive uma campanha para esquecer: quatro derrotas em quatro jogos, 3 gols marcados e 13 sofridos. Gheorghe Hagi, o maior ídolo do futebol romeno, voltou ao comando da seleção em abril de 2026 e ainda busca a primeira vitória na competição. Para este jogo, não terá o meia Nicolae Stanciu nem o goleiro Ionuț Radu, lesionados, e o volante Răzvan Marin, suspenso. Daniel Bîrligea deve ser a referência no ataque, com Ianis Hagi, filho do treinador, na armação.",
    "A Polônia de Jan Urban é a 3ª colocada, com 4 pontos, e goleou a própria Romênia por 6 a 0 no 1º turno, em Varsóvia, com três gols de Lewandowski. O capitão volta ao time depois de cumprir suspensão. O lateral Przemysław Frankowski, lesionado, está fora. O futuro de Urban no cargo deve ser decidido depois desta Data Fifa.",
  ],
  cardTitulo: "Situação no Grupo 4 da Liga B", cardSub: "Antes da 5ª rodada",
  extraRows: [["Líder", "Suécia, 10 pontos"], ["Zona de risco", "4º joga playoff de rebaixamento"]],
  tabelaTitulo: "Classificação do Grupo 4 da Liga B",
  emJogo: [
    "Na Liga B, o 1º colocado sobe para a Liga A, o 2º disputa um playoff de acesso, o 3º permanece e o 4º joga um playoff contra o rebaixamento para a Liga C. Um empate basta para a Polônia garantir que não termina em último e permanece na Liga B.",
    "A Romênia, lanterna sem pontos, precisa vencer para seguir viva. Uma derrota em Bucareste confirma o 4º lugar e a ida ao playoff contra a queda. Na última rodada, a Romênia visita a Bósnia em Zenica, e a Polônia recebe a Suécia em Wrocław.",
  ],
  lineupNote: "Os técnicos não divulgaram a escalação. Os campinhos usam a base recente de cada seleção; na Polônia, Lewandowski volta ao time no lugar de Mateusz Żukowski. A lista oficial sai cerca de uma hora antes da bola rolar.",
  local: [
    "A arbitragem é do austríaco Sebastian Gishamer.",
    "A Arena Națională, em Bucareste, é o principal estádio da Romênia e recebeu jogos da Eurocopa de 2021.",
  ],
  faqCanal: "A partida tem transmissão do Disney+, no streaming, às 16h45 de Brasília.",
  faqExtra: [
    ["Lewandowski joga Romênia x Polônia?", "Sim. Robert Lewandowski cumpriu suspensão na rodada anterior e está liberado para enfrentar a Romênia."],
    ["Como está o Grupo 4 da Liga B da Liga das Nações?", "Antes da 5ª rodada: Suécia com 10 pontos, Bósnia e Herzegovina com 8, Polônia com 4 e Romênia sem pontos."],
  ],
  excerpt: "Romênia e Polônia se enfrentam às 16h45 deste sábado (14/11), em Bucareste, pela Liga das Nações. Veja onde assistir, desfalques e prováveis escalações.",
  metaDescription: "Saiba onde assistir a Romênia x Polônia neste sábado (14/11), às 16h45, em Bucareste, pela Liga das Nações. Transmissão do Disney+, escalações e tabela.",
};
export default (ctx) => watchPostV2(opts, ctx);
