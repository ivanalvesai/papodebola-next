// Modelo dos guias "onde assistir" de AMISTOSOS (seleção principal, sub-20, outras seleções).
// Sem tabela de classificação: o card mostra a fase de cada lado (últimos resultados) e o
// texto traz o contexto. Escalação: campinho só do lado com escalação provável confiável.
// Uso: node scripts/onde-assistir/build-amistoso.mjs <post> <out.json>
import { B, P, H, LIST, LK, RT, FAQ, MATCH_INFO, STAT_CARD, LINEUP, slugify } from "./lexical.mjs";

const txt = (t) => (typeof t === "string" ? P(t) : t);

export function amistosoPost(o) {
  const { A, Bn, hora, canal, canalLongo } = o;
  const lineups = [];
  if (o.lineupHome) lineups.push(LINEUP(A, o.lineupHome, o.labelHome || "Provável"));
  if (o.lineupAway) lineups.push(LINEUP(Bn, o.lineupAway, o.labelAway || "Provável"));
  const names = (s) => s.starters.map((p) => p.name).join(", ");

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
    ...o.comoChegam.map(txt),
    STAT_CARD(o.cardTitulo, o.cardSub, o.cardRows),
    H("h2", o.contextoTitulo || "O que está em jogo"),
    ...o.emJogo.map(txt),
    ...(o.desfalques?.length ? [H("h2", "Desfalques e novidades"), ...o.desfalques.map(txt)] : []),
    H("h2", "Escalações prováveis"),
    P(o.lineupNote),
    ...lineups,
    ...(o.lineupHome ? [P(B(`${A} (${o.lineupHome.formation}): `), o.provHome || names(o.lineupHome), ".")] : o.provHome ? [P(B(`${A}: `), o.provHome, ".")] : []),
    ...(o.lineupAway ? [P(B(`${Bn} (${o.lineupAway.formation}): `), o.provAway || names(o.lineupAway), ".")] : o.provAway ? [P(B(`${Bn}: `), o.provAway, ".")] : []),
    ...(o.extraSecoes || []).flatMap(([titulo, paras]) => [H("h2", titulo), ...paras.map(txt)]),
    H("h2", o.arbitro ? "Arbitragem e local" : "Local da partida"),
    ...o.local.map(txt),
    P(...o.links),
    FAQ([
      [`Onde vai passar ${A} x ${Bn}?`, o.faqCanal],
      [`Que horas é ${A} x ${Bn}?`, `${o.data.frase}, às ${hora} (horário de Brasília).`],
      [`Onde é o jogo entre ${A} e ${Bn}?`, `A partida é ${o.ondeFrase}.`],
      ...o.faqExtra,
    ]),
  );

  const base = o.slugBase || `${slugify(A)}-x-${slugify(Bn)}`;
  const title = o.title || `${A} x ${Bn}: onde assistir, horário e escalações`;
  return {
    slug: `${base}-onde-assistir-horario-e-escalacoes`,
    coverFile: `capa-${base}.png`,
    coverAlt: `${title}. Bandeiras das duas seleções; ${o.data.curta}, às ${hora}, ${o.canalCapaAlt}`,
    data: {
      title,
      category: "Onde Assistir",
      tags: ["Onde assistir", "Amistosos", ...o.tagsExtra].map((tag) => ({ tag })),
      matchId: o.matchId,
      excerpt: o.excerpt,
      content,
      author: o.authorId === 1 ? "Ivan Alves" : "Lucas Lima",
      authorProfile: o.authorId,
      seo: { metaTitle: title, metaDescription: o.metaDescription },
    },
  };
}

export const SEX13 = { slug: "13-11-2026", longa: "sexta-feira, 13 de novembro", curta: "sexta, 13/11", frase: "Nesta sexta-feira, 13 de novembro de 2026" };
export const SAB14 = { slug: "14-11-2026", longa: "sábado, 14 de novembro", curta: "sábado, 14/11", frase: "Neste sábado, 14 de novembro de 2026" };

// Monta {formation, starters} a partir de "Nome#num@id; ..." (ordem goleiro → ataque).
export const XI = (formation, list) => ({
  formation,
  starters: list.split(";").map((s) => s.trim()).filter(Boolean).map((s) => {
    const [nameNum, id = ""] = s.split("@");
    const [name, number = ""] = nameNum.split("#");
    return { name: name.trim(), number, id };
  }),
});
