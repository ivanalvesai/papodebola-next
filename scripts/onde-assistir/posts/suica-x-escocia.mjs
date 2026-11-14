// Suíça x Escócia — Liga das Nações, Liga B · Grupo 1, 6ª rodada, segunda 16/11/2026 16h45. Jogo 15534107.
// Autor: Lucas Lima (2). Canal: ESPN 4 + Disney+ = FONTE ÚNICA (grade do Goal Brasil,
//   https://www.goal.com/br/listas/futebol-programacao-jogos-tv-aberta-fechada-onde-assistir-online-app/bltc0a7361374657315)
//   → canalConfirmado:false. Árbitro: não divulgado (omitido).
// Regulamento (UEFA, https://www.uefa.com/uefanationsleague/news/0298-1d6ef1acfaef-b54fcf1da859-1000--2026-27-uefa-nations-league-all-you-need-to-know):
//   Liga B: 1º sobe; 2º vai ao play-off contra 3º/4º da Liga A (março/2027); 3º fica; 4º vai ao play-off B/C.
// Estádio: Berit Sitterstadion, St. Gallen (ex-Kybunpark; nome escolhido por votação de torcedores) — Wikipedia B1,
//   Sports Mole, blick.ch/srf.ch (troca de nome).
// Desfalque: Dan Ndoye deixou a seleção (controle de carga, acordo com o Nottingham Forest) — bluewin.ch e radiocentral.ch (sda,
//   comunicado da federação suíça). Swap Ndoye -> Ruben Vargas (convocado, SRF). Técnico da Escócia: Sébastien Pocognoli
//   (Sky Sports + Sports Mole). McGinn 2 gols x Macedônia (Sky + Scotsman). Robertson igualou Dalglish com 102 jogos (Sky + Scotsman).
// Fora: Xhaka (relato de lesão na panturrilha só na NZZ, conflitante) e Manzambi (status conflitante) — não entram.
import { B, P } from "../lexical.mjs";
import { watchPostV2, SEG16 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: SEG16, matchId: 15534107, authorId: 2, A: "Suíça", Bn: "Escócia", hora: "16h45",
  canal: "ESPN 4 e Disney+", canalConfirmado: false, canalLongo: "ESPN 4 (TV fechada) e Disney+ (streaming), segundo a programação; confirme perto do jogo", canalCapaAlt: "na ESPN 4 e no Disney+",
  competicaoLinha: "Liga das Nações 2026/27, Liga B, Grupo 1, 6ª e última rodada",
  localCurto: "Berit Sitterstadion, em St. Gallen (Suíça)", ondeFrase: "no Berit Sitterstadion, em St. Gallen, na Suíça",
  swapHome: [["Dan Ndoye", { name: "Ruben Vargas", number: "", id: "" }]],
  lead: P("Já campeã do grupo, a ", B("Suíça"), " recebe a ", B("Escócia"), " nesta segunda-feira (16/11), às ", B("16h45 (de Brasília)"), ", em St. Gallen, na última rodada do Grupo 1 da Liga B da ", B("Liga das Nações"), ". Os escoceses precisam vencer para sonhar com o play-off de acesso. A programação indica transmissão da ", B("ESPN 4"), " e do ", B("Disney+"), "."),
  comoChegam: [
    "A Suíça de Murat Yakin garantiu o 1º lugar e a volta à Liga A com o 0 a 0 contra a Eslovênia, em Maribor, na sexta-feira (13). Foi o primeiro jogo da campanha sem gols suíços, mas a defesa segue quase intocada: 1 gol sofrido em cinco partidas, no 2 a 1 sobre os eslovenos em casa. O atacante Dan Ndoye, do Nottingham Forest, deixou a concentração depois do jogo, num acordo de controle de carga com o clube, e não enfrenta a Escócia.",
    "A Escócia do belga Sébastien Pocognoli venceu a Macedônia do Norte por 2 a 1 no Hampden Park, também na sexta, com dois gols de John McGinn, o segundo de pênalti após revisão do VAR. Foi a primeira vitória de Pocognoli em casa. O capitão Andy Robertson chegou a 102 jogos pela seleção e igualou o recorde de Kenny Dalglish; se entrar em campo em St. Gallen, vira o jogador com mais partidas pela Escócia.",
  ],
  cardTitulo: "Situação no Grupo 1 da Liga B", cardSub: "Antes da 6ª e última rodada",
  extraRows: [["Suíça", "1º lugar e acesso à Liga A garantidos"], ["Escócia", "precisa vencer e torcer contra a Eslovênia"]],
  tabelaTitulo: "Classificação do Grupo 1 da Liga B",
  emJogo: [
    "Pelo regulamento desta edição, o 2º colocado da Liga B disputa em março um play-off de ida e volta contra uma seleção da Liga A, valendo vaga na primeira divisão, e o 3º permanece na Liga B. A Eslovênia tem 8 pontos e a Escócia, 7. Os escoceses só ficam com o 2º lugar se vencerem a Suíça e a Eslovênia não vencer a Macedônia do Norte, em Skopje, no mesmo horário. Um empate escocês não basta: em igualdade de pontos, a Eslovênia leva vantagem no confronto direto (0 a 0 e 2 a 1 em Glasgow).",
    "A Escócia já não corre risco de cair para o 4º lugar, porque a Macedônia do Norte chega no máximo a 3 pontos. Para a Suíça, resta fechar a campanha invicta. No 1º turno, em Glasgow, os suíços venceram por 3 a 0.",
  ],
  desfalques: [
    P(B("Suíça: "), "Dan Ndoye foi liberado e volta ao Nottingham Forest. Ruben Vargas, do Sevilla, é o candidato natural à vaga pelo lado do campo."),
  ],
  local: [
    "O jogo é no estádio do St. Gallen, que até a temporada passada se chamava Kybunpark. O nome novo, Berit Sitterstadion, saiu de uma votação entre os torcedores e faz referência ao rio Sitter, que corre perto do estádio, aberto em 2008. A bola rola às 20h45 no horário local.",
  ],
  faqCanal: "A programação indica transmissão da ESPN 4, na TV fechada, e do Disney+, no streaming, às 16h45 de Brasília. Como só um guia confirmou o canal até agora, vale conferir perto do jogo.",
  faqExtra: [
    ["O que a Escócia precisa para ir ao play-off de acesso?", "Vencer a Suíça e torcer para a Eslovênia não vencer a Macedônia do Norte. Se terminar em 2º, a Escócia disputa em março um play-off contra uma seleção da Liga A; em 3º, continua na Liga B."],
    ["A Suíça já subiu para a Liga A?", "Sim. Com 13 pontos, a Suíça garantiu o 1º lugar do Grupo 1 da Liga B e o acesso direto à Liga A após o 0 a 0 com a Eslovênia."],
  ],
  excerpt: "Já classificada, a Suíça recebe a Escócia nesta segunda (16/11), às 16h45, em St. Gallen, pela Liga das Nações. Veja onde assistir e as escalações.",
  metaDescription: "Saiba onde assistir a Suíça x Escócia nesta segunda (16/11), às 16h45, em St. Gallen, pela Liga das Nações. Canal, cenários e prováveis escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
