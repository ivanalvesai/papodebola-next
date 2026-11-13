// Japão x Brasil — amistoso, sábado 14/11/2026 7h15, Estádio Nacional de Singapura. Jogo 17485338.
// Autor: Lucas Lima (2). Globo, SporTV e ge tv (várias fontes). Resultados: API.
// Escalação só de 1 fonte → só texto, sem campinho. Números da convocação (fonte única) → fora.
import { B, P, LK } from "../lexical.mjs";
import { amistosoPost, SAB14 } from "../template-amistoso.mjs";

export const opts = {
  data: SAB14, matchId: 17485338, authorId: 2, A: "Japão", Bn: "Brasil", hora: "7h15",
  tagsExtra: ["Seleção Brasileira", "Japão", "Brasil"],
  canal: "TV Globo, SporTV e ge tv", canalLongo: "TV Globo (TV aberta), SporTV (TV fechada) e ge tv (YouTube)", canalCapaAlt: "na Globo, no SporTV e no ge tv",
  competicaoLinha: "Amistoso internacional (Data Fifa de novembro)",
  localCurto: "Estádio Nacional, em Singapura", ondeFrase: "no Estádio Nacional de Singapura, em campo neutro",
  lead: P("A ", B("Seleção Brasileira"), " enfrenta o ", B("Japão"), " neste sábado (14/11), às ", B("7h15 (de Brasília)"), ", no Estádio Nacional de Singapura, no reencontro com o adversário que eliminou na Copa de 2026. O amistoso tem transmissão da ", B("TV Globo"), ", do ", B("SporTV"), " e do ", B("ge tv"), "."),
  comoChegam: [
    "O Brasil de Carlo Ancelotti caiu nas oitavas de final da Copa de 2026, ao perder para a Noruega por 2 a 1, e desde então usa as Datas Fifa para renovar o grupo, de olho no próximo ciclo. Depois da Copa, empatou com a Austrália (1 a 1) e venceu a revanche por 4 a 2, ambas em Brisbane, e goleou a Índia por 4 a 0.",
    "O Japão de Hajime Moriyasu é um velho conhecido: na Copa, nos 16 avos de final, abriu o placar contra o Brasil e levou a virada por 2 a 1. Um ano antes, em outubro de 2025, venceu os brasileiros por 3 a 2 em Tóquio, a primeira vitória japonesa no confronto. Em setembro, bateu o Uruguai por 3 a 1. Takefusa Kubo e Daichi Kamada são referências de um time rápido nas transições.",
  ],
  cardTitulo: "Japão x Brasil: retrospecto recente", cardSub: "Antes do amistoso",
  cardRows: [
    ["Último jogo", "Brasil 2 x 1 Japão, Copa de 2026 (16 avos)"],
    ["Outubro de 2025", "Japão 3 x 2 Brasil, em Tóquio"],
    ["Brasil depois da Copa", "2 vitórias e 1 empate"],
    ["Próximo jogo do Brasil", "Singapura x Brasil, terça (17/11), 7h"],
  ],
  emJogo: [
    "É o primeiro de dois jogos do Brasil em Singapura, os últimos da seleção em 2026. Na terça-feira (17), às 7h, a equipe enfrenta a seleção da casa no mesmo estádio. Para Ancelotti, a viagem é mais uma chance de testar jovens e definir posições que seguem em aberto, como a lateral esquerda e o meio-campo.",
    "Para o Japão, é a revanche da eliminação na Copa, diante de um Brasil em renovação.",
  ],
  lineupNote: "Ancelotti e Moriyasu não confirmaram os titulares, e as prévias ainda trazem dúvidas, principalmente no gol e no meio-campo brasileiros. Abaixo, os times apontados pela imprensa; a lista oficial sai cerca de uma hora antes da bola rolar.",
  provHome: "Zion Suzuki; Seko, Itakura e Ito; Sugawara, Kamada, Tanaka e Nakamura; Kubo, Maeda e Ogawa",
  provAway: "Pedro Morisco (ou Bento); Wesley, Jair, Gabriel Magalhães e Douglas Santos; Andrey Santos e Bruno Guimarães; Estêvão, Rayan, Raphinha e Vinícius Júnior",
  local: [
    "O Estádio Nacional de Singapura, no bairro de Kallang, já recebeu o confronto: em 2014, o Brasil goleou o Japão por 4 a 0 no mesmo palco, com quatro gols de Neymar.",
  ],
  links: ["Acompanhe o placar e o lance a lance na ", LK("página de Japão x Brasil", "/futebol/selecao-brasileira/14-11-2026/japao-brasil"), ". Veja também os ", LK("outros guias de onde assistir", "/onde-assistir"), ", os ", LK("jogos de hoje", "/jogos-de-hoje"), " e a ", LK("página da Seleção Brasileira", "/futebol/selecao-brasileira"), "."],
  faqCanal: "A partida tem transmissão da TV Globo, na TV aberta, do SporTV, na TV fechada, e do ge tv, no YouTube, às 7h15 de Brasília.",
  faqExtra: [
    ["Por que Japão x Brasil é em Singapura?", "O jogo faz parte de uma série de amistosos do Brasil em Singapura nesta Data Fifa. Depois do Japão, a seleção enfrenta Singapura na terça-feira (17), às 7h, no mesmo estádio."],
    ["Qual foi o último jogo entre Japão e Brasil?", "Na Copa do Mundo de 2026, nos 16 avos de final, o Brasil venceu o Japão por 2 a 1, de virada."],
  ],
  excerpt: "Japão e Brasil se enfrentam às 7h15 deste sábado (14/11), em Singapura, no reencontro da Copa de 2026. Veja onde assistir na Globo, SporTV e ge tv e as escalações.",
  metaDescription: "Saiba onde assistir a Japão x Brasil neste sábado (14/11), às 7h15, em Singapura. Transmissão da TV Globo, SporTV e ge tv, prováveis escalações e retrospecto.",
};
export default () => amistosoPost(opts);
