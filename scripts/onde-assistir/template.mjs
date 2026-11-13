// Modelo dos posts "onde assistir" da Liga das Nações: a ESTRUTURA é comum (lead, resumo,
// Ficha do jogo, como chegam, card + tabela do grupo, o que está em jogo, campinhos, local,
// FAQ); o TEXTO de cada jogo vem do arquivo do post (único, escrito jogo a jogo).
import { B, P, H, LIST, LK, RT, FAQ, MATCH_INFO, STAT_CARD, LINEUP, STANDINGS_TABLE, slugify } from "./lexical.mjs";

const HUB = "/futebol/futebol-internacional/liga-das-nacoes";

export function watchPost(o, { match, group }) {
  const { A, Bn, hora, canal, canalLongo, competicao } = o;
  const JOGO = `${HUB}/jogo/13-11-2026/${slugify(A)}-${slugify(Bn)}`;
  const ordinal = (r) => `${r.pos}º lugar, ${r.pts} ${r.pts === 1 ? "ponto" : "pontos"}, saldo ${r.gd > 0 ? "+" : ""}${r.gd}`;
  const rowOf = (name) => group.find((r) => r.team === name);

  const content = RT(
    o.lead,
    LIST([
      [B("Horário: "), `${hora} (de Brasília), sexta-feira, 13 de novembro`],
      [B("Local: "), o.localCurto],
      [B("Onde assistir: "), canalLongo],
      [B("Competição: "), `Liga das Nações 2026/27, ${competicao}, 5ª rodada`],
      ...(o.arbitro ? [[B("Arbitragem: "), o.arbitro]] : []),
    ]),
    H("h2", "Ficha do jogo"),
    MATCH_INFO(canal),
    H("h2", `Como chegam ${A} e ${Bn}`),
    ...o.comoChegam.map((t) => P(t)),
    STAT_CARD(`Situação no ${o.grupoNome}`, "Antes da 5ª rodada", [
      [A, ordinal(rowOf(A))],
      [Bn, ordinal(rowOf(Bn))],
      ...o.extraRows,
    ]),
    H("h3", `Classificação do ${o.grupoNome}`),
    STANDINGS_TABLE(group),
    H("h2", "O que está em jogo"),
    ...o.emJogo.map((t) => P(t)),
    H("h2", "Escalações prováveis"),
    P("As seleções ainda não divulgaram os titulares. Os campinhos abaixo mostram a escalação provável de cada lado; a lista oficial costuma sair cerca de uma hora antes da bola rolar."),
    LINEUP(A, match.home),
    LINEUP(Bn, match.away),
    P(B(`${A} (${match.home.formation}): `), match.home.starters.map((p) => p.name).join(", "), "."),
    P(B(`${Bn} (${match.away.formation}): `), match.away.starters.map((p) => p.name).join(", "), "."),
    H("h2", o.arbitro ? "Arbitragem e local" : "Local da partida"),
    ...o.local.map((t) => P(t)),
    P("Acompanhe o placar e o lance a lance na ", LK(`página de ${A} x ${Bn}`, JOGO), ". Veja também os ", LK("outros jogos de hoje e onde assistir", "/onde-assistir"), " e a ", LK("tabela completa da Liga das Nações", HUB), "."),
    FAQ([
      [`Onde vai passar ${A} x ${Bn}?`, o.faqCanal],
      [`Que horas é ${A} x ${Bn}?`, `Nesta sexta-feira, 13 de novembro de 2026, às ${hora} (horário de Brasília).`],
      [`Onde é o jogo entre ${A} e ${Bn}?`, `A partida é ${o.ondeFrase}.`],
      ...o.faqExtra,
    ]),
  );

  const slug = `${slugify(A)}-x-${slugify(Bn)}-onde-assistir-horario-e-escalacoes`;
  const title = `${A} x ${Bn}: onde assistir, horário e escalações`;
  return {
    slug,
    coverFile: `capa-${slugify(A)}-x-${slugify(Bn)}.png`,
    coverAlt: `${A} x ${Bn}: onde assistir, horário e escalações. Bandeiras das duas seleções; sexta, 13/11, às ${hora}, ${o.canalCapaAlt}`,
    data: {
      title,
      category: "Onde Assistir",
      tags: ["Onde assistir", "Liga das Nações", A, Bn].map((tag) => ({ tag })),
      matchId: o.matchId,
      excerpt: o.excerpt,
      content,
      author: o.authorId === 1 ? "Ivan Alves" : "Lucas Lima",
      authorProfile: o.authorId,
      seo: { metaTitle: title, metaDescription: o.metaDescription },
    },
  };
}
