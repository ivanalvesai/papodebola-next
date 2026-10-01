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
  const ref = block.snippet;
  let doc: any = null;
  try {
    if (ref && typeof ref === "object" && Array.isArray(ref.layout)) {
      // Já veio populado — ainda assim relê pelo cache (depth 2 garante mídia populada).
      doc = (await getSnippet(ref.id)) ?? ref;
    } else {
      const id = ref && typeof ref === "object" ? ref.id : ref;
      doc = await getSnippet(id);
    }
  } catch {
    return null;
  }
  const layout: any[] = Array.isArray(doc?.layout) ? doc.layout : [];
  const nodes = layout.filter((b) => b && b.blockType !== "snippet").map((b, i) => renderBlock(b, i));
  if (!nodes.length) return null;
  return <>{nodes}</>;
}
