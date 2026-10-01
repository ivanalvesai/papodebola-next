import type { Block } from "payload";
import type { lexicalEditor } from "@payloadcms/richtext-lexical";
import { staticBlocks, STATIC_BLOCK_SLUGS } from "./static.ts";
import { dataBlocks } from "./data.ts";
import { sectionBlock } from "./section.ts";

type RichTextEditor = ReturnType<typeof lexicalEditor>;
export { TEAM_LAYOUT_BLOCKS } from "./team.ts";
export { BLOCK_GROUPS, thumbUrl, withMeta } from "./meta.ts";
export { dataBlocks, todayGamesBlock } from "./data.ts";

// Biblioteca completa das Páginas (e dos Modelos): a Seção (colunas) + todos os blocos,
// que também são os permitidos DENTRO da Seção (sem Seção aninhada).
export function pageBlocks(richTextEditor: RichTextEditor): Block[] {
  const inner = [...staticBlocks(richTextEditor), ...dataBlocks()];
  return [sectionBlock(inner), ...inner];
}
export const SECTION_INNER_SLUGS = [...STATIC_BLOCK_SLUGS, "todayGames", "teamWidget", "standings", "scorers", "newsFeed", "liveMatch"] as const;
export const PAGE_BLOCK_SLUGS = ["section", ...SECTION_INNER_SLUGS] as const;
