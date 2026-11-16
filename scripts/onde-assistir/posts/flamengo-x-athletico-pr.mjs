// Flamengo x Athletico-PR — Brasileirão Série A, 35ª rodada, quarta 18/11/2026 20h30. Jogo 15238236.
// Autor: Ivan Alves (1). Sportv e Premiere (Máquina do Esporte, Beira do Campo; Premiere também na Coluna do Fla).
// Fontes: Lance (programação, pendurados, departamento médico), Terra, CartaCapital, Furacao.com, Um Dois Esportes,
// Bem Paraná (desfalques do Athletico), VAVEL/Lance/365Scores (escala da CBF), Diário do Rio.
import { B, P } from "../lexical.mjs";
import { watchPostV2, QUA18 } from "../template-v2.mjs";

export const opts = {
  comp: "a", data: QUA18, matchId: 15238236, authorId: 1, A: "Flamengo", Bn: "Athletico-PR", hora: "20h30",
  canal: "Sportv e Premiere", canalLongo: "Sportv (TV fechada) e Premiere (pay-per-view)", canalCapaAlt: "no Sportv e no Premiere",
  competicaoLinha: "Brasileirão Série A 2026, 35ª rodada",
  localCurto: "Maracanã, no Rio de Janeiro (RJ)",
  ondeFrase: "no Estádio Jornalista Mário Filho, o Maracanã, no Rio de Janeiro",
  arbitro: "Rafael Rodrigo Klein (RS); VAR: Caio Max Augusto (GO)",
  // Athletico: Dantas (3º amarelo), Kevin Viveros (expulso contra o Vasco) e Arthur Dias (Seleção) estão fora.
  // Benavídez vai para a zaga no lugar de Dantas, Gilberto assume a ala, Carlos Terán entra na vaga de Arthur Dias
  // e João Cruz ocupa o lugar de Viveros (todos com id de jogos anteriores do Athletico no snapshot).
  swapAway: [
    ["Gastón Benavídez", { name: "Gilberto", number: "12", id: "261687" }],
    ["Dantas", { name: "Gastón Benavídez", number: "29", id: "981452" }],
    ["Arthur Dias", { name: "Carlos Terán", number: "22", id: "974512" }],
    ["Kevin Viveros", { name: "João Cruz", number: "8", id: "1485226" }],
  ],
  lead: P("O ", B("Flamengo"), " recebe o ", B("Athletico-PR"), " nesta quarta-feira (18/11), às ", B("20h30 (de Brasília)"), ", no Maracanã, pela 35ª rodada do ", B("Brasileirão Série A"), ". A transmissão é do ", B("Sportv"), ", na TV fechada, e do ", B("Premiere"), ", no pay-per-view. O líder abre a semana que pode valer o título: três dias depois, visita o Palmeiras em São Paulo."),
  comoChegam: [
    "O Flamengo lidera com 76 pontos, três a mais que o Palmeiras, e chega embalado. São 11 jogos sem perder no Brasileirão, com cinco vitórias seguidas antes da data Fifa: Fluminense (1 a 0), Bahia (3 a 0, em Salvador), Atlético-MG (3 a 2), Vasco (4 a 1, em São Januário) e Grêmio (3 a 1). Como mandante, o time de Leonardo Jardim venceu os últimos oito jogos e perdeu só uma vez em 17. Tem também o melhor ataque do campeonato, com 71 gols.",
    "O Athletico-PR é o 5º colocado, com 54 pontos, mas chega em má fase: são quatro jogos sem vencer, com derrotas para Palmeiras (2 a 0, em casa), Grêmio (2 a 0, em Porto Alegre) e Vasco (3 a 1, em Curitiba) e um empate com o Vitória. A última vitória foi a goleada de 4 a 1 sobre a Chapecoense, em 12 de outubro. Fora de casa, o time de Odair Hellmann soma seis vitórias, quatro empates e sete derrotas.",
  ],
  cardTitulo: "Situação no Brasileirão", cardSub: "Antes da 35ª rodada",
  extraRows: [["Vice-líder", "Palmeiras, 73 pontos (joga com o Cruzeiro no mesmo horário)"], ["1º turno", "Athletico-PR 1 x 1 Flamengo, em Curitiba"]],
  tabela: [1, 6], tabelaTitulo: "Classificação do Brasileirão (1º ao 6º)",
  emJogo: [
    "O Flamengo não pode ser campeão nesta quarta: mesmo com vitória, chega a 79 pontos, e o Palmeiras ainda teria nove em disputa. Mas vencer muda o tamanho do jogo de sábado (21/11), às 16h30, no Nubank Parque. Com 79 pontos, uma vitória sobre o Palmeiras garante o título com duas rodadas de antecedência, qualquer que seja o resultado palmeirense contra o Cruzeiro no Mineirão, porque o Flamengo leva vantagem no primeiro critério de desempate, o número de vitórias. Se o Palmeiras perder em Belo Horizonte, até um empate em São Paulo basta.",
    "Um tropeço no Maracanã abre a porta para o rival. Ainda assim, mesmo em caso de derrota rubro-negra e vitória palmeirense, os dois ficariam com 76 pontos e o Flamengo seguiria na ponta, com 23 vitórias contra 22. O clube busca o nono título brasileiro, o segundo seguido.",
    "Para o Athletico, o que está em jogo é a vaga na Libertadores. O 5º lugar, hoje, leva à fase preliminar do torneio. O Fluminense, 4º, está três pontos acima e enfrenta o São Paulo; o Bahia, 6º, está um ponto atrás e visita o Grêmio. Uma derrota no Rio, combinada com vitória baiana, tira o Furacão do G-5 a três rodadas do fim.",
  ],
  desfalques: [
    P(B("Flamengo: "), "os uruguaios Varela e Arrascaeta foram liberados mais cedo pela seleção e estão à disposição. Alex Sandro, recuperado de um edema na coxa esquerda, voltou a treinar com o grupo; Lucas Paquetá, com uma lesão leve no joelho esquerdo, é dúvida; e Danilo treina com uma máscara de proteção depois de uma cirurgia no maxilar. Oito jogadores estão pendurados e desfalcam o time contra o Palmeiras se levarem amarelo: Léo Pereira, Alex Sandro, Pulgar, Arrascaeta, Pedro, Bruno Henrique, Luiz Araújo e Vitão. Segundo o Lance, Jardim descartou poupar alguém por causa disso."),
    P(B("Athletico-PR: "), "são três baixas certas. O zagueiro Dantas cumpre suspensão pelo terceiro amarelo, recebido nos acréscimos contra o Vasco; o atacante Kevin Viveros foi expulso no mesmo jogo; e o zagueiro Arthur Dias, convocado para os amistosos da Seleção Brasileira, não volta a tempo. Steven Mendoza, que marcou o gol do Athletico na derrota para o Vasco e saiu com dores no joelho, e Lucas Esquivel, que levou uma pancada no quadril, são dúvidas."),
  ],
  provAway: "Mycael; Gastón Benavídez, Juan Felipe Aguirre e Carlos Terán; Gilberto, Jádson, Luiz Gustavo e Lucas Esquivel; Steven Mendoza e Kerwin Vargas; João Cruz. Benavídez e Esquivel são as opções mais citadas para a zaga, e o comandante do ataque sem Viveros ainda está em aberto",
  local: [
    "A CBF escalou o gaúcho Rafael Rodrigo Klein, o mesmo árbitro do 1 a 1 do primeiro turno, em Curitiba. Os assistentes são Guilherme Dias Camilo (MG) e Thiago Augusto Kappes (RS), e o VAR fica com Caio Max Augusto (GO). No mesmo horário, Anderson Daronco apita Cruzeiro x Palmeiras.",
    "O jogo é no Maracanã. Depois dele, o elenco do Flamengo treina na quinta e na sexta no Rio e viaja para São Paulo na sexta à tarde, de onde volta logo depois do clássico de sábado.",
  ],
  faqCanal: "A partida passa no Sportv, na TV fechada, e no Premiere, no pay-per-view, às 20h30 de Brasília. Não há transmissão na TV aberta.",
  faqExtra: [
    ["O Flamengo pode ser campeão contra o Athletico-PR?", "Não nesta rodada. Mesmo vencendo, o Flamengo chega a 79 pontos, e o Palmeiras ainda teria como alcançá-lo. Com a vitória, porém, um triunfo sobre o Palmeiras no sábado (21/11) garante o título."],
    ["Quem desfalca o Athletico-PR no Maracanã?", "O zagueiro Dantas (suspenso pelo terceiro amarelo), o atacante Kevin Viveros (expulso contra o Vasco) e o zagueiro Arthur Dias (convocado para a Seleção). Steven Mendoza e Lucas Esquivel são dúvidas."],
  ],
  excerpt: "Flamengo e Athletico-PR jogam às 20h30 desta quarta (18/11), no Maracanã, pela 35ª rodada do Brasileirão. Veja onde assistir, desfalques e prováveis escalações.",
  metaDescription: "Saiba onde assistir a Flamengo x Athletico-PR nesta quarta (18/11), às 20h30, no Maracanã, pelo Brasileirão. Transmissão de Sportv e Premiere e escalações.",
};
export default (ctx) => watchPostV2(opts, ctx);
