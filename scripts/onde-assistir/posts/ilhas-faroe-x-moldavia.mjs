// Ilhas Faroé x Moldávia — Liga das Nações, Liga C · Grupo 3, 6ª rodada, segunda 16/11/2026 12h. Jogo 15534196.
// Autor: Ivan Alves (1). Canal: SporTV 2 (Goal "Futebol na TV" https://www.goal.com/br/listas/futebol-programacao-jogos-tv-aberta-fechada-onde-assistir-online-app/bltc0a7361374657315
//   + O Tempo https://www.otempo.com.br/opiniao/thiaggo-camilo/2026/11/14/tv-globo-sportv-e-ge-tv-transmitem-os-dois-ultimos-jogos-da-selecao-brasileira-neste-ano).
// Árbitro: não divulgado em 2 fontes (omitido). Local: Tórsvøllur, Tórshavn (snapshot da API + starting11).
// 5ª rodada: Eslováquia 2x2 Faroé (Prekop 17', pênalti faroense 30', 2º gol faroense 47', Haraslín 74' — sportnet.sme.sk, sita.sk, hetrik.sk;
//   autor do pênalti e do 2º gol divergem entre as fontes, por isso o texto não nomeia).
//   Moldávia 2x1 Cazaquistão (Petru Popescu 39' e 77', Chesnokov 51' — news.ro, tvn.md, ipn.md).
// Técnicos: Eyðun Klakstein (Faroé) e Lilian Popescu (Moldávia) — sportnet (legenda), statz.ai.
// Desfalques: nenhum confirmado por 2 fontes. Faroé levou amarelos de Knudsen, Danielsen e Edmundsson na sexta; suspensão não confirmada.
import { B, P } from "../lexical.mjs";
import { watchPostV2, SEG16 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: SEG16, matchId: 15534196, authorId: 1, A: "Ilhas Faroé", Bn: "Moldávia", hora: "12h",
  canal: "SporTV 2", canalLongo: "SporTV 2 (TV fechada)", canalCapaAlt: "no SporTV 2",
  competicaoLinha: "Liga das Nações 2026/27, Liga C, Grupo 3, 6ª e última rodada",
  localCurto: "Tórsvøllur, em Tórshavn (Ilhas Faroé)", ondeFrase: "no Tórsvøllur, em Tórshavn, nas Ilhas Faroé",
  lead: P("A vaga no play-off de acesso à Liga B se decide em confronto direto: ", B("Ilhas Faroé"), " e ", B("Moldávia"), " jogam nesta segunda-feira (16/11), às ", B("12h (de Brasília)"), ", em Tórshavn, pela última rodada do Grupo 3 da Liga C da ", B("Liga das Nações"), ". A transmissão é do ", B("SporTV 2"), "."),
  comoChegam: [
    "As Ilhas Faroé do técnico Eyðun Klakstein fizeram uma campanha curiosa: cinco jogos, cinco empates. O último foi o mais vistoso, um 2 a 2 com a líder Eslováquia em Košice, na sexta-feira (13). O time saiu atrás com gol de cabeça de Erik Prekop, empatou de pênalti ainda no 1º tempo, virou logo no começo do 2º e só cedeu o empate aos 29 do 2º tempo, com Lukáš Haraslín. O ponto não bastou para passar a Moldávia na tabela.",
    "A Moldávia de Lilian Popescu venceu o Cazaquistão por 2 a 1 em Chisinau, no mesmo dia, e subiu para o 2º lugar, com 7 pontos. O atacante Petru Popescu marcou os dois gols, aos 39 do 1º tempo e aos 32 do 2º; ele já tinha balançado a rede na vitória por 2 a 1 em Astana, na 3ª rodada. As duas derrotas moldavas na campanha foram para a Eslováquia, por 2 a 0 e 4 a 0, e explicam o saldo de -4.",
  ],
  cardTitulo: "Situação no Grupo 3 da Liga C", cardSub: "Antes da 6ª e última rodada",
  extraRows: [["Eslováquia", "1º lugar e acesso já garantidos"], ["Vaga no play-off (2º)", "Moldávia com empate; Faroé só vencendo"]],
  tabelaTitulo: "Classificação do Grupo 3 da Liga C",
  emJogo: [
    "A conta é simples. A Moldávia tem 7 pontos e as Ilhas Faroé, 5. Um empate mantém os moldavos em 2º, porque os faroenses chegariam a 6. Só a vitória serve às Ilhas Faroé: com 8 pontos, passariam a Moldávia e ficariam com a vaga no play-off contra um 4º colocado da Liga B, em março. O 1º lugar já é da Eslováquia, que joga no mesmo horário em Astana, contra o Cazaquistão, e não interfere na disputa.",
    "Quem perder não cai: com a mudança de formato a partir de 2028/29, o 3º e o 4º colocados da Liga C continuam na Liga C. No 1º turno, em Chisinau, as duas seleções empataram por 1 a 1. Para as Ilhas Faroé, que ainda não venceram nesta edição, a primeira vitória teria o peso de uma vaga.",
  ],
  local: [
    "O Tórsvøllur, em Tórshavn, a capital do arquipélago, é a casa da seleção faroense e foi onde o time arrancou o 1 a 1 com a Eslováquia, na 3ª rodada. A bola rola às 15h no horário local, 12h em Brasília.",
  ],
  faqCanal: "A partida tem transmissão do SporTV 2, na TV fechada, às 12h de Brasília.",
  faqExtra: [
    ["O que as Ilhas Faroé precisam para ir ao play-off da Liga das Nações?", "Precisam vencer a Moldávia. Com a vitória, chegam a 8 pontos e passam os moldavos, que têm 7. Empate ou derrota deixa a vaga com a Moldávia."],
    ["Quem vence o play-off sobe para a Liga B?", "Sim. O 2º colocado do Grupo 3 da Liga C enfrenta um 4º colocado da Liga B em março, em jogos de ida e volta, valendo vaga na Liga B."],
  ],
  excerpt: "Ilhas Faroé e Moldávia decidem a vaga no play-off da Liga C nesta segunda (16/11), às 12h, em Tórshavn. Veja onde assistir e as prováveis escalações.",
  metaDescription: "Saiba onde assistir a Ilhas Faroé x Moldávia nesta segunda (16/11), às 12h, pela Liga das Nações. Transmissão do SporTV 2, cenários e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
