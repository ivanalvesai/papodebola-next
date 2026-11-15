// Polônia x Suécia — Liga das Nações, Liga B · Grupo 4, 6ª e última rodada, terça 17/11/2026 16h45. Jogo 15534171.
// Autor: Lucas Lima (2). Canal: SporTV 2 = FONTE ÚNICA (grade do Goal Brasil, terça 17/11:
//   https://www.goal.com/br/listas/futebol-programacao-jogos-tv-aberta-fechada-onde-assistir-online-app/bltc0a7361374657315)
//   → canalConfirmado:false + ressalva. Mantos do Futebol/futebolnatv ainda sem a grade de terça em 15/11.
// Árbitro: Felix Zwayer (Alemanha) só na Wikipedia → omitido.
// Cenários: UEFA, "Nations League: latest on quarter-final qualification" (Suécia promovida; Bósnia no play-off A/B; Polônia evita o
//   play-off B/C vencendo a Suécia ou se a Romênia não vencer a Bósnia):
//   https://www.uefa.com/uefanationsleague/news/02ab-2209792f2fda-6a523d4500bb-1000--nations-league-latest-on-quarter-final-qualification-prom/
//   Contas à mão conferem (Polônia x Romênia: 6x0 e 1x2 → em empate de pontos, Polônia leva no saldo do confronto direto).
// Gols do sábado (14): API (lance a lance do snapshot) + Wikipedia. Matty Cash saiu lesionado aos 76' em Bucareste (API, fonte única:
//   citado só como fato do jogo; sem swap).
// Repescagem da Copa (31/03/2026, Solna, Suécia 3x2 Polônia, gol de Gyökeres no fim): The Star/Reuters, NBC Sports, ESPN.
// Estádio: Tarczyński Arena, Wrocław (API + Wikipedia).
import { B, P } from "../lexical.mjs";
import { watchPostV2, TER17 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: TER17, matchId: 15534171, authorId: 2, A: "Polônia", Bn: "Suécia", hora: "16h45",
  canal: "SporTV 2", canalConfirmado: false, canalLongo: "SporTV 2 (TV fechada), segundo a programação; confirme perto do jogo", canalCapaAlt: "no SporTV 2",
  competicaoLinha: "Liga das Nações 2026/27, Liga B, Grupo 4, 6ª e última rodada",
  localCurto: "Tarczyński Arena, em Wrocław (Polônia)", ondeFrase: "na Tarczyński Arena, em Wrocław, na Polônia",
  lineupNote: "Jan Urban e Graham Potter não divulgaram a escalação. Os campinhos repetem os titulares do último jogo de cada seleção; na Polônia, o lateral Matty Cash saiu machucado no sábado e pode não jogar. A lista oficial sai cerca de uma hora antes da bola rolar.",
  lead: P("A ", B("Polônia"), " de Robert Lewandowski recebe a ", B("Suécia"), ", já garantida na Liga A, nesta terça-feira (17/11), às ", B("16h45 (de Brasília)"), ", em Wrocław, na última rodada do Grupo 4 da Liga B da ", B("Liga das Nações"), ". Os poloneses jogam para não cair para o play-off contra o rebaixamento. A programação indica transmissão do ", B("SporTV 2"), "."),
  comoChegam: [
    "A Polônia de Jan Urban perdeu para a Romênia por 2 a 1 em Bucareste, no sábado (14). Alexandru Cicâldău e Dennis Man marcaram no segundo tempo, e Marcel Reguła descontou a oito minutos do fim. Foi a terceira derrota em cinco jogos, e a única vitória da campanha segue sendo o 6 a 0 sobre os próprios romenos, em Varsóvia, com três gols de Lewandowski. O lateral Matty Cash deixou o campo machucado.",
    "A Suécia de Graham Potter venceu a Bósnia por 3 a 2 em Solna, também no sábado, e garantiu o 1º lugar e a volta à Liga A com uma rodada de antecedência. Daniel Svensson abriu o placar e Viktor Gyökeres fez dois de pênalti antes do intervalo; os bósnios reagiram com Armin Gigović e Sead Kolašinac. Invicta, com quatro vitórias e um empate, a seleção sueca já derrotou a Polônia por 3 a 1 no 1º turno.",
  ],
  cardTitulo: "Situação no Grupo 4 da Liga B", cardSub: "Antes da 6ª e última rodada",
  extraRows: [["Suécia", "1º lugar e acesso à Liga A garantidos"], ["Bósnia e Herzegovina", "2º lugar garantido (play-off de acesso)"], ["Polônia", "fica em 3º se vencer ou se a Romênia não vencer"]],
  tabelaTitulo: "Classificação do Grupo 4 da Liga B",
  emJogo: [
    "Na Liga B, o 3º colocado permanece na divisão e o 4º disputa em março um play-off contra um 2º colocado da Liga C, valendo vaga na Liga B. A Polônia tem 4 pontos e a Romênia, 3, e as duas jogam no mesmo horário. Se a Polônia vencer a Suécia, fica com o 3º lugar de qualquer jeito. Se não vencer, depende de Bósnia x Romênia, em Zenica.",
    "A Romênia só ultrapassa os poloneses se ganhar da Bósnia. Com empate dos romenos e derrota polonesa, as duas ficam com 4 pontos, e a Polônia leva vantagem no confronto direto: ganhou por 6 a 0 e perdeu por 2 a 1. Já Suécia e Bósnia não têm mais o que mudar na tabela.",
  ],
  local: [
    "A Tarczyński Arena, em Wrocław, foi uma das sedes da Eurocopa de 2012. O reencontro tem histórico recente pesado para os poloneses: em 31 de março, na final da repescagem europeia da Copa do Mundo, a Suécia venceu por 3 a 2 em Solna, com gol de Gyökeres no fim, e ficou com a vaga. A bola rola às 20h45 no horário local.",
  ],
  faqCanal: "A programação indica transmissão do SporTV 2, na TV fechada, às 16h45 de Brasília. Como só um guia confirmou o canal até agora, vale conferir perto do jogo.",
  faqExtra: [
    ["A Polônia pode ir ao play-off de rebaixamento da Liga das Nações?", "Pode. A Polônia termina em 4º se não vencer a Suécia e a Romênia vencer a Bósnia. Nesse caso, disputa em março um play-off contra uma seleção da Liga C."],
    ["A Suécia já subiu para a Liga A?", "Sim. Com 13 pontos, a Suécia garantiu o 1º lugar do Grupo 4 da Liga B ao vencer a Bósnia por 3 a 2, no sábado (14)."],
  ],
  excerpt: "Polônia e Suécia fecham o Grupo 4 da Liga B da Liga das Nações nesta terça (17/11), às 16h45, em Wrocław. Veja onde assistir, cenários e escalações.",
  metaDescription: "Saiba onde assistir a Polônia x Suécia nesta terça (17/11), às 16h45, em Wrocław, pela Liga das Nações. Canal, o que está em jogo e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
