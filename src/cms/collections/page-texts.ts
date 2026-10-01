import type { CollectionConfig } from "payload";
import { revalidatePath } from "next/cache";
import { adminOnly, seoOrEditorOrAdmin } from "@/cms/lib/access";
import { expireTag } from "@/cms/lib/revalidate-tag";

/* eslint-disable @typescript-eslint/no-explicit-any */
// Textos e SEO por rota do site (substitui o painel /painel-pdb-9x/paginas).
// Rotas com ":param" são padrões — não dá pra revalidar um path concreto; a tag cobre.
function revalidateRoute(route: unknown) {
  expireTag("pageTexts");
  if (typeof route !== "string" || !route || route.includes(":")) return;
  try { revalidatePath(route); } catch { /* fora de request */ }
}

export const pageTextsCollection: CollectionConfig = {
  slug: "pageTexts",
  labels: { singular: "Textos e SEO da página", plural: "Textos e SEO das páginas" },
  admin: {
    useAsTitle: "label",
    group: "Conteúdo",
    defaultColumns: ["route", "label", "updatedAt"],
    description: "Uma entrada por página do site. SEO vale pro Google; textos valem pro que aparece na tela.",
  },
  access: { read: () => true, create: seoOrEditorOrAdmin, update: seoOrEditorOrAdmin, delete: adminOnly },
  hooks: {
    afterChange: [({ doc, previousDoc }: any) => {
      revalidateRoute(doc?.route);
      if (previousDoc?.route && previousDoc.route !== doc?.route) revalidateRoute(previousDoc.route);
      return doc;
    }],
    afterDelete: [({ doc }: any) => { revalidateRoute(doc?.route); return doc; }],
  },
  fields: [
    {
      name: "route",
      type: "text",
      required: true,
      unique: true,
      index: true,
      label: "Rota",
      admin: { description: "Caminho da página (ex.: /futebol/copa-do-mundo). Padrões com :param também valem (ex.: /noticias/:categoria)" },
    },
    { name: "label", type: "text", required: true, label: "Nome da página" },
    {
      name: "seo",
      type: "group",
      label: "SEO",
      fields: [
        { name: "metaTitle", type: "text", label: "Título (meta title)" },
        { name: "metaDescription", type: "textarea", label: "Descrição (meta description)" },
        { name: "noindex", type: "checkbox", label: "Não indexar (noindex)" },
      ],
    },
    {
      name: "texts",
      type: "array",
      label: "Textos da tela",
      labels: { singular: "Texto", plural: "Textos" },
      admin: { components: { RowLabel: "@/cms/components/text-row-label#TextRowLabel" } },
      fields: [
        { name: "key", type: "text", required: true, label: "Chave", admin: { description: "id do texto no código, não mude" } },
        { name: "label", type: "text", label: "Descrição" },
        { name: "value", type: "textarea", label: "Texto" },
      ],
    },
  ],
};
