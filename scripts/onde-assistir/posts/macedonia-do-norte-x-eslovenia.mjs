// Macedônia do Norte x Eslovênia — Liga das Nações, Liga B · Grupo 1, 6ª rodada, segunda 16/11/2026 16h45. Jogo 15534117.
// Autor: Ivan Alves (1). Canal: Disney+ = FONTE ÚNICA (grade do Goal Brasil,
//   https://www.goal.com/br/listas/futebol-programacao-jogos-tv-aberta-fechada-onde-assistir-online-app/bltc0a7361374657315)
//   → canalConfirmado:false. Árbitro: não divulgado (omitido).
// Regulamento (UEFA, https://www.uefa.com/uefanationsleague/news/0298-1d6ef1acfaef-b54fcf1da859-1000--2026-27-uefa-nations-league-all-you-need-to-know):
//   Liga B: 1º sobe; 2º play-off A/B; 3º fica; 4º play-off B/C contra um 2º da Liga C (março/2027). Coerente com suica-x-escocia.mjs.
// Estádio: Arena Nacional Toše Proeski, Skopje (Wikipedia B1, sportski.mk/365.com.mk, Sports Mole). 20h45 local.
// Técnicos: Goce Sedloski (sportski.mk + 365.com.mk); Boštjan Cesar (rtvslo.si + nzs.si).
// Rastoder fez o 1º gol macedônio da campanha, em Glasgow (Sky Sports + ohridnews.com).
// NÃO entrou (fonte única): suspensão de Jaka Bijol pelo 2º amarelo (só rtvslo.si); lesão de Elšnik (só rtvslo.si).
//   Bijol não está no XI provável da API, então não há swap.
import { B, P } from "../lexical.mjs";
import { watchPostV2, SEG16 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: SEG16, matchId: 15534117, authorId: 1, A: "Macedônia do Norte", Bn: "Eslovênia", hora: "16h45",
  canal: "Disney+", canalConfirmado: false, canalLongo: "Disney+ (streaming), segundo a programação; confirme perto do jogo", canalCapaAlt: "no Disney+",
  competicaoLinha: "Liga das Nações 2026/27, Liga B, Grupo 1, 6ª e última rodada",
  localCurto: "Arena Nacional Toše Proeski, em Skopje (Macedônia do Norte)", ondeFrase: "na Arena Nacional Toše Proeski, em Skopje, na Macedônia do Norte",
  lead: P("A ", B("Eslovênia"), " visita a ", B("Macedônia do Norte"), " nesta segunda-feira (16/11), às ", B("16h45 (de Brasília)"), ", em Skopje, com o 2º lugar do Grupo 1 da Liga B da ", B("Liga das Nações"), " ao alcance: uma vitória garante a vaga no play-off de acesso. A programação indica transmissão do ", B("Disney+"), "."),
  comoChegam: [
    "A Macedônia do Norte de Goce Sedloski perdeu os cinco jogos e tem a pior campanha do grupo, com 1 gol marcado e 12 sofridos. O único gol saiu na sexta-feira (13), em Glasgow: Elmin Rastoder empatou de cabeça, após escanteio, mas a Escócia venceu por 2 a 1. O time já está matematicamente em 4º lugar.",
    "A Eslovênia de Boštjan Cesar segurou a Suíça no 0 a 0 em Maribor, também na sexta, e tirou dos suíços a chance de fechar a fase com 100% de aproveitamento. Com 8 pontos, a equipe soma duas vitórias, dois empates e só uma derrota, e sofreu 3 gols em cinco jogos. No 1º turno, em Ljubljana, venceu os macedônios por 2 a 0.",
  ],
  cardTitulo: "Situação no Grupo 1 da Liga B", cardSub: "Antes da 6ª e última rodada",
  extraRows: [["Escócia", "3º lugar, 7 pontos; visita a Suíça"], ["Play-off de acesso", "vaga do 2º colocado"]],
  tabelaTitulo: "Classificação do Grupo 1 da Liga B",
  emJogo: [
    "A Suíça já é campeã do grupo, e a disputa é pelo 2º lugar, que leva a um play-off de ida e volta contra uma seleção da Liga A, em março, por vaga na primeira divisão. Quem terminar em 3º continua na Liga B. Se vencer, a Eslovênia chega a 11 pontos e fica com a vaga, seja qual for o resultado na Suíça. Com empate ou derrota, só perde o 2º lugar se a Escócia vencer a Suíça em St. Gallen, no mesmo horário. Em caso de igualdade de pontos, os eslovenos levam a melhor no confronto direto.",
    "Para a Macedônia do Norte, o 4º lugar está definido e significa um play-off contra o rebaixamento, em março, diante de um 2º colocado da Liga C. Em Skopje, o objetivo é somar os primeiros pontos da campanha.",
  ],
  local: [
    "A Arena Nacional Toše Proeski é o maior estádio do país e leva o nome do cantor macedônio morto em 2007, aos 26 anos. A bola rola às 20h45 no horário local.",
  ],
  faqCanal: "A programação indica transmissão do Disney+, no streaming, às 16h45 de Brasília. Como só um guia confirmou o canal até agora, vale conferir perto do jogo.",
  faqExtra: [
    ["O que a Eslovênia precisa para terminar em 2º no grupo?", "Uma vitória garante o 2º lugar. Com empate ou derrota, a Eslovênia só perde a posição se a Escócia vencer a Suíça no mesmo horário."],
    ["A Macedônia do Norte foi rebaixada na Liga das Nações?", "Ainda não. O 4º lugar no Grupo 1 da Liga B leva a um play-off contra um 2º colocado da Liga C, em março de 2027, que define quem joga a Liga B na próxima edição."],
  ],
  excerpt: "A Eslovênia visita a Macedônia do Norte nesta segunda (16/11), às 16h45, em Skopje, e vence para ir ao play-off. Veja onde assistir e as escalações.",
  metaDescription: "Saiba onde assistir a Macedônia do Norte x Eslovênia nesta segunda (16/11), às 16h45, em Skopje, pela Liga das Nações. Canal, cenários e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
