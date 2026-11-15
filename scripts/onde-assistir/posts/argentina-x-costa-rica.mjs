// Argentina x Costa Rica — amistoso, terça 17/11/2026 20h, estádio Mario Alberto Kempes (Córdoba). Jogo 17485286.
// Autor: Lucas Lima (2).
// HORÁRIO: a API marca 18h (21h UTC), mas a imprensa argentina dá 20h locais (= 20h de Brasília) e La Nación (CR)
//   dá 17h da Costa Rica (= 20h de Brasília). Usado 20h. Fontes: radioconaguante.com.ar, cholilaonline.ar, nacion.com.
// Canal: SporTV e ge tv — FONTE ÚNICA (https://www.antenadosnatvestreaming.com/2026/11/brasil-japao-final-inter-flamengo-futebol-globo.html)
//   → canalConfirmado: false + ressalva no texto. Argentina x Uruguai (13/11) passou no SporTV.
// Árbitro: não divulgado → omitido.
// Argentina 1x2 Uruguai (API): gol contra de Balerdi, Maxi Araújo de cabeça; Julián Alvarez descontou (La Nación AR).
//   Rulli no gol, Scaloni o respaldou e anunciou mudanças (eldestapeweb, misionesonline). Sem provável com nomes → só texto.
// Costa Rica: técnico Bryan Ruiz, efetivado em outubro (Record, ABC Color, La Nación CR); Equador 2x0 Costa Rica em 13/11 (La Nación AR, Metro Ecuador).
//   Keylor Navas fora da lista (só ClaroSports → fora do texto). Diego Mesén expulso em Quito (suspensão em amistoso não confirmada → fora).
// Último confronto: Argentina 3x1 Costa Rica, 26/03/2024, em Los Angeles.
import { B, P, LK } from "../lexical.mjs";
import { amistosoPost, TER17 } from "../template-amistoso.mjs";

export const opts = {
  data: TER17, matchId: 17485286, authorId: 2, A: "Argentina", Bn: "Costa Rica", hora: "20h",
  tagsExtra: ["Argentina", "Costa Rica"],
  canal: "SporTV e ge tv", canalConfirmado: false,
  canalLongo: "SporTV (TV fechada) e ge tv (YouTube), segundo a programação divulgada; confirme perto do jogo",
  canalCapaAlt: "no SporTV e no ge tv",
  competicaoLinha: "Amistoso internacional (Data Fifa de novembro)",
  localCurto: "Estádio Mario Alberto Kempes, em Córdoba (Argentina)", ondeFrase: "no estádio Mario Alberto Kempes, em Córdoba, na Argentina",
  lead: P("A ", B("Argentina"), " recebe a ", B("Costa Rica"), " nesta terça-feira (17/11), às ", B("20h (de Brasília)"), ", no estádio Mario Alberto Kempes, em Córdoba, três dias depois de perder para o Uruguai na Bombonera. Segundo a programação do site Antenados na TV, o jogo passa no ", B("SporTV"), " e no ", B("ge tv"), "; confirme perto da partida."),
  comoChegam: [
    "A primeira noite da Argentina sem Lionel Messi terminou em derrota. Na sexta-feira (13), numa Bombonera com muitos lugares vazios, a equipe de Lionel Scaloni perdeu para o Uruguai por 2 a 1: levou dois gols em seis minutos no começo do segundo tempo, um contra de Leonardo Balerdi e outro de cabeça de Maximiliano Araújo, e descontou com Julián Alvarez. Foi a primeira derrota depois da Copa, depois de três vitórias sem sofrer gol. Scaloni manteve a confiança em Gerónimo Rulli, titular no lugar de Emiliano Martínez, e avisou que vai mudar o time para terça.",
    "A Costa Rica começa um ciclo novo com Bryan Ruiz, ex-capitão da seleção nas Copas de 2014 e 2018, efetivado como técnico em outubro, com contrato até 2030. Fora da Copa de 2026, a seleção começou a semana com derrota para o Equador por 2 a 0, na sexta (13), em Quito, onde terminou com um jogador a menos depois da expulsão de Diego Mesén.",
  ],
  cardTitulo: "Argentina x Costa Rica: a fase", cardSub: "Antes do amistoso",
  cardRows: [
    ["Último jogo da Argentina", "Argentina 1 x 2 Uruguai, sexta (13/11)"],
    ["Argentina depois da Copa", "3 vitórias e 1 derrota"],
    ["Último jogo da Costa Rica", "Equador 2 x 0 Costa Rica, sexta (13/11)"],
    ["Último confronto", "Argentina 3 x 1 Costa Rica, março de 2024"],
  ],
  emJogo: [
    "Para Scaloni, o amistoso em Córdoba é a chance de fechar o ano com resposta depois de uma estreia ruim na fase sem Messi. Ele já disse que vai dar minutos a jogadores que atuaram pouco na sexta, e a imprensa argentina espera mudanças em vários setores, sem que o técnico tenha antecipado nomes.",
    "Para a Costa Rica, é o segundo teste de Bryan Ruiz contra uma seleção sul-americana na mesma semana e uma forma de medir um elenco em renovação, que mira as Eliminatórias para 2030.",
  ],
  lineupNote: "Scaloni e Bryan Ruiz não divulgaram os titulares, e não há uma escalação provável confiável para nenhum dos lados. Abaixo, o time que cada um usou no último jogo; a lista oficial sai cerca de uma hora antes da bola rolar.",
  provHome: "contra o Uruguai, Scaloni começou com Gerónimo Rulli; Gonzalo Montiel, Leonardo Balerdi, Lisandro Martínez e Facundo Medina; Enzo Fernández, Exequiel Palacios e Alexis Mac Allister; Nico Paz, Julián Alvarez e Thiago Almada. Gianluca Prestianni, que deu o passe para o gol, Román Vega e Agustín Giay entraram no segundo tempo e brigam por espaço",
  provAway: "contra o Equador, Bryan Ruiz escalou Patrick Sequeira; Kenay Myrie, Juan Pablo Vargas, Francisco Calvo e Joseph Mora; Roan Wilson; Carlos Mora, Douglas López, Andrey Soto e Josimar Alcócer; Manfred Ugalde",
  local: [
    "O estádio Mario Alberto Kempes, o maior de Córdoba, leva o nome do artilheiro da Argentina campeã do mundo em 1978 e foi uma das sedes daquela Copa.",
  ],
  links: ["Acompanhe o placar e o lance a lance na ", LK("página de Argentina x Costa Rica", "/futebol/amistosos/17-11-2026/argentina-costa-rica"), ". Veja também o guia de ", LK("Uruguai x República Dominicana", "/onde-assistir/uruguai-x-republica-dominicana-onde-assistir-horario-e-escalacoes"), ", os ", LK("outros guias de onde assistir", "/onde-assistir"), " e os ", LK("jogos de hoje", "/jogos-de-hoje"), "."],
  faqCanal: "Segundo a programação do site Antenados na TV, a partida passa no SporTV, na TV fechada, e no ge tv, no YouTube, às 20h de Brasília. A transmissão ainda não foi confirmada por outras fontes; confirme perto do jogo.",
  faqExtra: [
    ["Messi joga Argentina x Costa Rica?", "Não. Lionel Messi se aposentou da seleção argentina, e este é o segundo jogo da equipe sem ele. O primeiro foi a derrota por 2 a 1 para o Uruguai, na sexta-feira (13)."],
    ["Quem é o técnico da Costa Rica?", "Bryan Ruiz, ex-meia e ex-capitão da seleção, efetivado no cargo em outubro de 2026 com contrato até 2030."],
  ],
  excerpt: "Argentina e Costa Rica jogam às 20h desta terça (17/11), em Córdoba, depois da derrota argentina para o Uruguai. Veja onde assistir, horário e escalações.",
  metaDescription: "Saiba onde assistir a Argentina x Costa Rica nesta terça (17/11), às 20h, no Kempes, em Córdoba. Transmissão prevista no SporTV e ge tv e escalações.",
};
export default () => amistosoPost(opts);
