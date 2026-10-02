import type { Block, Field } from "payload";
import type { lexicalEditor } from "@payloadcms/richtext-lexical";
import { withMeta, type BLOCK_GROUPS } from "./meta.ts";
import { ICON_OPTIONS, SOCIAL_NETWORKS } from "./icons.ts";
import { fieldEditorOrAdmin } from "../lib/access.ts";

type RichTextEditor = ReturnType<typeof lexicalEditor>;
type Opt = { label: string; value: string };
type Sib = Record<string, unknown> | undefined;

// Blocos "ricos" (estilo Elementor) das Páginas/Modelos/Trechos. Só schema: o render fica nos
// componentes do site. Slugs e nomes de campo viram tabelas/colunas no Postgres — não renomear
// depois de migrar. A ordem aqui é a ordem no drawer (fonte única, como STATIC_BLOCK_SLUGS).
export const RICH_BLOCK_SLUGS = [
  "hero", "cta", "cards", "stats", "testimonials", "mediaText", "people", "timeline",
  "faq", "tabs", "formBlock", "buttons", "social", "iconList",
  "instagram", "xPost", "embed", "carousel",
  "divider", "countdown",
  "snippet",
] as const;

// ── helpers ──
const t = (name: string, label: string, extra: Record<string, unknown> = {}): Field => ({ name, type: "text", label, ...extra }) as Field;
const ta = (name: string, label: string, extra: Record<string, unknown> = {}): Field => ({ name, type: "textarea", label, ...extra }) as Field;
const up = (name: string, label: string, required = false, extra: Record<string, unknown> = {}): Field =>
  ({ name, type: "upload", relationTo: "media", label, required, ...extra }) as Field;
const sel = (name: string, label: string, options: Opt[], def: string): Field => ({ name, type: "select", label, options, defaultValue: def });
const o = (...pairs: [string, string][]): Opt[] => pairs.map(([value, label]) => ({ label, value }));

const BUTTON_STYLES = o(["primary", "Verde (principal)"], ["outline", "Contorno"], ["white", "Branco"]);
const btns = (max = 2, name = "buttons"): Field => ({
  name, type: "array", label: "Botões", labels: { singular: "Botão", plural: "Botões" }, maxRows: max,
  fields: [
    t("label", "Texto", { required: true }),
    t("href", "Link", { required: true, admin: { description: "URL completa ou caminho (ex.: /futebol/copa-do-mundo)" } }),
    sel("style", "Estilo", BUTTON_STYLES, "primary"),
  ],
});
const titleOpt = t("title", "Título (opcional)", { admin: { description: "Aparece acima do bloco" } });
const ALIGN_LC = o(["left", "Esquerda"], ["center", "Centro"]);
const COLS_234 = o(["2", "2 colunas"], ["3", "3 colunas"], ["4", "4 colunas"]);
const SIZES = o(["sm", "Pequeno"], ["md", "Médio"], ["lg", "Grande"]);

type Def = { group: keyof typeof BLOCK_GROUPS; block: Block };

// richText dos blocos ricos usa o editor PADRÃO do Payload (sem `editor`); o parâmetro fica
// pela simetria com staticBlocks(editor).
export function richBlocks(_richTextEditor: RichTextEditor): Block[] {
  const defs: Def[] = [
    // ── Destaques ──
    { group: "highlight", block: {
      slug: "hero", labels: { singular: "Destaque (hero)", plural: "Destaques (hero)" },
      fields: [
        t("title", "Título", { required: true }),
        ta("subtitle", "Subtítulo"),
        sel("align", "Alinhamento", ALIGN_LC, "center"),
        sel("bgColor", "Cor de fundo", o(["none", "Nenhuma"], ["green", "Verde"], ["dark", "Escuro"], ["custom", "Personalizada (hex)"]), "green"),
        t("bgHex", "Cor personalizada", { admin: { description: "Ex.: #00965E", condition: (_: unknown, s: Sib) => s?.bgColor === "custom" } }),
        up("bgImage", "Imagem de fundo (opcional)"),
        { name: "overlay", type: "number", label: "Escurecer a imagem (%)", min: 0, max: 80, defaultValue: 40, admin: { description: "0 = sem película; 80 = bem escuro. Só vale com imagem." } },
        sel("height", "Altura", o(["auto", "Automática"], ["tall", "Alta (meia tela)"]), "auto"),
        btns(2),
      ],
    } },
    { group: "highlight", block: {
      slug: "cta", labels: { singular: "Chamada (CTA)", plural: "Chamadas (CTA)" },
      fields: [
        t("title", "Título", { required: true }),
        ta("text", "Texto"),
        sel("background", "Fundo", o(["green", "Verde"], ["dark", "Escuro"], ["light", "Claro"], ["image", "Imagem"]), "green"),
        up("bgImage", "Imagem de fundo", false, { admin: { condition: (_: unknown, s: Sib) => s?.background === "image" } }),
        sel("align", "Alinhamento", ALIGN_LC, "center"),
        btns(2),
      ],
    } },
    { group: "highlight", block: {
      slug: "cards", labels: { singular: "Cards", plural: "Cards" },
      fields: [
        titleOpt,
        sel("columns", "Colunas", COLS_234, "3"),
        { name: "items", type: "array", label: "Cards", labels: { singular: "Card", plural: "Cards" }, minRows: 1, fields: [
          up("image", "Imagem"),
          t("title", "Título", { required: true }),
          ta("text", "Texto"),
          t("href", "Link (opcional)"),
          t("linkLabel", "Texto do link", { admin: { description: "Ex.: Saiba mais" } }),
        ] },
      ],
    } },
    { group: "highlight", block: {
      slug: "stats", labels: { singular: "Números", plural: "Números" },
      fields: [
        titleOpt,
        sel("background", "Fundo", o(["none", "Nenhum"], ["green", "Verde"], ["dark", "Escuro"]), "none"),
        { name: "items", type: "array", label: "Números", labels: { singular: "Número", plural: "Números" }, minRows: 2, maxRows: 4, fields: [
          t("value", "Valor", { required: true, admin: { description: "Ex.: 1.200" } }),
          t("label", "Legenda", { required: true }),
          t("suffix", "Sufixo (opcional)", { admin: { description: "Ex.: +, %, mil" } }),
        ] },
      ],
    } },
    { group: "highlight", block: {
      slug: "testimonials", labels: { singular: "Depoimentos", plural: "Depoimentos" },
      fields: [
        titleOpt,
        sel("layout", "Formato", o(["grid", "Grade"], ["carousel", "Carrossel"]), "grid"),
        { name: "items", type: "array", label: "Depoimentos", labels: { singular: "Depoimento", plural: "Depoimentos" }, fields: [
          ta("quote", "Depoimento", { required: true }),
          t("name", "Nome", { required: true }),
          t("role", "Cargo / descrição"),
          up("photo", "Foto"),
        ] },
      ],
    } },
    { group: "highlight", block: {
      slug: "mediaText", labels: { singular: "Imagem + texto", plural: "Imagem + texto" },
      fields: [
        up("image", "Imagem", true),
        sel("imageSide", "Lado da imagem", o(["left", "Esquerda"], ["right", "Direita"]), "left"),
        t("title", "Título"),
        { name: "text", type: "richText", label: "Texto" },
        { name: "button", type: "group", label: "Botão (opcional)", fields: [t("label", "Texto"), t("href", "Link")] },
      ],
    } },
    { group: "highlight", block: {
      slug: "people", labels: { singular: "Pessoas / equipe", plural: "Pessoas / equipe" },
      fields: [
        titleOpt,
        sel("columns", "Colunas", COLS_234, "3"),
        { name: "items", type: "array", label: "Pessoas", labels: { singular: "Pessoa", plural: "Pessoas" }, fields: [
          up("photo", "Foto"),
          t("name", "Nome", { required: true }),
          t("role", "Cargo"),
          ta("text", "Texto"),
          { name: "links", type: "array", label: "Links", labels: { singular: "Link", plural: "Links" }, fields: [t("label", "Texto"), t("url", "URL")] },
        ] },
      ],
    } },
    { group: "highlight", block: {
      slug: "timeline", labels: { singular: "Linha do tempo", plural: "Linhas do tempo" },
      fields: [
        titleOpt,
        { name: "items", type: "array", label: "Marcos", labels: { singular: "Marco", plural: "Marcos" }, minRows: 2, fields: [
          t("date", "Data", { required: true, admin: { description: "Texto livre (ex.: 1970, jun/2026)" } }),
          t("title", "Título", { required: true }),
          ta("text", "Texto"),
        ] },
      ],
    } },
    // ── Interação ──
    { group: "interact", block: {
      slug: "faq", labels: { singular: "Perguntas frequentes", plural: "Perguntas frequentes" },
      fields: [
        titleOpt,
        { name: "items", type: "array", label: "Perguntas", labels: { singular: "Pergunta", plural: "Perguntas" }, minRows: 1, fields: [
          t("question", "Pergunta", { required: true }),
          ta("answer", "Resposta", { required: true }),
        ] },
        { name: "schema", type: "checkbox", label: "Marcar como FAQ pro Google", defaultValue: true },
      ],
    } },
    { group: "interact", block: {
      slug: "tabs", labels: { singular: "Abas", plural: "Abas" },
      fields: [
        { name: "items", type: "array", label: "Abas", labels: { singular: "Aba", plural: "Abas" }, minRows: 2, fields: [
          t("label", "Nome da aba", { required: true }),
          { name: "content", type: "richText", label: "Conteúdo" },
        ] },
      ],
    } },
    { group: "interact", block: {
      slug: "formBlock", labels: { singular: "Formulário", plural: "Formulários" },
      fields: [
        { name: "form", type: "relationship", relationTo: "forms", required: true, label: "Formulário", admin: { description: "Crie o formulário em Conteúdo → Formulários" } },
        { name: "intro", type: "richText", label: "Texto acima do formulário (opcional)" },
        { name: "compact", type: "checkbox", label: "Versão compacta", defaultValue: false },
      ],
    } },
    { group: "interact", block: {
      slug: "buttons", labels: { singular: "Botões", plural: "Botões" },
      fields: [
        sel("align", "Alinhamento", o(["left", "Esquerda"], ["center", "Centro"], ["right", "Direita"]), "left"),
        btns(4, "items"),
      ],
    } },
    { group: "interact", block: {
      slug: "social", labels: { singular: "Redes sociais", plural: "Redes sociais" },
      fields: [
        sel("size", "Tamanho", SIZES, "md"),
        { name: "items", type: "array", label: "Redes", labels: { singular: "Rede", plural: "Redes" }, fields: [
          { name: "network", type: "select", label: "Rede", required: true, options: SOCIAL_NETWORKS, defaultValue: "instagram" },
          t("url", "Link do perfil", { required: true }),
        ] },
      ],
    } },
    { group: "interact", block: {
      slug: "iconList", labels: { singular: "Lista com ícones", plural: "Listas com ícones" },
      fields: [
        titleOpt,
        sel("columns", "Colunas", o(["1", "1 coluna"], ["2", "2 colunas"]), "1"),
        { name: "items", type: "array", label: "Itens", labels: { singular: "Item", plural: "Itens" }, fields: [
          { name: "icon", type: "select", label: "Ícone", options: ICON_OPTIONS, defaultValue: "check" },
          t("text", "Texto", { required: true }),
          t("href", "Link (opcional)"),
        ] },
      ],
    } },
    // ── Incorporar ──
    { group: "embed", block: {
      slug: "instagram", labels: { singular: "Post do Instagram", plural: "Posts do Instagram" },
      fields: [
        t("url", "Link", { required: true, admin: { description: "Link do post/reel" } }),
        t("caption", "Legenda (opcional)"),
      ],
    } },
    { group: "embed", block: {
      slug: "xPost", labels: { singular: "Post do X (Twitter)", plural: "Posts do X" },
      fields: [
        t("url", "Link", { required: true, admin: { description: "Link do post (x.com/… ou twitter.com/…)" } }),
        t("caption", "Legenda (opcional)"),
      ],
    } },
    { group: "embed", block: {
      slug: "embed", labels: { singular: "HTML personalizado", plural: "HTML personalizado" },
      fields: [
        { name: "html", type: "code", label: "HTML", required: true,
          admin: { language: "html", description: "Só editores e admins podem criar ou alterar." },
          access: { create: fieldEditorOrAdmin, update: fieldEditorOrAdmin } },
        { name: "height", type: "number", label: "Altura mínima (px, opcional)", min: 0 },
        t("note", "Anotação interna", { admin: { description: "Só aparece aqui no /cms (ex.: de onde veio esse código)" } }),
      ],
    } },
    { group: "embed", block: {
      slug: "carousel", labels: { singular: "Carrossel de imagens", plural: "Carrosséis" },
      fields: [
        titleOpt,
        sel("aspect", "Proporção", o(["16:9", "16:9 (paisagem)"], ["4:3", "4:3"], ["1:1", "1:1 (quadrada)"]), "16:9"),
        { name: "images", type: "array", label: "Imagens", labels: { singular: "Imagem", plural: "Imagens" }, minRows: 2, fields: [
          up("image", "Imagem", true),
          t("caption", "Legenda"),
        ] },
      ],
    } },
    // ── Layout ──
    { group: "layout", block: {
      slug: "divider", labels: { singular: "Divisor / espaço", plural: "Divisores" },
      fields: [
        sel("style", "Tipo", o(["line", "Linha"], ["space", "Espaço em branco"]), "line"),
        sel("size", "Tamanho", SIZES, "md"),
      ],
    } },
    // ── Dados ao vivo ──
    { group: "data", block: {
      slug: "countdown", labels: { singular: "Contagem regressiva do jogo", plural: "Contagens regressivas" },
      fields: [
        { name: "team", type: "relationship", relationTo: "teams", label: "Time", admin: { description: "Escolha o time OU informe o id do jogo" } },
        { name: "matchId", type: "number", label: "ID do jogo (API)", admin: { description: "Escolha o time OU informe o id do jogo" } },
        titleOpt,
        { name: "showBroadcast", type: "checkbox", label: "Mostrar onde assistir", defaultValue: true },
      ],
    } },
    // ── Trechos ──
    { group: "snippet", block: {
      slug: "snippet", labels: { singular: "Trecho reutilizável", plural: "Trechos" },
      fields: [
        { name: "snippet", type: "relationship", relationTo: "snippets", required: true, label: "Trecho",
          admin: { description: "Editar o trecho atualiza todas as páginas que o usam" } },
      ],
    } },
  ];
  const blocks = defs.map((d) => withMeta(d.block, d.group));
  const pos = (b: Block) => (RICH_BLOCK_SLUGS as readonly string[]).indexOf(b.slug);
  return blocks.sort((a, b) => pos(a) - pos(b));
}
