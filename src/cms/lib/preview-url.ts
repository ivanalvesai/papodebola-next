// URLs de preview/live preview por collection. CRON_SECRET autoriza o iframe do /cms
// mesmo sem cookie (ver cms-preview-auth). Relativas: o admin e o site são o mesmo host.
export function previewUrl(kind: "pagina" | "time" | "post", key: string | number | undefined, extra?: string): string {
  const secret = process.env.CRON_SECRET || "";
  const base = kind === "pagina" ? `/cms-preview/pagina/${key ?? "novo"}`
    : kind === "time" ? `/cms-preview/time/${key ?? "novo"}/${extra || "hub"}`
    : `/cms-preview/${key ?? ""}`;
  return `${base}?previewSecret=${encodeURIComponent(secret)}`;
}
export const PREVIEW_BREAKPOINTS = [
  { label: "Celular", name: "mobile", width: 390, height: 844 },
  { label: "Tablet", name: "tablet", width: 768, height: 1024 },
  { label: "Desktop", name: "desktop", width: 1440, height: 900 },
];
