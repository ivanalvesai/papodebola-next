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
export const PAGE_BLOCK_SLUGS = ["richText","heading","image","gallery","youtube","quote","list","table","note","columns","button","infoCard","linkCards"] as const;
