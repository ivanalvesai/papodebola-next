import type { Block } from "payload";
import type { lexicalEditor } from "@payloadcms/richtext-lexical";
import { staticBlocks } from "./static";

type RichTextEditor = ReturnType<typeof lexicalEditor>;
export { TEAM_LAYOUT_BLOCKS } from "./team";
export { BLOCK_GROUPS, thumbUrl, withMeta } from "./meta";

// Biblioteca completa das Páginas (e dos Modelos). A Task 2 acrescenta os blocos de dados
// e a Seção aqui.
export function pageBlocks(richTextEditor: RichTextEditor): Block[] {
  return [...staticBlocks(richTextEditor)];
}
export { STATIC_BLOCK_SLUGS as PAGE_BLOCK_SLUGS } from "./static";
