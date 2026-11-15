// Singapura x Brasil — amistoso, terça 17/11/2026 7h (18h em Singapura), Estádio Nacional de Singapura. Jogo 17551098.
// Autor: Ivan Alves (1).
// Canal: TV Globo, SporTV e ge tv (YouTube), confirmado por 2 fontes:
//   https://maquinadoesporte.com.br/onde-assistir/onde-assistir-aos-amistosos-da-selecao-brasileira-contra-japao-e-singapura/
//   https://rd1.com.br/brasil-x-japao-e-singapura-garantem-transmissao-na-globo-e-ge-tv-nos-dias-14-e-17/
//   (também: antenadosnatvestreaming.com 2026/11, imirante 09/11)
// Árbitro: não divulgado → omitido.
// Desfalques: Raphinha e Ancelotti expulsos contra o Japão, suspensos para terça (CNN Brasil + Metrópoles):
//   https://www.cnnbrasil.com.br/esportes/futebol/selecao-brasileira/ancelotti-e-raphinha-sao-expulsos-e-desfalcam-brasil-contra-singapura/
//   https://www.metropoles.com/esportes/ancelotti-e-raphinha-sao-expulsos-e-estao-fora-de-amistoso-contra-singapura
//   Substituto de Raphinha (Endrick ou Rayan): Metrópoles + tvsimbrasil (sem definição). Quem comanda do banco: não divulgado.
// Japão 3x2 Brasil (API): Kubo e Keito Nakamura, Vini Jr. 2x, Sakamoto nos acréscimos (Al Jazeera, CNN Brasil).
// Singapura: técnico Gavin Lee (ESPN/ASEAN Football), Paraguai 4x1 Singapura em 13/11 (Vavel, SportPlus).
// Escalações: sem prévia confiável para nenhum lado → só texto, sem campinho.
// Link do jogo: o índice de amistosos grava "Singapore" (sem tradução) → URL .../17-11-2026/singapore-brasil.
import { B, P, LK } from "../lexical.mjs";
import { amistosoPost, TER17 } from "../template-amistoso.mjs";

export const opts = {
  data: TER17, matchId: 17551098, authorId: 1, A: "Singapura", Bn: "Brasil", hora: "7h",
  tagsExtra: ["Seleção Brasileira", "Singapura", "Brasil"],
  canal: "TV Globo, SporTV e ge tv", canalLongo: "TV Globo (TV aberta), SporTV (TV fechada) e ge tv (YouTube)", canalCapaAlt: "na Globo, no SporTV e no ge tv",
  competicaoLinha: "Amistoso internacional (Data Fifa de novembro)",
  localCurto: "Estádio Nacional, em Singapura", ondeFrase: "no Estádio Nacional de Singapura, no bairro de Kallang, às 18h no horário local",
  lead: P("A ", B("Seleção Brasileira"), " enfrenta ", B("Singapura"), " nesta terça-feira (17/11), às ", B("7h (de Brasília)"), ", no Estádio Nacional de Singapura, no último jogo do ano. O Brasil não terá Raphinha, suspenso, e Carlo Ancelotti, expulso no sábado, fica fora do banco. O amistoso tem transmissão da ", B("TV Globo"), ", do ", B("SporTV"), " e do ", B("ge tv"), "."),
  comoChegam: [
    "O Brasil chega de uma derrota que deixou marcas. No sábado (14), no mesmo estádio, perdeu para o Japão por 3 a 2: saiu atrás por 2 a 0 antes dos 20 minutos, buscou o empate com dois gols de Vinícius Júnior e levou o terceiro nos acréscimos, num lance em que a seleção pediu falta em João Gomes. Na reclamação, Raphinha, que já tinha sido substituído, e Ancelotti receberam cartão vermelho. Depois da eliminação nas oitavas de final da Copa de 2026, a equipe soma duas vitórias, um empate e uma derrota.",
    "Singapura é a dona da casa e vive um momento histórico: classificou-se para a Copa da Ásia de 2027 sob o comando de Gavin Lee, efetivado no cargo depois da campanha. Na sexta-feira (13), abriu a série de amistosos em Kallang com derrota para o Paraguai por 4 a 1, com gol de Song Ui-young, de cabeça. O capitão é o volante Hariss Harun, um dos dez convocados do Lion City Sailors, o clube mais forte do país.",
  ],
  cardTitulo: "Singapura x Brasil: a fase", cardSub: "Antes do amistoso",
  cardRows: [
    ["Confronto", "Inédito entre as seleções principais"],
    ["Último jogo do Brasil", "Japão 3 x 2 Brasil, sábado (14/11)"],
    ["Brasil depois da Copa", "2 vitórias, 1 empate e 1 derrota"],
    ["Último jogo de Singapura", "Singapura 1 x 4 Paraguai, sexta (13/11)"],
  ],
  emJogo: [
    "É a última chance de Ancelotti observar o grupo em 2026, e a derrota para o Japão aumentou a cobrança por uma atuação convincente. Sem Raphinha, que vinha atuando como falso 9, a comissão técnica avalia Endrick e Rayan para a função. Lateral esquerda e a terceira vaga do meio-campo seguem em disputa entre os jogadores que ganharam chance nesta Data Fifa.",
    "Para Singapura, enfrentar o Brasil pela primeira vez na história é o ponto alto de uma preparação pensada para a Copa da Ásia. Gavin Lee já disse que quer medir o time contra adversários fortes, e o Estádio Nacional deve receber público grande, como no sábado, quando mais de 38 mil pessoas viram Japão x Brasil.",
  ],
  desfalques: [
    P(B("Brasil: "), "Raphinha cumpre suspensão automática pela expulsão contra o Japão, mas segue com a delegação. Carlo Ancelotti, também expulso, não fica à beira do campo; a CBF ainda não informou quem comanda o time no banco."),
  ],
  lineupNote: "Nenhum dos dois técnicos adiantou a escalação, e a imprensa ainda não fechou uma provável para terça. A base abaixo é a que começou a última partida de cada seleção; a lista oficial sai cerca de uma hora antes da bola rolar.",
  provHome: "contra o Paraguai, Gavin Lee começou com Izwan Mahbud; Ryhan Stewart, Safuwan Baharudin, Hariss Harun e Jacob Mahler; Kyoga Nakamura e Shah Shahiran; Harhys Stewart, Farhan Zulkifli e Song Ui-young; Ilhan Fandi",
  provAway: "contra o Japão, o time teve Pedro Morisco; Wesley, Jair, Gabriel Magalhães e Carlos Augusto; Bruno Guimarães, Andrey Santos e André Luiz; Estêvão, Raphinha e Vinícius Júnior. Para terça, Endrick ou Rayan deve ocupar a vaga de Raphinha",
  local: [
    "O Estádio Nacional de Singapura, em Kallang, tem teto retrátil e capacidade para cerca de 55 mil pessoas. O Brasil já jogou ali: em 2014, goleou o Japão por 4 a 0, com quatro gols de Neymar. No sábado, voltou ao estádio e perdeu para os japoneses.",
  ],
  links: ["Acompanhe o placar e o lance a lance na ", LK("página de Singapura x Brasil", "/futebol/selecao-brasileira/17-11-2026/singapore-brasil"), ". Veja também como foi ", LK("Japão x Brasil", "/futebol/selecao-brasileira/14-11-2026/japao-brasil"), ", os ", LK("outros guias de onde assistir", "/onde-assistir"), ", os ", LK("jogos de hoje", "/jogos-de-hoje"), " e a ", LK("página da Seleção Brasileira", "/futebol/selecao-brasileira"), "."],
  faqCanal: "A partida tem transmissão da TV Globo, na TV aberta, do SporTV, na TV fechada, e do ge tv, no YouTube, às 7h de Brasília.",
  faqExtra: [
    ["Raphinha joga contra Singapura?", "Não. Raphinha foi expulso do banco na derrota para o Japão, no sábado (14), e cumpre suspensão automática. Carlo Ancelotti, também expulso, não comanda o time à beira do campo."],
    ["Brasil e Singapura já se enfrentaram?", "Não. É o primeiro jogo entre as seleções principais dos dois países e o último compromisso do Brasil em 2026."],
  ],
  excerpt: "Singapura e Brasil se enfrentam às 7h desta terça (17/11), no último jogo da seleção em 2026, sem Raphinha. Veja onde assistir na Globo, SporTV e ge tv.",
  metaDescription: "Saiba onde assistir a Singapura x Brasil nesta terça (17/11), às 7h, sem Raphinha e Ancelotti no banco. Transmissão da TV Globo, SporTV e ge tv e escalações.",
};
export default () => amistosoPost(opts);
