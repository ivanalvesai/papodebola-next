import type { Block } from "payload";
import { withMeta } from "./meta.ts";

// Seção com 1 a 3 colunas; cada coluna recebe blocos da biblioteca (sem outra Seção dentro).
export function sectionBlock(inner: Block[]): Block {
  return withMeta({
    slug: "section",
    labels: { singular: "Seção (colunas)", plural: "Seções" },
    fields: [
      { name: "title", type: "text", label: "Título da seção (opcional)" },
      { name: "width", type: "select", defaultValue: "wide", label: "Largura",
        options: [{ label: "Estreita (720px)", value: "narrow" }, { label: "Larga (1240px)", value: "wide" }, { label: "Tela cheia", value: "full" }],
        admin: { description: "Só vale quando a página é larga ou tela cheia (Aparência da página)." } },
      { name: "background", type: "select", defaultValue: "none", label: "Fundo",
        options: [{ label: "Nenhum", value: "none" }, { label: "Card branco", value: "card" }, { label: "Verde", value: "green" }, { label: "Escuro", value: "dark" }] },
      {
        name: "columns", type: "array", label: "Colunas", minRows: 1, maxRows: 3,
        admin: { description: "1 a 3 colunas. No celular empilham." },
        fields: [
          { name: "span", type: "select", defaultValue: "1", label: "Largura da coluna", options: [{ label: "Normal", value: "1" }, { label: "Dupla", value: "2" }] },
          { name: "blocks", type: "blocks", label: "Blocos", blocks: inner, admin: { initCollapsed: true } },
        ],
      },
    ],
  }, "layout");
}
