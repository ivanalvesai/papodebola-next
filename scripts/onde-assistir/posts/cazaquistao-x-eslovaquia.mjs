// Cazaquistão x Eslováquia — Liga das Nações, Liga C · Grupo 3, 6ª rodada, segunda 16/11/2026 12h. Jogo 15534188.
// Autor: Lucas Lima (2). Canal: ESPN 4 e Disney+ (Goal "Futebol na TV" https://www.goal.com/br/listas/futebol-programacao-jogos-tv-aberta-fechada-onde-assistir-online-app/bltc0a7361374657315
//   + futebolplus https://futebolplus.pro/onde-assistir/cazaquistao-x-eslovaquia-2026-11-16/).
// Árbitro: não divulgado em 2 fontes (omitido). Local: Astana Arena (snapshot da API).
// Desfalques Eslováquia (2 fontes: teraz.sk https://www.teraz.sk/sport/slovaci-pocestuju-do-kazachstanu-bez-s/1007605-clanok.html
//   + sportnet https://sportnet.sme.sk/spravy/futbal-slovensko-kazachstan-vynechanie-skriniar-hancko-greif-liga-narodov-2026-2027/, também dennikn):
//   Škriniar, Hancko, Greif, Duda, Bero e Rusnák poupados; Valjent suspenso (2º amarelo). Suslov lesionado. Haraslín optou por viajar (hetrik.sk).
// Swaps: os 5 titulares ausentes trocados por nomes da convocação (denniksport.sk) — PROJEÇÃO NOSSA, Weiss não anunciou o time.
// 5ª rodada: Moldávia 2x1 Cazaquistão (Chesnokov 51' — news.ro, tvn.md); Eslováquia 2x2 Faroé (Prekop, Haraslín — sportnet, sita, hetrik).
import { B, P } from "../lexical.mjs";
import { watchPostV2, SEG16 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: SEG16, matchId: 15534188, authorId: 2, A: "Cazaquistão", Bn: "Eslováquia", hora: "12h",
  canal: "ESPN 4 e Disney+", canalLongo: "ESPN 4 (TV fechada) e Disney+ (streaming)", canalCapaAlt: "na ESPN 4 e no Disney+",
  competicaoLinha: "Liga das Nações 2026/27, Liga C, Grupo 3, 6ª e última rodada",
  localCurto: "Astana Arena, em Astana (Cazaquistão)", ondeFrase: "na Astana Arena, em Astana, no Cazaquistão",
  lead: P("Já campeã do grupo, a ", B("Eslováquia"), " visita o ", B("Cazaquistão"), " nesta segunda-feira (16/11), às ", B("12h (de Brasília)"), ", em Astana, na última rodada do Grupo 3 da Liga C da ", B("Liga das Nações"), ". O jogo tem transmissão da ", B("ESPN 4"), " e do ", B("Disney+"), "."),
  comoChegam: [
    "O Cazaquistão chega à última rodada sem ter vencido nesta edição. Foram dois empates com as Ilhas Faroé (1 a 1 e 2 a 2) e três derrotas, a mais recente por 2 a 1 para a Moldávia, em Chisinau, na sexta-feira (13), com gol de Islam Chesnokov no começo do 2º tempo. Com 2 pontos, é o lanterna do grupo.",
    "A Eslováquia de Vladimír Weiss garantiu o acesso à Liga B com o 2 a 2 diante das Ilhas Faroé, em Košice, também na sexta. Erik Prekop abriu o placar de cabeça e Lukáš Haraslín empatou no 2º tempo. Invicto, com 11 pontos, o time fecha a fase de grupos sem pressão. No 1º turno, em Košice, venceu o Cazaquistão por 2 a 1.",
  ],
  cardTitulo: "Situação no Grupo 3 da Liga C", cardSub: "Antes da 6ª e última rodada",
  extraRows: [["Eslováquia", "1º lugar e acesso à Liga B garantidos"], ["Briga pelo 2º lugar", "Moldávia (7) x Ilhas Faroé (5), no mesmo horário"]],
  tabelaTitulo: "Classificação do Grupo 3 da Liga C",
  emJogo: [
    "Na tabela, quase nada muda em Astana. A Eslováquia termina em 1º de qualquer jeito: a Moldávia, vice, chega no máximo a 10 pontos. A vaga no play-off é decidida no outro jogo, no mesmo horário, entre Ilhas Faroé e Moldávia, em Tórshavn.",
    "Para o Cazaquistão, sobra a chance da primeira vitória. Mesmo vencendo, só sai da lanterna se as Ilhas Faroé perderem para a Moldávia; nesse caso, as duas seleções empatariam em 5 pontos e o saldo de gols decidiria o 3º lugar. Na prática, a posição pesa pouco: com a mudança de formato a partir de 2028/29, o 3º e o 4º da Liga C continuam na Liga C.",
  ],
  desfalques: [
    P(B("Eslováquia: "), "com o acesso garantido, Weiss liberou o capitão Milan Škriniar, Dávid Hancko, o goleiro Dominik Greif e os meias Ondrej Duda, Matúš Bero e Albert Rusnák, que não viajaram ao Cazaquistão. O zagueiro Martin Valjent cumpre suspensão pelo segundo cartão amarelo, e Tomáš Suslov segue lesionado. Haraslín, que poderia ter sido liberado, preferiu viajar com o grupo."),
  ],
  lineupNote: "Os técnicos ainda não divulgaram os titulares. O campinho do Cazaquistão mostra a escalação provável do snapshot da partida. O da Eslováquia parte do time-base da campanha, com os seis titulares que ficaram fora trocados por jogadores da convocação; é uma projeção nossa, já que Weiss deve fazer várias mudanças. A lista oficial costuma sair cerca de uma hora antes da bola rolar.",
  swapAway: [
    ["Dominik Greif", { name: "Marek Rodák", number: "", id: "" }],
    ["Martin Valjent", { name: "Ivan Mesík", number: "", id: "" }],
    ["Milan Škriniar", { name: "Dávid Krčík", number: "", id: "" }],
    ["Dávid Hancko", { name: "Adam Obert", number: "", id: "" }],
    ["Ondrej Duda", { name: "Tomáš Rigo", number: "", id: "" }],
    ["Albert Rusnák", { name: "Mario Sauer", number: "", id: "" }],
  ],
  local: [
    "A Astana Arena, na capital do Cazaquistão, tem teto retrátil, o que protege o jogo do frio do inverno na estepe. A partida começa às 20h no horário local, 12h em Brasília.",
  ],
  faqCanal: "A partida tem transmissão da ESPN 4, na TV fechada, e do Disney+, no streaming, às 12h de Brasília.",
  faqExtra: [
    ["A Eslováquia já subiu para a Liga B da Liga das Nações?", "Sim. O empate por 2 a 2 com as Ilhas Faroé, na 5ª rodada, garantiu o 1º lugar do Grupo 3 da Liga C e o acesso direto à Liga B."],
    ["Škriniar joga Cazaquistão x Eslováquia?", "Não. Com o acesso garantido, Milan Škriniar foi liberado e não viajou, assim como Hancko, Greif, Duda, Bero e Rusnák. Valjent está suspenso."],
  ],
  excerpt: "Já classificada, a Eslováquia visita o Cazaquistão nesta segunda (16/11), às 12h, em Astana, com time reserva. Veja onde assistir e as prováveis escalações.",
  metaDescription: "Saiba onde assistir a Cazaquistão x Eslováquia nesta segunda (16/11), às 12h, pela Liga das Nações. ESPN 4 e Disney+, desfalques e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
