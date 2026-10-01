import type { CollectionConfig } from "payload";
import type { lexicalEditor } from "@payloadcms/richtext-lexical";
import { pageBlocks } from "@/cms/blocks";
import { anyLogged, editorOrAdmin } from "@/cms/lib/access";
import { expireTag } from "@/cms/lib/revalidate-tag";

type RichTextEditor = ReturnType<typeof lexicalEditor>;

// Trechos: seções reutilizáveis (inseridas nas páginas pelo bloco "snippet").
// Um trecho não pode conter outro trecho (evita recursão).
export function snippetsCollection(richTextEditor: RichTextEditor): CollectionConfig {
  return {
    slug: "snippets",
    labels: { singular: "Trecho", plural: "Trechos" },
    admin: {
      useAsTitle: "title",
      group: "Conteúdo",
      defaultColumns: ["title", "description", "updatedAt"],
      description: "Seções prontas pra reaproveitar em várias páginas. Editou aqui, muda em todas.",
    },
    access: { read: anyLogged, create: editorOrAdmin, update: editorOrAdmin, delete: editorOrAdmin },
    hooks: {
      afterChange: [({ doc }) => { expireTag("snippets"); return doc; }],
      afterDelete: [({ doc }) => { expireTag("snippets"); return doc; }],
    },
    fields: [
      { name: "title", type: "text", required: true, label: "Nome do trecho" },
      { name: "description", type: "textarea", label: "Pra que serve" },
      {
        name: "layout",
        type: "blocks",
        label: "Blocos",
        labels: { singular: "Bloco", plural: "Blocos" },
        blocks: pageBlocks(richTextEditor).filter((b) => b.slug !== "snippet"),
        admin: { initCollapsed: true },
      },
    ],
  };
}
