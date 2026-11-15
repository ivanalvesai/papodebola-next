// Uruguai x República Dominicana — amistoso, terça 17/11/2026 20h30, Estádio Domingo Burgueño Miguel (Campus de Maldonado). Jogo 17502409.
// Autor: Lucas Lima (2).
// Canal: SEM transmissão confirmada no Brasil (Super Rádio Tupi: https://www.tupi.fm/esportes/flamengo/horarios-e-onde-assistir-amistosos-dos-jogadores-do-flamengo-na-data-fifa/;
//   nenhuma grade brasileira lista o jogo). No Uruguai, AUF TV (El Observador).
// Horário 20h30 (= Brasília) e estádio: Cadena del Mar + El Observador (AUF confirmou).
// Árbitro: não divulgado → omitido.
// Desfalques Uruguai: Arrascaeta, Varela (Flamengo) e Piquerez (Palmeiras) liberados pela AUF em 14/11 (Terra, Lance!, El Observador).
// Desfalques RD: Júnior Firpo lesionado (Acento/EFE + Proceso.com.do); Juan Carlos López e Jimmy Kaparos lesionados (nota da federação via EFE).
//   Técnico Marcelo Neveleff. Objetivo: repescagem da Copa Ouro 2027.
// Argentina 1x2 Uruguai (API): gol contra de Balerdi e Maxi Araújo; Arrascaeta participou dos dois (Terra).
// Último confronto: Uruguai 1x0 República Dominicana, 10/10/2025 (API).
// Escalações: Uruguai sem 3 titulares e Forlán promete rodízio; RD sem López → só texto, sem campinho.
import { B, P, LK } from "../lexical.mjs";
import { amistosoPost, TER17 } from "../template-amistoso.mjs";

export const opts = {
  data: TER17, matchId: 17502409, authorId: 2, A: "Uruguai", Bn: "República Dominicana", hora: "20h30",
  tagsExtra: ["Uruguai", "República Dominicana"],
  canal: "Sem transmissão confirmada no Brasil", canalConfirmado: false,
  canalLongo: "sem transmissão confirmada no Brasil (no Uruguai, AUF TV)",
  canalCapaAlt: "sem transmissão confirmada no Brasil",
  competicaoLinha: "Amistoso internacional (Data Fifa de novembro)",
  localCurto: "Estádio Domingo Burgueño Miguel, em Maldonado (Uruguai)", ondeFrase: "no Estádio Domingo Burgueño Miguel, o Campus de Maldonado, no Uruguai",
  lead: P("O ", B("Uruguai"), " recebe a ", B("República Dominicana"), " nesta terça-feira (17/11), às ", B("20h30 (de Brasília)"), ", no Campus de Maldonado, quatro dias depois de vencer a Argentina na Bombonera. Até agora, o jogo ", B("não tem transmissão confirmada no Brasil"), "; no Uruguai, passa na AUF TV."),
  comoChegam: [
    "O Uruguai de Diego Forlán ganhou moral na sexta-feira (13): venceu a Argentina por 2 a 1 em Buenos Aires, com gol contra de Leonardo Balerdi e outro de Maximiliano Araújo, de cabeça, os dois em lances que tiveram a participação de Giorgian de Arrascaeta. Depois da eliminação na fase de grupos da Copa de 2026, a Celeste soma três vitórias e uma derrota. Para terça, perde justamente Arrascaeta e o lateral Guillermo Varela, liberados para voltar ao Flamengo, e Joaquín Piquerez, que voltou ao Palmeiras.",
    "A República Dominicana usa a viagem como preparação para a repescagem da Copa Ouro de 2027. O técnico argentino Marcelo Neveleff chamou nomes que jogam na Europa, como o atacante Mariano Díaz, ex-Real Madrid e hoje no Alavés, o meia Heinz Mörschel e o volante Pablo Rosario, do Porto, além do centroavante Dorny Romero, do Bolívar.",
  ],
  cardTitulo: "Uruguai x República Dominicana: a fase", cardSub: "Antes do amistoso",
  cardRows: [
    ["Último jogo do Uruguai", "Argentina 1 x 2 Uruguai, sexta (13/11)"],
    ["Uruguai depois da Copa", "3 vitórias e 1 derrota"],
    ["Último confronto", "Uruguai 1 x 0 República Dominicana, outubro de 2025"],
    ["Objetivo dos dominicanos", "Repescagem da Copa Ouro de 2027"],
  ],
  emJogo: [
    "Forlán deve aproveitar o último jogo do ano para testar. A imprensa uruguaia espera várias mudanças em relação ao time da Bombonera, com chances para quem jogou pouco ou nada na sexta, como José María Giménez, Nicolás de la Cruz e Rodrigo Zalazar. Federico Valverde, que entrou só no segundo tempo contra a Argentina, deve ganhar mais minutos.",
    "As duas seleções se enfrentaram em outubro de 2025, e o Uruguai venceu por 1 a 0. Para os dominicanos, encarar fora de casa uma seleção bicampeã do mundo, mesmo desfalcada, serve de medida para a repescagem da Copa Ouro.",
  ],
  desfalques: [
    P(B("Uruguai: "), "Giorgian de Arrascaeta e Guillermo Varela, do Flamengo, e Joaquín Piquerez, do Palmeiras, foram liberados pela federação uruguaia no sábado (14) e voltaram aos clubes para a reta final do Brasileirão."),
    P(B("República Dominicana: "), "o lateral Júnior Firpo, do Betis, ainda se recupera de lesão sofrida em outubro e não foi convocado. Juan Carlos López e Jimmy Kaparos também ficaram fora da lista por lesão, segundo a federação dominicana."),
  ],
  lineupNote: "Forlán e Neveleff não divulgaram os titulares, e não há escalação provável confiável. Abaixo, a base do último jogo de cada seleção; a lista oficial sai cerca de uma hora antes da bola rolar.",
  provHome: "na vitória sobre a Argentina, Forlán usou Cristopher Fiermarín; Guillermo Varela, Ronald Araújo, Mathías Olivera e Joaquín Piquerez; Agustín Canobbio, Lucas Torreira, Rodrigo Bentancur e Maximiliano Araújo; Giorgian de Arrascaeta; Darwin Núñez. Varela, Piquerez e Arrascaeta não jogam, e outras mudanças são esperadas",
  provAway: "no último jogo, contra a Nicarágua, pela Liga das Nações da Concacaf, Neveleff escalou Xavier Valdez; Jeremy Báez, Edgar Pujol, Luiyi de Lucas e Noah Dollenmayer; Daniel Flores e Jean Carlos López; Peter González, Heinz Mörschel e Juan Familia-Castillo; Juanca Pineda. López está lesionado",
  local: [
    "O Estádio Domingo Burgueño Miguel, conhecido como Campus de Maldonado, fica a cerca de 140 quilômetros de Montevidéu, perto de Punta del Este, e tem capacidade para 27 mil pessoas. A Celeste leva o jogo para o interior do país, longe do Centenário.",
  ],
  links: ["Acompanhe o placar e o lance a lance na ", LK("página de Uruguai x República Dominicana", "/futebol/amistosos/17-11-2026/uruguai-republica-dominicana"), ". Veja também o guia de ", LK("Argentina x Costa Rica", "/onde-assistir/argentina-x-costa-rica-onde-assistir-horario-e-escalacoes"), ", os ", LK("outros guias de onde assistir", "/onde-assistir"), " e os ", LK("jogos de hoje", "/jogos-de-hoje"), "."],
  faqCanal: "Até agora, a partida não tem transmissão confirmada no Brasil. No Uruguai, o jogo passa na AUF TV, às 20h30 de Brasília.",
  faqExtra: [
    ["Arrascaeta joga Uruguai x República Dominicana?", "Não. Arrascaeta e Guillermo Varela foram liberados pela federação uruguaia e voltaram ao Flamengo. Joaquín Piquerez também foi liberado e voltou ao Palmeiras."],
    ["Qual foi o último jogo entre Uruguai e República Dominicana?", "Em outubro de 2025, o Uruguai venceu a República Dominicana por 1 a 0, em amistoso."],
  ],
  excerpt: "Uruguai e República Dominicana jogam às 20h30 desta terça (17/11), em Maldonado, sem Arrascaeta. Veja horário, transmissão, desfalques e escalações.",
  metaDescription: "Saiba onde assistir a Uruguai x República Dominicana nesta terça (17/11), às 20h30, em Maldonado. Sem Arrascaeta, Varela e Piquerez; transmissão e escalações.",
};
export default () => amistosoPost(opts);
