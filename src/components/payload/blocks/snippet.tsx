/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ReactNode } from "react";
import { getSnippet } from "@/lib/data/snippets";

// SERVER-ONLY. Bloco "snippet": busca o trecho reutilizável e renderiza os blocos dele com o
// mesmo PageBlock da página (recebido por prop pra evitar import circular). Trecho dentro de
// trecho é ignorado (nunca recursão).
export async function SnippetBlock({
  block,
  renderBlock,
}: {
  block: any;
  renderBlock: (b: any, i: number) => ReactNode;
}) {
  // Resolve SEMPRE pelo id no banco (nunca usa o objeto embutido no bloco: um `layout`
  // inline viria de quem montou o bloco, não do trecho salvo). Sem id válido/doc → nada.
  const ref = block.snippet;
  const raw = ref && typeof ref === "object" ? ref.id : ref;
  const id = Number(raw);
  if (!Number.isInteger(id) || id <= 0) return null;
  let doc: any = null;
  try {
    doc = await getSnippet(id);
  } catch {
    return null;
  }
  if (!doc) return null;
  const layout: any[] = Array.isArray(doc?.layout) ? doc.layout : [];
  const nodes = layout.filter((b) => b && b.blockType !== "snippet").map((b, i) => renderBlock(b, i));
  if (!nodes.length) return null;
  return <>{nodes}</>;
}
