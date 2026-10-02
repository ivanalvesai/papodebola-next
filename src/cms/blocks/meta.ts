import type { Block, Field } from "payload";

export const BLOCK_GROUPS = {
  text: "Texto e mídia",
  layout: "Layout",
  highlight: "Destaques",
  interact: "Interação",
  embed: "Incorporar",
  data: "Dados ao vivo",
  snippet: "Trechos",
  team: "Dados do time",
} as const;

// Visibilidade por dispositivo: todo bloco das Páginas/Modelos ganha este campo.
export const HIDE_ON_FIELD: Field = {
  name: "hideOn",
  type: "select",
  defaultValue: "none",
  label: "Visibilidade",
  options: [
    { label: "Mostrar em tudo", value: "none" },
    { label: "Ocultar no celular", value: "mobile" },
    { label: "Ocultar no computador", value: "desktop" },
  ],
  admin: { description: "Esconde este bloco só no celular ou só no computador." },
};

export function thumbUrl(slug: string): string {
  return `/cms-blocks/${slug}.svg`;
}

// Aplica grupo, thumbnail, rótulo-resumo e (por padrão) o campo hideOn a um bloco. O Label
// é o mesmo componente pra todos (lê blockType + dados da linha e chama blockSummary).
// `{ hideOn: false }`: blocos de time (collection teams) — não mexer nas tabelas deles.
export function withMeta(block: Block, group: keyof typeof BLOCK_GROUPS, opts: { hideOn?: boolean } = {}): Block {
  const wantHide = opts.hideOn !== false;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hasHide = block.fields.some((f: any) => f.name === "hideOn");
  return {
    ...block,
    fields: wantHide && !hasHide ? [...block.fields, HIDE_ON_FIELD] : block.fields,
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
