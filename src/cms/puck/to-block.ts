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

// Mídia escolhida no Puck (item do external: { id, url, alt, filename }) → o objeto que os
// componentes esperam (`image?.url`). Sem url → undefined.
function media(v: any): { url: string; alt: string } | undefined {
  return v && typeof v === "object" && v.url ? { url: String(v.url), alt: String(v.alt || "") } : undefined;
}
const arr = (v: any): any[] => (Array.isArray(v) ? v : []);
const idOf = (v: any): any => (v && typeof v === "object" ? v.id : v);
const bool = (v: any, def: boolean): boolean => (v === undefined || v === null || v === "" ? def : v === true || v === "true");
const btns = (v: any) => arr(v).map((b: any) => ({ label: b?.label || "", href: b?.href || "#", style: b?.style || "primary" }));

// Campos dos 21 blocos ricos (hideOn em todos, menos o Trecho).
function rich(type: string, d: any): any | null {
  const hideOn = d.hideOn || "none";
  switch (type) {
    case "Hero":
      return { blockType: "hero", title: d.title || "", subtitle: d.subtitle, align: d.align || "center", bgColor: d.bgColor || "green", bgHex: d.bgHex, bgImage: media(d.bgImage), overlay: d.overlay ?? 40, height: d.height || "auto", buttons: btns(d.buttons), hideOn };
    case "Cta":
      return { blockType: "cta", title: d.title || "", text: d.text, background: d.background || "green", bgImage: media(d.bgImage), align: d.align || "center", buttons: btns(d.buttons), hideOn };
    case "Cards":
      return { blockType: "cards", title: d.title, columns: String(d.columns || "3"), items: arr(d.items).map((it: any) => ({ image: media(it?.image), title: it?.title || "", text: it?.text, href: it?.href, linkLabel: it?.linkLabel })), hideOn };
    case "Stats":
      return { blockType: "stats", title: d.title, background: d.background || "none", items: arr(d.items).map((it: any) => ({ value: it?.value || "", label: it?.label || "", suffix: it?.suffix })), hideOn };
    case "Testimonials":
      return { blockType: "testimonials", title: d.title, layout: d.layout || "grid", items: arr(d.items).map((it: any) => ({ quote: it?.quote || "", name: it?.name || "", role: it?.role, photo: media(it?.photo) })), hideOn };
    case "MediaText":
      return { blockType: "mediaText", image: media(d.image), imageSide: d.imageSide || "left", title: d.title, text: d.text ? lexicalParagraphs(d.text) : undefined, button: { label: d.button?.label, href: d.button?.href }, hideOn };
    case "People":
      return { blockType: "people", title: d.title, columns: String(d.columns || "3"), items: arr(d.items).map((it: any) => ({ photo: media(it?.photo), name: it?.name || "", role: it?.role, text: it?.text, links: arr(it?.links).map((l: any) => ({ label: l?.label, url: l?.url })) })), hideOn };
    case "Timeline":
      return { blockType: "timeline", title: d.title, items: arr(d.items).map((it: any) => ({ date: it?.date || "", title: it?.title || "", text: it?.text })), hideOn };
    case "Faq":
      return { blockType: "faq", title: d.title, items: arr(d.items).map((it: any) => ({ question: it?.question || "", answer: it?.answer || "" })), schema: bool(d.schema, true), hideOn };
    case "Tabs":
      return { blockType: "tabs", items: arr(d.items).map((it: any) => ({ label: it?.label || "", content: lexicalParagraphs(it?.content) })), hideOn };
    case "FormBlock": {
      const form = idOf(d.form);
      return form ? { blockType: "formBlock", form, intro: d.intro ? lexicalParagraphs(d.intro) : undefined, compact: bool(d.compact, false), hideOn } : null;
    }
    case "Buttons":
      return { blockType: "buttons", align: d.align || "left", items: btns(d.items), hideOn };
    case "Social":
      return { blockType: "social", size: d.size || "md", items: arr(d.items).map((it: any) => ({ network: it?.network || "instagram", url: it?.url || "" })), hideOn };
    case "IconList":
      return { blockType: "iconList", title: d.title, columns: String(d.columns || "1"), items: arr(d.items).map((it: any) => ({ icon: it?.icon || "check", text: it?.text || "", href: it?.href })), hideOn };
    case "Instagram":
      return d.url ? { blockType: "instagram", url: d.url, caption: d.caption, hideOn } : null;
    case "XPost":
      return d.url ? { blockType: "xPost", url: d.url, caption: d.caption, hideOn } : null;
    case "Embed":
      return d.html ? { blockType: "embed", html: d.html, height: d.height, note: d.note, hideOn } : null;
    case "Carousel":
      return { blockType: "carousel", title: d.title, aspect: d.aspect || "16:9", images: arr(d.images).filter((it: any) => media(it?.image)).map((it: any) => ({ image: media(it.image), caption: it.caption })), hideOn };
    case "Divider":
      return { blockType: "divider", style: d.style || "line", size: d.size || "md", hideOn };
    case "Countdown": {
      const team = Number(idOf(d.team)) || undefined;
      const matchId = Number(d.matchId) || undefined;
      return { blockType: "countdown", team, matchId, title: d.title, showBroadcast: bool(d.showBroadcast, true), hideOn };
    }
    case "Snippet": {
      const snippet = idOf(d.snippet);
      return snippet ? { blockType: "snippet", snippet } : null;
    }
    default:
      return null;
  }
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
      return rich(type, d);
  }
}
