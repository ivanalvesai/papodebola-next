// Croácia x Tchéquia — Liga das Nações, Liga A · Grupo 3, 6ª rodada, domingo 15/11/2026 16h45. Jogo 15534089.
// Autor: Ivan Alves (1). Disney+ = FONTE ÚNICA (Mantos do Futebol) → canalConfirmado:false. Árbitro: Luís Godinho (tportal.hr).
// XI: Mišić -> Modrić (Bilić o poupou em Wembley pensando neste jogo); Ambros -> Souček (tiscali.cz). Krejčí suspenso.
import { B, P } from "../lexical.mjs";
import { watchPostV2, DOM15 } from "../template-v2.mjs";

export const opts = {
  comp: "nl", data: DOM15, matchId: 15534089, authorId: 1, A: "Croácia", Bn: "Tchéquia", hora: "16h45",
  canal: "Disney+", canalConfirmado: false, canalLongo: "Disney+ (streaming), segundo a programação; confirme perto do jogo", canalCapaAlt: "no Disney+",
  competicaoLinha: "Liga das Nações 2026/27, Liga A, Grupo 3, 6ª e última rodada",
  localCurto: "Opus Arena, em Osijek (Croácia)", ondeFrase: "na Opus Arena, em Osijek, na Croácia",
  arbitro: "Luís Godinho (Portugal); VAR: Tiago Martins",
  swapHome: [["Josip Mišić", { name: "Luka Modrić", number: "", id: "" }]],
  swapAway: [["Lukáš Ambros", { name: "Tomáš Souček", number: "", id: "" }]],
  lead: P("A ", B("Croácia"), " recebe a ", B("Tchéquia"), " neste domingo (15/11), às ", B("16h45 (de Brasília)"), ", em Osijek, num duelo pelo 3º lugar do Grupo 3 da ", B("Liga das Nações"), ". Luka Modrić pode igualar Lionel Messi em número de jogos por seleção. A programação indica transmissão do ", B("Disney+"), "."),
  comoChegam: [
    "A Croácia de Slaven Bilić vem de quatro derrotas seguidas na competição, a última por 2 a 1 para a Inglaterra em Wembley, na quinta-feira (12), com gol de Petar Sučić. Bilić deixou Modrić no banco em Londres e explicou: \"Não o escalei de início porque temos pela frente o jogo contra a República Tcheca, que é extremamente importante\". Aos 41 anos, o meia chegou a 207 jogos pela seleção. Ivan Perišić, que cumpriu suspensão em Wembley, também volta.",
    "A Tchéquia do espanhol Santi Denia é a única seleção da chave sem pontos e marcou só 2 gols em cinco jogos. Na quinta, perdeu para a Espanha por 2 a 0 em Praga e ficou sem o capitão Ladislav Krejčí, expulso após revisão do VAR, o segundo vermelho dele em cinco jogos com Denia. O técnico trata o domingo como decisão: \"Vamos nos preparar como se fosse uma final de Copa do Mundo\". O volante Tomáš Souček voltou de lesão.",
  ],
  cardTitulo: "Situação no Grupo 3 da Liga A", cardSub: "Antes da 6ª e última rodada",
  extraRows: [["Espanha e Inglaterra", "já classificadas às quartas"], ["Croácia", "fica em 3º com empate ou vitória"], ["Tchéquia", "fica em 3º com qualquer vitória"]],
  tabelaTitulo: "Classificação do Grupo 3 da Liga A",
  emJogo: [
    "Espanha e Inglaterra já ficaram com as vagas nas quartas. Croácia (3 pontos) e Tchéquia (0) brigam pelo 3º lugar. A Croácia garante a posição com um empate. A Tchéquia precisa vencer, e qualquer vitória serve: no 1º turno, a Croácia ganhou por 2 a 1 em Praga; com vitória tcheca por um gol, o confronto direto empata e o desempate vai para o saldo geral, em que a Tchéquia leva vantagem.",
    "O 3º lugar não garante a permanência na Liga A. Os dois melhores terceiros colocados ficam, e nesse ranking só contam os jogos contra 1º e 2º do grupo. Como os dois perderam todas para Espanha e Inglaterra, quem terminar em 3º deve ir ao play-off de março contra um 2º colocado da Liga B. O 4º colocado depende dos outros grupos: os dois melhores 4º também vão ao play-off, e os dois piores caem direto.",
  ],
  desfalques: [
    P(B("Tchéquia: "), "o capitão Ladislav Krejčí, expulso contra a Espanha, cumpre suspensão."),
    P(B("Croácia: "), "não há suspensos. Seis jogadores estão pendurados, entre eles Modrić, Kovačić e Sučić."),
  ],
  local: [
    "O português Luís Godinho apita a partida, com Pedro Martins e Gonçalo Freire como assistentes e Tiago Martins no VAR.",
    "A Opus Arena, em Osijek, é o estádio mais novo do país, inaugurado em 2023. A bola rola às 20h45 no horário local.",
  ],
  faqCanal: "A programação indica transmissão do Disney+, no streaming, às 16h45 de Brasília. Como só um guia confirmou o canal até agora, vale conferir perto do jogo.",
  faqExtra: [
    ["Modrić pode igualar Messi em Croácia x Tchéquia?", "Sim. Modrić tem 207 jogos pela Croácia; se entrar em campo, chega a 208, a mesma marca de Lionel Messi pela Argentina."],
    ["Quanto foi o primeiro jogo entre Croácia e Tchéquia nesta Liga das Nações?", "A Croácia venceu por 2 a 1, em Praga, em 26 de setembro, com gols de Modrić e Marco Pašalić."],
  ],
  excerpt: "Croácia e Tchéquia brigam pelo 3º lugar do Grupo 3 da Liga das Nações neste domingo (15/11), às 16h45, em Osijek. Veja onde assistir e as escalações.",
  metaDescription: "Saiba onde assistir a Croácia x Tchéquia neste domingo (15/11), às 16h45, em Osijek, pela Liga das Nações. Transmissão, cenários e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
