/* eslint-disable @typescript-eslint/no-explicit-any */
import { lexicalToHtml } from "@/lib/data/articles-payload";
import { ProseBody } from "@/components/article/prose-body";

// SERVER-ONLY (lexicalToHtml vem de @/lib/data). O canvas do editor visual usa outro caminho
// pro bloco Texto — por isso "richText" NÃO está em CLIENT_SAFE_SLUGS.
export function RichTextBlock({ block }: { block: any }) {
  // Editor completo (mesmos cards dos posts) → converte pra HTML e renderiza com o
  // corpo "prose-article" (estilos + loaders de Instagram/X). Ver ProseBody.
  const html = lexicalToHtml(block.content);
  return html ? <ProseBody html={html} /> : null;
}
