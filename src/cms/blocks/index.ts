import type { Block } from "payload";
import type { lexicalEditor } from "@payloadcms/richtext-lexical";
import { staticBlocks, STATIC_BLOCK_SLUGS } from "./static.ts";
import { dataBlocks } from "./data.ts";
import { richBlocks, RICH_BLOCK_SLUGS } from "./rich.ts";
import { sectionBlock } from "./section.ts";

type RichTextEditor = ReturnType<typeof lexicalEditor>;
export { TEAM_LAYOUT_BLOCKS } from "./team.ts";
export { BLOCK_GROUPS, HIDE_ON_FIELD, thumbUrl, withMeta } from "./meta.ts";
export { dataBlocks, todayGamesBlock } from "./data.ts";
export { richBlocks, RICH_BLOCK_SLUGS } from "./rich.ts";
export { ICON_NAMES, ICON_OPTIONS, SOCIAL_NETWORKS } from "./icons.ts";

type RichSlug = (typeof RICH_BLOCK_SLUGS)[number];
type InnerRichSlug = Exclude<RichSlug, "snippet">;
const INNER_RICH_SLUGS = RICH_BLOCK_SLUGS.filter((s): s is InnerRichSlug => s !== "snippet");

// Biblioteca completa das Páginas (e dos Modelos): a Seção (colunas) + todos os blocos,
// que também são os permitidos DENTRO da Seção (sem Seção aninhada). O Trecho fica só no
// nível da página (fora da Seção).
export function pageBlocks(richTextEditor: RichTextEditor): Block[] {
  const rich = richBlocks(richTextEditor);
  const inner = [...staticBlocks(richTextEditor), ...dataBlocks(), ...rich.filter((b) => b.slug !== "snippet")];
  const snippet = rich.find((b) => b.slug === "snippet")!;
  return [sectionBlock(inner), ...inner, snippet];
}
export const SECTION_INNER_SLUGS = [
  ...STATIC_BLOCK_SLUGS,
  "todayGames", "teamWidget", "standings", "scorers", "newsFeed", "liveMatch",
  ...INNER_RICH_SLUGS,
] as const;
export const PAGE_BLOCK_SLUGS = ["section", ...SECTION_INNER_SLUGS, "snippet"] as const;
