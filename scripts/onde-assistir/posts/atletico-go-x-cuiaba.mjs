// Atlético-GO x Cuiabá — Série B, 38ª e última rodada, sábado 14/11/2026 16h30. Jogo 15526387.
// Autor: Ivan Alves (1). ESPN/Disney+ (tabela da CBF). Fontes: O Popular, Mais Goiás, Dragão Goiano,
// Brasil em Folhas, Olhar Direto, escala da CBF. (Sites oficiais dos dois clubes fora do ar na pesquisa.)
import { B, P } from "../lexical.mjs";
import { watchPostV2, SAB14 } from "../template-v2.mjs";

export const opts = {
  comp: "b", data: SAB14, matchId: 15526387, authorId: 1, A: "Atlético-GO", Bn: "Cuiabá", hora: "16h30",
  canal: "ESPN e Disney+", canalLongo: "ESPN (TV fechada) e Disney+ (streaming)", canalCapaAlt: "na ESPN e no Disney+",
  competicaoLinha: "Brasileirão Série B 2026, 38ª e última rodada",
  localCurto: "Estádio Antônio Accioly, em Goiânia (GO)", ondeFrase: "no Estádio Antônio Accioly, em Goiânia, Goiás",
  arbitro: "Bráulio da Silva Machado (SC); VAR: Diego Pombo Lopez (BA)",
  lead: P("O ", B("Atlético-GO"), " recebe o ", B("Cuiabá"), " neste sábado (14/11), às ", B("16h30 (de Brasília)"), ", no Antônio Accioly, ainda com chance de alcançar o playoff de acesso da ", B("Série B"), ". O jogo da última rodada tem transmissão da ", B("ESPN"), " e do ", B("Disney+"), "."),
  comoChegam: [
    "O Atlético-GO é o 8º, com 58 pontos, a mesma pontuação de CRB e Goiás, que ocupam o 6º e o 7º lugares. O Dragão vem de uma virada por 3 a 2 sobre o Athletic, fora de casa, que encerrou uma sequência de cinco jogos sem vencer, com três empates. O técnico Roger Silva volta ao banco depois de cumprir suspensão pela expulsão contra o Fortaleza. \"Vejo semelhança com o Remo de 2025\", disse o atacante João Pedro, lembrando o time paraense que conquistou o acesso na reta final de 2025.",
    "O Cuiabá, 14º com 47 pontos, já está livre do rebaixamento e não tem mais o que buscar. Chega em crise: são seis jogos sem vencer, com cinco derrotas seguidas, e a última, para o Juventude, na despedida da Arena Pantanal na temporada, teve confusão no vestiário durante o intervalo. Depois do episódio, o goleiro titular João Carlos deixou o clube por questões disciplinares. O time é comandado por Eduardo Barros, um dos seis técnicos que não foram trocados na Série B de 2026.",
  ],
  cardTitulo: "Situação na Série B", cardSub: "Antes da 38ª e última rodada",
  extraRows: [["6º lugar", "CRB, 58 pontos (17 vitórias)"], ["7º lugar", "Goiás, 58 pontos (17 vitórias)"]],
  tabela: [3, 10], tabelaTitulo: "Classificação da Série B (3º ao 10º)",
  emJogo: [
    "Pelo regulamento de 2026, 1º e 2º sobem direto e do 3º ao 6º há playoffs de ida e volta (3º x 6º e 4º x 5º), em 21 e 28 de novembro, com uma vaga na Série A em cada confronto. O primeiro critério de desempate é o número de vitórias, e aí o Atlético-GO, com 15, está atrás de CRB e Goiás, que têm 17.",
    "Por isso o Dragão depende dos outros. Ele fica com a 6ª vaga se vencer o Cuiabá e nem o CRB (contra o Ceará) nem o Goiás (contra o Sport) vencerem. Com empate, precisa que os dois rivais percam. Se perder, está fora. Classificado, enfrenta o 3º colocado, Vila Nova ou Juventude.",
  ],
  desfalques: [
    P(B("Atlético-GO: "), "o atacante Bruno José, autor do gol da vitória por 1 a 0 em Cuiabá no 1º turno, está suspenso pelo terceiro amarelo, e o meia-atacante Marrony, com lesão no púbis, tem poucas chances de jogar. Em compensação, o lateral Cristiano, o atacante Gustavo Maia, o volante Leandro Vilela e o meia Guilherme Marques estão recuperados de problemas musculares. Sete jogadores estão pendurados e, em caso de classificação, um terceiro amarelo os tira do jogo de ida do playoff."),
    P(B("Cuiabá: "), "além do goleiro João Carlos, que saiu do clube, não há desfalques divulgados."),
  ],
  labelHome: "Base do último jogo", labelAway: "Base do último jogo",
  lineupNote: "Nenhum dos dois clubes adiantou a escalação. Os campinhos mostram a base do último jogo; no Atlético-GO, Bruno José está suspenso, e no Cuiabá, o gol terá outro dono depois da saída de João Carlos. A lista oficial sai cerca de uma hora antes da bola rolar.",
  local: [
    "A arbitragem é de Bráulio da Silva Machado (SC), com Neuza Inês Back (SP) e Fabrini Bevilacqua Costa (SP) como assistentes. No VAR, Diego Pombo Lopez (BA).",
    "Para lotar o Accioly, o Atlético-GO colocou o primeiro lote a R$ 20 a inteira e R$ 10 a meia, com desconto para quem for com a camisa do clube. A promoção vale até o meio-dia de sábado.",
  ],
  faqCanal: "A partida tem transmissão da ESPN, na TV fechada, e do Disney+, no streaming, às 16h30 de Brasília.",
  faqExtra: [
    ["O Atlético-GO ainda pode ir ao playoff da Série B?", "Sim. Precisa vencer o Cuiabá e torcer para CRB e Goiás não vencerem. Com empate, só se os dois perderem."],
  ],
  excerpt: "Atlético-GO e Cuiabá se enfrentam às 16h30 deste sábado (14/11), no Accioly, na última rodada da Série B. O Dragão ainda sonha com o playoff. Veja onde assistir.",
  metaDescription: "Saiba onde assistir a Atlético-GO x Cuiabá neste sábado (14/11), às 16h30, em Goiânia, pela Série B. Dragão briga pelo playoff; transmissão da ESPN e Disney+.",
};
export default (ctx) => watchPostV2(opts, ctx);
