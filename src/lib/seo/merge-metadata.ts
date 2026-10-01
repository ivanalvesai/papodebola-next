import type { Metadata } from "next";

// Funções puras do SEO editável (sem Next/Payload — testáveis com node:test).

export interface PageTextsSeo {
  metaTitle?: string | null;
  metaDescription?: string | null;
  noindex?: boolean | null;
}

export interface PageTextsDoc {
  route?: string;
  label?: string;
  seo?: PageTextsSeo | null;
  texts?: { key?: string | null; label?: string | null; value?: string | null }[] | null;
}

function clean(v: unknown): string {
  return typeof v === "string" ? v.trim() : "";
}

// Mescla o SEO do doc (pageTexts) sobre os defaults do código.
// Sem doc / campos vazios → devolve os próprios defaults (mesmo objeto).
export function mergeMetadata(defaults: Metadata, doc: PageTextsDoc | null | undefined): Metadata {
  const seo = doc?.seo;
  if (!seo) return defaults;
  const title = clean(seo.metaTitle);
  const description = clean(seo.metaDescription);
  const noindex = seo.noindex === true;
  if (!title && !description && !noindex) return defaults;

  const out: Metadata = { ...defaults };
  if (title) {
    const t = defaults.title;
    out.title = t && typeof t === "object" && "absolute" in t ? { absolute: title } : title;
  }
  if (description) {
    out.description = description;
    if (defaults.openGraph) out.openGraph = { ...defaults.openGraph, description };
    if (defaults.twitter) out.twitter = { ...defaults.twitter, description };
  }
  if (noindex) out.robots = { index: false, follow: false };
  return out;
}

// Acha a rota cadastrada que corresponde ao path: exata primeiro; senão um padrão
// com segmentos ":param" e o mesmo número de segmentos; senão null.
export function matchRoute(path: string, routes: string[]): string | null {
  if (routes.includes(path)) return path;
  const segs = path.split("/");
  for (const r of routes) {
    if (!r.includes(":")) continue;
    const rs = r.split("/");
    if (rs.length !== segs.length) continue;
    if (rs.every((s, i) => s.startsWith(":") ? segs[i] !== "" : s === segs[i])) return r;
  }
  return null;
}

// Valor de um texto da tela (texts[key]) — vazio conta como ausente.
export function textValue(doc: PageTextsDoc | null | undefined, key: string): string | null {
  const v = doc?.texts?.find((t) => t?.key === key)?.value;
  return typeof v === "string" && v.trim() ? v : null;
}
