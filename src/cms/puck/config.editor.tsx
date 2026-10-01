"use client";
// Config do Puck pro EDITOR: canvas em "wireframe" (estilos inline simples). O visual real
// fica no Live Preview. Blocos de dados viram um card-resumo (nada é buscado no editor).
import type React from "react";
import type { Config } from "@puckeditor/core";
import { FIELDS, CATEGORIES } from "./fields";
import { blockSummary } from "@/cms/blocks/summary";
import { puckPropsToBlock } from "./to-block";
/* eslint-disable @typescript-eslint/no-explicit-any */

const FONT = "Open Sans, Arial, sans-serif";
const box: React.CSSProperties = { border: "1px dashed #9CA3AF", borderRadius: 8, padding: 16, background: "#fff", color: "#374151", fontFamily: FONT };
const LABELS: Record<string, string> = {
  TeamWidget: "Widget de time",
  Standings: "Classificação",
  Scorers: "Artilharia",
  NewsFeed: "Feed de notícias",
  LiveMatch: "Jogo ao vivo",
  TodayGames: "Jogos de hoje",
};

function Placeholder({ type, props }: { type: string; props: any }) {
  const b = puckPropsToBlock(type, props);
  const summary = b ? blockSummary(b.blockType, b) : "";
  return (
    <div style={box}>
      <strong style={{ display: "block", fontSize: 13, color: "#00965E" }}>{LABELS[type] || type} · dado ao vivo</strong>
      <span style={{ fontSize: 14 }}>{summary || "configure nos campos à direita"}</span>
    </div>
  );
}

const data = (type: string, defaultProps: Record<string, any> = {}) => ({
  label: LABELS[type],
  fields: FIELDS[type],
  defaultProps,
  render: (props: any) => <Placeholder type={type} props={props} />,
});

export const editorConfig: Config = {
  categories: CATEGORIES as any,
  components: {
    Heading: {
      label: "Título",
      fields: FIELDS.Heading,
      defaultProps: { text: "Título", level: "h2" },
      render: ({ text, level }: any) =>
        level === "h3" ? (
          <h3 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, margin: "8px 0" }}>{text}</h3>
        ) : (
          <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 22, margin: "8px 0" }}>{text}</h2>
        ),
    },
    Text: {
      label: "Texto",
      fields: FIELDS.Text,
      defaultProps: { text: "Escreva aqui." },
      render: ({ text }: any) => (
        <div style={{ fontSize: 16, lineHeight: 1.6, fontFamily: FONT }}>
          {String(text || "")
            .split(/\r?\n/)
            .map((l: string, i: number) => (
              <p key={i} style={{ margin: "0 0 8px" }}>{l}</p>
            ))}
        </div>
      ),
    },
    Image: {
      label: "Imagem",
      fields: FIELDS.Image,
      render: ({ url, caption }: any) =>
        url ? (
          <figure style={{ margin: 0 }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={url} alt={caption || ""} style={{ maxWidth: "100%", borderRadius: 8 }} />
            {caption && <figcaption style={{ fontSize: 13, color: "#6B7280" }}>{caption}</figcaption>}
          </figure>
        ) : (
          <div style={box}>Imagem: informe a URL</div>
        ),
    },
    Button: {
      label: "Botão",
      fields: FIELDS.Button,
      defaultProps: { label: "Saiba mais", url: "/", style: "primary" },
      render: ({ label, style }: any) => (
        <span
          style={{
            display: "inline-block",
            padding: "8px 16px",
            borderRadius: 8,
            fontWeight: 600,
            fontFamily: FONT,
            background: style === "outline" ? "#fff" : "#00965E",
            color: style === "outline" ? "#00965E" : "#fff",
            border: "1px solid #00965E",
          }}
        >
          {label}
        </span>
      ),
    },
    Columns: {
      label: "Colunas",
      fields: FIELDS.Columns,
      defaultProps: { count: 2, col1: [], col2: [], col3: [] },
      render: ({ count, col1: C1, col2: C2, col3: C3 }: any) => (
        <div style={{ display: "grid", gap: 16, gridTemplateColumns: `repeat(${count || 2}, minmax(0, 1fr))` }}>
          <C1 />
          <C2 />
          {(count || 2) === 3 && <C3 />}
        </div>
      ),
    },
    Section: {
      label: "Seção",
      fields: FIELDS.Section,
      defaultProps: { background: "none", content: [] },
      render: ({ title, background, content: Content }: any) => (
        <section
          style={{
            padding: 16,
            borderRadius: 10,
            background: background === "green" ? "#00965E" : background === "dark" ? "#111827" : background === "card" ? "#fff" : "transparent",
            color: background === "green" || background === "dark" ? "#fff" : "inherit",
            border: background === "card" ? "1px solid #E5E7EB" : "none",
          }}
        >
          {title && <h2 style={{ fontFamily: FONT, fontWeight: 700, fontSize: 18, margin: "0 0 12px" }}>{title}</h2>}
          <Content />
        </section>
      ),
    },
    TeamWidget: data("TeamWidget", { widget: "upcoming" }),
    Standings: data("Standings", { tournament: "brasileirao-serie-a", compact: false }),
    Scorers: data("Scorers", { tournament: "brasileirao-serie-a", limit: 10 }),
    NewsFeed: data("NewsFeed", { source: "latest", limit: 6, layout: "grid" }),
    LiveMatch: data("LiveMatch"),
    TodayGames: data("TodayGames", { league: "all" }),
  },
};
