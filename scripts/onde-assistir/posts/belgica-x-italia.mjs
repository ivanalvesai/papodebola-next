// Bélgica x Itália — Liga das Nações, Liga A · Grupo 1, 6ª rodada, domingo 15/11/2026 16h45. Jogo 15534036.
// Autor: Lucas Lima (2). ESPN (Mantos do Futebol + Guia de TV); Disney+ só no Mantos. Árbitro: Espen Eskås (ANSA e outros).
// XI: Raskin -> Lavia (Eurosport.it); Frattesi saiu da concentração (só ANSA) -> Ricci, sem citar no texto. Suspensões da Itália não confirmadas: fora do texto.
import { B, P } from "../lexical.mjs";
import { watchPostV2, DOM15 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: DOM15, matchId: 15534036, authorId: 2, A: "Bélgica", Bn: "Itália", hora: "16h45",
  canal: "ESPN", canalLongo: "ESPN (TV fechada); um dos guias aponta também o Disney+", canalCapaAlt: "na ESPN",
  competicaoLinha: "Liga das Nações 2026/27, Liga A, Grupo 1, 6ª e última rodada",
  localCurto: "Estádio Rei Balduíno, em Bruxelas (Bélgica)", ondeFrase: "no Estádio Rei Balduíno, em Bruxelas, na Bélgica",
  arbitro: "Espen Eskås (Noruega); VAR: Christian Dingert (Alemanha)",
  swapHome: [["Nicolas Raskin", { name: "Roméo Lavia", number: "", id: "" }]],
  swapAway: [["Davide Frattesi", { name: "Samuele Ricci", number: "", id: "" }]],
  lead: P("Vale vaga nas quartas para os dois. A ", B("Bélgica"), " recebe a ", B("Itália"), " neste domingo (15/11), às ", B("16h45 (de Brasília)"), ", em Bruxelas, na última rodada do Grupo 1 da ", B("Liga das Nações"), ". Os belgas só passam se vencerem; os italianos dependem de si mesmos. A transmissão é da ", B("ESPN"), "."),
  comoChegam: [
    "A Bélgica de Mark van Bommel virou sobre a Turquia em Istambul, na quinta-feira (12), com dois gols em quatro minutos, de Kevin De Bruyne e Charles De Ketelaere. O goleiro Senne Lammens ainda fez duas boas defesas no fim. Na estreia, em setembro, os belgas venceram a Itália por 2 a 0 em Roma, a primeira vitória sobre os italianos em jogo oficial desde 1972. Jeremy Doku volta a ficar à disposição.",
    "A Itália de Roberto Mancini assumiu a liderança ao virar sobre a França por 3 a 1 no San Siro, diante de 71.452 torcedores. Francesco Pio Esposito marcou duas vezes, uma de pênalti, e chegou a 4 gols, artilheiro do time na competição; Frattesi fez o outro. \"Os meninos estiveram muito bem\", resumiu Mancini.",
  ],
  cardTitulo: "Situação no Grupo 1 da Liga A", cardSub: "Antes da 6ª e última rodada",
  extraRows: [["Classificação às quartas", "1º e 2º colocados"], ["Itália", "vence e é 1ª; empate classifica"], ["Bélgica", "só a vitória serve"]],
  tabelaTitulo: "Classificação do Grupo 1 da Liga A",
  emJogo: [
    "Itália (10 pontos), França (10) e Bélgica (9) disputam duas vagas, com os dois jogos no mesmo horário. A Itália termina em 1º se vencer. Se empatar, também se classifica: fica em 1º, ou em 2º caso a França vença a Turquia. Perdendo, só passa se a França também perder.",
    "Para a Bélgica, só a vitória interessa. Ganhando, termina em 1º se a França não vencer e em 2º se a França vencer. Com empate, os belgas chegam a 10 pontos e ficam em 3º em qualquer cenário, porque perderam os dois jogos para a França. Em 3º, a Bélgica entra no ranking dos terceiros colocados, que define quem fica na Liga A e quem vai ao play-off de março.",
    "Nos duelos recentes, a Itália leva vantagem: 2 a 2 em Roma e 1 a 0 em Bruxelas pela Liga das Nações de 2024, além da vitória por 2 a 1 nas quartas da Euro 2020. A Bélgica, porém, venceu o jogo do 1º turno.",
  ],
  desfalques: [
    P(B("Bélgica: "), "Thibaut Courtois está de pausa na seleção, como combinado com a federação para esta Liga das Nações; Amadou Onana se recupera de lesão no ligamento cruzado, sofrida na Copa; e o zagueiro Koni De Winter recusou a convocação."),
  ],
  local: [
    "O norueguês Espen Eskås apita a partida, com Jan Erik Engan e Alf Olav Rossland como assistentes. O VAR é do alemão Christian Dingert. Eskås já apitou este confronto: o 2 a 2 em Roma, pela Liga das Nações de 2024.",
    "O Estádio Rei Balduíno, em Bruxelas, está com os ingressos esgotados. A partida começa às 20h45 no horário local.",
  ],
  faqCanal: "A partida tem transmissão da ESPN, na TV fechada, às 16h45 de Brasília. Um dos guias de programação aponta também o Disney+.",
  faqExtra: [
    ["Do que a Itália precisa para ir às quartas da Liga das Nações?", "De uma vitória ou de um empate contra a Bélgica. Mesmo perdendo, a Itália se classifica se a França também perder para a Turquia."],
    ["A Bélgica se classifica com empate?", "Não. Com empate, a Bélgica chega a 10 pontos e termina em 3º, porque perdeu os dois confrontos diretos com a França."],
  ],
  excerpt: "Bélgica e Itália brigam por vaga nas quartas da Liga das Nações neste domingo (15/11), às 16h45, em Bruxelas. Veja onde assistir e o que cada um precisa.",
  metaDescription: "Saiba onde assistir a Bélgica x Itália neste domingo (15/11), às 16h45, em Bruxelas, pela Liga das Nações. Transmissão da ESPN, cenários e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
