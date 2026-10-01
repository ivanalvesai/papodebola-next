/* eslint-disable @typescript-eslint/no-explicit-any */
// Converte as props de um componente do Puck no bloco equivalente da biblioteca de
// blocos (o mesmo shape que o PageBlock renderiza). Puro: roda no editor e no servidor.
function lexicalParagraphs(text: string) {
  const lines = String(text || "").split(/\r?\n/).filter((l) => l.trim().length);
  return {
    root: {
      type: "root", format: "", indent: 0, version: 1, direction: "ltr",
      children: lines.map((l) => ({
        type: "paragraph", format: "", indent: 0, version: 1, direction: "ltr", textFormat: 0, textStyle: "",
        children: [{ type: "text", text: l, format: 0, detail: 0, mode: "normal", style: "", version: 1 }],
      })),
    },
  };
}

export function puckPropsToBlock(type: string, p: any): any | null {
  const d = p || {};
  switch (type) {
    case "Heading":
      return { blockType: "heading", text: d.text || "", level: d.level === "h3" ? "h3" : "h2" };
    case "Text":
      return { blockType: "richText", content: lexicalParagraphs(d.text) };
    case "Button":
      return { blockType: "button", label: d.label || "", url: d.url || "#", style: d.style === "outline" ? "outline" : "primary" };
    case "Image":
      return d.url ? { blockType: "image", image: { url: d.url, alt: d.caption || "" }, caption: d.caption, align: "center" } : null;
    case "TeamWidget": {
      const id = Number(d.team?.id ?? d.team);
      return id ? { blockType: "teamWidget", team: id, widget: d.widget || "upcoming", title: d.title, limit: d.limit } : null;
    }
    case "Standings":
      return { blockType: "standings", tournament: d.tournament || "brasileirao-serie-a", title: d.title, rows: d.rows, compact: !!d.compact };
    case "Scorers":
      return { blockType: "scorers", tournament: d.tournament || "brasileirao-serie-a", title: d.title, limit: d.limit };
    case "NewsFeed":
      return { blockType: "newsFeed", source: d.source || "latest", value: d.value, team: d.team?.id, limit: d.limit, layout: d.layout || "grid", title: d.title };
    case "LiveMatch":
      return d.matchId ? { blockType: "liveMatch", matchId: Number(d.matchId), competition: d.competition, title: d.title } : null;
    case "TodayGames":
      return { blockType: "todayGames", league: d.league || "all", title: d.title };
    default:
      return null;
  }
}
