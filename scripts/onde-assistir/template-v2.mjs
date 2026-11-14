// Modelo v2 dos posts "onde assistir" (desde 14/11/2026): mesma estrutura do template.mjs,
// mas serve para seleções (Liga das Nações) e clubes (Brasileirão Série A/B), com data,
// rodada e recorte da tabela vindos do arquivo do post. O TEXTO de cada jogo continua único,
// escrito jogo a jogo em posts/*.mjs.
import { B, P, H, LIST, LK, RT, FAQ, MATCH_INFO, STAT_CARD, LINEUP, STANDINGS_TABLE, slugify } from "./lexical.mjs";

export const COMPS = {
  nl: { hub: "/futebol/futebol-internacional/liga-das-nacoes", nome: "Liga das Nações", tabela: "a tabela completa da Liga das Nações", time: "Seleção", clubes: false },
  a: { hub: "/futebol/brasileirao-serie-a", nome: "Brasileirão Série A", tabela: "a classificação completa do Brasileirão Série A", time: "Time", clubes: true },
  b: { hub: "/futebol/brasileirao-serie-b", nome: "Brasileirão Série B", tabela: "a classificação completa da Série B", time: "Time", clubes: true },
};

// o.data = { slug: "14-11-2026", longa: "sábado, 14 de novembro", frase: "Neste sábado, 14 de novembro de 2026" }
export function watchPostV2(o, { facts, lineups }) {
  const C = COMPS[o.comp];
  const { A, Bn, hora, canal, canalLongo } = o;
  const JOGO = `${C.hub}/jogo/${o.data.slug}/${slugify(facts.home)}-${slugify(facts.away)}`;
  const rowOf = (apiName) => facts.table.find((r) => r.team === apiName);
  const ordinal = (r) => `${r.pos}º lugar, ${r.pts} ${r.pts === 1 ? "ponto" : "pontos"}${C.clubes ? `, ${r.wins} vitórias` : ""}, saldo ${r.gd > 0 ? "+" : ""}${r.gd}`;
  const rows = o.tabela ? facts.table.filter((r) => r.pos >= o.tabela[0] && r.pos <= o.tabela[1]) : facts.table;
  const lineupNote = o.lineupNote || (C.clubes
    ? "Os técnicos só confirmam os titulares perto do jogo. Os campinhos abaixo mostram a escalação provável, a partir da última formação usada por cada time e das informações de desfalques da semana; a lista oficial sai cerca de uma hora antes da bola rolar."
    : "As seleções ainda não divulgaram os titulares. Os campinhos abaixo mostram a escalação provável de cada lado; a lista oficial costuma sair cerca de uma hora antes da bola rolar.");

  const content = RT(
    o.lead,
    LIST([
      [B("Horário: "), `${hora} (de Brasília), ${o.data.longa}`],
      [B("Local: "), o.localCurto],
      [B("Onde assistir: "), canalLongo],
      [B("Competição: "), o.competicaoLinha],
      ...(o.arbitro ? [[B("Arbitragem: "), o.arbitro]] : []),
    ]),
    H("h2", "Ficha do jogo"),
    MATCH_INFO(canal, o.canalConfirmado !== false),
    H("h2", `Como chegam ${A} e ${Bn}`),
    ...o.comoChegam.map((t) => (typeof t === "string" ? P(t) : t)),
    STAT_CARD(o.cardTitulo, o.cardSub, [
      [A, ordinal(rowOf(facts.home))],
      [Bn, ordinal(rowOf(facts.away))],
      ...o.extraRows,
    ]),
    H("h3", o.tabelaTitulo),
    STANDINGS_TABLE(rows, C.time),
    H("h2", "O que está em jogo"),
    ...o.emJogo.map((t) => (typeof t === "string" ? P(t) : t)),
    ...(o.desfalques?.length ? [H("h2", "Desfalques e novidades"), ...o.desfalques.map((t) => (typeof t === "string" ? P(t) : t))] : []),
    H("h2", "Escalações prováveis"),
    P(lineupNote),
    LINEUP(A, lineups.home, o.labelHome || "Provável"),
    LINEUP(Bn, lineups.away, o.labelAway || "Provável"),
    P(B(`${A} (${lineups.home.formation}): `), o.provHome || lineups.home.starters.map((p) => p.name).join(", "), "."),
    P(B(`${Bn} (${lineups.away.formation}): `), o.provAway || lineups.away.starters.map((p) => p.name).join(", "), "."),
    H("h2", o.arbitro ? "Arbitragem e local" : "Local da partida"),
    ...o.local.map((t) => (typeof t === "string" ? P(t) : t)),
    P("Acompanhe o placar e o lance a lance na ", LK(`página de ${A} x ${Bn}`, JOGO), ". Veja também os ", LK("outros guias de onde assistir", "/onde-assistir"), ", os ", LK("jogos de hoje ao vivo", "/ao-vivo"), " e ", LK(C.tabela, C.hub), "."),
    FAQ([
      [`Onde vai passar ${A} x ${Bn}?`, o.faqCanal],
      [`Que horas é ${A} x ${Bn}?`, `${o.data.frase}, às ${hora} (horário de Brasília).`],
      [`Onde é o jogo entre ${A} e ${Bn}?`, `A partida é ${o.ondeFrase}.`],
      ...o.faqExtra,
    ]),
  );

  const slug = `${slugify(A)}-x-${slugify(Bn)}-onde-assistir-horario-e-escalacoes`;
  const title = o.title || `${A} x ${Bn}: onde assistir, horário e escalações`;
  return {
    slug,
    coverFile: `capa-${slugify(A)}-x-${slugify(Bn)}.png`,
    coverAlt: `${A} x ${Bn}: onde assistir, horário e escalações. ${C.clubes ? "Escudos dos dois times" : "Bandeiras das duas seleções"}; ${o.data.curta}, às ${hora}, ${o.canalCapaAlt}`,
    data: {
      title,
      category: "Onde Assistir",
      tags: ["Onde assistir", C.nome, A, Bn].map((tag) => ({ tag })),
      matchId: o.matchId,
      excerpt: o.excerpt,
      content,
      author: o.authorId === 1 ? "Ivan Alves" : "Lucas Lima",
      authorProfile: o.authorId,
      seo: { metaTitle: title, metaDescription: o.metaDescription },
    },
  };
}

// Atalhos de data
export const SAB14 = { slug: "14-11-2026", longa: "sábado, 14 de novembro", curta: "sábado, 14/11", frase: "Neste sábado, 14 de novembro de 2026" };
export const DOM15 = { slug: "15-11-2026", longa: "domingo, 15 de novembro", curta: "domingo, 15/11", frase: "Neste domingo, 15 de novembro de 2026" };
export const SEG16 = { slug: "16-11-2026", longa: "segunda-feira, 16 de novembro", curta: "segunda, 16/11", frase: "Nesta segunda-feira, 16 de novembro de 2026" };
