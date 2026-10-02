import type { CollectionConfig, Field } from "payload";
import type { lexicalEditor } from "@payloadcms/richtext-lexical";
import { revalidatePath } from "next/cache";
import { pageBlocks } from "@/cms/blocks";
import { validatePagePath, normalizePath } from "@/cms/lib/cms-paths";
import { previewUrl, PREVIEW_BREAKPOINTS } from "@/cms/lib/preview-url";
import { isAutosave } from "@/cms/lib/is-autosave";
import { dedicatedPageRoute } from "@/lib/dedicated-pages";
import { editorOrAdmin, publishedOrLogged, seoOrEditorOrAdmin } from "@/cms/lib/access";
import { lockFieldsExceptSeo } from "@/cms/lib/lock-fields";

type RichTextEditor = ReturnType<typeof lexicalEditor>;

/* eslint-disable @typescript-eslint/no-explicit-any */
export const heroGroup: Field = {
  name: "hero", type: "group", label: "Cabeçalho",
  fields: [
    { name: "h1", type: "text", label: "Título (H1)" },
    { name: "subtitle", type: "text", label: "Subtítulo" },
    { name: "style", type: "select", defaultValue: "centered", label: "Estilo",
      options: [{ label: "Centralizado", value: "centered" }, { label: "Alinhado à esquerda", value: "left" }, { label: "Banner com imagem", value: "banner" }] },
    { name: "image", type: "upload", relationTo: "media", label: "Imagem do banner", admin: { condition: (_: any, s: any) => s?.style === "banner" } },
  ],
};
export const layoutStyleGroup: Field = {
  name: "layoutStyle", type: "group", label: "Aparência da página",
  fields: [
    { name: "width", type: "select", defaultValue: "narrow", label: "Largura",
      options: [{ label: "Estreita em card (720px) — padrão", value: "narrow" }, { label: "Larga (1240px)", value: "wide" }, { label: "Tela cheia (seções controlam a largura)", value: "full" }] },
    { name: "showBreadcrumb", type: "checkbox", defaultValue: false, label: "Mostrar trilha (Início › …)" },
  ],
};

export function pagesCollection(richTextEditor: RichTextEditor): CollectionConfig {
  return {
    slug: "pages",
    labels: { singular: "Página", plural: "Páginas" },
    admin: {
      useAsTitle: "title",
      group: "Conteúdo",
      defaultColumns: ["title", "path", "slug", "_status", "updatedAt"],
      description: "Páginas montadas por blocos. Caminho vazio = /paginas/{slug}. Use a aba Live Preview pra ver ao vivo.",
      livePreview: { url: ({ data }: any) => previewUrl("pagina", data?.id), breakpoints: PREVIEW_BREAKPOINTS },
      preview: (data: any) => previewUrl("pagina", data?.id),
      components: {
        views: {
          edit: {
            construtor: {
              Component: "@/cms/components/puck-view#PuckView",
              path: "/construtor",
              tab: { label: "Construtor (beta)", href: "/construtor", order: 60 },
            },
          },
        },
      },
    },
    // Rascunho/publicar: o site (find sem draft) só mostra a versão publicada.
    versions: { drafts: { autosave: { interval: 1500 } }, maxPerDoc: 50 },
    // seo: pode salvar, mas só os campos de SEO (lockFieldsExceptSeo nos fields).
    access: { read: publishedOrLogged, create: editorOrAdmin, update: seoOrEditorOrAdmin, delete: editorOrAdmin },
    hooks: {
      afterChange: [({ doc, previousDoc, req }: any) => {
        if (isAutosave(req)) return doc;
        revalidatePageDoc(doc);
        // Caminho renomeado: derruba a URL antiga também.
        if (previousDoc?.path && previousDoc.path !== doc?.path) {
          try { revalidatePath(previousDoc.path); } catch { /* fora de request */ }
        }
        return doc;
      }],
      afterDelete: [({ doc }: any) => { revalidatePageDoc(doc); return doc; }],
    },
    fields: lockFieldsExceptSeo([
      { name: "title", type: "text", required: true, label: "Nome da página" },
      {
        name: "path", type: "text", unique: true, index: true, label: "Caminho (URL final)",
        admin: { position: "sidebar", description: "Ex.: /volei/mundial-2026. Vazio = /paginas/{slug}. Rotas que já existem no site são recusadas." },
        hooks: { beforeValidate: [({ value }: any) => (value ? normalizePath(value) || null : null)] },
        validate: (value: any, { siblingData }: any) => validatePagePath(value, siblingData?.slug),
      },
      { name: "slug", type: "text", required: true, unique: true, index: true, admin: { position: "sidebar", description: "Identificador interno (também usado em /paginas/{slug})" } },
      { name: "templateTools", type: "ui", admin: { position: "sidebar", components: { Field: "@/cms/components/template-tools#TemplateTools" } } },
      { name: "editor", type: "select", defaultValue: "blocks", label: "Editor usado no site", admin: { position: "sidebar", description: "Blocos (esta aba) ou Construtor (aba Construtor). Mudar aqui troca o que o site renderiza." },
        options: [{ label: "Blocos", value: "blocks" }, { label: "Construtor (beta)", value: "puck" }] },
      heroGroup,
      layoutStyleGroup,
      { name: "layout", type: "blocks", label: "Blocos da página", labels: { singular: "Bloco", plural: "Blocos" }, blocks: pageBlocks(richTextEditor), admin: { initCollapsed: true } },
      { name: "puckData", type: "json", label: "Dados do Construtor", admin: { hidden: true } },
      { name: "seo", type: "group", label: "SEO", fields: [
        { name: "metaTitle", type: "text", label: "Título (meta title)" },
        { name: "metaDescription", type: "textarea", label: "Descrição (meta description)" },
      ] },
      { name: "showSponsors", type: "checkbox", defaultValue: false, label: "Exibir faixa de patrocinadores nesta página",
        admin: { description: "Mostra a faixa com os patrocinadores ATIVOS abaixo do conteúdo desta página. Usado na página do Municipal." } },
    ]),
  };
}

export function pagePublicPath(doc: { path?: string | null; slug?: string }): string {
  if (doc.path) return doc.path;
  const dedicated = doc.slug ? dedicatedPageRoute(doc.slug) : null;
  return dedicated || `/paginas/${doc.slug}`;
}

function revalidatePageDoc(doc: any) {
  try {
    revalidatePath(pagePublicPath(doc));
    if (doc?.slug) revalidatePath(`/paginas/${doc.slug}`);
    revalidatePath("/sitemap.xml");
  } catch { /* fora de request (CLI/build) */ }
}
