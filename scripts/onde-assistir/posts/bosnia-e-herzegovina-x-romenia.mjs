// Bósnia e Herzegovina x Romênia — Liga das Nações, Liga B · Grupo 4, 6ª e última rodada, terça 17/11/2026 16h45. Jogo 15534173.
// Autor: Ivan Alves (1). Canal: Disney+ = FONTE ÚNICA (grade do Goal Brasil, terça 17/11:
//   https://www.goal.com/br/listas/futebol-programacao-jogos-tv-aberta-fechada-onde-assistir-online-app/bltc0a7361374657315)
//   → canalConfirmado:false + ressalva. Mantos do Futebol/futebolnatv ainda sem a grade de terça em 15/11.
// Árbitro: José María Sánchez Martínez (Espanha) só na Wikipedia → omitido.
// Cenários: UEFA, "Nations League: latest on quarter-final qualification" (Bósnia no play-off A/B; Romênia vai ao play-off B/C se não
//   vencer a Bósnia ou se a Polônia vencer a Suécia):
//   https://www.uefa.com/uefanationsleague/news/02ab-2209792f2fda-6a523d4500bb-1000--nations-league-latest-on-quarter-final-qualification-prom/
//   Formato (2º da Liga B x 3º/4º da Liga A; 4º da Liga B x 2º da Liga C, em março): UEFA "all you need to know".
// Gols do sábado (14): API (lance a lance do snapshot) + Wikipedia. Haris Tabaković saiu lesionado aos 39' em Solna (API, fonte única:
//   citado só como fato do jogo; sem swap).
// Bósnia na Copa 2026 (1x1 e pênaltis contra a Itália na repescagem): SABC Sport, particlenews/Reuters. Džeko fora (despedida em outubro,
//   guia suecia-x-bosnia de 14/11). Estádio: Bilino Polje, Zenica (API + Wikipedia).
import { B, P } from "../lexical.mjs";
import { watchPostV2, TER17 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: TER17, matchId: 15534173, authorId: 1, A: "Bósnia e Herzegovina", Bn: "Romênia", hora: "16h45",
  canal: "Disney+", canalConfirmado: false, canalLongo: "Disney+ (streaming), segundo a programação; confirme perto do jogo", canalCapaAlt: "no Disney+",
  competicaoLinha: "Liga das Nações 2026/27, Liga B, Grupo 4, 6ª e última rodada",
  localCurto: "Estádio Bilino Polje, em Zenica (Bósnia e Herzegovina)", ondeFrase: "no Estádio Bilino Polje, em Zenica, na Bósnia e Herzegovina",
  lineupNote: "Sergej Barbarez e Gheorghe Hagi não divulgaram a escalação. Os campinhos repetem os titulares do último jogo de cada seleção; na Bósnia, o atacante Haris Tabaković saiu machucado no sábado e pode não jogar. A lista oficial sai cerca de uma hora antes da bola rolar.",
  lead: P("Já garantida no play-off de acesso, a ", B("Bósnia e Herzegovina"), " recebe a ", B("Romênia"), " nesta terça-feira (17/11), às ", B("16h45 (de Brasília)"), ", em Zenica, na última rodada do Grupo 4 da Liga B da ", B("Liga das Nações"), ". Os romenos precisam vencer para escapar do play-off contra o rebaixamento. A programação indica transmissão do ", B("Disney+"), "."),
  comoChegam: [
    "A Bósnia de Sergej Barbarez perdeu para a Suécia por 3 a 2 em Solna, no sábado (14), e deu adeus à chance de subir direto. Saiu perdendo por 3 a 0 no intervalo, com dois pênaltis de Viktor Gyökeres, e reagiu no segundo tempo com Armin Gigović e Sead Kolašinac. O atacante Haris Tabaković deixou o campo machucado ainda no primeiro tempo. Foi a primeira Data Fifa sem Edin Džeko, que se despediu da seleção em outubro, poucos meses depois de a Bósnia disputar a Copa do Mundo, vaga conquistada nos pênaltis contra a Itália na repescagem.",
    "A Romênia de Gheorghe Hagi conseguiu no sábado a primeira vitória na competição, depois de quatro derrotas: 2 a 1 sobre a Polônia, em Bucareste, com gols de Alexandru Cicâldău e Dennis Man. Com 3 pontos, está um atrás dos poloneses. A defesa segue como o ponto fraco: 14 gols sofridos em cinco jogos, quatro deles para a própria Bósnia, no 4 a 2 do 1º turno, em casa.",
  ],
  cardTitulo: "Situação no Grupo 4 da Liga B", cardSub: "Antes da 6ª e última rodada",
  extraRows: [["Bósnia e Herzegovina", "2º lugar garantido (play-off de acesso)"], ["Romênia", "precisa vencer e torcer contra a Polônia"], ["Suécia", "1º lugar e acesso à Liga A garantidos"]],
  tabelaTitulo: "Classificação do Grupo 4 da Liga B",
  emJogo: [
    "A Bósnia não muda mais de posição: a Suécia, com 13 pontos, já é a campeã do grupo, e Polônia e Romênia não alcançam os 8 bósnios. Como 2ª colocada, a seleção disputa em março um play-off de ida e volta contra uma equipe da Liga A, valendo vaga na primeira divisão.",
    "A briga é pelo 3º lugar, que mantém a seleção na Liga B; o 4º vai a um play-off contra um 2º colocado da Liga C. A Romênia tem 3 pontos e a Polônia, 4. Os romenos só ficam com a vaga se vencerem em Zenica e a Polônia não vencer a Suécia, em Wrocław, no mesmo horário. Um empate não basta: com 4 pontos para cada, a Polônia leva vantagem no confronto direto, por causa do 6 a 0 em Varsóvia.",
  ],
  local: [
    "O Bilino Polje, em Zenica, é a casa tradicional da seleção bósnia e foi lá que o time arrancou o 1 a 1 com a Suécia, em outubro. A bola rola às 20h45 no horário local.",
  ],
  faqCanal: "A programação indica transmissão do Disney+, no streaming, às 16h45 de Brasília. Como só um guia confirmou o canal até agora, vale conferir perto do jogo.",
  faqExtra: [
    ["O que a Romênia precisa para não ir ao play-off de rebaixamento?", "Vencer a Bósnia e torcer para a Polônia não vencer a Suécia. Em qualquer outro cenário, a Romênia termina em 4º e disputa em março um play-off contra uma seleção da Liga C."],
    ["Quanto foi o primeiro jogo entre Romênia e Bósnia nesta Liga das Nações?", "A Bósnia venceu por 4 a 2, na Romênia, pela 2ª rodada."],
  ],
  excerpt: "Bósnia e Romênia fecham o Grupo 4 da Liga B da Liga das Nações nesta terça (17/11), às 16h45, em Zenica. Veja onde assistir, cenários e escalações.",
  metaDescription: "Saiba onde assistir a Bósnia x Romênia nesta terça (17/11), às 16h45, em Zenica, pela Liga das Nações. Canal, o que está em jogo e prováveis escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
