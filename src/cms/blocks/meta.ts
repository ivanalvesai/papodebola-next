import type { Block } from "payload";

export const BLOCK_GROUPS = {
  text: "Texto e mídia",
  layout: "Layout",
  data: "Dados ao vivo",
  team: "Dados do time",
} as const;

export function thumbUrl(slug: string): string {
  return `/cms-blocks/${slug}.svg`;
}

// Aplica grupo, thumbnail e rótulo-resumo a um bloco. O Label é o mesmo componente pra
// todos (lê blockType + dados da linha e chama blockSummary).
export function withMeta(block: Block, group: keyof typeof BLOCK_GROUPS): Block {
  return {
    ...block,
    admin: {
      ...(block.admin || {}),
      group: BLOCK_GROUPS[group],
      images: { thumbnail: { url: thumbUrl(block.slug), alt: `Bloco ${block.slug}` } },
      components: {
        ...(block.admin?.components || {}),
        Label: "@/cms/components/block-summary-label#BlockSummaryLabel",
      },
    },
  };
}
