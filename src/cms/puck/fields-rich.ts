// Campos do Puck dos 21 blocos ricos (espelham src/cms/blocks/rich.ts). Compartilhados
// entre o editor (client) e o render do servidor — ver fields.ts.
import type { Fields } from "@puckeditor/core";
import { ICON_OPTIONS, SOCIAL_NETWORKS } from "@/cms/blocks/icons";
import { teamExternal, mediaExternal, formExternal, snippetExternal } from "./externals";
/* eslint-disable @typescript-eslint/no-explicit-any */

type Opt = { label: string; value: any };
const text = (label: string) => ({ type: "text", label }) as const;
const area = (label: string) => ({ type: "textarea", label }) as const;
const select = (label: string, options: Opt[]) => ({ type: "select", label, options }) as any;
const radio = (label: string, options: Opt[]) => ({ type: "radio", label, options }) as any;
const yesNo = (label: string) => radio(label, [{ label: "Sim", value: true }, { label: "Não", value: false }]);
const cols = (values: string[]) => values.map((v) => ({ label: v, value: v }));
const array = (
  label: string,
  arrayFields: Record<string, any>,
  summary: (i: any) => string | undefined,
  extra: Record<string, any> = {}
) =>
  ({ type: "array", label, arrayFields, getItemSummary: (i: any, n?: number) => summary(i || {}) || `Item ${(n ?? 0) + 1}`, ...extra }) as any;

const title = text("Título (opcional)");
const hideOn = select("Esconder em", [
  { label: "Não esconder", value: "none" },
  { label: "Celular", value: "mobile" },
  { label: "Computador", value: "desktop" },
]);
const buttonStyle = select("Estilo", [
  { label: "Verde", value: "primary" },
  { label: "Contorno", value: "outline" },
  { label: "Branco", value: "white" },
]);
const buttonsField = (max: number) =>
  array("Botões", { label: text("Texto"), href: text("Link"), style: buttonStyle }, (i) => i.label, {
    max,
    defaultItemProps: { label: "Saiba mais", href: "/", style: "primary" },
  });
const alignLC = radio("Alinhamento", [{ label: "Esquerda", value: "left" }, { label: "Centro", value: "center" }]);
const size = radio("Tamanho", [{ label: "P", value: "sm" }, { label: "M", value: "md" }, { label: "G", value: "lg" }]);

export const RICH_FIELDS: Record<string, Fields<any>> = {
  Hero: {
    title: text("Título"),
    subtitle: area("Subtítulo"),
    align: alignLC,
    bgColor: select("Fundo", [{ label: "Nenhum", value: "none" }, { label: "Verde", value: "green" }, { label: "Escuro", value: "dark" }, { label: "Cor própria", value: "custom" }]),
    bgHex: text("Cor própria (ex.: #0B5D3B)"),
    bgImage: mediaExternal("Imagem de fundo"),
    overlay: { type: "number", label: "Escurecer a imagem (%)", min: 0, max: 80 },
    height: radio("Altura", [{ label: "Automática", value: "auto" }, { label: "Alta", value: "tall" }]),
    buttons: buttonsField(2),
    hideOn,
  },
  Cta: {
    title: text("Título"),
    text: area("Texto"),
    background: select("Fundo", [{ label: "Verde", value: "green" }, { label: "Escuro", value: "dark" }, { label: "Claro", value: "light" }, { label: "Imagem", value: "image" }]),
    bgImage: mediaExternal("Imagem de fundo (quando Fundo = Imagem)"),
    align: alignLC,
    buttons: buttonsField(2),
    hideOn,
  },
  Cards: {
    title,
    columns: radio("Colunas", cols(["2", "3", "4"])),
    items: array(
      "Cards",
      { image: mediaExternal(), title: text("Título"), text: area("Texto"), href: text("Link"), linkLabel: text("Texto do link") },
      (i) => i.title,
      { min: 1, defaultItemProps: { title: "Novo card" } }
    ),
    hideOn,
  },
  Stats: {
    title,
    background: select("Fundo", [{ label: "Nenhum", value: "none" }, { label: "Verde", value: "green" }, { label: "Escuro", value: "dark" }]),
    items: array(
      "Números",
      { value: text("Número"), label: text("Rótulo"), suffix: text("Sufixo (ex.: %, mil)") },
      (i) => [i.value, i.label].filter(Boolean).join(" · "),
      { min: 2, max: 4, defaultItemProps: { value: "10", label: "Rótulo" } }
    ),
    hideOn,
  },
  Testimonials: {
    title,
    layout: radio("Formato", [{ label: "Grade", value: "grid" }, { label: "Carrossel", value: "carousel" }]),
    items: array("Depoimentos", { quote: area("Depoimento"), name: text("Nome"), role: text("Cargo / descrição"), photo: mediaExternal("Foto") }, (i) => i.name),
    hideOn,
  },
  MediaText: {
    image: mediaExternal(),
    imageSide: radio("Imagem à", [{ label: "Esquerda", value: "left" }, { label: "Direita", value: "right" }]),
    title,
    text: area("Texto (uma linha = um parágrafo)"),
    button: { type: "object", label: "Botão (opcional)", objectFields: { label: text("Texto"), href: text("Link") } } as any,
    hideOn,
  },
  People: {
    title,
    columns: radio("Colunas", cols(["2", "3", "4"])),
    items: array(
      "Pessoas",
      {
        photo: mediaExternal("Foto"),
        name: text("Nome"),
        role: text("Cargo"),
        text: area("Texto"),
        links: array("Links", { label: text("Texto"), url: text("URL") }, (l) => l.label || l.url),
      },
      (i) => i.name
    ),
    hideOn,
  },
  Timeline: {
    title,
    items: array("Marcos", { date: text("Data"), title: text("Título"), text: area("Texto") }, (i) => [i.date, i.title].filter(Boolean).join(" · "), { min: 2 }),
    hideOn,
  },
  Faq: {
    title,
    items: array("Perguntas", { question: text("Pergunta"), answer: area("Resposta") }, (i) => i.question, {
      min: 1,
      defaultItemProps: { question: "Pergunta?", answer: "Resposta." },
    }),
    schema: yesNo("Marcar como FAQ pro Google"),
    hideOn,
  },
  Tabs: {
    items: array("Abas", { label: text("Nome da aba"), content: area("Conteúdo (uma linha = um parágrafo)") }, (i) => i.label, { min: 2 }),
    hideOn,
  },
  FormBlock: {
    form: formExternal,
    intro: area("Texto acima do formulário (opcional)"),
    compact: yesNo("Versão compacta"),
    hideOn,
  },
  Buttons: {
    align: radio("Alinhamento", [{ label: "Esquerda", value: "left" }, { label: "Centro", value: "center" }, { label: "Direita", value: "right" }]),
    items: buttonsField(4),
    hideOn,
  },
  Social: {
    size,
    items: array("Redes", { network: select("Rede", SOCIAL_NETWORKS), url: text("URL") }, (i) => i.network, {
      defaultItemProps: { network: "instagram", url: "" },
    }),
    hideOn,
  },
  IconList: {
    title,
    columns: radio("Colunas", cols(["1", "2"])),
    items: array("Itens", { icon: select("Ícone", ICON_OPTIONS), text: text("Texto"), href: text("Link (opcional)") }, (i) => i.text, {
      defaultItemProps: { icon: "check", text: "Item" },
    }),
    hideOn,
  },
  Instagram: { url: text("Link do post"), caption: text("Legenda"), hideOn },
  XPost: { url: text("Link do post"), caption: text("Legenda"), hideOn },
  Embed: {
    html: area("HTML"),
    height: { type: "number", label: "Altura mínima (px, opcional)", min: 0 },
    note: text("Nota abaixo (opcional)"),
    hideOn,
  },
  Carousel: {
    title,
    aspect: radio("Proporção", cols(["16:9", "4:3", "1:1"])),
    images: array("Imagens", { image: mediaExternal(), caption: text("Legenda") }, (i) => i.caption || i.image?.filename, { min: 2 }),
    hideOn,
  },
  Divider: {
    style: radio("Tipo", [{ label: "Linha", value: "line" }, { label: "Espaço", value: "space" }]),
    size,
    hideOn,
  },
  Countdown: {
    team: teamExternal as any,
    matchId: { type: "number", label: "OU ID do jogo (API)" },
    title,
    showBroadcast: yesNo("Mostrar onde assistir"),
    hideOn,
  },
  Snippet: { snippet: snippetExternal },
};

export const RICH_DEFAULTS: Record<string, Record<string, any>> = {
  Hero: { title: "Título do destaque", align: "center", bgColor: "green", overlay: 40, height: "auto", buttons: [], hideOn: "none" },
  Cta: { title: "Chamada", background: "green", align: "center", buttons: [{ label: "Saiba mais", href: "/", style: "white" }], hideOn: "none" },
  Cards: { columns: "3", items: [{ title: "Card 1" }, { title: "Card 2" }, { title: "Card 3" }], hideOn: "none" },
  Stats: { background: "none", items: [{ value: "10", label: "Títulos" }, { value: "50", label: "Anos" }], hideOn: "none" },
  Testimonials: { layout: "grid", items: [{ quote: "Depoimento.", name: "Nome" }], hideOn: "none" },
  MediaText: { imageSide: "left", title: "Título", text: "Texto.", button: {}, hideOn: "none" },
  People: { columns: "3", items: [{ name: "Nome", role: "Cargo" }], hideOn: "none" },
  Timeline: { items: [{ date: "2024", title: "Marco 1" }, { date: "2025", title: "Marco 2" }], hideOn: "none" },
  Faq: { items: [{ question: "Pergunta?", answer: "Resposta." }], schema: true, hideOn: "none" },
  Tabs: { items: [{ label: "Aba 1", content: "Conteúdo 1" }, { label: "Aba 2", content: "Conteúdo 2" }], hideOn: "none" },
  FormBlock: { compact: false, hideOn: "none" },
  Buttons: { align: "left", items: [{ label: "Saiba mais", href: "/", style: "primary" }], hideOn: "none" },
  Social: { size: "md", items: [{ network: "instagram", url: "https://instagram.com/" }], hideOn: "none" },
  IconList: { columns: "1", items: [{ icon: "check", text: "Item" }], hideOn: "none" },
  Instagram: { hideOn: "none" },
  XPost: { hideOn: "none" },
  Embed: { hideOn: "none" },
  Carousel: { aspect: "16:9", images: [], hideOn: "none" },
  Divider: { style: "line", size: "md", hideOn: "none" },
  Countdown: { showBroadcast: true, hideOn: "none" },
  Snippet: {},
};

export const RICH_LABELS: Record<string, string> = {
  Hero: "Destaque (hero)",
  Cta: "Chamada (CTA)",
  Cards: "Cards",
  Stats: "Números",
  Testimonials: "Depoimentos",
  MediaText: "Imagem + texto",
  People: "Pessoas / equipe",
  Timeline: "Linha do tempo",
  Faq: "Perguntas frequentes",
  Tabs: "Abas",
  FormBlock: "Formulário",
  Buttons: "Botões",
  Social: "Redes sociais",
  IconList: "Lista com ícones",
  Instagram: "Post do Instagram",
  XPost: "Post do X (Twitter)",
  Embed: "HTML personalizado",
  Carousel: "Carrossel de imagens",
  Divider: "Divisor / espaço",
  Countdown: "Contagem regressiva",
  Snippet: "Trecho reutilizável",
};

// Componente do Puck → slug do bloco (pra achar o componente client-safe).
export const RICH_SLUG: Record<string, string> = {
  Hero: "hero", Cta: "cta", Cards: "cards", Stats: "stats", Testimonials: "testimonials", MediaText: "mediaText",
  People: "people", Timeline: "timeline", Faq: "faq", Tabs: "tabs", FormBlock: "formBlock", Buttons: "buttons",
  Social: "social", IconList: "iconList", Instagram: "instagram", XPost: "xPost", Embed: "embed", Carousel: "carousel",
  Divider: "divider", Countdown: "countdown", Snippet: "snippet",
};
