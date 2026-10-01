import { EDITABLE } from "@/lib/data/editable-content";
import { getPageTexts, getSiteSettings, textValue, type SiteSettings } from "@/lib/data/site-texts";

// ids "site.*" → campo do global siteSettings (editável no /cms → Configurações do site).
const SITE_FIELDS: Record<string, (s: SiteSettings) => string | null | undefined> = {
  "site.name": (s) => s.siteName,
  "site.meta.titleDefault": (s) => s.metaTitleDefault,
  "site.meta.descriptionDefault": (s) => s.metaDescriptionDefault,
  "site.social.instagram": (s) => s.social?.instagram,
  "site.social.x": (s) => s.social?.x,
  "site.social.youtube": (s) => s.social?.youtube,
};

function nonEmpty(v: unknown): string | null {
  return typeof v === "string" && v.trim() ? v : null;
}

// Texto editável resolvido: valor do /cms (pageTexts da rota / siteSettings) ?? default do registro.
export async function getEditableText(id: string): Promise<string> {
  const def = EDITABLE[id];
  const fallback = def?.default ?? "";
  if (id.startsWith("site.")) {
    const pick: ((s: SiteSettings) => string | null | undefined) | undefined = SITE_FIELDS[id];
    if (!pick) return fallback;
    const settings = await getSiteSettings();
    return (settings && nonEmpty(pick(settings))) || fallback;
  }
  if (!def?.page) return fallback;
  const doc = await getPageTexts(def.page);
  return textValue(doc, id) ?? fallback;
}

// Igual ao getEditableText, mas substitui placeholders {variavel} por valores reais.
// Pra textos com dado interpolado (ex: "Jogo do {time} hoje", "{home} x {away}").
// Placeholder sem valor é mantido literal (não some), pra não quebrar silenciosamente.
export async function getEditableTemplate(
  id: string,
  vars: Record<string, string | number>
): Promise<string> {
  const tpl = await getEditableText(id);
  return tpl.replace(/\{(\w+)\}/g, (_, k) => (vars[k] != null ? String(vars[k]) : `{${k}}`));
}

type Tag = "span" | "p" | "h1" | "h2" | "h3" | "div";

// Renderiza um texto editável (editável no /cms → Textos e SEO das páginas), com
// fallback no default do código. Ex: <Editable id="sobre.h1" as="h1" className="..." />
export async function Editable({
  id,
  as = "span",
  className,
}: {
  id: string;
  as?: Tag;
  className?: string;
}) {
  const text = await getEditableText(id);
  const Tag = as;
  return <Tag className={className}>{text}</Tag>;
}
