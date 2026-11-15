// Islândia x Luxemburgo — Liga das Nações, Liga C · Grupo 4, 6ª rodada, segunda 16/11/2026 14h. Jogo 15537777.
// Autor: Lucas Lima (2). Canal: ESPN 4 e Disney+ (Goal "Futebol na TV" https://www.goal.com/br/listas/futebol-programacao-jogos-tv-aberta-fechada-onde-assistir-online-app/bltc0a7361374657315
//   + futebolplus https://futebolplus.pro/onde-assistir/islandia-x-luxemburgo-2026-11-16/).
// Árbitro: não divulgado em 2 fontes (omitido). Local: Laugardalsvöllur, Reykjavík (fotbolti.net, visir.is, mbl.is; a API grafa "Ice Rink Laugardalur").
// Desfalques Islândia (2 fontes: visir.is https://www.visir.is/g/20262963048d/thrir-teknir-inn-i-landslidshopinn
//   + fotbolti.net https://www.fotbolti.net/news/14-11-2026/thrir-kalladir-inn-i-landslidid, também mbl.is):
//   Stefán Teitur Þórðarson (coxa) e Kristall Máni Ingason (joelho) lesionados; Hörður Björgvin Magnússon suspenso (amarelos).
//   Convocados: Hjörtur Hermannsson, Brynjar Ingi Bjarnason, Sævar Atli Magnússon. Técnico: Arnar Gunnlaugsson.
// Swaps (PROJEÇÃO NOSSA): Stefán Teitur -> Aron Einar Gunnarsson (visir cita como opção de zaga); Kristall Máni -> Sævar Atli (chamado no lugar dele).
// Sem XI no snapshot: base = XI dos dois times na 5ª rodada (ls/), explicado no lineupNote.
// 5ª rodada: Bulgária 0x5 Islândia (Andri Lucas Guðjohnsen 17' pên., 68', 79'; Orri Steinn 21'; contra de Tsenov 52' — mbl.is, fotbolti.net, Yahoo);
//   Luxemburgo 0x1 Estônia (Paskotši — ERR, Postimees, L'essentiel). Técnico de Luxemburgo: Jeff Strasser (L'essentiel).
// Luxemburgo: nenhum desfalque confirmado por 2 fontes.
import { B, P } from "../lexical.mjs";
import { watchPostV2, SEG16 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: SEG16, matchId: 15537777, authorId: 2, A: "Islândia", Bn: "Luxemburgo", hora: "14h",
  canal: "ESPN 4 e Disney+", canalLongo: "ESPN 4 (TV fechada) e Disney+ (streaming)", canalCapaAlt: "na ESPN 4 e no Disney+",
  competicaoLinha: "Liga das Nações 2026/27, Liga C, Grupo 4, 6ª e última rodada",
  localCurto: "Laugardalsvöllur, em Reykjavík (Islândia)", ondeFrase: "no Laugardalsvöllur, em Reykjavík, na Islândia",
  lead: P("A ", B("Islândia"), " recebe ", B("Luxemburgo"), " nesta segunda-feira (16/11), às ", B("14h (de Brasília)"), ", em Reykjavík, a um empate do acesso à Liga B da ", B("Liga das Nações"), ". O jogo do Grupo 4 da Liga C tem transmissão da ", B("ESPN 4"), " e do ", B("Disney+"), "."),
  comoChegam: [
    "A Islândia de Arnar Gunnlaugsson tem o melhor ataque do grupo, com 12 gols, e divide com a Estônia a defesa menos vazada, com só 1 gol sofrido. Na sexta-feira (13), goleou a Bulgária por 5 a 0 em Plovdiv. Andri Lucas Guðjohnsen fez três gols, o primeiro de pênalti, no seu primeiro hat-trick pela seleção; Orri Steinn Óskarsson e um gol contra do zagueiro Emil Tsenov completaram o placar. A vitória teve custo: dois titulares saíram lesionados e um zagueiro está suspenso.",
    "Luxemburgo de Jeff Strasser perdeu para a Estônia por 1 a 0 em casa, também na sexta, e emendou a quarta derrota seguida na competição. O time venceu a Bulgária por 2 a 1 fora de casa na estreia e depois não marcou mais: são 2 gols em cinco jogos. No 1º turno, no Stade de Luxembourg, a Islândia venceu por 3 a 0.",
  ],
  cardTitulo: "Situação no Grupo 4 da Liga C", cardSub: "Antes da 6ª e última rodada",
  extraRows: [["Islândia", "sobe com vitória ou empate"], ["Estônia (vice)", "9 pontos, recebe a Bulgária no mesmo horário"]],
  tabelaTitulo: "Classificação do Grupo 4 da Liga C",
  emJogo: [
    "A Islândia depende só de si. Com vitória, chega a 14 pontos e garante o 1º lugar e o acesso direto à Liga B. O empate também deve bastar: se a Estônia vencer a Bulgária, em Tallinn, as duas terminam com 12 pontos, o confronto direto fica igual (1 a 1 e 0 a 0) e o saldo geral decide. Hoje, a Islândia tem +11 e a Estônia, +2. Só uma derrota islandesa, somada a uma vitória estoniana, tira o título de Reykjavík.",
    "Os dois primeiros já estão definidos, porque a Bulgária chega no máximo a 7 pontos; quem terminar em 2º vai ao play-off contra um 4º colocado da Liga B, em março. Luxemburgo não cai: com a mudança de formato a partir de 2028/29, o 3º e o 4º da Liga C continuam na Liga C. Para terminar em 3º, os luxemburgueses precisam vencer e torcer para a Bulgária não ganhar da Estônia.",
  ],
  desfalques: [
    P(B("Islândia: "), "Stefán Teitur Þórðarson (lesão na coxa), que vinha jogando na zaga, e o meia Kristall Máni Ingason (pancada no joelho) se machucaram em Plovdiv e estão fora. O zagueiro Hörður Björgvin Magnússon, que entrou no lugar de Stefán Teitur, levou o segundo amarelo e cumpre suspensão. Gunnlaugsson chamou os zagueiros Hjörtur Hermannsson e Brynjar Ingi Bjarnason e o atacante Sævar Atli Magnússon."),
  ],
  lineupNote: "Os técnicos ainda não divulgaram os titulares. Os campinhos partem da escalação que cada seleção usou na 5ª rodada, na sexta-feira (13). Na Islândia, trocamos os dois lesionados: Aron Einar Gunnarsson entra na zaga e Sævar Atli Magnússon, chamado no lugar de Kristall Máni, no meio; é uma projeção nossa. A lista oficial costuma sair cerca de uma hora antes da bola rolar.",
  labelAway: "Último jogo",
  swapHome: [
    ["Stefán Teitur Þórðarson", { name: "Aron Einar Gunnarsson", number: "", id: "" }],
    ["Kristall Máni Ingason", { name: "Sævar Atli Magnússon", number: "", id: "" }],
  ],
  local: [
    "O Laugardalsvöllur, no vale de Laugardalur, em Reykjavík, é o estádio nacional da Islândia. A partida começa às 17h no horário local, 14h em Brasília, e passa em TV aberta no país.",
  ],
  faqCanal: "A partida tem transmissão da ESPN 4, na TV fechada, e do Disney+, no streaming, às 14h de Brasília.",
  faqExtra: [
    ["O que a Islândia precisa para subir para a Liga B?", "Vencer garante o acesso. Um empate também deve bastar: mesmo com vitória da Estônia, a Islândia leva vantagem no saldo de gols geral (+11 contra +2). Só perde o 1º lugar se for derrotada e a Estônia vencer a Bulgária."],
    ["Quem está fora da Islândia contra Luxemburgo?", "Stefán Teitur Þórðarson e Kristall Máni Ingason, lesionados, e Hörður Björgvin Magnússon, suspenso."],
  ],
  excerpt: "A Islândia recebe Luxemburgo nesta segunda (16/11), às 14h, em Reykjavík, a um empate do acesso à Liga B. Veja onde assistir, desfalques e escalações.",
  metaDescription: "Saiba onde assistir a Islândia x Luxemburgo nesta segunda (16/11), às 14h, pela Liga das Nações. ESPN 4 e Disney+, desfalques e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
