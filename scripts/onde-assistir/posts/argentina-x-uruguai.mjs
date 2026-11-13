// Argentina x Uruguai — amistoso, sexta 13/11/2026 20h, La Bombonera. Jogo 17497151.
// Autor: Ivan Alves (1). SporTV + Globoplay (SBT Sports, Goal/outros). Convocação: 442/Perfil, Teletica.
// Resultados e próximos jogos: API. Árbitro só em 1 fonte → fora. Escalação do Uruguai diverge → só texto.
import { B, P, LK } from "../lexical.mjs";
import { amistosoPost, SEX13, XI } from "../template-amistoso.mjs";

export const opts = {
  data: SEX13, matchId: 17497151, authorId: 1, A: "Argentina", Bn: "Uruguai", hora: "20h",
  tagsExtra: ["Argentina", "Uruguai"],
  canal: "SporTV e Globoplay", canalLongo: "SporTV (TV fechada) e Globoplay (streaming)", canalCapaAlt: "no SporTV e no Globoplay",
  competicaoLinha: "Amistoso internacional (Data Fifa de novembro)",
  localCurto: "La Bombonera, em Buenos Aires (Argentina)", ondeFrase: "na Bombonera, o estádio Alberto J. Armando, do Boca Juniors, em Buenos Aires",
  lead: P("A ", B("Argentina"), " recebe o ", B("Uruguai"), " nesta sexta-feira (13/11), às ", B("20h (de Brasília)"), ", na Bombonera, em Buenos Aires, no primeiro jogo da seleção argentina depois da aposentadoria de Lionel Messi da seleção. O clássico tem transmissão do ", B("SporTV"), " e do ", B("Globoplay"), "."),
  comoChegam: [
    "Vice-campeã do mundo, derrotada pela Espanha por 1 a 0 na final da Copa de 2026, a Argentina começa a vida sem Messi. Lionel Scaloni chamou 28 jogadores para esta Data Fifa e deixou de fora Rodrigo De Paul, titular na final; Leandro Paredes e Nahuel Molina ainda cumprem suspensão pelos incidentes depois da decisão, e Cristian Romero e Lautaro Martínez estão lesionados. Gonzalo Montiel e Mariano Troilo voltam à lista. Depois da Copa, a equipe venceu os três amistosos que fez, sem levar gol: 4 a 0 na Bolívia, 7 a 0 em Burkina Faso e 3 a 0 em Benin.",
    "O Uruguai faz a segunda Data Fifa sob o comando de Diego Forlán, ídolo da seleção, e tenta virar a página depois da eliminação na fase de grupos da Copa de 2026. Em setembro e outubro, perdeu para o Japão (3 a 1) e goleou Coreia do Sul (4 a 1) e Índia (6 a 1). O elenco tem nomes conhecidos do torcedor brasileiro, como Giorgian de Arrascaeta e Nicolás de la Cruz, do Flamengo.",
  ],
  cardTitulo: "Argentina e Uruguai depois da Copa", cardSub: "Antes do amistoso",
  cardRows: [
    ["Argentina na Copa de 2026", "Vice-campeã (perdeu a final para a Espanha)"],
    ["Argentina depois da Copa", "3 vitórias, 14 gols marcados, nenhum sofrido"],
    ["Uruguai na Copa de 2026", "Eliminado na fase de grupos"],
    ["Uruguai depois da Copa", "2 vitórias e 1 derrota"],
  ],
  emJogo: [
    "Não vale ponto, mas é um dos clássicos mais antigos do futebol de seleções e o primeiro capítulo de dois recomeços: a Argentina sem Messi, de olho na Copa de 2030, e o Uruguai de Forlán reconstruindo depois da queda precoce no Mundial.",
    "Os dois voltam a campo na terça-feira (17): a Argentina enfrenta a Costa Rica no estádio Mario Alberto Kempes, em Córdoba, e o Uruguai recebe a República Dominicana.",
  ],
  desfalques: [
    P(B("Argentina: "), "Cristian Romero e Lautaro Martínez (lesionados); Leandro Paredes e Nahuel Molina (suspensos); Rodrigo De Paul não foi convocado. O Boca Juniors, dono do estádio, não tem jogador na lista."),
  ],
  lineupNote: "Scaloni e Forlán não divulgaram os titulares. O campinho mostra a provável Argentina, em que as prévias coincidem; no Uruguai, as apostas da imprensa variam, inclusive no gol. A lista oficial sai cerca de uma hora antes da bola rolar.",
  lineupHome: XI("4-3-3", "Emiliano Martínez#1@158263; Gonzalo Montiel#29@822933; Leonardo Balerdi#26@928236; Aarón Anselmino#30@1500263; Nicolás Tagliafico#3@158243; Enzo Fernández#17@974505; Alexis Mac Allister#10@895324; Nico Paz#10@1171451; Matías Soulé#18@1082406; Franco Mastantuono#30@1403559; Julián Alvarez#19@944656"),
  provAway: "as prévias apontam Federico Valverde, Rodrigo Bentancur e Ronald Araújo como base, com Guillermo Varela na lateral e Darwin Núñez no ataque; o goleiro e o restante do time variam de uma prévia para outra",
  local: [
    "A Bombonera, casa do Boca Juniors, é um dos estádios mais famosos do mundo e recebe a seleção argentina em ocasiões especiais.",
  ],
  links: ["Veja também os ", LK("outros guias de onde assistir", "/onde-assistir"), ", os ", LK("jogos de hoje", "/jogos-de-hoje"), ", o ", LK("placar ao vivo", "/ao-vivo"), " e o guia de ", LK("Brasil x Peru sub-20", "/onde-assistir/brasil-x-peru-sub-20-onde-assistir-horario-e-escalacoes"), ", que começa no mesmo horário."],
  faqCanal: "A partida tem transmissão do SporTV, na TV fechada, e do Globoplay, no streaming, às 20h de Brasília.",
  faqExtra: [
    ["Messi joga Argentina x Uruguai?", "Não. Lionel Messi se aposentou da seleção argentina, e este é o primeiro jogo da equipe sem ele."],
    ["Quando a Argentina joga de novo?", "Na terça-feira, 17 de novembro, contra a Costa Rica, no estádio Mario Alberto Kempes, em Córdoba."],
  ],
  excerpt: "Argentina e Uruguai se enfrentam às 20h desta sexta (13/11), na Bombonera, no primeiro jogo argentino sem Messi. Veja onde assistir, desfalques e escalações.",
  metaDescription: "Saiba onde assistir a Argentina x Uruguai nesta sexta (13/11), às 20h, na Bombonera. Primeiro jogo sem Messi; transmissão do SporTV e Globoplay e escalações.",
};
export default () => amistosoPost(opts);
