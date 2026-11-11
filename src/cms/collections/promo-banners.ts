import type { CollectionConfig } from "payload";
import { revalidatePath } from "next/cache";
import { adminOnly, editorOrAdmin, hiddenUnlessEditor } from "@/cms/lib/access";
import { expireTag } from "@/cms/lib/revalidate-tag";

// Banner promocional que aparece em TODAS as páginas do site, logo abaixo do menu
// (ex.: 11.11, Black Friday). Troca-se a arte pelo /cms, sem deploy.
//  - Vários banners ativos no mesmo período = o site sorteia um por visita.
//  - Início/fim: o navegador do visitante confere a data, então o banner entra e sai
//    no horário certo mesmo com a página em cache.
//  - Sem "Link de destino" o banner NÃO aparece (nunca sai banner sem link de afiliado).
//  - O clique passa por /oferta/{slug}: conta o clique e redireciona (rel=sponsored).
export const promoBannersCollection: CollectionConfig = {
  slug: "promoBanners",
  labels: { singular: "Banner promocional", plural: "Banners promocionais" },
  admin: {
    group: "Comercial",
    useAsTitle: "name",
    hidden: hiddenUnlessEditor,
    defaultColumns: ["name", "active", "startsAt", "endsAt", "clicks", "updatedAt"],
    description:
      "Faixa em todas as páginas, abaixo do menu. Arte do computador 1200×300 e do celular 720×240 (envie em 2x: 2400×600 e 1440×480). Sem link de destino o banner não aparece. Para testar antes de valer, abra qualquer página com ?banner=preview no fim do endereço.",
  },
  access: { read: () => true, create: editorOrAdmin, update: editorOrAdmin, delete: adminOnly },
  hooks: {
    // Contador de cliques (context.skipRevalidate) não derruba o cache do site.
    afterChange: [({ doc, context }) => {
      if (context?.skipRevalidate) return doc;
      expireTag("promoBanners");
      try { revalidatePath("/", "layout"); } catch { /* fora de request */ }
      return doc;
    }],
    afterDelete: [({ doc }) => {
      expireTag("promoBanners");
      try { revalidatePath("/", "layout"); } catch { /* fora de request */ }
      return doc;
    }],
  },
  fields: [
    { name: "name", type: "text", required: true, label: "Nome interno", admin: { description: "Ex.: 11.11 — Mercado Livre" } },
    {
      name: "slug",
      type: "text",
      required: true,
      unique: true,
      index: true,
      label: "Slug",
      admin: { description: "Usado no link rastreado /oferta/{slug} (ex.: 1111-mercado-livre)." },
    },
    {
      type: "row",
      fields: [
        { name: "imageDesktop", type: "upload", relationTo: "media", required: true, label: "Arte do computador (1200×300)", admin: { width: "50%" } },
        { name: "imageMobile", type: "upload", relationTo: "media", label: "Arte do celular (720×240)", admin: { width: "50%", description: "Vazio = usa a do computador." } },
      ],
    },
    { name: "alt", type: "text", label: "Texto alternativo", admin: { description: "Ex.: 11.11 com cupom de desconto no Mercado Livre" } },
    {
      name: "url",
      type: "text",
      label: "Link de destino (afiliado)",
      admin: { description: "Link completo da loja com o seu ID de afiliado (https://...). Vazio = banner não aparece." },
    },
    {
      type: "row",
      fields: [
        { name: "startsAt", type: "date", label: "Começa em", admin: { width: "50%", date: { pickerAppearance: "dayAndTime" }, description: "Vazio = já começou." } },
        { name: "endsAt", type: "date", label: "Termina em", admin: { width: "50%", date: { pickerAppearance: "dayAndTime" }, description: "Vazio = sem fim." } },
      ],
    },
    { name: "active", type: "checkbox", defaultValue: true, label: "Ativo" },
    {
      name: "clicks",
      type: "number",
      defaultValue: 0,
      label: "Cliques",
      admin: { readOnly: true, description: "Contador de cliques no link /oferta/{slug}." },
    },
  ],
};
