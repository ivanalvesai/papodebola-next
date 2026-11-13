// Sport x Goiás — Série B, 38ª e última rodada, sábado 14/11/2026 16h30. Jogo 15526389.
// Autor: Lucas Lima (2). ESPN/Disney+ (tabela da CBF). Fontes: sportrecife.com.br (Meu Sport),
// Mais Goiás, Esmeraldino, Diário de Goiás, escala da CBF.
import { B, P } from "../lexical.mjs";
import { watchPostV2, SAB14 } from "../template-v2.mjs";

export const opts = {
  comp: "b", data: SAB14, matchId: 15526389, authorId: 2, A: "Sport", Bn: "Goiás", hora: "16h30",
  canal: "ESPN e Disney+", canalLongo: "ESPN (TV fechada) e Disney+ (streaming)", canalCapaAlt: "na ESPN e no Disney+",
  competicaoLinha: "Brasileirão Série B 2026, 38ª e última rodada",
  localCurto: "Ilha do Retiro, no Recife (PE)", ondeFrase: "na Ilha do Retiro, no Recife, em Pernambuco",
  arbitro: "Anderson Daronco (RS/Fifa); VAR: Heber Roberto Lopes (SC)",
  lead: P("O ", B("Goiás"), " visita o ", B("Sport"), " neste sábado (14/11), às ", B("16h30 (de Brasília)"), ", na Ilha do Retiro, de olho na última vaga do playoff de acesso da ", B("Série B"), ". O jogo da 38ª rodada tem transmissão da ", B("ESPN"), " e do ", B("Disney+"), "."),
  comoChegam: [
    "O Goiás é o time mais embalado da reta final: cinco vitórias e um empate nos últimos seis jogos, incluindo o 2 a 1 sobre o CRB, rival direto pela vaga, e o 1 a 0 sobre a Ponte Preta na rodada passada. Com 58 pontos, é o 7º colocado. O técnico Mozart busca um feito inédito: três acessos seguidos da Série B, depois de subir com o Mirassol em 2024 e com o Coritiba, campeão, em 2025.",
    "O Sport, 10º com 55 pontos, já não tem chance matemática de playoff e faz o último jogo da temporada diante da torcida. Vem de derrota por 3 a 2 para o Operário-PR e de um empate com o Botafogo-SP. A semana foi marcada pela morte da mãe do técnico Mariano Soso, que viajou à Argentina; os treinos foram comandados pelos auxiliares, e a volta dele ao banco para o jogo não estava confirmada. Antes do treino de quinta-feira (12), elenco e funcionários fizeram uma oração em solidariedade ao treinador. No 1º turno, Goiás e Sport empataram por 1 a 1, na Serrinha.",
  ],
  cardTitulo: "Situação na Série B", cardSub: "Antes da 38ª e última rodada",
  extraRows: [["6º lugar", "CRB, 58 pontos (17 vitórias, saldo +6)"], ["8º lugar", "Atlético-GO, 58 pontos (15 vitórias)"]],
  tabela: [3, 10], tabelaTitulo: "Classificação da Série B (3º ao 10º)",
  emJogo: [
    "Pelo regulamento de 2026, 1º e 2º sobem direto e do 3º ao 6º há playoffs de ida e volta (3º x 6º e 4º x 5º), em 21 e 28 de novembro, com uma vaga na Série A em cada confronto. A briga pelo 6º lugar envolve três times com 58 pontos: CRB, Goiás e Atlético-GO. O primeiro critério de desempate é o número de vitórias, e CRB e Goiás têm 17 cada.",
    "O Goiás fica com a vaga se vencer e o CRB não vencer o Ceará, em Maceió. Se os dois vencerem, a decisão vai para o saldo de gols, em que o CRB leva vantagem de oito gols. Com empate, o Goiás precisa de derrota do CRB e de o Atlético-GO não vencer o Cuiabá. Se perder, as chances são praticamente nulas. Classificado, enfrenta o 3º colocado, Vila Nova ou Juventude.",
  ],
  desfalques: [
    P(B("Sport: "), "o zagueiro Marcelo Benevenuto, expulso contra o Operário-PR, cumpre suspensão, e o meia Willian Oliveira segue em recuperação de lesão. O lateral-esquerdo Felipinho voltou a treinar normalmente e está à disposição."),
    P(B("Goiás: "), "o volante Lucas Rodrigues foi cortado da Seleção Sub-20 com um estiramento no joelho e está fora; o zagueiro Ramon Menezes, emprestado pelo Sport, não pode jogar por cláusula contratual. O meia Lucas Lima e o zagueiro Lucas Ribeiro saíram do último jogo com dores musculares: Lucas Lima deve ficar à disposição, com Wellington Rato como alternativa, e Lucas Ribeiro depende de avaliação."),
  ],
  labelHome: "Base do último jogo",
  provHome: "Thiago Couto; Claudinho, Marcelo Benevenuto, Habraão e Rai Lopes; Biel Fonseca e Patrick de Paula; Diego Hernández, Chrystian Barletta e Carlos De Pena; Perotti (base do último jogo; Benevenuto está suspenso)",
  lineupNote: "Os técnicos só confirmam os titulares perto do jogo. No Sport, o campinho mostra a base do último jogo, que terá ao menos uma mudança na zaga; no Goiás, a formação provável a partir do último jogo e das informações da imprensa goiana. A lista oficial sai cerca de uma hora antes da bola rolar.",
  local: [
    "A arbitragem é de Anderson Daronco (RS), do quadro da Fifa, com Alex Sandro Quadros Thome (RR) e Luciane Rodrigues dos Santos (RS) como assistentes. No VAR, Heber Roberto Lopes (SC).",
    "A Ilha do Retiro abre os portões às 14h30. Os ingressos são vendidos pela plataforma oficial do Sport, com biometria facial obrigatória: a arquibancada frontal custa R$ 80 (meia R$ 40) para o público geral, a cadeira central R$ 160 (meia R$ 80) e o setor visitante R$ 100. Crianças até 7 anos e 11 meses não pagam, com resgate do ingresso.",
  ],
  faqCanal: "A partida tem transmissão da ESPN, na TV fechada, e do Disney+, no streaming, às 16h30 de Brasília.",
  faqExtra: [
    ["O que o Goiás precisa para ir ao playoff da Série B?", "Vencer o Sport e torcer para o CRB não vencer o Ceará. Com empate, precisa que o CRB perca e que o Atlético-GO não vença o Cuiabá."],
    ["O Sport ainda tem chance de acesso?", "Não. Com 55 pontos, o Sport chegaria no máximo a 58 e ficaria atrás de CRB e Goiás no número de vitórias, primeiro critério de desempate."],
  ],
  excerpt: "Sport e Goiás se enfrentam às 16h30 deste sábado (14/11), na Ilha do Retiro, na última rodada da Série B. O Goiás briga pelo playoff. Veja onde assistir e as escalações.",
  metaDescription: "Saiba onde assistir a Sport x Goiás neste sábado (14/11), às 16h30, na Ilha do Retiro, pela Série B. Goiás briga pelo playoff; transmissão da ESPN e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
