import type { CollectionConfig } from "payload";
import type { lexicalEditor } from "@payloadcms/richtext-lexical";
import { pageBlocks } from "@/cms/blocks";
import { heroGroup, layoutStyleGroup } from "./pages";

type RichTextEditor = ReturnType<typeof lexicalEditor>;

export function pageTemplatesCollection(richTextEditor: RichTextEditor): CollectionConfig {
  return {
    slug: "pageTemplates",
    labels: { singular: "Modelo de página", plural: "Modelos de página" },
    admin: { useAsTitle: "title", group: "Conteúdo", defaultColumns: ["title", "description", "updatedAt"],
      description: "Layouts prontos pra começar uma página. Em qualquer Página, use 'Aplicar modelo' na barra lateral." },
    access: { read: ({ req: { user } }) => !!user, create: ({ req: { user } }) => !!user, update: ({ req: { user } }) => !!user, delete: ({ req: { user } }) => !!user },
    fields: [
      { name: "title", type: "text", required: true, label: "Nome do modelo" },
      { name: "description", type: "textarea", label: "Pra que serve" },
      { name: "thumbnail", type: "upload", relationTo: "media", label: "Miniatura (opcional)" },
      heroGroup,
      layoutStyleGroup,
      { name: "layout", type: "blocks", label: "Blocos", labels: { singular: "Bloco", plural: "Blocos" }, blocks: pageBlocks(richTextEditor), admin: { initCollapsed: true } },
    ],
  };
}
