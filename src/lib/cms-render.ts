import { TOURNAMENT_BY_SLUG, type Tournament } from "./config.ts";

const WIDGET_TO_BLOCK: Record<string, string> = {
  todayMatch: "teamTodayMatch", upcoming: "teamUpcoming", results: "teamResults", standing: "teamStanding",
  news: "teamNews", scorers: "teamScorers", whereToWatch: "teamWhereToWatch", lineup: "teamLineup",
};
export function widgetToBlockType(widget: string | undefined): string {
  return (widget && WIDGET_TO_BLOCK[widget]) || "";
}
export function resolveTournament(slug: string | undefined): { kind: "worldcup" } | { kind: "tournament"; t: Tournament } | null {
  if (!slug) return null;
  if (slug === "copa-do-mundo") return { kind: "worldcup" };
  const t = TOURNAMENT_BY_SLUG[slug];
  return t ? { kind: "tournament", t } : null;
}
export function pathBreadcrumb(path: string, title: string): { label: string; href: string }[] {
  const segs = path.replace(/^\/|\/$/g, "").split("/").filter(Boolean);
  const items = [{ label: "Início", href: "/" }];
  segs.forEach((s, i) => {
    const href = `/${segs.slice(0, i + 1).join("/")}`;
    const label = i === segs.length - 1 ? title : s.split("-").map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(" ");
    items.push({ label, href });
  });
  return items;
}
