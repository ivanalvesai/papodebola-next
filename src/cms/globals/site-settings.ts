import type { GlobalConfig } from "payload";
import { revalidatePath } from "next/cache";
import { seoOrEditorOrAdmin } from "@/cms/lib/access";
import { expireTag } from "@/cms/lib/revalidate-tag";

// Configurações gerais do site (nome, SEO padrão, redes sociais).
export const siteSettingsGlobal: GlobalConfig = {
  slug: "siteSettings",
  label: "Configurações do site",
  admin: { group: "Conteúdo" },
  access: { read: () => true, update: seoOrEditorOrAdmin },
  hooks: {
    afterChange: [({ doc }) => {
      expireTag("siteSettings");
      try { revalidatePath("/", "layout"); } catch { /* fora de request */ }
      return doc;
    }],
  },
  fields: [
    { name: "siteName", type: "text", required: true, label: "Nome do site", defaultValue: "Papo de Bola" },
    { name: "metaTitleDefault", type: "text", label: "Título padrão (meta title)" },
    { name: "metaDescriptionDefault", type: "textarea", label: "Descrição padrão (meta description)" },
    {
      name: "social",
      type: "group",
      label: "Redes sociais",
      fields: [
        { name: "instagram", type: "text", label: "Instagram (URL)" },
        { name: "x", type: "text", label: "X / Twitter (URL)" },
        { name: "youtube", type: "text", label: "YouTube (URL)" },
        { name: "facebook", type: "text", label: "Facebook (URL)" },
        { name: "tiktok", type: "text", label: "TikTok (URL)" },
      ],
    },
  ],
};
