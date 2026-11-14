// Modelo dos guias "onde assistir" de ligas americanas (NBA, NFL). Sem escalação (não há
// fonte confiável de quinteto/titulares antes do jogo): lead, lista rápida, Ficha do jogo,
// como chegam, card da campanha, tabela da conferência/divisão, o que está em jogo,
// como assistir, links e FAQ. Números (campanha, resultados) saem da API (facts).
// Uso: node scripts/onde-assistir/build-us.mjs <out-dir>
import { B, P, H, LIST, LK, RT, FAQ, MATCH_INFO, STAT_CARD, TABLE, slugify } from "./lexical.mjs";

const txt = (t) => (typeof t === "string" ? P(t) : t);

export const LIGAS = {
  nba: {
    tag: "NBA", hub: "/nba", hubNome: "página da NBA", seal: "NBA · ONDE ASSISTIR",
    competicao: "NBA, temporada regular 2026/27",
    tabelaHead: ["Pos.", "Time", "V", "D", "Aprov."],
    row: (r) => [`${r.pos}º`, r.team, String(r.w), String(r.l), `${Math.round(r.pct * 1000) / 10}%`.replace(".", ",")],
  },
  nfl: {
    tag: "NFL", hub: "/futebol-americano", hubNome: "página de futebol americano", seal: "NFL · ONDE ASSISTIR",
    competicao: "NFL, temporada regular 2026 (semana 10)",
    tabelaHead: ["Pos.", "Time", "V", "D", "Pontos pró", "Pontos contra"],
    row: (r) => [`${r.pos}º`, r.team, String(r.w), String(r.l), String(r.pf), String(r.pa)],
  },
};

export function usPost(o) {
  const L = LIGAS[o.liga];
  const { A, Bn, hora, canal, canalLongo } = o;
  const content = RT(
    o.lead,
    LIST([
      [B("Horário: "), `${hora} (de Brasília), ${o.data.longa}`],
      [B("Local: "), o.localCurto],
      [B("Onde assistir: "), canalLongo],
      [B("Competição: "), L.competicao],
    ]),
    H("h2", "Ficha do jogo"),
    MATCH_INFO(canal, true),
    H("h2", `Como chegam ${A} e ${Bn}`),
    ...o.comoChegam.map(txt),
    STAT_CARD(`${A} x ${Bn}: a campanha`, "Antes do jogo", o.cardRows),
    H("h2", o.tabelaTitulo),
    TABLE(L.tabelaHead, o.tabela.map(L.row)),
    ...(o.tabelaNota ? [P(o.tabelaNota)] : []),
    H("h2", "O que está em jogo"),
    ...o.emJogo.map(txt),
    H("h2", `Como assistir a ${A} x ${Bn} ao vivo`),
    ...o.comoAssistir.map(txt),
    P(...o.links),
    FAQ([
      [`Onde vai passar ${A} x ${Bn}?`, o.faqCanal],
      [`Que horas é ${A} x ${Bn}?`, `${o.data.frase}, às ${hora} (horário de Brasília).`],
      [`Onde é o jogo entre ${A} e ${Bn}?`, `A partida é ${o.ondeFrase}.`],
      ...(o.faqExtra || []),
    ]),
  );

  const base = `${slugify(A)}-x-${slugify(Bn)}`;
  const title = o.title || `${A} x ${Bn}: onde assistir e horário ${o.liga === "nba" ? "do jogo da NBA" : "do jogo da NFL"}`;
  return {
    slug: `${base}-onde-assistir-e-horario`,
    coverFile: `capa-${base}.png`,
    coverAlt: `${title}. Logos dos dois times; ${o.data.curta}, às ${hora}, ${o.canalCapaAlt}`,
    cover: { home: o.homeId, away: o.awayId, info: `${o.data.capa} · ${hora} · ${o.canalCapa}`, seal: L.seal, sport: o.liga },
    data: {
      title,
      category: "Onde Assistir",
      tags: ["Onde assistir", L.tag, A, Bn].map((tag) => ({ tag })),
      matchId: o.matchId,
      excerpt: o.excerpt,
      content,
      author: o.authorId === 1 ? "Ivan Alves" : "Lucas Lima",
      authorProfile: o.authorId,
      seo: { metaTitle: title, metaDescription: o.metaDescription },
    },
  };
}

export const SAB14 = { slug: "14-11-2026", longa: "sábado, 14 de novembro", curta: "sábado, 14/11", capa: "Sábado, 14/11", frase: "Neste sábado, 14 de novembro de 2026" };
export const DOM15 = { slug: "15-11-2026", longa: "domingo, 15 de novembro", curta: "domingo, 15/11", capa: "Domingo, 15/11", frase: "Neste domingo, 15 de novembro de 2026" };
export { B, P, LK };
