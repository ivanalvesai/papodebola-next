// Brasil x Peru sub-20 — amistoso, sexta 13/11/2026 20h, Mangueirão (Belém). Jogo 17527835.
// Autor: Lucas Lima (2). TNT Sports no YouTube (TNH1/TNT, Gazeta, Portal Democrata, Antenados).
// Convocação e fala do técnico: cbf.com.br. Resultados: API. Árbitro só em 1 fonte → fora.
import { B, P, LK } from "../lexical.mjs";
import { amistosoPost, SEX13, XI } from "../template-amistoso.mjs";

export const opts = {
  data: SEX13, matchId: 17527835, authorId: 2, A: "Brasil sub-20", Bn: "Peru", hora: "20h",
  slugBase: "brasil-x-peru-sub-20", title: "Brasil x Peru sub-20: onde assistir, horário e escalações",
  tagsExtra: ["Seleção Brasileira", "Seleção sub-20", "Peru"],
  canal: "TNT Sports (YouTube)", canalLongo: "canal da TNT Sports no YouTube, de graça", canalCapaAlt: "no YouTube da TNT Sports",
  competicaoLinha: "Amistoso internacional sub-20 (1º de 2 jogos)",
  localCurto: "Estádio Olímpico do Pará (Mangueirão), em Belém (PA)", ondeFrase: "no Estádio Olímpico do Pará, o Mangueirão, em Belém (PA)",
  lead: P("A ", B("Seleção Brasileira sub-20"), " enfrenta o ", B("Peru"), " nesta sexta-feira (13/11), às ", B("20h (de Brasília)"), ", no Mangueirão, em Belém, no primeiro de dois amistosos que encerram o ano da equipe. O jogo tem transmissão ao vivo e gratuita no ", B("canal da TNT Sports no YouTube"), "."),
  comoChegam: [
    "O Brasil de Paulo Victor chega embalado: venceu os quatro jogos mais recentes. Em agosto, bateu a Bolívia por 2 a 0, e na última Data Fifa passou por Dinamarca (4 a 1), Estados Unidos (2 a 0) e México (4 a 0). Para Belém, o técnico chamou 27 jogadores, que se apresentaram na segunda-feira (9), com nomes que já atuam na Europa, como Robinho Jr. (Genoa), Isaque e Bruninho (Shakhtar Donetsk) e Matheos Ferreira (Newcastle), e destaques do Brasileirão, como Erick Belé e o goleiro Kauan, do Palmeiras, e Zé Lucas, do Cruzeiro.",
    P("\"Estamos conseguindo construir de maneira clara a nossa forma de jogar, nossa identidade\", disse Paulo Victor no site da CBF. O treinador também chamou o torcedor paraense: \"A gente convoca já de antemão o torcedor de todo o estado do Pará para que esteja próximo da gente\"."),
    "O Peru também usa os dois jogos em Belém para fechar a preparação para o Sul-Americano da categoria.",
  ],
  cardTitulo: "Brasil sub-20 em 2026", cardSub: "Antes do amistoso",
  cardRows: [
    ["Últimos jogos", "4 x 1 Dinamarca, 2 x 0 EUA, 4 x 0 México"],
    ["Segundo amistoso", "Segunda-feira (16/11), 20h, Mangueirão"],
    ["Próxima competição", "Sul-Americano sub-20, janeiro de 2027, na Colômbia"],
  ],
  emJogo: [
    "São os últimos testes do ano antes do Sul-Americano sub-20, marcado para janeiro de 2027, na Colômbia, que classifica para o Mundial da categoria. A comissão técnica usa os dois jogos contra o Peru para observar o grupo antes de fechar a lista do torneio.",
    "O segundo amistoso será na segunda-feira (16), também às 20h e no Mangueirão. Os ingressos são vendidos pela plataforma Ticket And Go.",
  ],
  lineupNote: "Paulo Victor não divulgou o time. O campinho mostra a escalação provável do Brasil apontada pela imprensa que acompanha a seleção em Belém; a do Peru não foi antecipada com segurança. A lista oficial sai cerca de uma hora antes da bola rolar.",
  lineupHome: XI("4-3-3", "Kauan#72@1884635; Ryan#52@2026380; João Ananias#26@1888624; Bruno André#80@2026626; Kauã Pascini#36@1829022; Zé Lucas#5@2040561; Djhordney#48@1884601; Isaque#14@1835892; Bruninho#99@2436878; Erick Belé#45@1633503; Robinho Jr.#21@2191860"),
  extraSecoes: [
    ["No mesmo horário: Argentina x Uruguai", [
      P("Quem gosta de futebol sul-americano vai ter de escolher: também às 20h, a ", B("Argentina"), " recebe o ", B("Uruguai"), " na Bombonera, em Buenos Aires, no primeiro jogo da seleção argentina depois da aposentadoria de Lionel Messi da seleção. O clássico passa no SporTV e no Globoplay. Veja o ", LK("guia completo de Argentina x Uruguai", "/onde-assistir/argentina-x-uruguai-onde-assistir-horario-e-escalacoes"), "."),
      P("E a seleção principal entra em campo no sábado (14), às 7h15, contra o Japão, em Singapura, com transmissão da TV Globo, do SporTV e do ge tv. Acompanhe na ", LK("página de Japão x Brasil", "/futebol/selecao-brasileira/14-11-2026/japao-brasil"), "."),
    ]],
  ],
  local: [
    "O Estádio Olímpico do Pará, o Mangueirão, é o maior palco do futebol paraense e casa dos clássicos entre Remo e Paysandu.",
  ],
  links: ["Veja também os ", LK("outros guias de onde assistir", "/onde-assistir"), ", os ", LK("jogos de hoje", "/jogos-de-hoje"), " e o ", LK("placar ao vivo", "/ao-vivo"), "."],
  faqCanal: "A partida tem transmissão ao vivo e gratuita no canal da TNT Sports no YouTube, às 20h de Brasília.",
  faqExtra: [
    ["Brasil x Peru desta sexta é da seleção principal?", "Não. É um amistoso da seleção sub-20. A seleção principal joga no sábado (14), às 7h15, contra o Japão, em Singapura."],
    ["Quando é o segundo jogo entre Brasil e Peru sub-20?", "Na segunda-feira, 16 de novembro, às 20h, também no Mangueirão, em Belém."],
  ],
  excerpt: "A Seleção sub-20 enfrenta o Peru às 20h desta sexta (13/11), no Mangueirão, em Belém, com transmissão grátis no YouTube da TNT Sports. Veja horário e escalação.",
  metaDescription: "Brasil x Peru sub-20 é nesta sexta (13/11), às 20h, no Mangueirão, em Belém. Saiba onde assistir de graça no YouTube da TNT Sports e a provável escalação.",
};
export default () => amistosoPost(opts);
