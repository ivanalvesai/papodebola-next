// Vitória x Bragantino — Brasileirão Série A, 35ª rodada, quinta 19/11/2026 19h30. Jogo 15235666.
// Autor: Ivan Alves (1). Premiere (Máquina do Esporte, Portal Mídia Esporte, A Tarde).
// Fontes: A Tarde (Luan Cândido e Laquintana, Brítez, escalações, arbitragem), Bahia Notícias (árbitro,
// Mancini no Vitória, multa da dupla), Correio (chegada de Rafael Lacerda), Futebol Baiano e Sports Mole
// (suspensão de Lucas Barbosa, desfalques do Bragantino), Alô Alô Bahia (treino aberto), Lance/VAVEL (escala da 35ª).
import { B, P } from "../lexical.mjs";
import { watchPostV2, QUI19 } from "../template-v2.mjs";

export const opts = {
  comp: "a", data: QUI19, matchId: 15235666, authorId: 1, A: "Vitória", Bn: "Bragantino", hora: "19h30",
  canal: "Premiere", canalLongo: "Premiere (pay-per-view, exclusivo)", canalCapaAlt: "no Premiere",
  competicaoLinha: "Brasileirão Série A 2026, 35ª rodada",
  localCurto: "Barradão, em Salvador (BA)",
  ondeFrase: "no Estádio Barradão, em Salvador, na Bahia",
  arbitro: "Ramon Abatti Abel (SC); VAR: Pablo Ramon Gonçalves Pinheiro (RN)",
  // Luan Cândido pertence ao Bragantino e não joga por cláusula do empréstimo; Brítez volta de suspensão.
  swapHome: [
    ["Luan Cândido", { name: "Emanuel Brítez", number: "2", id: "789395" }],
  ],
  // Lucas Barbosa cumpre suspensão pelo terceiro amarelo, recebido contra o Santos.
  swapAway: [
    ["Lucas Barbosa", { name: "José Herrera", number: "32", id: "1179171" }],
  ],
  lead: P("O ", B("Vitória"), " recebe o ", B("Bragantino"), " nesta quinta-feira (19/11), às ", B("19h30 (de Brasília)"), ", no Barradão, em Salvador, pela 35ª rodada do ", B("Brasileirão Série A"), ". A transmissão é exclusiva do ", B("Premiere"), ", no pay-per-view. É a estreia do técnico Rafael Lacerda no Vitória, que está um ponto acima da zona de rebaixamento; o Bragantino, oitavo colocado, tenta encostar no pelotão que briga por vaga em torneio sul-americano."),
  comoChegam: [
    "O Vitória chega pressionado. São cinco jogos sem vencer no Brasileirão, com dois empates e três derrotas desde os 4 a 0 sobre a Chapecoense, em 7 de outubro. Nas duas últimas rodadas, o time não marcou: perdeu por 2 a 0 para o Coritiba, em Curitiba, e por 3 a 0 para o Fluminense, no Barradão. Depois disso, a diretoria trocou Jair Ventura por Rafael Lacerda, anunciado em 10 de novembro com contrato até o fim de 2027. Lacerda, de 42 anos, vem da Chapecoense, onde fez 20 jogos, com quatro vitórias, quatro empates e 12 derrotas, e deixou o clube após o rebaixamento. O Barradão é o que segura o Vitória na Série A: dos 38 pontos, 32 foram conquistados em casa (dez vitórias, dois empates e cinco derrotas). Fora de Salvador, o time ainda não venceu em 17 jogos.",
    "O Bragantino de Vagner Mancini vem de duas vitórias seguidas, 3 a 0 sobre a Chapecoense e 2 a 1 sobre o Santos, ambas em Bragança Paulista, e teve mais de duas semanas para preparar a viagem, já que não joga desde 2 de novembro. O problema é o desempenho como visitante: são quatro vitórias, cinco empates e oito derrotas longe de casa, e nos dois últimos jogos fora o time perdeu para o Palmeiras por 2 a 0 e empatou com o Remo por 1 a 1. Mancini volta a um estádio que conhece bem. Ele é o técnico que mais vezes dirigiu o Vitória na história, com 216 jogos e 91 vitórias, em quatro passagens entre 2008 e 2018, segundo levantamento do Bahia Notícias.",
  ],
  cardTitulo: "Situação no Brasileirão", cardSub: "Antes da 35ª rodada",
  extraRows: [["Primeiro na zona", "Corinthians, 37 pontos (17º)"], ["1º turno", "Bragantino 2 x 0 Vitória, em Bragança Paulista"]],
  tabela: [6, 18], tabelaTitulo: "Classificação do Brasileirão (6º ao 18º)",
  emJogo: [
    "Para o Vitória, a conta mudou de tamanho porque a rodada começa na quarta-feira. Corinthians e Grêmio, ambos com 37 pontos, entram em campo um dia antes, contra Botafogo e Bahia. O Vitória tem 38 e fica à frente do Internacional, também com 38, no número de vitórias (10 a 9). Se Corinthians e Grêmio vencerem na quarta, os dois chegam a 40 e o Vitória pode começar o jogo de quinta dentro da zona de rebaixamento. Uma vitória sobre o Bragantino leva o time a 41 pontos e garante que ele termine a rodada fora do Z4, qualquer que seja o resultado dos rivais. Já uma derrota, somada a vitórias de Corinthians e Grêmio, deixaria o Vitória entre os quatro últimos a três rodadas do fim.",
    "O calendário seguinte também é de confronto direto: na segunda-feira (23/11), o Vitória visita o Internacional, em Porto Alegre, pela 36ª rodada. O Inter joga nesta quinta, no mesmo horário, contra o Vasco, no Rio.",
    "O Bragantino não corre risco de rebaixamento e, mesmo vencendo, não passa do 8º lugar nesta rodada. Com 47 pontos, divide o 8º lugar com o Santos, mas leva vantagem no número de vitórias (13 a 12). Está seis pontos atrás do Bahia, sexto, e quatro atrás do Atlético-MG, sétimo, que já fez 35 jogos. No 1º turno, em 17 de maio, o Bragantino venceu por 2 a 0 em casa.",
  ],
  desfalques: [
    P(B("Vitória: "), "o zagueiro Luan Cândido, titular absoluto, e o atacante Nacho Laquintana estão emprestados pelo Bragantino e só poderiam jogar com o pagamento de uma multa, que a diretoria decidiu não pagar. O argentino Emanuel Brítez volta de suspensão e deve formar a dupla de zaga com Cacá. Dudu, Nathan Mendes e Fabiano seguem no departamento médico. No sábado (14/11), o clube abriu os portões do Barradão para um treino gratuito com a torcida, e na terça (17/11) Lacerda trabalhou bolas paradas no penúltimo treino antes do jogo."),
    P(B("Bragantino: "), "o meia Lucas Barbosa recebeu o terceiro cartão amarelo na vitória sobre o Santos e cumpre suspensão automática. Rodriguinho e Davi Gomes estão lesionados. José Herrera é o mais cotado para entrar no meio-campo, e Fernando aparece como alternativa no ataque."),
  ],
  provHome: "Lucas Arcanjo; Mateusinho, Cacá, Emanuel Brítez e Jamerson; Caique Gonçalves, Gabriel Baralhas e Emmanuel Martínez; Erick, Matheuzinho e Renê Sousa (Lacerda ainda não comandou o time em jogo oficial e pode mexer no desenho; a base é a mesma da derrota para o Fluminense, com Brítez no lugar de Luan Cândido)",
  provAway: "Tiago Volpi; Ryan Augusto, Gustavo Marques, Guzmán Rodríguez e Juninho Capixaba; Fabinho e Eric Ramires; Wallace Yan, José Herrera e Henry Mosquera; Eduardo Sasha (Fernando pode começar no lugar de Mosquera, como indicou a escalação provável publicada pelo A Tarde)",
  local: [
    "O árbitro é Ramon Abatti Abel, de Santa Catarina, do quadro da Fifa. Os assistentes são Nailton Júnior de Sousa Oliveira (CE) e Alexandre de Medeiros Lodetti (SC), e o VAR fica com Pablo Ramon Gonçalves Pinheiro (RN). Será o terceiro jogo do Vitória apitado por ele em 2026: os outros dois foram a vitória por 2 a 0 sobre o Remo, na estreia do campeonato, e o empate por 2 a 2 com o Mirassol.",
    "A partida é no Barradão, em Salvador, onde o Vitória fez 23 dos seus 35 gols no Brasileirão. O time tem o segundo pior ataque da Série A, à frente só da Chapecoense.",
  ],
  faqCanal: "A partida tem transmissão exclusiva do Premiere, no pay-per-view, às 19h30 de Brasília. Não passa na TV aberta nem no SporTV.",
  faqExtra: [
    ["O Vitória pode entrar na zona de rebaixamento nesta rodada?", "Pode. Se Corinthians e Grêmio vencerem na quarta-feira (18/11), os dois passam o Vitória. Com uma vitória sobre o Bragantino, o Vitória chega a 41 pontos e termina a rodada fora do Z4 em qualquer cenário."],
    ["Por que Luan Cândido não joga contra o Bragantino?", "O zagueiro está emprestado pelo Bragantino, e o contrato prevê uma multa para que ele enfrente o clube dono do seu vínculo. O Vitória decidiu não pagar. O mesmo vale para o atacante Nacho Laquintana."],
  ],
  excerpt: "Vitória e Bragantino se enfrentam às 19h30 desta quinta-feira (19/11), no Barradão, pela 35ª rodada do Brasileirão. Veja onde assistir, desfalques e prováveis escalações.",
  metaDescription: "Saiba onde assistir a Vitória x Bragantino nesta quinta (19/11), às 19h30, no Barradão, pelo Brasileirão. Transmissão do Premiere, desfalques e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
