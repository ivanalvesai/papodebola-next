// Estônia x Bulgária — Liga das Nações, Liga C · Grupo 4, 6ª rodada, segunda 16/11/2026 14h. Jogo 15534237.
// Autor: Ivan Alves (1). Canal: SporTV 2 (Goal "Futebol na TV" https://www.goal.com/br/listas/futebol-programacao-jogos-tv-aberta-fechada-onde-assistir-online-app/bltc0a7361374657315
//   + O Tempo https://www.otempo.com.br/opiniao/thiaggo-camilo/2026/11/14/tv-globo-sportv-e-ge-tv-transmitem-os-dois-ultimos-jogos-da-selecao-brasileira-neste-ano
//   + futebolplus https://futebolplus.pro/onde-assistir/estonia-x-bulgaria-2026-11-16/ (lista também Disney+ e SporTV; só o SporTV 2 bate nas 3).
// Árbitro: Nenad Minaković (Sérvia), VAR Momčilo Marković — taralej.bg, temasport.com, paragraf.bg (aviso da federação búlgara).
// Local: A. Le Coq Arena, Tallinn (snapshot da API + taralej/paragraf).
// 5ª rodada: Luxemburgo 0x1 Estônia (Paskotši 42'/43' — ERR https://sport.err.ee/1610195209/..., Postimees, sekundomer.ee, L'essentiel);
//   Bulgária 0x5 Islândia (mbl.is, fotbolti.net, Yahoo).
// Técnico da Estônia: Jürgen Henn (Postimees). Desfalques: nenhum confirmado por 2 fontes.
import { B, P } from "../lexical.mjs";
import { watchPostV2, SEG16 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: SEG16, matchId: 15534237, authorId: 1, A: "Estônia", Bn: "Bulgária", hora: "14h",
  canal: "SporTV 2", canalLongo: "SporTV 2 (TV fechada)", canalCapaAlt: "no SporTV 2",
  competicaoLinha: "Liga das Nações 2026/27, Liga C, Grupo 4, 6ª e última rodada",
  localCurto: "A. Le Coq Arena, em Tallinn (Estônia)", ondeFrase: "na A. Le Coq Arena, em Tallinn, na Estônia",
  arbitro: "Nenad Minaković (Sérvia); VAR: Momčilo Marković",
  lead: P("Com o play-off garantido e uma chance remota de título, a ", B("Estônia"), " recebe a ", B("Bulgária"), " nesta segunda-feira (16/11), às ", B("14h (de Brasília)"), ", em Tallinn, pela última rodada do Grupo 4 da Liga C da ", B("Liga das Nações"), ". O jogo tem transmissão do ", B("SporTV 2"), "."),
  comoChegam: [
    "A Estônia de Jürgen Henn ainda não perdeu nesta Liga das Nações: são duas vitórias e três empates, com só 1 gol sofrido em cinco jogos. Na sexta-feira (13), venceu Luxemburgo por 1 a 0 fora de casa. O zagueiro Maksim Paskotši tabelou com Rocco Robert Shein e bateu rasteiro da entrada da área, pouco antes do intervalo. Foi o segundo gol dele na campanha; o primeiro valeu o 1 a 1 com a Islândia, em Reykjavík.",
    "A Bulgária vive o pior momento do grupo. Levou 5 a 0 da Islândia em Plovdiv, na sexta, com três gols de Andri Lucas Guðjohnsen, e soma três derrotas em cinco jogos, com 10 gols sofridos. A única vitória foi o 2 a 0 sobre Luxemburgo, fora de casa, na 4ª rodada. No 1º turno, búlgaros e estonianos empataram sem gols.",
  ],
  cardTitulo: "Situação no Grupo 4 da Liga C", cardSub: "Antes da 6ª e última rodada",
  extraRows: [["Estônia", "pelo menos o 2º lugar (play-off) garantido"], ["Islândia (líder)", "11 pontos, recebe Luxemburgo no mesmo horário"]],
  tabelaTitulo: "Classificação do Grupo 4 da Liga C",
  emJogo: [
    "A Estônia já não sai do 2º lugar, porque a Bulgária chega no máximo a 7 pontos, e tem vaga no play-off contra um 4º colocado da Liga B, em março. Para ficar com o 1º lugar e o acesso direto, precisa vencer e torcer por uma derrota da Islândia para Luxemburgo, em Reykjavík, no mesmo horário: aí terminaria com 12 pontos, contra 11 dos islandeses.",
    "Se a Islândia empatar e a Estônia vencer, as duas ficam com 12 pontos. O confronto direto não separa ninguém (1 a 1 e 0 a 0), e o critério seguinte é o saldo de gols geral, em que a Islândia tem hoje +11 e a Estônia, +2: os estonianos precisariam de uma goleada histórica para tirar a diferença. A Bulgária não tem mais nada em jogo além do orgulho: com a mudança de formato a partir de 2028/29, o 3º e o 4º colocados da Liga C continuam na Liga C.",
  ],
  local: [
    "A arbitragem é do sérvio Nenad Minaković, com Nikola Borović e Boško Božović como assistentes e Momčilo Marković no VAR.",
    "A A. Le Coq Arena, no bairro de Lilleküla, é a casa da seleção estoniana e do Flora Tallinn. A bola rola às 19h no horário local, 14h em Brasília.",
  ],
  faqCanal: "A partida tem transmissão do SporTV 2, na TV fechada, às 14h de Brasília.",
  faqExtra: [
    ["A Estônia ainda pode terminar em 1º no Grupo 4 da Liga C?", "Pode, mas depende da Islândia. A Estônia precisa vencer a Bulgária e torcer para a Islândia perder para Luxemburgo. Com empate islandês, o saldo de gols geral decide, e a Islândia leva vantagem de 9 gols."],
    ["Quem apita Estônia x Bulgária?", "O sérvio Nenad Minaković, com Momčilo Marković no VAR."],
  ],
  excerpt: "Já no play-off, a Estônia recebe a Bulgária nesta segunda (16/11), às 14h, em Tallinn, e ainda sonha com o 1º lugar. Veja onde assistir e as escalações.",
  metaDescription: "Saiba onde assistir a Estônia x Bulgária nesta segunda (16/11), às 14h, em Tallinn, pela Liga das Nações. Transmissão do SporTV 2 e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
