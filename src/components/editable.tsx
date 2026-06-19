import { cache } from "react";
import { getEditableValues } from "@/lib/data/editable-content-store";
import { EDITABLE } from "@/lib/data/editable-content";

// `cache` memoiza a leitura do JSON por request → uma única leitura mesmo com
// vários <Editable> na mesma página.
const load = cache(getEditableValues);

// Texto editável resolvido: override do painel ?? default do registro.
export async function getEditableText(id: string): Promise<string> {
  const all = await load();
  return all[id] ?? EDITABLE[id]?.default ?? "";
}

type Tag = "span" | "p" | "h1" | "h2" | "h3" | "div";

// Renderiza um texto editável (editável no painel "Páginas"), com fallback no
// default do código. Ex: <Editable id="sobre.h1" as="h1" className="..." />
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
