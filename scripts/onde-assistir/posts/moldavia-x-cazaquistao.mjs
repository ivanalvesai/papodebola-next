// Post "onde assistir" — Moldávia x Cazaquistão (Liga das Nações, Liga C · Grupo 3, 5ª rodada, 13/11/2026 14h).
// Dados: snapshot do jogo 15534197 (estádio, escalações prováveis) e da tabela (liga-das-nacoes.json).
// Árbitro não veio na API → a seção não aparece (nada inventado).
import { B, P, H, LIST, LK, RT, FAQ, MATCH_INFO, STAT_CARD, LINEUP, STANDINGS_TABLE } from "../lexical.mjs";

export default function build({ match, group }) {
  const HUB = "/futebol/futebol-internacional/liga-das-nacoes";
  const JOGO = `${HUB}/jogo/13-11-2026/moldavia-cazaquistao`;
  const A = "Moldávia", Bn = "Cazaquistão";

  const content = RT(
    P(A, " e ", Bn, " abrem a sexta-feira (13/11) da ", B("Liga das Nações"), " às ", B("14h (de Brasília)"), ", no Estádio Zimbru, em Chisinau. O jogo vale pela 5ª e penúltima rodada do Grupo 3 da Liga C e tem transmissão da ", B("ESPN 4"), ", na TV fechada, e do ", B("Disney+"), ", no streaming."),
    LIST([
      [B("Horário: "), "14h (de Brasília), sexta-feira, 13 de novembro"],
      [B("Local: "), "Estádio Zimbru, em Chisinau (Moldávia)"],
      [B("Onde assistir: "), "ESPN 4 (TV fechada) e Disney+ (streaming)"],
      [B("Competição: "), "Liga das Nações 2026/27, Liga C, Grupo 3, 5ª rodada"],
    ]),
    H("h2", "Ficha do jogo"),
    MATCH_INFO("ESPN 4 e Disney+"),
    H("h2", `Como chegam ${A} e ${Bn}`),
    P("A Moldávia soma 4 pontos em quatro jogos, com uma vitória, um empate e duas derrotas. O saldo de gols (3 marcados e 8 sofridos) pesa por causa dos dois tropeços contra a líder Eslováquia: 2 a 0 fora e 4 a 0 em casa, na rodada passada. Contra os rivais diretos, porém, o time foi bem. Empatou com as Ilhas Faroé por 1 a 1 em Chisinau e venceu o próprio Cazaquistão por 2 a 1, como visitante, na 3ª rodada."),
    P("O Cazaquistão ainda não venceu nesta edição. Foram dois empates com as Ilhas Faroé (1 a 1 fora e 2 a 2 em casa) e duas derrotas por 2 a 1, para Eslováquia e Moldávia. Com 2 pontos, é o lanterna do grupo. O ataque até produziu mais que o do adversário desta sexta (5 gols contra 3), mas a defesa já sofreu 7."),
    STAT_CARD("Situação no Grupo 3 da Liga C", "Antes da 5ª rodada", [
      ["Moldávia", "3º lugar, 4 pontos, saldo -5"],
      ["Cazaquistão", "4º lugar, 2 pontos, saldo -2"],
      ["Vaga no playoff de acesso (2º)", "Ilhas Faroé, 4 pontos, saldo 0"],
      ["Líder", "Eslováquia, 10 pontos"],
    ]),
    H("h3", "Classificação do Grupo 3 da Liga C"),
    STANDINGS_TABLE(group),
    H("h2", "O que está em jogo"),
    P("O 2º lugar do grupo dá vaga no playoff de acesso à Liga B. Hoje ele é das Ilhas Faroé, que têm os mesmos 4 pontos da Moldávia, mas saldo bem melhor (0 contra -5). As duas jogam no mesmo dia: às 16h45, os faroenses visitam a líder Eslováquia. Se vencer às 14h, a Moldávia chega a 7 pontos, assume o 2º lugar provisoriamente e transfere a pressão para os rivais."),
    P("Para o Cazaquistão, é a chance de deixar a lanterna. Uma vitória leva o time a 5 pontos, à frente da Moldávia, e mantém viva a briga pelo playoff na última rodada, quando recebe a Eslováquia. A Moldávia fecha a fase visitando as Ilhas Faroé, no que pode virar um confronto direto pela vaga."),
    H("h2", "Escalações prováveis"),
    P("As seleções ainda não divulgaram os titulares. Os campinhos abaixo mostram a escalação provável de cada lado; a lista oficial costuma sair cerca de uma hora antes da bola rolar."),
    LINEUP(A, match.home),
    LINEUP(Bn, match.away),
    P(B(`${A} (${match.home.formation}): `), match.home.starters.map((p) => p.name).join(", "), "."),
    P(B(`${Bn} (${match.away.formation}): `), match.away.starters.map((p) => p.name).join(", "), "."),
    H("h2", "Local da partida"),
    P("O jogo é no Estádio Zimbru, em Chisinau, a capital da Moldávia. É a casa da seleção moldava, que ali empatou com as Ilhas Faroé e perdeu para a Eslováquia nesta Liga das Nações."),
    P("Acompanhe o placar e o lance a lance na ", LK("página de Moldávia x Cazaquistão", JOGO), ". Veja também os ", LK("outros jogos de hoje e onde assistir", "/onde-assistir"), " e a ", LK("tabela completa da Liga das Nações", HUB), "."),
    FAQ([
      ["Onde vai passar Moldávia x Cazaquistão?", "A partida tem transmissão da ESPN 4, na TV fechada, e do Disney+, no streaming."],
      ["Que horas é Moldávia x Cazaquistão?", "Nesta sexta-feira, 13 de novembro de 2026, às 14h (horário de Brasília)."],
      ["Onde é o jogo entre Moldávia e Cazaquistão?", "No Estádio Zimbru, em Chisinau, na Moldávia."],
      ["Como está o Grupo 3 da Liga C da Liga das Nações?", "Antes da 5ª rodada: Eslováquia com 10 pontos, Ilhas Faroé com 4, Moldávia com 4 e Cazaquistão com 2. O 2º colocado vai ao playoff de acesso à Liga B."],
    ]),
  );

  return {
    slug: "moldavia-x-cazaquistao-onde-assistir-horario-e-escalacoes",
    coverFile: "capa-moldavia-x-cazaquistao.png",
    coverAlt: "Moldávia x Cazaquistão: onde assistir, horário e escalações. Bandeiras das duas seleções; sexta, 13/11, às 14h, na ESPN 4 e no Disney+",
    data: {
      title: "Moldávia x Cazaquistão: onde assistir, horário e escalações",
      category: "Onde Assistir",
      tags: ["Onde assistir", "Liga das Nações", A, Bn].map((tag) => ({ tag })),
      matchId: 15534197,
      excerpt: "Moldávia e Cazaquistão jogam às 14h desta sexta (13/11), em Chisinau, pela Liga das Nações. Veja onde assistir, as prováveis escalações e a situação do Grupo 3 da Liga C.",
      content,
      author: "Ivan Alves",
      authorProfile: 1,
      seo: {
        metaTitle: "Moldávia x Cazaquistão: onde assistir, horário e escalações",
        metaDescription: "Saiba onde assistir a Moldávia x Cazaquistão pela Liga das Nações nesta sexta (13/11), às 14h, no Estádio Zimbru. Veja canal, prováveis escalações e a tabela do grupo.",
      },
    },
  };
}
