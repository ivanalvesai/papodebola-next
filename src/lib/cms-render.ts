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
// Esconde o bloco por dispositivo (campo `hideOn` dos blocos de Página). "" = visível em tudo.
export function hideOnClass(block: { hideOn?: string | null } | null | undefined): string {
  return block?.hideOn === "mobile" ? "max-md:hidden" : block?.hideOn === "desktop" ? "md:hidden" : "";
}

// Bloco "Números": só valores inteiros (com ou sem separador de milhar) ganham contador animado.
// "1.200" → { target: 1200, sep: "." }; "3,5" / "R$ 10" → null (fica estático).
export function parseStatValue(value: string | null | undefined): { target: number; sep: "." | "," | "" } | null {
  const v = String(value ?? "").trim();
  if (/^\d+$/.test(v)) return { target: Number(v), sep: "" };
  const m = v.match(/^\d{1,3}([.,])\d{3}(?:\1\d{3})*$/);
  if (!m) return null;
  return { target: Number(v.split(m[1]).join("")), sep: m[1] as "." | "," };
}
export function formatStatValue(n: number, sep: string): string {
  const s = String(Math.round(n));
  return sep ? s.replace(/\B(?=(\d{3})+(?!\d))/g, sep) : s;
}

// Colunas dos blocos de grade (salvas como texto "2"/"3"/"4"). Mapa estático: o Tailwind não
// gera classe montada em tempo de execução.
const GRID_COLS: Record<string, string> = {
  "2": "sm:grid-cols-2",
  "3": "sm:grid-cols-2 lg:grid-cols-3",
  "4": "sm:grid-cols-2 lg:grid-cols-4",
};
export function gridColsClass(columns: string | number | null | undefined): string {
  return GRID_COLS[String(columns ?? "")] ?? GRID_COLS["3"];
}
