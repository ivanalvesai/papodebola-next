// Belarus x Albânia — Liga das Nações, Liga C · Grupo 1, 6ª rodada, domingo 15/11/2026 14h. Jogo 15534145.
// Autor: Ivan Alves (1). ESPN e Disney+ (futebolnatv + futebolplus). Árbitro: Igor Pajač (fonte única). Campo neutro em Budapeste.
// XI provável: Ramadani (suspensão citada só pelo Sports Mole) sai; entra Hasa, como no XI do Sports Mole.
import { B, P } from "../lexical.mjs";
import { watchPostV2, DOM15 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: DOM15, matchId: 15534145, authorId: 1, A: "Belarus", Bn: "Albânia", hora: "14h",
  canal: "ESPN e Disney+", canalLongo: "ESPN (TV fechada) e Disney+ (streaming)", canalCapaAlt: "na ESPN e no Disney+",
  competicaoLinha: "Liga das Nações 2026/27, Liga C, Grupo 1, 6ª e última rodada",
  localCurto: "Estádio Illovszky Rudolf, em Budapeste (Hungria), campo neutro", ondeFrase: "no Estádio Illovszky Rudolf, em Budapeste, na Hungria, em campo neutro",
  arbitro: "Igor Pajač (Croácia)",
  swapAway: [["Ylber Ramadani", { name: "Luis Hasa", number: "", id: "" }]],
  lead: P("Vale o acesso à Liga B. ", B("Belarus"), " e ", B("Albânia"), " decidem o Grupo 1 da Liga C neste domingo (15/11), às ", B("14h (de Brasília)"), ", em Budapeste, pela última rodada da ", B("Liga das Nações"), ". A Albânia sobe com um empate; Belarus precisa vencer. A transmissão é da ", B("ESPN"), " e do ", B("Disney+"), "."),
  comoChegam: [
    "Belarus manda os jogos na Hungria por causa da proibição da UEFA a partidas no país. O time de Viktor Goncharenko, no cargo desde janeiro, venceu San Marino por 2 a 0 fora de casa na quinta-feira (12), com gols de Kirill Gomanov e Artem Kontsevoy logo no início, e chega com três vitórias seguidas. Tem a melhor defesa do grupo, com só 2 gols sofridos, ambos justamente na derrota para a Albânia na estreia. Kontsevoy é o artilheiro, com 3 gols.",
    "A Albânia de Rolando Maran passou pela Finlândia por 2 a 0 em Tirana, com gols de Ernest Muçi e Rei Manaj, e soma quatro vitórias em cinco jogos, depois de chegar a esta Liga das Nações com cinco derrotas seguidas. Kristjan Asllani e Manaj dividem a artilharia da campanha, com 3 gols cada. Manaj chegou a 14 gols em 50 jogos pela seleção.",
  ],
  cardTitulo: "Situação no Grupo 1 da Liga C", cardSub: "Antes da 6ª e última rodada",
  extraRows: [["Acesso direto à Liga B", "1º colocado"], ["Play-off de acesso (março)", "2º colocado"], ["Albânia", "sobe com vitória ou empate"], ["Belarus", "sobe só se vencer"]],
  tabelaTitulo: "Classificação do Grupo 1 da Liga C",
  emJogo: [
    "A conta é simples. A Albânia tem 12 pontos e garante o 1º lugar e a vaga direta na Liga B com uma vitória ou um empate. Belarus tem 10 e só sobe se vencer, porque chegaria a 13. Quem ficar em 2º vai ao play-off de março contra um 4º colocado da Liga B.",
    "Belarus já tem pelo menos o 2º lugar assegurado: mesmo que perca e a Finlândia vença San Marino, as duas ficariam com 10 pontos, e os bielorrussos levam a melhor no confronto direto (0 a 0 em Helsinque e 1 a 0 em Budapeste). No 1º turno, em Tirana, a Albânia ganhou por 2 a 0, com gols de Asllani, de pênalti, e Muçi.",
  ],
  desfalques: [
    P(B("Belarus: "), "o volante Aleksandr Svirepa recebeu o segundo amarelo nos acréscimos contra San Marino e foi expulso, por isso cumpre suspensão."),
  ],
  local: [
    "O árbitro é o croata Igor Pajač. A partida começa às 18h em Budapeste, 14h em Brasília.",
    "O Estádio Illovszky Rudolf, casa do Vasas, virou a sede de Belarus nesta campanha. Lá, os bielorrussos venceram a Finlândia por 1 a 0, com gol no primeiro minuto, e golearam San Marino por 4 a 0.",
  ],
  faqCanal: "A partida tem transmissão da ESPN, na TV fechada, e do Disney+, no streaming, às 14h de Brasília.",
  faqExtra: [
    ["Do que a Albânia precisa para subir para a Liga B?", "De uma vitória ou de um empate contra Belarus. Com 12 pontos, a Albânia termina em 1º no Grupo 1 da Liga C se não perder."],
    ["Por que Belarus joga em Budapeste?", "A UEFA proíbe jogos internacionais em território bielorrusso, e a seleção manda as partidas em campo neutro, no Estádio Illovszky Rudolf, na Hungria."],
  ],
  excerpt: "Belarus e Albânia decidem o acesso à Liga B neste domingo (15/11), às 14h, em Budapeste. Veja onde assistir, o que cada um precisa e as escalações.",
  metaDescription: "Saiba onde assistir a Belarus x Albânia neste domingo (15/11), às 14h, pela Liga das Nações. ESPN e Disney+, o que vale o jogo e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
