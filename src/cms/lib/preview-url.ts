// URLs de preview/live preview por collection. Relativas e same-origin: o iframe do
// Live Preview e o botão Preview levam o cookie payload-token, que basta pro
// assertPreviewAccess. NÃO embutir o CRON_SECRET aqui: a página de preview roda no
// layout do site (GTM/GA4/Clarity) e a URL com o secret iria pros analytics.
// (assertPreviewAccess segue aceitando ?previewSecret= pra uso manual/curl.)
export function previewUrl(kind: "pagina" | "time" | "post", key: string | number | undefined, extra?: string): string {
  return kind === "pagina" ? `/cms-preview/pagina/${key ?? "novo"}`
    : kind === "time" ? `/cms-preview/time/${key ?? "novo"}/${extra || "hub"}`
    : `/cms-preview/${key ?? ""}`;
}
export const PREVIEW_BREAKPOINTS = [
  { label: "Celular", name: "mobile", width: 390, height: 844 },
  { label: "Tablet", name: "tablet", width: 768, height: 1024 },
  { label: "Desktop", name: "desktop", width: 1440, height: 900 },
];
