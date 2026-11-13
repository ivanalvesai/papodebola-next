// Helpers pra montar o corpo Lexical (campo `content`) dos posts "onde assistir".
// Mesmo formato dos posts criados via payload run (ver create-post-jogos-hoje-*.mjs no servidor).
import crypto from "node:crypto";

export const T = (text, format = 0) => ({ type: "text", text, format, detail: 0, mode: "normal", style: "", version: 1 });
export const B = (text) => T(text, 1);
const kids = (c) => (Array.isArray(c) ? c : [c]).map((x) => (typeof x === "string" ? T(x) : x));
export const LK = (text, url, newTab = false) => ({ type: "link", version: 3, fields: { linkType: "custom", url, newTab }, children: [T(text)], direction: "ltr", format: "", indent: 0 });
export const P = (...children) => ({ type: "paragraph", children: kids(children), direction: "ltr", format: "", indent: 0, version: 1, textFormat: 0 });
export const H = (tag, text) => ({ type: "heading", tag, children: [T(text)], direction: "ltr", format: "", indent: 0, version: 1 });
export const LIST = (items) => ({
  type: "list", listType: "bullet", tag: "ul", start: 1, direction: "ltr", format: "", indent: 0, version: 1,
  children: items.map((it, i) => ({ type: "listitem", value: i + 1, direction: "ltr", format: "", indent: 0, version: 1, children: kids(it) })),
});
const CELL = (content, header) => ({
  type: "tablecell", format: "", indent: 0, colSpan: 1, rowSpan: 1, version: 1, direction: null, headerState: header ? 1 : 0, backgroundColor: null,
  children: [{ type: "paragraph", format: "", indent: 0, version: 1, direction: null, textStyle: "", textFormat: 0, children: kids(content) }],
});
const ROW = (cells, header = false) => ({ type: "tablerow", format: "", indent: 0, version: 1, direction: null, children: cells.map((c) => CELL(c, header)) });
export const TABLE = (head, rows) => ({ type: "table", format: "", indent: 0, version: 1, direction: null, children: [ROW(head, true), ...rows.map((r) => ROW(r))] });
export const RT = (...nodes) => ({ root: { type: "root", children: nodes, direction: "ltr", format: "", indent: 0, version: 1 } });
const id = () => crypto.randomBytes(12).toString("hex");
export const BLOCK = (blockType, fields) => ({ type: "block", version: 2, format: "", fields: { id: id(), blockType, ...fields } });
export const FAQ = (items) => BLOCK("faq", { title: "Perguntas frequentes", firstOpen: true, items: items.map(([question, answer]) => ({ id: id(), question, answer: RT(P(answer)) })) });
export const MATCH_INFO = (channels, channelsConfirmed = true) => BLOCK("matchInfo", { channels, channelsConfirmed });
export const STAT_CARD = (title, subtitle, rows, cor = "verde") => BLOCK("statCard", { title, subtitle, cor, rows: rows.map(([label, value]) => ({ id: id(), label, value })) });
// Escalação no campinho: jogadores na ordem goleiro → ataque (como vêm da API).
export const LINEUP = (team, side, label = "Provável") =>
  BLOCK("lineup", {
    team, formation: side.formation, label,
    players: side.starters.slice(0, 11).map((p) => ({ id: id(), name: p.name, number: p.number != null ? String(p.number) : "", playerId: String(p.id) })),
  });

export const STANDINGS_TABLE = (rows, teamHead = "Seleção") =>
  TABLE(["Pos.", teamHead, "Pts", "J", "V", "E", "D", "Gols", "Saldo"], rows.map((r) => [`${r.pos}º`, r.team, String(r.pts), String(r.matches), String(r.wins), String(r.draws), String(r.losses), `${r.gf}-${r.ga}`, r.gd > 0 ? `+${r.gd}` : String(r.gd)]));

export const slugify = (s) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
