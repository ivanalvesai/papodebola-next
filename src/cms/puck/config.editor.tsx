"use client";
// Config do Puck pro EDITOR. O canvas recebe o CSS real do site (ver iframe-styles.tsx), então:
// - blocos puros (client-safe) renderizam o MESMO componente do site;
// - blocos que dependem do servidor (dados ao vivo, Lexical, formulário, trecho) viram um
//   mini-preview em iframe (BlockFrame → /cms-block-preview → PageBlock real).
import type { Config } from "@puckeditor/core";
import { FIELDS, CATEGORIES } from "./fields";
import { RICH_DEFAULTS, RICH_LABELS, RICH_SLUG } from "./fields-rich";
import { puckPropsToBlock } from "./to-block";
import { BlockFrame } from "./block-frame";
import { BG, COL } from "./layout-classes";
import { CLIENT_SAFE_COMPONENTS } from "@/components/payload/blocks/client-safe";
/* eslint-disable @typescript-eslint/no-explicit-any */

const empty = (msg: string) => (
  <div style={{ border: "1px dashed #9CA3AF", borderRadius: 8, padding: 16, background: "#fff", color: "#6B7280", fontSize: 14 }}>{msg}</div>
);

// Bloco puro: o componente do site, com as props convertidas.
const real = (type: string, slug: string, label: string, defaultProps: Record<string, any> = {}) => ({
  label,
  fields: FIELDS[type],
  defaultProps,
  render: (props: any) => {
    const block = puckPropsToBlock(type, props);
    const C = CLIENT_SAFE_COMPONENTS[slug];
    return block && C ? <C block={block} /> : empty(`${label}: configure nos campos à direita`);
  },
});

// Bloco que depende do servidor: mini-preview em iframe.
const framed = (type: string, label: string, defaultProps: Record<string, any> = {}) => ({
  label,
  fields: FIELDS[type],
  defaultProps,
  render: (props: any) => <BlockFrame block={puckPropsToBlock(type, props)} id={String(props.id || type)} />,
});

const SERVER_ONLY = new Set(["MediaText", "Tabs", "FormBlock", "Countdown", "Snippet"]);

const richComponents = Object.fromEntries(
  Object.keys(RICH_SLUG).map((type) => [
    type,
    SERVER_ONLY.has(type)
      ? framed(type, RICH_LABELS[type], RICH_DEFAULTS[type])
      : real(type, RICH_SLUG[type], RICH_LABELS[type], RICH_DEFAULTS[type]),
  ])
);

export const editorConfig: Config = {
  categories: CATEGORIES as any,
  components: {
    Heading: real("Heading", "heading", "Título", { text: "Título", level: "h2" }),
    Text: {
      label: "Texto",
      fields: FIELDS.Text,
      defaultProps: { text: "Escreva aqui." },
      // Mesmo visual do bloco "Texto" do site (prosa), sem ida ao servidor a cada tecla.
      render: ({ text }: any) => (
        <div className="space-y-3 text-sm leading-relaxed text-text-secondary">
          {String(text || "")
            .split(/\r?\n/)
            .filter((l: string) => l.trim())
            .map((l: string, i: number) => (
              <p key={i} className="m-0">{l}</p>
            ))}
        </div>
      ),
    },
    Image: real("Image", "image", "Imagem"),
    Button: real("Button", "button", "Botão", { label: "Saiba mais", url: "/", style: "primary" }),
    Columns: {
      label: "Colunas",
      fields: FIELDS.Columns,
      defaultProps: { count: 2, col1: [], col2: [], col3: [] },
      render: ({ count, col1: C1, col2: C2, col3: C3 }: any) => (
        <div className={`grid gap-4 ${(count || 2) === 3 ? "md:grid-cols-3" : "md:grid-cols-2"}`}>
          <C1 className={COL} minEmptyHeight={80} />
          <C2 className={COL} minEmptyHeight={80} />
          {(count || 2) === 3 && <C3 className={COL} minEmptyHeight={80} />}
        </div>
      ),
    },
    Section: {
      label: "Seção",
      fields: FIELDS.Section,
      defaultProps: { background: "none", content: [] },
      render: ({ title, background, content: Content }: any) => (
        <section className={BG[background || "none"] || undefined}>
          {title && <h2 className="mb-4 text-lg font-bold text-text-primary">{title}</h2>}
          <Content className="space-y-5" minEmptyHeight={80} />
        </section>
      ),
    },
    TeamWidget: framed("TeamWidget", "Widget de time", { widget: "upcoming" }),
    Standings: framed("Standings", "Classificação", { tournament: "brasileirao-serie-a", compact: false }),
    Scorers: framed("Scorers", "Artilharia", { tournament: "brasileirao-serie-a", limit: 10 }),
    NewsFeed: framed("NewsFeed", "Feed de notícias", { source: "latest", limit: 6, layout: "grid" }),
    LiveMatch: framed("LiveMatch", "Jogo ao vivo"),
    TodayGames: framed("TodayGames", "Jogos de hoje", { league: "all" }),
    ...richComponents,
  },
};
